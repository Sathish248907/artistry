/**
 * Phone OTP via Firebase Phone Authentication.
 *
 * When VITE_FIREBASE_* is configured, `sendOtp` triggers a real SMS through Firebase (with an
 * invisible reCAPTCHA) and `verifyOtp` confirms the code. Without configuration the service runs in
 * demo mode (any 6-digit code) so the storefront still works. Firebase is loaded on demand so the
 * rest of the site never pays for it.
 */
const env = import.meta.env;
const FIREBASE_CONFIG = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

export const isOtpConfigured = () => Boolean(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.authDomain && FIREBASE_CONFIG.projectId && FIREBASE_CONFIG.appId);

const MESSAGES = {
  'auth/invalid-phone-number': 'That mobile number doesn’t look right. Use a 10-digit Indian number.',
  'auth/too-many-requests': 'Too many attempts from this device. Please wait a while and try again.',
  'auth/quota-exceeded': 'SMS limit reached for now. Please try again later.',
  'auth/invalid-verification-code': 'That code isn’t correct. Check the SMS and try again.',
  'auth/code-expired': 'This code has expired. Request a new one.',
  'auth/captcha-check-failed': 'Verification check failed. Please refresh and try again.',
  'auth/unauthorized-domain': 'This website isn’t authorised for OTP yet. Add it under Firebase → Authentication → Settings → Authorized domains.',
  'auth/network-request-failed': 'Network problem while sending the code. Check your connection and retry.',
};

export class OtpError extends Error {
  constructor(code, message) {
    super(message || MESSAGES[code] || 'Something went wrong. Please try again.');
    this.code = code;
  }
}

export const toE164 = (mobile) => `+91${String(mobile).replace(/\D/g, '').slice(-10)}`;

let firebase; // { auth, RecaptchaVerifier, signInWithPhoneNumber, verifier }
let confirmation; // pending ConfirmationResult
let demoPending = null;

async function loadFirebase() {
  if (firebase) return firebase;
  const [{ initializeApp, getApps }, authMod] = await Promise.all([import('firebase/app'), import('firebase/auth')]);
  const app = getApps()[0] || initializeApp(FIREBASE_CONFIG);
  const auth = authMod.getAuth(app);
  auth.languageCode = 'en';
  firebase = { auth, RecaptchaVerifier: authMod.RecaptchaVerifier, signInWithPhoneNumber: authMod.signInWithPhoneNumber, verifier: null };
  return firebase;
}

/** Invisible reCAPTCHA bound to an empty container element; reused across sends. */
async function getVerifier(containerId) {
  const fb = await loadFirebase();
  if (!fb.verifier) {
    fb.verifier = new fb.RecaptchaVerifier(fb.auth, containerId, { size: 'invisible' });
    await fb.verifier.render();
  }
  return fb.verifier;
}

export function resetVerifier() {
  if (firebase?.verifier) {
    try {
      firebase.verifier.clear();
    } catch {
      /* already cleared */
    }
    firebase.verifier = null;
  }
}

/**
 * Send an OTP to an Indian mobile number.
 * @param {string} mobile 10-digit number
 * @param {string} containerId id of an element for the invisible reCAPTCHA
 */
export async function sendOtp(mobile, containerId = 'otp-recaptcha') {
  const phone = toE164(mobile);
  if (!isOtpConfigured()) {
    await new Promise((r) => setTimeout(r, 400));
    demoPending = phone;
    return { phone, demo: true };
  }
  try {
    const fb = await loadFirebase();
    const verifier = await getVerifier(containerId);
    confirmation = await fb.signInWithPhoneNumber(fb.auth, phone, verifier);
    return { phone, demo: false };
  } catch (e) {
    resetVerifier(); // a failed challenge can't be reused
    throw new OtpError(e.code, e.code ? undefined : e.message);
  }
}

/** Verify the 6-digit code; resolves to { uid, phone }. */
export async function verifyOtp(code) {
  const digits = String(code).replace(/\D/g, '');
  if (digits.length !== 6) throw new OtpError('auth/invalid-verification-code');
  if (!isOtpConfigured()) {
    await new Promise((r) => setTimeout(r, 300));
    return { uid: `demo-${demoPending}`, phone: demoPending, demo: true };
  }
  if (!confirmation) throw new OtpError('auth/code-expired', 'Please request a code first.');
  try {
    const { user } = await confirmation.confirm(digits);
    confirmation = null;
    return { uid: user.uid, phone: user.phoneNumber, demo: false };
  } catch (e) {
    throw new OtpError(e.code);
  }
}

export async function signOutOtp() {
  if (!isOtpConfigured() || !firebase) return;
  const { signOut } = await import('firebase/auth');
  await signOut(firebase.auth).catch(() => {});
}
