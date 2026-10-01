import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { RateTrendChart } from '../charts';
import { Async, Card, Empty, Field, FilterBar, PageHeader, Pagination, Pill, Select, Table, dateTime, money, useAsync } from '../ui';

const ACTION_LABEL = { created: 'First rate', updated: 'New rate', corrected: 'Corrected', backdated: 'Back-dated', deactivated: 'Switched off', reactivated: 'Switched on' };
const ACTION_OPTIONS = [['', 'Any change'], ...Object.entries(ACTION_LABEL)];
const DAYS_OPTIONS = [['30', 'Last 30 days'], ['90', 'Last 90 days'], ['365', 'Last 12 months']];

export default function GoldRateHistory() {
  const [params, setParams] = useSearchParams();
  const filters = {
    purity: params.get('purity') || '22K',
    action: params.get('action') || '',
    from: params.get('from') || '',
    to: params.get('to') || '',
    days: params.get('days') || '30',
    page: Number(params.get('page')) || 1,
  };
  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };

  const rates = useAsync(() => api('/gold-rates'), []);
  const purityOptions = [...new Set([filters.purity, ...((rates.data?.rates || []).map((r) => r.purity))])].map((p) => [p, p]);

  const trend = useAsync(() => api('/gold-rates/trend', { query: { purity: filters.purity, days: filters.days }, auth: false }), [filters.purity, filters.days]);
  const history = useAsync(
    () => api('/gold-rates/history', { query: { purity: filters.purity, action: filters.action, from: filters.from, to: filters.to, page: filters.page, limit: 20 } }),
    [filters.purity, filters.action, filters.from, filters.to, filters.page],
  );

  return (
    <>
      <PageHeader eyebrow="Gold rates" title="Gold rate history" description="Every rate that has been set, with the date and time it took effect and who entered it. Nothing here can be edited or removed." />

      <FilterBar>
        <Field label="Purity" htmlFor="grh-purity">
          <Select id="grh-purity" value={filters.purity} onChange={(v) => setFilter('purity', v)} options={purityOptions} />
        </Field>
        <Field label="Chart period" htmlFor="grh-days">
          <Select id="grh-days" value={filters.days} onChange={(v) => setFilter('days', v === '30' ? '' : v)} options={DAYS_OPTIONS} />
        </Field>
        <Field label="Kind of change" htmlFor="grh-action">
          <Select id="grh-action" value={filters.action} onChange={(v) => setFilter('action', v)} options={ACTION_OPTIONS} />
        </Field>
        <Field label="Effective from" htmlFor="grh-from">
          <input id="grh-from" type="date" value={filters.from} max={filters.to || undefined} onChange={(e) => setFilter('from', e.target.value)} className="input" />
        </Field>
        <Field label="Effective to" htmlFor="grh-to">
          <input id="grh-to" type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => setFilter('to', e.target.value)} className="input" />
        </Field>
      </FilterBar>

      <div className="space-y-6">
        <Card title={`${filters.purity} gold rate per gram · ${DAYS_OPTIONS.find(([v]) => v === filters.days)?.[1].toLowerCase() || ''}`}>
          <Async state={trend}>{(data) => <RateTrendChart points={data.points} purity={data.purity} />}</Async>
        </Card>

        <Card padded={false} title="Rate changes">
          <Async state={history}>
            {(data) => (
              <>
                <Table
                  minWidth={860}
                  rowKey={(h) => h.id}
                  rows={data.history}
                  empty={<Empty title="No rate changes match">Try another purity or a wider date range.</Empty>}
                  columns={[
                    { key: 'effectiveFrom', label: 'Effective from', render: (h) => <span className="whitespace-nowrap">{dateTime(h.effectiveFrom)}</span> },
                    { key: 'purity', label: 'Purity', render: (h) => <span className="font-medium">{h.purity}</span> },
                    { key: 'ratePerGram', label: 'Rate / g', align: 'right', render: (h) => <span className="font-semibold">{money(h.ratePerGram)}</span> },
                    { key: 'previousRatePerGram', label: 'Previous', align: 'right', render: (h) => (h.previousRatePerGram == null ? '—' : money(h.previousRatePerGram)) },
                    { key: 'change', label: 'Change', align: 'right', render: (h) => (h.change ? `${h.change > 0 ? '▲' : '▼'} ${money(Math.abs(h.change))}` : '—') },
                    { key: 'action', label: 'Kind', render: (h) => <Pill>{ACTION_LABEL[h.action] || h.action}</Pill> },
                    { key: 'changedBy', label: 'Entered by', render: (h) => (h.changedBy ? <span title={h.changedBy.email}>{h.changedBy.name}</span> : <span className="text-ink-faint">—</span>) },
                    { key: 'createdAt', label: 'Recorded', render: (h) => <span className="whitespace-nowrap text-xs text-ink-soft">{dateTime(h.createdAt)}</span> },
                    { key: 'note', label: 'Note', render: (h) => <span className="text-ink-soft">{h.note || '—'}</span> },
                  ]}
                />
                <Pagination pagination={data.pagination} onPage={(page) => setFilter('page', page > 1 ? String(page) : '')} />
              </>
            )}
          </Async>
        </Card>
      </div>
    </>
  );
}
