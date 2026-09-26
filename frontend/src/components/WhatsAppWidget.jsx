import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { HiOutlineChatBubbleOvalLeftEllipsis, HiOutlineXMark, HiOutlinePaperAirplane } from 'react-icons/hi2';

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState('+919876543210');
  const [defaultMsg, setDefaultMsg] = useState('Hello Smart School! I need assistance with school operations.');
  const [customMsg, setCustomMsg] = useState('');

  useEffect(() => {
    api.get('/settings')
      .then(res => {
        if (res.data?.whatsapp_number) {
          setPhone(res.data.whatsapp_number);
        }
        if (res.data?.whatsapp_default_message) {
          setDefaultMsg(res.data.whatsapp_default_message);
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenChat = (msg) => {
    const textToSend = msg || customMsg || defaultMsg;
    const cleanNumber = phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const templates = [
    { label: 'Admission Inquiry', text: 'Hello! I would like to inquire about student admission procedures and fee structure.' },
    { label: 'Fee Payment Help', text: 'Hello! I need assistance regarding student fee payment receipts and online portal dues.' },
    { label: 'Transport / Bus Stop', text: 'Hello! I need information regarding transport route timings and pickup stops.' },
  ];

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {isOpen && (
        <div
          className="card shadow-2xl animate-slideUp"
          style={{
            width: '320px',
            marginBottom: '12px',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            background: 'var(--bg-card)',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.5)'
          }}
        >
          {/* Header */}
          <div
            className="p-3.5 flex justify-between items-center text-white rounded-t-xl"
            style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                WA
              </div>
              <div>
                <div className="font-bold text-sm leading-tight">Smart School Helpline</div>
                <div className="text-[11px] text-green-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse"></span>
                  Online Support (Modules 19 & 39)
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <HiOutlineXMark size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-3.5 space-y-3">
            <p className="text-xs text-secondary leading-relaxed">
              Connect directly with school administration, admissions desk, or accounts on WhatsApp:
            </p>

            {/* Quick Templates */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-tertiary">Quick Queries:</div>
              {templates.map(t => (
                <button
                  key={t.label}
                  onClick={() => handleOpenChat(t.text)}
                  className="w-full text-left p-2 rounded-lg bg-secondary/15 hover:bg-primary-500/10 hover:border-primary-500/30 border border-transparent transition-all text-xs flex justify-between items-center"
                >
                  <span className="font-medium">{t.label}</span>
                  <HiOutlinePaperAirplane size={12} className="text-success-400" />
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="pt-2 border-t border-secondary">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  className="form-input text-xs py-1.5 px-2"
                  placeholder="Type a message..."
                  value={customMsg}
                  onChange={e => setCustomMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleOpenChat()}
                />
                <button
                  onClick={() => handleOpenChat()}
                  className="btn btn-sm btn-success px-3 flex items-center justify-center"
                  style={{ background: '#16a34a', borderColor: '#16a34a' }}
                >
                  <HiOutlinePaperAirplane size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 rounded-full text-white font-bold shadow-xl hover:scale-105 transition-all"
        style={{
          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          boxShadow: '0 10px 25px -3px rgba(34, 197, 94, 0.5)'
        }}
        title="Chat on WhatsApp"
      >
        <HiOutlineChatBubbleOvalLeftEllipsis size={22} />
        <span className="text-xs font-semibold hidden sm:inline">WhatsApp Help</span>
      </button>
    </div>
  );
}
