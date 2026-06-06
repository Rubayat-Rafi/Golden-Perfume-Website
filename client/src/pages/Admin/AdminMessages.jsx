import { useEffect, useState } from 'react';
import { Mail, MailOpen } from 'lucide-react';
import { api } from '../../lib/api';
import { formatDateTime, PageHeader, Card, Spinner, EmptyState } from './adminUI';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [openId, setOpenId]     = useState(null);

  const load = () => {
    setLoading(true);
    const q = new URLSearchParams();
    if (unreadOnly) q.set('unread', '1');
    api.get(`/contact?${q}`)
      .then((d) => setMessages(d.data || []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [unreadOnly]);

  const openMessage = async (msg) => {
    setOpenId(openId === msg._id ? null : msg._id);
    if (!msg.isRead) {
      try {
        await api.patch(`/contact/${msg._id}/read`);
        setMessages((prev) => prev.map((m) => (m._id === msg._id ? { ...m, isRead: true } : m)));
      } catch { /* ignore */ }
    }
  };

  return (
    <div>
      <PageHeader title="Messages" subtitle="Contact form submissions">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} className="sr-only peer" />
          <span className="relative w-10 h-5.5 rounded-full bg-[#ccc] peer-checked:bg-brand-green transition-colors">
            <span className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all ${unreadOnly ? 'left-5' : 'left-0.5'}`} />
          </span>
          <span className="font-lato text-[13px] text-[#666]">Unread only</span>
        </label>
      </PageHeader>

      {loading ? <Spinner /> : messages.length === 0 ? (
        <Card><EmptyState icon={Mail} title="No messages" subtitle="Contact form submissions will appear here." /></Card>
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <Card key={m._id} className={`overflow-hidden transition-shadow ${!m.isRead ? 'border-l-4 border-l-brand-green' : ''}`}>
              <button onClick={() => openMessage(m)} className="w-full text-left px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-[#fafafa]">
                <span className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${m.isRead ? 'bg-[#f0f0f0] text-[#aaa]' : 'bg-brand-green/10 text-brand-green'}`}>
                  {m.isRead ? <MailOpen size={16} /> : <Mail size={16} />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-lato text-[14px] truncate ${m.isRead ? 'text-[#666]' : 'font-bold text-dark-green'}`}>{m.name}</p>
                    {!m.isRead && <span className="shrink-0 w-2 h-2 rounded-full bg-brand-green" />}
                  </div>
                  <p className="font-lato text-[12px] text-[#999] truncate">{m.subject || '(no subject)'} · {m.email}</p>
                </div>
                <span className="font-lato text-[11px] text-[#aaa] shrink-0 hidden sm:block">{formatDateTime(m.createdAt)}</span>
              </button>
              {openId === m._id && (
                <div className="px-5 pb-5 pt-1 border-t border-[#f0f0f0]">
                  <p className="font-lato text-[14px] text-[#555] leading-relaxed whitespace-pre-wrap mb-4">{m.message}</p>
                  <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || 'Your inquiry')}`}
                    className="inline-flex items-center gap-2 h-9 px-4 bg-dark-green text-linen font-lato font-bold text-[12px] uppercase tracking-[1px] rounded-lg hover:bg-forest transition-colors">
                    Reply via Email
                  </a>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
