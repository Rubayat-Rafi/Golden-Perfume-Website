import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ticket, X, Plus } from 'lucide-react';
import { api } from '../../lib/api';
import { usePromos } from '../../hooks/queries';
import { money, formatDate, PageHeader, Card, TableSkeleton, EmptyState } from './adminUI';

const inputCls = 'w-full h-10 px-3 border border-[#ddd] rounded-lg font-lato text-[13px] outline-none focus:border-brand-green';
const labelCls = 'block font-lato text-[12px] text-[#666] mb-1.5';

const CreateModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    code: '', type: 'percent', value: '', minOrderAmount: '', applicableTo: 'all', usageLimit: '', expiresAt: '',
  });
  const [err, setErr]   = useState('');
  const [busy, setBusy] = useState(false);
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const submit = async () => {
    setErr(''); setBusy(true);
    try {
      await api.post('/promo', {
        ...form,
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount || 0),
        usageLimit: Number(form.usageLimit || 0),
        expiresAt: form.expiresAt || null,
      });
      onCreated();
    } catch (e) {
      setErr(e.message || 'Failed to create');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl z-50 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-[#ececec] flex items-center justify-between">
          <h3 className="font-playfair text-[18px] text-dark-green">New Promo Code</h3>
          <button onClick={onClose} className="text-[#999] hover:text-dark-green cursor-pointer"><X size={20} /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          {err && <div className="bg-red-50 border border-red-200 text-red-600 font-lato text-[13px] rounded-lg px-3 py-2">{err}</div>}
          <div>
            <label className={labelCls}>Code *</label>
            <input value={form.code} onChange={set('code')} placeholder="WELCOME20" className={`${inputCls} uppercase`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Type *</label>
              <select value={form.type} onChange={set('type')} className={`${inputCls} bg-white`}>
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Value *</label>
              <input type="number" value={form.value} onChange={set('value')} placeholder={form.type === 'percent' ? '20' : '10'} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Min Order ($)</label>
              <input type="number" value={form.minOrderAmount} onChange={set('minOrderAmount')} placeholder="0" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Usage Limit</label>
              <input type="number" value={form.usageLimit} onChange={set('usageLimit')} placeholder="0 = unlimited" className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Applies To</label>
              <select value={form.applicableTo} onChange={set('applicableTo')} className={`${inputCls} bg-white`}>
                <option value="all">All customers</option>
                <option value="b2c">Retail (B2C)</option>
                <option value="b2b">Wholesale (B2B)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Expires</label>
              <input type="date" value={form.expiresAt} onChange={set('expiresAt')} className={inputCls} />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#ececec]">
          <button onClick={submit} disabled={busy}
            className="w-full h-11 bg-dark-green text-linen font-lato font-bold text-[13px] uppercase tracking-[1.5px] rounded-lg hover:bg-forest transition-colors cursor-pointer disabled:opacity-60">
            {busy ? 'Creating…' : 'Create Code'}
          </button>
        </div>
      </div>
    </>
  );
};

const AdminPromos = () => {
  const queryClient = useQueryClient();
  const invalidate  = () => queryClient.invalidateQueries({ queryKey: ['promos'] });

  const { data: promos = [], isLoading: loading } = usePromos();
  const [showCreate, setShowCreate] = useState(false);

  const toggleMutation = useMutation({
    mutationFn: (promo) => api.put(`/promo/${promo._id}`, { isActive: !promo.isActive }),
    onSuccess: invalidate,
    onError: (e) => alert(e.message),
  });

  return (
    <div>
      <PageHeader title="Promo Codes" subtitle={`${promos.length} code${promos.length !== 1 ? 's' : ''}`}>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 h-10 px-4 bg-dark-green text-linen font-lato font-bold text-[12px] uppercase tracking-[1px] rounded-lg hover:bg-forest transition-colors cursor-pointer">
          <Plus size={15} /> New Code
        </button>
      </PageHeader>

      {loading ? <TableSkeleton cols={7} /> : promos.length === 0 ? (
        <Card><EmptyState icon={Ticket} title="No promo codes yet" subtitle="Create your first discount code." /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f0f0f0] text-left">
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-5 py-3">Code</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Discount</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Min Order</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Applies</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Used</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Expires</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-5 py-3 text-right">Active</th>
                </tr>
              </thead>
              <tbody>
                {promos.map((p) => (
                  <tr key={p._id} className="border-b border-[#f5f5f5] last:border-0 hover:bg-[#fafafa]">
                    <td className="px-5 py-3.5 font-lato font-bold text-[13px] text-dark-green">{p.code}</td>
                    <td className="px-3 py-3.5 font-lato text-[13px] text-[#666]">{p.type === 'percent' ? `${p.value}%` : money(p.value)}</td>
                    <td className="px-3 py-3.5 font-lato text-[13px] text-[#666]">{p.minOrderAmount ? money(p.minOrderAmount) : '—'}</td>
                    <td className="px-3 py-3.5 font-lato text-[12px] uppercase text-[#666]">{p.applicableTo}</td>
                    <td className="px-3 py-3.5 font-lato text-[13px] text-[#666]">{p.usedCount}{p.usageLimit ? ` / ${p.usageLimit}` : ''}</td>
                    <td className="px-3 py-3.5 font-lato text-[12px] text-[#999]">{p.expiresAt ? formatDate(p.expiresAt) : 'Never'}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => toggleMutation.mutate(p)}
                        className={`relative w-10 h-5.5 rounded-full transition-colors cursor-pointer ${p.isActive ? 'bg-brand-green' : 'bg-[#ccc]'}`}>
                        <span className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all ${p.isActive ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {showCreate && (
        <CreateModal onClose={() => setShowCreate(false)} onCreated={() => { invalidate(); setShowCreate(false); }} />
      )}
    </div>
  );
};

export default AdminPromos;
