import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Plus, X, Trash2, Eye, EyeOff, Check, ChevronLeft, ChevronRight, Mail, Calendar, Pencil } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { useAdminStaff } from '../../hooks/queries';
import { formatDate, formatDateTime, PageHeader, Card, TableSkeleton, EmptyState } from './adminUI';

// Assignable admin sections (must match backend STAFF_SECTIONS + admin nav)
export const SECTIONS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'banners',   label: 'Banners' },
  { key: 'orders',    label: 'Orders' },
  { key: 'wholesale', label: 'Wholesale' },
  { key: 'products',  label: 'Products' },
  { key: 'categories', label: 'Categories' },
  { key: 'customers', label: 'Customers' },
  { key: 'promos',    label: 'Promo Codes' },
  { key: 'messages',  label: 'Messages' },
];

const inputCls = 'w-full h-10 px-3 border border-[#ddd] rounded-lg font-lato text-[13px] outline-none focus:border-brand-green';
const labelCls = 'block font-lato text-[12px] text-[#666] mb-1.5';

// Permission checkbox grid (shared by create + edit)
const PermGrid = ({ selected, toggle }) => (
  <div className="grid grid-cols-2 gap-2">
    {SECTIONS.map((s) => {
      const on = selected.includes(s.key);
      return (
        <button key={s.key} type="button" onClick={() => toggle(s.key)}
          className={`flex items-center gap-2 px-3 h-10 rounded-lg border font-lato text-[13px] transition-colors cursor-pointer ${
            on ? 'bg-brand-green/10 border-brand-green/40 text-brand-green' : 'bg-white border-[#ddd] text-[#666] hover:border-brand-green'
          }`}>
          <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${on ? 'bg-brand-green text-white' : 'border border-[#ccc]'}`}>
            {on && <Check size={11} />}
          </span>
          {s.label}
        </button>
      );
    })}
  </div>
);

const CreateModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [perms, setPerms] = useState(['dashboard']);
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));
  const toggle = (k) => setPerms((p) => p.includes(k) ? p.filter((x) => x !== k) : [...p, k]);

  const submit = async () => {
    setErr(''); setBusy(true);
    try {
      await api.post('/admin/staff', { ...form, permissions: perms });
      onCreated();
      onClose();
    } catch (e) {
      setErr(e.message || 'Failed to create staff');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl z-50 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-[#ececec] flex items-center justify-between">
          <h3 className="font-playfair text-[18px] text-dark-green">New Staff Member</h3>
          <button onClick={onClose} className="text-[#999] hover:text-dark-green cursor-pointer"><X size={20} /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          {err && <div className="bg-red-50 border border-red-200 text-red-600 font-lato text-[13px] rounded-lg px-3 py-2">{err}</div>}
          <div>
            <label className={labelCls}>Full Name *</label>
            <input value={form.name} onChange={set('name')} placeholder="Jane Doe" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Email *</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="jane@goldenperfume.com" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Password *</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="At least 8 characters" className={`${inputCls} pr-11`} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-dark-green cursor-pointer">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className={labelCls}>Route Access</label>
            <PermGrid selected={perms} toggle={toggle} />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#ececec]">
          <button onClick={submit} disabled={busy}
            className="w-full h-11 bg-brand-green text-white font-lato font-bold text-[13px] uppercase tracking-[1.5px] rounded-lg hover:bg-forest transition-colors cursor-pointer disabled:opacity-60">
            {busy ? 'Creating…' : 'Create Staff'}
          </button>
        </div>
      </div>
    </>
  );
};

const EditModal = ({ member, onClose, onSaved }) => {
  const [name, setName] = useState(member.name);
  const [perms, setPerms] = useState(member.permissions || []);
  const [busy, setBusy] = useState(false);
  const toggle = (k) => setPerms((p) => p.includes(k) ? p.filter((x) => x !== k) : [...p, k]);

  const save = async () => {
    setBusy(true);
    try {
      await api.patch(`/admin/staff/${member._id}`, { name, permissions: perms });
      onSaved();
      onClose();
    } catch (e) {
      alert(e.message || 'Failed to save');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl z-50 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-[#ececec] flex items-center justify-between">
          <h3 className="font-playfair text-[18px] text-dark-green">Edit Access — {member.name}</h3>
          <button onClick={onClose} className="text-[#999] hover:text-dark-green cursor-pointer"><X size={20} /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className={labelCls}>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Route Access</label>
            <PermGrid selected={perms} toggle={toggle} />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#ececec]">
          <button onClick={save} disabled={busy}
            className="w-full h-11 bg-brand-green text-white font-lato font-bold text-[13px] uppercase tracking-[1.5px] rounded-lg hover:bg-forest transition-colors cursor-pointer disabled:opacity-60">
            {busy ? 'Saving…' : 'Save Access'}
          </button>
        </div>
      </div>
    </>
  );
};

const labelFor = (k) => SECTIONS.find((s) => s.key === k)?.label || k;

// Full-details slide-over
const DetailsDrawer = ({ member, onClose, onEdit, onRemove, isSelf }) => {
  const isAdmin = member.role === 'admin';
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#f5f6f5] z-50 flex flex-col shadow-2xl">
        <div className="bg-white px-6 py-4 border-b border-[#ececec] flex items-center justify-between shrink-0">
          <h3 className="font-playfair text-[18px] text-dark-green">Member Details</h3>
          <button onClick={onClose} className="text-[#999] hover:text-dark-green cursor-pointer"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {/* Identity */}
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <span className={`shrink-0 w-14 h-14 rounded-full flex items-center justify-center font-lato font-bold text-[20px] ${isAdmin ? 'bg-purple-600 text-white' : 'bg-brand-green text-white'}`}>
                {member.name?.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="font-playfair text-[18px] text-dark-green truncate">{member.name}{isSelf && ' (you)'}</p>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full font-lato font-bold text-[10px] uppercase tracking-[0.5px] ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>
                  {member.role}
                </span>
              </div>
            </div>
          </Card>

          {/* Contact + meta */}
          <Card className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2.5 font-lato text-[13px] text-[#555]">
              <Mail size={15} className="text-brand-green shrink-0" /> <span className="break-all">{member.email}</span>
            </div>
            <div className="flex items-center gap-2.5 font-lato text-[13px] text-[#555]">
              <Calendar size={15} className="text-brand-green shrink-0" /> Joined {formatDateTime(member.createdAt)}
            </div>
          </Card>

          {/* Route access — full matrix */}
          <Card className="p-5">
            <p className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] mb-3">Route Access</p>
            {isAdmin ? (
              <p className="font-lato text-[13px] text-purple-700 font-bold">Full access to all sections</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {SECTIONS.map((s) => {
                  const on = member.permissions?.includes(s.key);
                  return (
                    <div key={s.key} className={`flex items-center gap-2 px-3 h-9 rounded-lg font-lato text-[13px] ${on ? 'bg-brand-green/10 text-brand-green' : 'bg-[#f3f3f3] text-[#aaa]'}`}>
                      <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${on ? 'bg-brand-green text-white' : 'border border-[#ccc]'}`}>
                        {on ? <Check size={11} /> : <X size={10} />}
                      </span>
                      {s.label}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Actions */}
        {!isAdmin && (
          <div className="bg-white px-6 py-4 border-t border-[#ececec] shrink-0 flex gap-3">
            <button onClick={() => onEdit(member)}
              className="flex-1 h-11 flex items-center justify-center gap-2 bg-brand-green text-white font-lato font-bold text-[12px] uppercase tracking-[1px] rounded-lg hover:bg-forest transition-colors cursor-pointer">
              <Pencil size={14} /> Edit Access
            </button>
            <button onClick={() => onRemove(member)}
              className="flex-1 h-11 flex items-center justify-center gap-2 border border-red-300 text-red-600 font-lato font-bold text-[12px] uppercase tracking-[1px] rounded-lg hover:bg-red-50 transition-colors cursor-pointer">
              <Trash2 size={14} /> Remove
            </button>
          </div>
        )}
      </div>
    </>
  );
};

const AdminStaff = () => {
  const { user: me } = useAuth();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [page, setPage]       = useState(1);

  const { data, isLoading: loading } = useAdminStaff({ page: String(page), limit: '10' });
  const team       = data?.data       || [];
  const totalPages = data?.totalPages || 1;
  const total      = data?.total      || 0;
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'staff'] });

  const remove = async (m) => {
    if (!confirm(`Remove ${m.name}? This cannot be undone.`)) return;
    try {
      await api.del(`/admin/staff/${m._id}`);
      setViewing((v) => (v && v._id === m._id ? null : v));
      invalidate();
    } catch (e) { alert(e.message); }
  };

  const onSaved = () => invalidate();

  return (
    <div>
      <PageHeader title="Staff & Admins" subtitle={`${total} team member${total !== 1 ? 's' : ''} — create staff and choose their section access`}>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 h-10 px-4 bg-brand-green text-white font-lato font-bold text-[12px] uppercase tracking-[1px] rounded-lg hover:bg-forest transition-colors cursor-pointer">
          <Plus size={15} /> Add Staff
        </button>
      </PageHeader>

      {loading ? <TableSkeleton cols={5} /> : team.length === 0 ? (
        <Card><EmptyState icon={ShieldCheck} title="No team members" subtitle="Create your first staff account." /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f0f0f0] text-left">
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-5 py-3">Member</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3">Role</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3 hidden md:table-cell">Access</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-3 py-3 hidden sm:table-cell">Joined</th>
                  <th className="font-lato text-[11px] uppercase tracking-[1px] text-[#aaa] px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {team.map((m) => {
                  const isAdmin = m.role === 'admin';
                  const isSelf = m._id === me?._id;
                  return (
                    <tr key={m._id} className="border-b border-[#f5f5f5] last:border-0 hover:bg-[#fafafa]">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-lato font-bold text-[13px] ${isAdmin ? 'bg-purple-600 text-white' : 'bg-brand-green text-white'}`}>
                            {m.name?.charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="font-lato font-bold text-[13px] text-dark-green truncate">{m.name}{isSelf && ' (you)'}</p>
                            <p className="font-lato text-[11px] text-[#999] truncate">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full font-lato font-bold text-[10px] uppercase tracking-[0.5px] ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>
                          {m.role}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-lato text-[13px] text-[#666] hidden md:table-cell">
                        {isAdmin ? 'All sections' : `${m.permissions?.length || 0} section${(m.permissions?.length || 0) !== 1 ? 's' : ''}`}
                      </td>
                      <td className="px-3 py-3 font-lato text-[12px] text-[#999] hidden sm:table-cell whitespace-nowrap">{formatDate(m.createdAt)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setViewing(m)} title="View details"
                            className="w-9 h-9 flex items-center justify-center border border-[#ddd] rounded-lg text-[#666] hover:border-brand-green hover:text-brand-green transition-colors cursor-pointer">
                            <Eye size={16} />
                          </button>
                          {!isAdmin && (
                            <>
                              <button onClick={() => setEditing(m)} title="Edit access"
                                className="w-9 h-9 flex items-center justify-center border border-[#ddd] rounded-lg text-[#666] hover:border-brand-green hover:text-brand-green transition-colors cursor-pointer">
                                <Pencil size={15} />
                              </button>
                              <button onClick={() => remove(m)} title="Remove"
                                className="w-9 h-9 flex items-center justify-center border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer">
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-[#f0f0f0]">
              <span className="font-lato text-[12px] text-[#999]">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                  className="w-8 h-8 flex items-center justify-center border border-[#ddd] rounded-lg text-[#666] hover:border-dark-green disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"><ChevronLeft size={16} /></button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                  className="w-8 h-8 flex items-center justify-center border border-[#ddd] rounded-lg text-[#666] hover:border-dark-green disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </Card>
      )}

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={invalidate} />}
      {editing && <EditModal member={editing} onClose={() => setEditing(null)} onSaved={onSaved} />}
      {viewing && (
        <DetailsDrawer
          member={viewing}
          isSelf={viewing._id === me?._id}
          onClose={() => setViewing(null)}
          onEdit={(m) => { setViewing(null); setEditing(m); }}
          onRemove={remove}
        />
      )}
    </div>
  );
};

export default AdminStaff;
