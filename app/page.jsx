"use client";
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect, useCallback, useRef } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const BUSINESS_NAME = "Barbería Pavón";
const DEFAULT_ADMIN_PASSWORD = "admin1234";
const MASTER_RECOVERY_CODE = "BARBERIA-MASTER-2025";
const START_HOUR = 9.5;
const END_HOUR = 21.5;

function generateSlots() {
  const slots = [];
  for (let h = START_HOUR; h < END_HOUR; h += 0.5) {
    const hour = Math.floor(h);
    const min = h % 1 === 0 ? "00" : "30";
    slots.push(`${String(hour).padStart(2, "0")}:${min}`);
  }
  return slots;
}
const ALL_SLOTS = generateSlots();

function todayStr() { return new Date().toISOString().split("T")[0]; }
function formatDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
}
function formatDateShort(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}
function getNext30Days() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}
function getFirstName(n) { return n.trim().split(" ")[0]; }

const Icon = {
  scissors: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:20,height:20}}><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>),
  calendar: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>),
  clock: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:16,height:16}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>),
  user: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>),
  phone: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.01z"/></svg>),
  check: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{width:18,height:18}}><polyline points="20 6 9 17 4 12"/></svg>),
  x: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:15,height:15}}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>),
  lock: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>),
  trash: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:15,height:15}}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>),
  edit: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:15,height:15}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>),
  ban: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:15,height:15}}><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>),
  note: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:15,height:15}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>),
  search: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:16,height:16}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>),
  chart: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:16,height:16}}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>),
  sparkle: () => (<svg viewBox="0 0 24 24" fill="currentColor" style={{width:28,height:28}}><path d="M12 1l2.5 8.5L23 12l-8.5 2.5L12 23l-2.5-8.5L1 12l8.5-2.5z"/></svg>),
  logout: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:15,height:15}}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>),
  arrowLeft: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{width:16,height:16}}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>),
  google: () => (<svg viewBox="0 0 24 24" style={{width:16,height:16}} fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>),
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  :root{--ink:#0d0d0d;--cream:#f5f0e8;--gold:#c9a84c;--gold-light:#e8d5a3;--gold-dark:#9c7a2e;--charcoal:#2a2a2a;--smoke:#6b6b6b;--border:#e0d8cc;--red:#c0392b;--green:#27ae60}
  body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--ink);min-height:100vh}
  .serif{font-family:'Playfair Display',Georgia,serif}
  .app-container{max-width:440px;margin:0 auto;min-height:100vh;position:relative}
  .app-header{background:var(--ink);padding:18px 20px 14px;position:sticky;top:0;z-index:100}
  .app-header h1{color:var(--gold);font-size:1.4rem;letter-spacing:-0.02em}
  .app-header p{color:#888;font-size:0.72rem;margin-top:2px;letter-spacing:0.08em;text-transform:uppercase;font-weight:300}
  .steps{display:flex;padding:0 20px 14px;background:var(--ink)}
  .step-dot{flex:1;height:3px;background:#333;border-radius:2px;margin:0 2px;transition:background 0.4s}
  .step-dot.active{background:var(--gold)}.step-dot.done{background:var(--gold-dark)}
  .calendar-strip{display:flex;gap:7px;overflow-x:auto;padding:14px 20px;scroll-snap-type:x mandatory;scrollbar-width:none}
  .calendar-strip::-webkit-scrollbar{display:none}
  .day-card{flex-shrink:0;width:54px;text-align:center;padding:9px 0;border-radius:12px;border:1.5px solid var(--border);cursor:pointer;scroll-snap-align:start;transition:all 0.2s;background:white}
  .day-card:hover{border-color:var(--gold)}.day-card.selected{background:var(--ink);border-color:var(--ink);color:var(--gold)}
  .day-card .day-name{font-size:0.6rem;text-transform:uppercase;letter-spacing:0.05em;opacity:0.6}
  .day-card.selected .day-name{opacity:0.7;color:var(--gold-light)}
  .day-card .day-num{font-size:1.15rem;font-weight:600;margin-top:2px}
  .day-card.today-card .day-num::after{content:'';display:block;width:5px;height:5px;background:var(--gold);border-radius:50%;margin:2px auto 0}
  .avail-badge{font-size:0.58rem;margin-top:2px;font-weight:700}
  .avail-few{color:#e67e22}.avail-none{color:var(--red)}.avail-ok{color:var(--green)}
  .time-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px;padding:4px 20px 20px}
  .time-slot{padding:11px 0;text-align:center;border-radius:10px;border:1.5px solid var(--border);font-size:0.88rem;font-weight:500;cursor:pointer;transition:all 0.18s;background:white;position:relative}
  .time-slot:hover:not(.occupied):not(.blocked){border-color:var(--gold);background:#fffdf5;transform:translateY(-1px)}
  .time-slot.selected{background:var(--gold);border-color:var(--gold);color:white;font-weight:700}
  .time-slot.occupied{background:#f5f5f5;color:#ccc;cursor:not-allowed;border-color:#eee;font-size:0.72rem}
  .time-slot.blocked{background:repeating-linear-gradient(45deg,#f5f5f5,#f5f5f5 5px,#ebebeb 5px,#ebebeb 10px);color:#bbb;cursor:not-allowed;border-color:#ddd;font-size:0.72rem}
  .time-slot.partial{border-color:#e67e22;border-width:2px}
  .partial-badge{position:absolute;top:3px;right:3px;background:#e67e22;color:white;border-radius:4px;font-size:0.55rem;padding:1px 4px;font-weight:700}
  .form-section{padding:0 20px 28px}
  .input-group{margin-bottom:14px}
  .input-group label{display:block;font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:var(--smoke);margin-bottom:5px}
  .input-group .optional-tag{font-size:0.65rem;color:#bbb;font-weight:400;margin-left:4px;text-transform:lowercase;letter-spacing:0}
  .input-group input,.input-group textarea{width:100%;padding:13px 14px;border:1.5px solid var(--border);border-radius:11px;font-size:0.95rem;font-family:'DM Sans',sans-serif;background:white;color:var(--ink);outline:none;transition:border-color 0.2s}
  .input-group input:focus,.input-group textarea:focus{border-color:var(--gold)}
  .input-group input::placeholder,.input-group textarea::placeholder{color:#ccc}
  .input-group textarea{resize:none;min-height:70px}
  .privacy-row{display:flex;align-items:flex-start;gap:10px;margin-bottom:18px;padding:13px;background:white;border-radius:11px;border:1.5px solid var(--border)}
  .privacy-row input[type="checkbox"]{width:18px;height:18px;flex-shrink:0;margin-top:2px;accent-color:var(--gold);cursor:pointer}
  .privacy-row p{font-size:0.78rem;color:var(--smoke);line-height:1.5}
  .privacy-row a{color:var(--gold);text-decoration:none}
  .confirm-summary{background:linear-gradient(135deg,var(--ink) 0%,#1a1a1a 100%);border-radius:14px;padding:16px;margin-bottom:16px;border:1px solid #2a2a2a}
  .confirm-summary .cs-title{color:var(--gold);font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;font-weight:600}
  .confirm-row{display:flex;align-items:center;gap:10px;padding:5px 0;color:#ddd;font-size:0.88rem}
  .confirm-row .icon-wrap{color:var(--gold);opacity:0.8;flex-shrink:0}
  .btn-primary{width:100%;padding:15px;background:var(--ink);color:var(--gold);border:none;border-radius:13px;font-size:0.95rem;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;letter-spacing:0.03em;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:8px}
  .btn-primary:hover:not(:disabled){background:#1a1a1a;transform:translateY(-1px)}
  .btn-primary:disabled{opacity:0.35;cursor:not-allowed;transform:none}
  .btn-secondary{width:100%;padding:13px;background:white;color:var(--ink);border:1.5px solid var(--border);border-radius:13px;font-size:0.88rem;font-weight:500;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:10px}
  .btn-secondary:hover{border-color:var(--gold)}
  .btn-back{display:flex;align-items:center;gap:6px;font-size:0.8rem;color:var(--smoke);background:none;border:none;cursor:pointer;padding:0;font-family:'DM Sans',sans-serif;margin-bottom:12px}
  .btn-back:hover{color:var(--ink)}
  .btn-gold{padding:10px 16px;background:var(--gold);color:white;border:none;border-radius:10px;font-size:0.82rem;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:6px}
  .btn-gold:hover{background:var(--gold-dark)}
  .btn-danger{padding:7px 11px;background:#fff5f5;color:var(--red);border:1px solid #fcc;border-radius:8px;font-size:0.78rem;font-family:'DM Sans',sans-serif;cursor:pointer;display:flex;align-items:center;gap:4px;transition:all 0.2s}
  .btn-danger:hover{background:#fee}
  .btn-sm{padding:7px 11px;background:#f5f5f5;color:var(--charcoal);border:1px solid var(--border);border-radius:8px;font-size:0.78rem;font-family:'DM Sans',sans-serif;cursor:pointer;display:flex;align-items:center;gap:4px;transition:all 0.2s}
  .btn-sm:hover{background:var(--border)}
  .success-screen{padding:28px 20px;text-align:center;animation:fadeInUp 0.5s ease}
  @keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  .success-icon{width:76px;height:76px;border-radius:50%;background:var(--ink);display:flex;align-items:center;justify-content:center;margin:0 auto 18px;color:var(--gold);box-shadow:0 0 0 8px rgba(201,168,76,0.15)}
  .success-card{background:white;border-radius:18px;padding:20px;margin:16px 0;border:1.5px solid var(--border);text-align:left}
  .success-detail{display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #f0ece4;font-size:0.88rem;color:var(--charcoal)}
  .success-detail:last-child{border-bottom:none}
  .success-detail .icon-wrap{color:var(--gold)}
  .cancel-link{display:block;margin-top:14px;padding:12px;background:#fff8f8;border:1px solid #fcc;border-radius:10px;font-size:0.78rem;color:var(--smoke);text-align:center;word-break:break-all}
  .cal-buttons{display:flex;gap:8px;margin-top:10px}
  .admin-header{background:var(--ink);padding:14px 20px;display:flex;align-items:center;justify-content:space-between}
  .admin-tab-bar{display:flex;border-bottom:2px solid var(--border);background:white;position:sticky;top:0;z-index:50}
  .admin-tab{flex:1;padding:13px 6px;text-align:center;font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--smoke);cursor:pointer;border-bottom:3px solid transparent;margin-bottom:-2px;transition:all 0.2s}
  .admin-tab.active{color:var(--ink);border-bottom-color:var(--gold)}
  .appt-card{background:white;border-radius:13px;padding:14px;margin-bottom:9px;border:1.5px solid var(--border);display:flex;align-items:center;gap:12px}
  .appt-time-badge{background:var(--ink);color:var(--gold);border-radius:9px;padding:7px 9px;font-size:0.82rem;font-weight:700;text-align:center;min-width:50px;flex-shrink:0}
  .appt-info{flex:1;min-width:0}
  .appt-info .name{font-weight:600;font-size:0.92rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .appt-info .phone{font-size:0.78rem;color:var(--smoke);margin-top:1px}
  .appt-info .appt-note{font-size:0.72rem;color:var(--gold-dark);margin-top:3px;font-style:italic;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .appt-actions{display:flex;gap:5px;flex-shrink:0}
  .stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 16px 4px}
  .stat-card{background:white;border-radius:13px;padding:14px;border:1.5px solid var(--border)}
  .stat-card .stat-val{font-size:1.6rem;font-weight:700;color:var(--ink);line-height:1}
  .stat-card .stat-label{font-size:0.7rem;color:var(--smoke);margin-top:4px;text-transform:uppercase;letter-spacing:0.06em}
  .popular-row{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:0.83rem}
  .popular-row:last-child{border-bottom:none}
  .popular-bar{height:6px;border-radius:3px;background:var(--gold);opacity:0.7;min-width:4px}
  .search-box{display:flex;align-items:center;gap:10px;background:white;border:1.5px solid var(--border);border-radius:11px;padding:10px 14px;margin:12px 16px}
  .search-box input{border:none;outline:none;font-family:'DM Sans',sans-serif;font-size:0.9rem;flex:1;background:transparent;color:var(--ink)}
  .search-box input::placeholder{color:#ccc}
  .section-title{font-size:0.68rem;text-transform:uppercase;letter-spacing:0.12em;color:var(--smoke);font-weight:600;padding:14px 20px 7px;display:flex;align-items:center;gap:8px}
  .divider{height:1px;background:var(--border);margin:6px 20px}
  .no-items{text-align:center;padding:28px;color:var(--smoke);font-size:0.88rem}
  .badge-count{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;background:var(--gold);color:white;border-radius:50%;font-size:0.65rem;font-weight:700;margin-left:3px}
  .real-time-dot{width:7px;height:7px;border-radius:50%;background:var(--green);animation:blink 2s infinite;display:inline-block}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
  .info-box{background:#fffbf0;border:1px solid var(--gold-light);border-radius:11px;padding:11px 14px;margin:0 20px 14px;font-size:0.79rem;color:var(--charcoal);line-height:1.6}
  select{width:100%;padding:11px 13px;border:1.5px solid var(--border);border-radius:10px;font-size:0.88rem;font-family:'DM Sans',sans-serif;background:white;color:var(--ink);outline:none;margin-top:4px}
  select:focus{border-color:var(--gold)}
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:200;display:flex;align-items:flex-end}
  .modal-sheet{background:white;border-radius:20px 20px 0 0;padding:22px 20px;width:100%;animation:slideUp 0.3s ease;max-height:90vh;overflow-y:auto}
  @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
  .modal-title{font-weight:700;font-size:0.98rem;margin-bottom:14px}
  .toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);background:var(--ink);color:white;padding:11px 18px;border-radius:30px;font-size:0.82rem;z-index:1000;animation:toastIn 0.3s ease,toastOut 0.3s ease 2.5s forwards;white-space:nowrap;max-width:90vw;border-left:3px solid var(--gold)}
  @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
  @keyframes toastOut{from{opacity:1}to{opacity:0}}
  .cancel-page{padding:28px 20px;text-align:center}
  .login-page{padding:50px 28px}
  .loading-screen{display:flex;align-items:center;justify-content:center;min-height:60vh;flex-direction:column;gap:16px;color:var(--smoke)}
  .spinner{width:36px;height:36px;border:3px solid var(--border);border-top-color:var(--gold);border-radius:50%;animation:spin 0.8s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .block-panel{background:white;border-radius:14px;border:1.5px solid var(--border);padding:16px;margin:0 16px 12px}
  .block-panel-title{font-weight:700;font-size:0.88rem;margin-bottom:14px;display:flex;align-items:center;gap:8px}
  .stepper{display:flex;align-items:center;gap:10px}
  .stepper-btn{width:34px;height:34px;border-radius:8px;border:1.5px solid var(--border);background:white;font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;font-weight:700;transition:all 0.2s}
  .stepper-btn:hover{border-color:var(--gold)}
  .stepper-val{font-size:1.3rem;font-weight:700;min-width:28px;text-align:center}
  .block-list{margin-top:10px}
  .block-item{display:flex;align-items:center;justify-content:space-between;padding:7px 10px;background:#fff8f0;border:1px solid var(--gold-light);border-radius:8px;margin-bottom:6px;font-size:0.82rem}
  .block-item-info{display:flex;align-items:center;gap:8px}
  .block-badge{background:var(--gold);color:white;border-radius:5px;padding:2px 7px;font-size:0.7rem;font-weight:700}
`;

function Toast({ message, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return <div className="toast">{message}</div>;
}

// Calcula cuántos puestos están bloqueados parcialmente en una franja
function getBlockedPuestosForSlot(date, time, blocked) {
  return blocked.filter(b => b.date === date && b.time === time).reduce((sum, b) => sum + (b.puestos || 1), 0);
}

// Calcula huecos disponibles para un día
function getAvailableCount(date, appointments, blocked, capacidad) {
  const counts = {};
  appointments.filter(a => a.date === date && a.status === "confirmed").forEach(a => {
    const t = a.time ? a.time.slice(0,5) : "";
    counts[t] = (counts[t] || 0) + 1;
  });
  return ALL_SLOTS.filter(t => {
    const reservas = counts[t] || 0;
    const bloqueados = getBlockedPuestosForSlot(date, t, blocked);
    return reservas < (capacidad - bloqueados);
  }).length;
}

// ============================================================
// BOOKING APP
// ============================================================
function BookingApp({ appointments, blocked, onBook, showToast, bizConfig, capacidad }) {
  const days = getNext30Days();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(days[0]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [privacy, setPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmedAppt, setConfirmedAppt] = useState(null);
  const formRef = useRef(null);
  const timeRef = useRef(null);

  // Para cada franja: cuántos puestos efectivos quedan
  const getEffectiveAvailable = (t) => {
    const reservas = appointments.filter(a => a.date === selectedDate && a.status === "confirmed" && a.time && a.time.slice(0,5) === t).length;
    const bloqueados = getBlockedPuestosForSlot(selectedDate, t, blocked);
    return capacidad - reservas - bloqueados;
  };

  const handleSelectDate = (d) => {
    setSelectedDate(d); setSelectedTime(null);
    if (step === 1) setStep(2);
    setTimeout(() => timeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const handleSelectTime = (t) => {
    if (getEffectiveAvailable(t) <= 0) return;
    setSelectedTime(t); setStep(3);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim() || !privacy) return;
    setLoading(true);
    try {
      const newAppt = await onBook({
        date: selectedDate, time: selectedTime + ":00",
        name: form.name.trim(), phone: form.phone.trim(),
        email: form.email.trim(), notes: "", status: "confirmed"
      });
      setConfirmedAppt({ ...newAppt, time: selectedTime });
    } catch (e) {
      showToast("Error al guardar la reserva. Inténtalo de nuevo.");
    }
    setLoading(false);
  };

  const bizName = bizConfig?.name || BUSINESS_NAME;
  const googleCalLink = confirmedAppt ? (() => {
    const dt = `${confirmedAppt.date.replace(/-/g, "")}T${confirmedAppt.time.replace(":", "")}00`;
    const endH = String(parseInt(confirmedAppt.time.split(":")[0]) + 1).padStart(2, "0");
    const end = `${confirmedAppt.date.replace(/-/g, "")}T${endH}${confirmedAppt.time.split(":")[1]}00`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Cita en " + bizName)}&dates=${dt}/${end}`;
  })() : "#";

  if (confirmedAppt) return (
    <div className="success-screen">
      <div className="success-icon"><Icon.sparkle /></div>
      <h2 className="serif" style={{fontSize:"1.55rem",letterSpacing:"-0.02em",marginBottom:5}}>¡Reserva Confirmada!</h2>
      <p style={{color:"var(--smoke)",fontSize:"0.88rem",marginBottom:4}}>¡Hasta el {formatDateShort(confirmedAppt.date)}, <strong>{getFirstName(confirmedAppt.name)}</strong>!</p>
      {confirmedAppt.email && <p style={{color:"var(--green)",fontSize:"0.78rem",marginBottom:16}}>📧 Confirmación enviada a {confirmedAppt.email}</p>}
      <div className="success-card">
        <div className="success-detail"><span className="icon-wrap"><Icon.calendar /></span><span style={{textTransform:"capitalize"}}>{formatDate(confirmedAppt.date)}</span></div>
        <div className="success-detail"><span className="icon-wrap"><Icon.clock /></span><span>{confirmedAppt.time} h · 30 minutos</span></div>
        <div className="success-detail"><span className="icon-wrap"><Icon.user /></span><span>{confirmedAppt.name}</span></div>
        <div className="success-detail"><span className="icon-wrap"><Icon.phone /></span><span>{confirmedAppt.phone}</span></div>
      </div>
      <div className="cal-buttons">
        <a href={googleCalLink} target="_blank" rel="noreferrer" style={{flex:1,textDecoration:"none"}}>
          <button className="btn-secondary" style={{marginTop:0,width:"100%",fontSize:"0.8rem"}}><Icon.google /> Google Cal</button>
        </a>
      </div>
      <div className="cancel-link">
        <strong style={{display:"block",marginBottom:3,color:"var(--charcoal)",fontSize:"0.8rem"}}>¿Necesitas cancelar?</strong>
        <span style={{color:"var(--gold)",fontSize:"0.78rem"}}>{typeof window !== "undefined" ? window.location.origin : ""}/cancelar/{confirmedAppt.id}</span>
        <p style={{marginTop:3,fontSize:"0.7rem"}}>Guarda este enlace para anular tu cita</p>
      </div>
      <button className="btn-primary" style={{marginTop:18}} onClick={() => {
        setStep(1); setSelectedDate(days[0]); setSelectedTime(null);
        setForm({name:"",phone:"",email:""}); setPrivacy(false); setConfirmedAppt(null);
      }}>Hacer otra reserva</button>
    </div>
  );

  return (
    <div>
      <div className="steps">{[1,2,3].map(s => <div key={s} className={`step-dot ${s < step ? "done" : s === step ? "active" : ""}`} />)}</div>
      <div className="section-title"><Icon.calendar /> Elige el día</div>
      <div className="calendar-strip">
        {days.map(d => {
          const dateObj = new Date(d + "T12:00:00");
          const avail = getAvailableCount(d, appointments, blocked, capacidad);
          const pct = avail / ALL_SLOTS.length;
          return (
            <div key={d} className={`day-card ${selectedDate===d?"selected":""} ${d===todayStr()?"today-card":""}`} onClick={() => handleSelectDate(d)}>
              <div className="day-name">{dateObj.toLocaleDateString("es-ES",{weekday:"short"})}</div>
              <div className="day-num">{dateObj.getDate()}</div>
              <div style={{fontSize:"0.58rem",opacity:0.5,marginTop:1}}>{dateObj.toLocaleDateString("es-ES",{month:"short"})}</div>
              {avail===0 ? <div className="avail-badge avail-none">Lleno</div>
                : pct<=0.25 ? <div className="avail-badge avail-few">{avail} lib.</div>
                : <div className="avail-badge avail-ok">{avail} lib.</div>}
            </div>
          );
        })}
      </div>

      {step >= 2 && (
        <div ref={timeRef}>
          <div className="section-title"><Icon.clock />{formatDateShort(selectedDate)} — elige hora <span className="real-time-dot" /></div>
          <div className="time-grid">
            {ALL_SLOTS.map(t => {
              const efectivos = getEffectiveAvailable(t);
              const isOccupied = efectivos <= 0;
              const isSelected = selectedTime === t;
              const isPartial = !isOccupied && efectivos < capacidad;
              return (
                <div key={t}
                  className={`time-slot${isOccupied?" occupied":""}${isSelected?" selected":""}`}
                  onClick={() => handleSelectTime(t)}>
                  {t}
                  {isOccupied && <div style={{fontSize:"0.55rem",marginTop:1,opacity:0.7}}>Ocupado</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {step >= 3 && selectedTime && (
        <div ref={formRef} style={{scrollMarginTop:20}}>
          <div className="divider" />
          <div className="section-title"><Icon.user /> Tus datos</div>
          <div className="form-section">
            <button className="btn-back" onClick={() => { setSelectedTime(null); setStep(2); }}><Icon.arrowLeft /> Cambiar hora</button>
            <div className="confirm-summary">
              <div className="cs-title">Resumen de tu cita</div>
              <div className="confirm-row"><span className="icon-wrap"><Icon.calendar /></span><span style={{textTransform:"capitalize"}}>{formatDate(selectedDate)}</span></div>
              <div className="confirm-row"><span className="icon-wrap"><Icon.clock /></span><span>{selectedTime} h · 30 minutos</span></div>
            </div>
            <div className="input-group"><label>Nombre completo</label><input type="text" placeholder="Ej: Carlos García" value={form.name} onChange={e => setForm(f => ({...f,name:e.target.value}))} /></div>
            <div className="input-group"><label>Teléfono</label><input type="tel" placeholder="Ej: 612 345 678" value={form.phone} onChange={e => setForm(f => ({...f,phone:e.target.value}))} /></div>
            <div className="input-group"><label>Correo electrónico <span className="optional-tag">(opcional)</span></label><input type="email" placeholder="tu@email.com" value={form.email} onChange={e => setForm(f => ({...f,email:e.target.value}))} /></div>
            <div className="privacy-row">
              <input type="checkbox" checked={privacy} onChange={e => setPrivacy(e.target.checked)} />
              <p>He leído y acepto la <a href="#">Política de Privacidad</a>. Mis datos se usarán exclusivamente para gestionar esta reserva.</p>
            </div>
            <button className="btn-primary" onClick={handleSubmit} disabled={!form.name.trim()||!form.phone.trim()||!privacy||loading}>
              {loading ? "Guardando..." : <><Icon.check /> Confirmar reserva</>}
            </button>
          </div>
        </div>
      )}

      {step < 3 && (
        <div className="info-box">
          ✂️ <strong>{bizConfig?.name||BUSINESS_NAME}</strong>{bizConfig?.address?` · ${bizConfig.address}`:""}<br />
          {bizConfig?.schedule||"Lunes a Sábado · 09:30 – 21:30"} · Citas de 30 min<br />
          {bizConfig?.phone?`📞 ${bizConfig.phone} · `:""}{bizConfig?.cancelPolicy||"Cancelación gratuita 24h antes"}
        </div>
      )}
    </div>
  );
}

// ============================================================
// CANCEL PAGE
// ============================================================
function CancelPage({ appointmentId, onCancel }) {
  const [appt, setAppt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("appointments").select("*").eq("id", appointmentId).single();
      setAppt(data); setLoading(false);
    }
    if (appointmentId) load();
  }, [appointmentId]);

  const handleCancel = async () => {
    await supabase.from("appointments").update({ status: "cancelled" }).eq("id", appointmentId);
    onCancel(appointmentId); setDone(true);
  };

  if (loading) return <div className="cancel-page"><div className="spinner" style={{margin:"0 auto"}}/></div>;
  if (done) return (<div className="cancel-page"><div style={{fontSize:"3rem",marginBottom:12}}>✅</div><h2 className="serif" style={{marginBottom:8}}>Cita cancelada</h2><p style={{color:"var(--smoke)",fontSize:"0.88rem"}}>Tu reserva ha sido anulada. ¡Esperamos verte pronto!</p></div>);
  if (!appt || appt.status === "cancelled") return (<div className="cancel-page"><div style={{fontSize:"3rem",marginBottom:12}}>🔍</div><h2 className="serif" style={{marginBottom:8}}>Reserva no encontrada</h2><p style={{color:"var(--smoke)",fontSize:"0.88rem"}}>Este enlace no corresponde a ninguna cita activa.</p></div>);

  const displayTime = appt.time ? appt.time.slice(0,5) : "";
  return (
    <div className="cancel-page">
      <div style={{background:"var(--ink)",borderRadius:20,padding:"20px 24px",marginBottom:20,textAlign:"center"}}>
        <div style={{color:"#888",fontSize:"0.7rem",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Tu cita reservada</div>
        <div style={{color:"var(--gold)",fontFamily:"'Playfair Display',serif",fontSize:"1.9rem",fontWeight:700,lineHeight:1.1}}>{displayTime} h</div>
        <div style={{color:"white",fontSize:"0.95rem",marginTop:6,textTransform:"capitalize",fontWeight:500}}>{formatDate(appt.date)}</div>
        <div style={{color:"#888",fontSize:"0.78rem",marginTop:6}}>{appt.name} · {appt.phone}</div>
      </div>
      <h2 className="serif" style={{marginBottom:6,fontSize:"1.3rem"}}>¿Cancelar esta reserva?</h2>
      <p style={{color:"var(--smoke)",fontSize:"0.83rem",marginBottom:20,lineHeight:1.6}}>Si cancelas, este hueco quedará libre. Esta acción no se puede deshacer.</p>
      <button style={{width:"100%",justifyContent:"center",padding:15,borderRadius:13,fontSize:"0.95rem",display:"flex",alignItems:"center",gap:8,background:"#fff5f5",color:"var(--red)",border:"1.5px solid #fcc",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700}} onClick={handleCancel}>
        <Icon.trash /> Sí, cancelar mi cita
      </button>
    </div>
  );
}

// ============================================================
// ADMIN LOGIN
// ============================================================
function AdminLogin({ onLogin, adminPassword, onPasswordChange }) {
  const [mode, setMode] = useState("login");
  const [pwd, setPwd] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [masterCode, setMasterCode] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [recoveryError, setRecoveryError] = useState("");
  const [recoveryDone, setRecoveryDone] = useState(false);
  const [showMaster, setShowMaster] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleLogin = () => {
    if (pwd === adminPassword) onLogin();
    else { setLoginError(true); setTimeout(() => setLoginError(false), 2500); }
  };

  const handleRecover = () => {
    setRecoveryError("");
    if (masterCode !== MASTER_RECOVERY_CODE) { setRecoveryError("Código maestro incorrecto."); return; }
    if (newPwd.length < 6) { setRecoveryError("Mínimo 6 caracteres."); return; }
    if (newPwd !== confirmPwd) { setRecoveryError("Las contraseñas no coinciden."); return; }
    onPasswordChange(newPwd); setRecoveryDone(true);
  };

  if (recoveryDone) return (
    <div className="login-page" style={{textAlign:"center"}}>
      <div style={{fontSize:"3rem",marginBottom:16}}>🔓</div>
      <h2 className="serif" style={{marginBottom:8,fontSize:"1.4rem"}}>¡Contraseña restablecida!</h2>
      <button className="btn-primary" onClick={() => { setMode("login"); setRecoveryDone(false); setPwd(""); setMasterCode(""); setNewPwd(""); setConfirmPwd(""); }}>
        <Icon.lock /> Ir al acceso
      </button>
    </div>
  );

  if (mode === "recover") return (
    <div className="login-page">
      <button className="btn-back" onClick={() => { setMode("login"); setRecoveryError(""); }} style={{marginBottom:20}}><Icon.arrowLeft /> Volver</button>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6,color:"var(--gold)"}}><Icon.lock /><h2 className="serif" style={{fontSize:"1.3rem"}}>Recuperar acceso</h2></div>
      <p style={{color:"var(--smoke)",fontSize:"0.82rem",marginBottom:22,lineHeight:1.6}}>Introduce el código maestro y establece una nueva contraseña.</p>
      {recoveryError && <div style={{background:"#fff5f5",border:"1px solid #fcc",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:"0.82rem",color:"var(--red)"}}>⚠️ {recoveryError}</div>}
      <div className="input-group"><label>Código maestro</label><div style={{position:"relative",display:"flex",alignItems:"center"}}><input type={showMaster?"text":"password"} placeholder="Código de recuperación" value={masterCode} onChange={e => setMasterCode(e.target.value)} style={{paddingRight:44}} /><button type="button" onClick={() => setShowMaster(v=>!v)} style={{position:"absolute",right:14,background:"none",border:"none",cursor:"pointer",color:"var(--smoke)"}}>👁</button></div></div>
      <div className="input-group"><label>Nueva contraseña</label><div style={{position:"relative",display:"flex",alignItems:"center"}}><input type={showNew?"text":"password"} placeholder="Mínimo 6 caracteres" value={newPwd} onChange={e => setNewPwd(e.target.value)} style={{paddingRight:44}} /><button type="button" onClick={() => setShowNew(v=>!v)} style={{position:"absolute",right:14,background:"none",border:"none",cursor:"pointer",color:"var(--smoke)"}}>👁</button></div></div>
      <div className="input-group"><label>Repetir contraseña</label><input type="password" placeholder="Repite la contraseña" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} style={{borderColor:confirmPwd&&confirmPwd!==newPwd?"var(--red)":confirmPwd&&confirmPwd===newPwd?"var(--green)":undefined}} /></div>
      <button className="btn-primary" onClick={handleRecover} disabled={!masterCode||!newPwd||!confirmPwd}>🔓 Restablecer contraseña</button>
    </div>
  );

  return (
    <div className="login-page">
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:28,color:"var(--gold)"}}><Icon.scissors /><h2 className="serif" style={{fontSize:"1.4rem"}}>{BUSINESS_NAME}</h2></div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:22,color:"var(--smoke)"}}><Icon.lock /><span style={{fontSize:"0.82rem",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em"}}>Panel de Control</span></div>
      <div className="input-group"><label>Contraseña de administrador</label><input type="password" placeholder="••••••••" value={pwd} onChange={e => setPwd(e.target.value)} onKeyDown={e => e.key==="Enter"&&handleLogin()} style={{borderColor:loginError?"var(--red)":undefined}} autoComplete="current-password" />{loginError&&<p style={{color:"var(--red)",fontSize:"0.78rem",marginTop:5}}>Contraseña incorrecta.</p>}</div>
      <button className="btn-primary" onClick={handleLogin} style={{marginTop:6}}><Icon.lock /> Acceder al panel</button>
      <button onClick={() => { setMode("recover"); setLoginError(false); setPwd(""); }} style={{background:"none",border:"none",width:"100%",marginTop:16,color:"var(--smoke)",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textDecoration:"underline",textDecorationStyle:"dotted"}}>¿Olvidaste la contraseña?</button>
    </div>
  );
}

// ============================================================
// MODALS
// ============================================================
function EditModal({ appt, appointments, blocked, days, capacidad, onSave, onClose }) {
  const [date, setDate] = useState(appt.date);
  const [time, setTime] = useState(appt.time ? appt.time.slice(0,5) : "");
  const getAvail = (t) => {
    const reservas = appointments.filter(a => a.date === date && a.status === "confirmed" && a.id !== appt.id && a.time && a.time.slice(0,5) === t).length;
    const bloqueados = getBlockedPuestosForSlot(date, t, blocked);
    return capacidad - reservas - bloqueados;
  };
  const available = ALL_SLOTS.filter(t => getAvail(t) > 0);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-title">✏️ Modificar — {appt.name}</div>
        <div className="input-group"><label>Nuevo día</label><select value={date} onChange={e => { setDate(e.target.value); setTime(""); }}>{days.map(d => <option key={d} value={d}>{formatDate(d)}</option>)}</select></div>
        <div className="input-group"><label>Nueva hora</label><select value={time} onChange={e => setTime(e.target.value)}><option value="">-- Seleccionar --</option>{available.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
        <div style={{display:"flex",gap:10,marginTop:8}}>
          <button className="btn-secondary" onClick={onClose} style={{marginTop:0}}>Cancelar</button>
          <button className="btn-primary" style={{marginTop:0}} onClick={() => time && onSave({...appt,date,time:time+":00"})} disabled={!time}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

function NoteModal({ appt, onSave, onClose }) {
  const [note, setNote] = useState(appt.notes || "");
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-title">📝 Nota — {appt.name}</div>
        <div className="input-group"><label>Nota interna</label><textarea placeholder="Solo visible para el admin..." value={note} onChange={e => setNote(e.target.value)} /></div>
        <div style={{display:"flex",gap:10,marginTop:8}}>
          <button className="btn-secondary" onClick={onClose} style={{marginTop:0}}>Cancelar</button>
          <button className="btn-primary" style={{marginTop:0}} onClick={() => onSave({...appt,notes:note})}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// BLOQUEO PARCIAL MODAL
// ============================================================
function BloqueoModal({ date, capacidad, blocked, onAdd, onRemove, onClose }) {
  const [puestos, setPuestos] = useState(1);
  const [desde, setDesde] = useState(ALL_SLOTS[0]);
  const [hasta, setHasta] = useState(ALL_SLOTS[ALL_SLOTS.length - 1]);

  const bloqueosDia = blocked.filter(b => b.date === date);

  // Agrupa bloqueos por rango para mostrarlos mejor
  const resumenPorId = bloqueosDia.reduce((acc, b) => {
    const key = b.id;
    if (!acc[key]) acc[key] = b;
    return acc;
  }, {});

  const handleAplicar = () => {
    if (puestos < 1) return;
    const slots = ALL_SLOTS.filter(t => t >= desde && t <= hasta);
    if (slots.length === 0) return;
    onAdd(date, desde, hasta, puestos);
    onClose();
  };

  const maxBloqueable = capacidad;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-title">🔒 Bloqueo parcial — {formatDateShort(date)}</div>

        <div className="block-panel" style={{margin:"0 0 14px"}}>
          <div className="block-panel-title">Puestos a bloquear</div>
          <div className="stepper">
            <button className="stepper-btn" onClick={() => setPuestos(p => Math.max(1, p-1))}>−</button>
            <div className="stepper-val">{puestos}</div>
            <button className="stepper-btn" onClick={() => setPuestos(p => Math.min(maxBloqueable, p+1))}>+</button>
            <span style={{fontSize:"0.8rem",color:"var(--smoke)"}}>de {capacidad} totales</span>
          </div>
        </div>

        <div className="input-group">
          <label>Desde</label>
          <select value={desde} onChange={e => setDesde(e.target.value)}>
            {ALL_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label>Hasta</label>
          <select value={hasta} onChange={e => setHasta(e.target.value)}>
            {ALL_SLOTS.filter(t => t >= desde).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <button className="btn-primary" onClick={handleAplicar} style={{marginTop:4}}>
          <Icon.ban /> Aplicar bloqueo
        </button>

        {bloqueosDia.length > 0 && (
          <>
            <div style={{fontWeight:700,fontSize:"0.82rem",margin:"16px 0 8px"}}>Bloqueos activos este día</div>
            <div className="block-list">
              {Object.values(resumenPorId).map(b => (
                <div key={b.id} className="block-item">
                  <div className="block-item-info">
                    <span className="block-badge">🔒 {b.puestos} puesto{b.puestos>1?"s":""}</span>
                    <span style={{fontSize:"0.8rem"}}>{b.time}</span>
                  </div>
                  <button onClick={() => onRemove(b.id)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--red)",display:"flex",alignItems:"center"}}>
                    <Icon.x />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <button className="btn-secondary" onClick={onClose} style={{marginTop:10}}>Cerrar</button>
      </div>
    </div>
  );
}

// ============================================================
// APPT CARD
// ============================================================
function ApptCard({ appt, onEdit, onNote, onCancel, showDate }) {
  const [confirming, setConfirming] = useState(false);
  const displayTime = appt.time ? appt.time.slice(0,5) : "";

  if (confirming) return (
    <div className="appt-card" style={{borderColor:"var(--red)",borderWidth:2,flexWrap:"wrap",gap:10}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:700,fontSize:"0.85rem",color:"var(--red)",marginBottom:2}}>¿Cancelar esta cita?</div>
        <div style={{fontSize:"0.82rem",color:"var(--charcoal)"}}><strong>{appt.name}</strong> · {displayTime}{showDate?` · ${formatDateShort(appt.date)}`:""}</div>
        <div style={{fontSize:"0.75rem",color:"var(--smoke)",marginTop:2}}>Esta acción no se puede deshacer</div>
      </div>
      <div style={{display:"flex",gap:6,flexShrink:0}}>
        <button className="btn-sm" onClick={() => setConfirming(false)}>No, volver</button>
        <button className="btn-danger" style={{fontWeight:700}} onClick={() => { setConfirming(false); onCancel(); }}><Icon.trash /> Sí, cancelar</button>
      </div>
    </div>
  );

  return (
    <div className="appt-card">
      <div className="appt-time-badge">{displayTime}{showDate&&<div style={{fontSize:"0.6rem",marginTop:2,opacity:0.7}}>{formatDateShort(appt.date)}</div>}</div>
      <div className="appt-info">
        <div className="name">{appt.name}</div>
        <div className="phone">📞 {appt.phone}{appt.email?` · ${appt.email}`:""}</div>
        {appt.notes&&<div className="appt-note">📝 {appt.notes}</div>}
      </div>
      <div className="appt-actions">
        <button className="btn-sm" onClick={onNote}><Icon.note /></button>
        <button className="btn-sm" onClick={onEdit}><Icon.edit /></button>
        <button className="btn-danger" onClick={() => setConfirming(true)}><Icon.x /></button>
      </div>
    </div>
  );
}

// ============================================================
// STATS TAB
// ============================================================
function StatsTab({ appointments }) {
  const now = new Date();
  const currentMonthKey = now.toISOString().slice(0,7);
  const [selectedMonthKey, setSelectedMonthKey] = useState(currentMonthKey);
  const confirmed = appointments.filter(a => a.status === "confirmed");
  const today = confirmed.filter(a => a.date === todayStr());
  const thisWeek = confirmed.filter(a => {
    const d = new Date(a.date + "T12:00:00");
    const start = new Date(now); start.setDate(now.getDate()-now.getDay()+1);
    const end = new Date(start); end.setDate(start.getDate()+6);
    return d >= start && d <= end;
  });
  const slotCount = {};
  confirmed.forEach(a => { if(a.time){const t=a.time.slice(0,5);slotCount[t]=(slotCount[t]||0)+1;} });
  const topSlots = Object.entries(slotCount).sort((a,b) => b[1]-a[1]).slice(0,5);
  const maxCount = topSlots[0]?.[1]||1;
  const monthSet = new Set([currentMonthKey]);
  appointments.forEach(a => { if(a.date) monthSet.add(a.date.slice(0,7)); });
  const monthKeys = Array.from(monthSet).sort((a,b) => b.localeCompare(a));
  function monthLabel(key) { const [y,m]=key.split("-"); return new Date(parseInt(y),parseInt(m)-1,1).toLocaleDateString("es-ES",{month:"long",year:"numeric"}); }
  const monthConfirmed = confirmed.filter(a => a.date.startsWith(selectedMonthKey));
  const monthCancelled = appointments.filter(a => a.status==="cancelled"&&a.date.startsWith(selectedMonthKey));
  const byDay = {};
  monthConfirmed.forEach(a => { if(!byDay[a.date]) byDay[a.date]=[]; byDay[a.date].push(a); });
  const sortedDays = Object.keys(byDay).sort();

  return (
    <div style={{paddingBottom:36}}>
      <div className="section-title"><Icon.chart /> Resumen general</div>
      <div className="stats-grid">
        {[{val:today.length,label:"Citas hoy"},{val:thisWeek.length,label:"Esta semana"},{val:confirmed.filter(a=>a.date.startsWith(currentMonthKey)).length,label:"Este mes"},{val:confirmed.length,label:"Total activas"}].map(s=>(
          <div key={s.label} className="stat-card"><div className="stat-val">{s.val}</div><div className="stat-label">{s.label}</div></div>
        ))}
      </div>
      {topSlots.length>0&&(<><div className="section-title" style={{marginTop:6}}>Horas más reservadas</div><div style={{background:"white",borderRadius:13,border:"1.5px solid var(--border)",margin:"0 16px",padding:"14px 16px"}}>{topSlots.map(([time,count])=>(<div key={time} className="popular-row"><span style={{fontWeight:600,minWidth:40,fontSize:"0.85rem"}}>{time}</span><div className="popular-bar" style={{width:`${(count/maxCount)*110}px`}}/><span style={{color:"var(--smoke)",fontSize:"0.78rem"}}>{count} cita{count>1?"s":""}</span></div>))}</div></>)}
      <div className="section-title" style={{marginTop:16}}>📋 Informe mensual</div>
      <div style={{padding:"0 16px 12px"}}><div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,scrollbarWidth:"none"}}>{monthKeys.map(key=>(<button key={key} onClick={()=>setSelectedMonthKey(key)} style={{flexShrink:0,padding:"7px 14px",borderRadius:20,border:"1.5px solid",borderColor:selectedMonthKey===key?"var(--ink)":"var(--border)",background:selectedMonthKey===key?"var(--ink)":"white",color:selectedMonthKey===key?"var(--gold)":"var(--smoke)",fontSize:"0.78rem",fontWeight:selectedMonthKey===key?700:400,fontFamily:"'DM Sans',sans-serif",cursor:"pointer",textTransform:"capitalize"}}>{key===currentMonthKey?"Este mes":monthLabel(key)}</button>))}</div></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,padding:"0 16px 14px"}}>{[{val:monthConfirmed.length,label:"Completadas",color:"var(--green)"},{val:monthCancelled.length,label:"Canceladas",color:"var(--red)"},{val:monthConfirmed.length,label:"Neto final",color:"var(--gold-dark)"}].map(s=>(<div key={s.label} style={{background:"white",borderRadius:12,padding:"12px 10px",border:"1.5px solid var(--border)",textAlign:"center"}}><div style={{fontSize:"1.5rem",fontWeight:700,color:s.color,lineHeight:1}}>{s.val}</div><div style={{fontSize:"0.62rem",color:"var(--smoke)",marginTop:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>{s.label}</div></div>))}</div>
      <div style={{margin:"0 16px 10px",background:"var(--ink)",borderRadius:13,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}><div><div style={{color:"var(--gold)",fontWeight:700,fontSize:"0.95rem",textTransform:"capitalize"}}>{monthLabel(selectedMonthKey)}</div><div style={{color:"#888",fontSize:"0.72rem",marginTop:2}}>{selectedMonthKey===currentMonthKey?"Mes en curso":"Mes cerrado"} · {monthConfirmed.length} confirmada{monthConfirmed.length!==1?"s":""}{monthCancelled.length>0?` · ${monthCancelled.length} cancelada${monthCancelled.length!==1?"s":""}`:""}</div></div><div style={{color:"var(--gold)",fontSize:"1.8rem",fontWeight:800,lineHeight:1}}>{monthConfirmed.length}</div></div>
      <div style={{padding:"0 16px"}}>{sortedDays.length===0?<div style={{textAlign:"center",padding:"20px 0",color:"var(--smoke)",fontSize:"0.85rem"}}>Sin reservas en {monthLabel(selectedMonthKey)}</div>:sortedDays.map(day=>(<div key={day} style={{marginBottom:10}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0 4px"}}><span style={{fontSize:"0.72rem",fontWeight:700,textTransform:"capitalize",color:"var(--charcoal)",letterSpacing:"0.04em"}}>{formatDate(day)}</span><span style={{fontSize:"0.7rem",background:"var(--gold-light)",color:"var(--gold-dark)",borderRadius:10,padding:"2px 8px",fontWeight:700}}>{byDay[day].length} cita{byDay[day].length>1?"s":""}</span></div>{byDay[day].sort((a,b)=>(a.time||"").localeCompare(b.time||"")).map(appt=>(<div key={appt.id} style={{display:"flex",alignItems:"center",gap:10,background:"white",borderRadius:10,padding:"9px 12px",marginBottom:5,border:"1px solid var(--border)"}}><span style={{background:"var(--ink)",color:"var(--gold)",borderRadius:7,padding:"4px 8px",fontSize:"0.78rem",fontWeight:700,flexShrink:0}}>{appt.time?appt.time.slice(0,5):""}</span><div style={{flex:1,minWidth:0}}><div style={{fontSize:"0.85rem",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{appt.name}</div><div style={{fontSize:"0.72rem",color:"var(--smoke)"}}>{appt.phone}</div></div></div>))}</div>))}</div>
      {monthCancelled.length>0&&(<div style={{margin:"10px 16px 0",padding:"11px 14px",background:"#fff8f8",border:"1px solid #fcc",borderRadius:11}}><div style={{fontSize:"0.75rem",color:"var(--red)",fontWeight:600,marginBottom:6}}>❌ {monthCancelled.length} cancelación{monthCancelled.length>1?"es":""}</div>{monthCancelled.map(appt=>(<div key={appt.id} style={{fontSize:"0.78rem",color:"var(--smoke)",padding:"3px 0",borderTop:"1px solid #fee",display:"flex",gap:8}}><span style={{color:"#ccc",minWidth:38}}>{appt.time?appt.time.slice(0,5):""}</span><span style={{textDecoration:"line-through"}}>{appt.name}</span><span style={{marginLeft:"auto",fontSize:"0.68rem"}}>{formatDateShort(appt.date)}</span></div>))}</div>)}
    </div>
  );
}

// ============================================================
// BIZ SETTINGS
// ============================================================
function BizSettingsTab({ bizConfig, onBizConfig, showToast }) {
  const [form, setForm] = useState({...bizConfig});
  const [saved, setSaved] = useState(false);
  const handleSave = () => {
    if (!form.name.trim()) return;
    onBizConfig(form); setSaved(true);
    showToast("✅ Configuración guardada");
    setTimeout(() => setSaved(false), 3000);
  };
  const Field = ({ label, field, placeholder, hint }) => (
    <div className="input-group"><label>{label}</label><input type="text" placeholder={placeholder} value={form[field]} onChange={e => setForm(f => ({...f,[field]:e.target.value}))} />{hint&&<p style={{fontSize:"0.7rem",color:"var(--smoke)",marginTop:4}}>{hint}</p>}</div>
  );
  return (
    <div style={{padding:"16px 16px 36px"}}>
      <div style={{background:"var(--ink)",borderRadius:16,padding:"16px 18px",marginBottom:16,display:"flex",alignItems:"center",gap:12}}><div style={{color:"var(--gold)",flexShrink:0}}><Icon.scissors /></div><div><div style={{color:"var(--gold)",fontWeight:700,fontSize:"0.9rem"}}>Datos del negocio</div><div style={{color:"#888",fontSize:"0.7rem",marginTop:1}}>Visibles para los clientes</div></div></div>
      {saved&&<div style={{background:"#f0fff4",border:"1px solid #68d391",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:"0.82rem",color:"var(--green)",fontWeight:600}}>✅ Guardado</div>}
      <div style={{background:"white",borderRadius:16,border:"1.5px solid var(--border)",padding:"18px"}}>
        <Field label="Nombre del negocio *" field="name" placeholder="Ej: Barbería Alejandro" hint="Aparece en el encabezado" />
        <Field label="Dirección" field="address" placeholder="Ej: Calle Mayor 12, Madrid" />
        <Field label="Teléfono" field="phone" placeholder="Ej: 912 345 678" />
        <Field label="Horario" field="schedule" placeholder="Ej: Lunes a Sábado · 09:30 – 21:30" />
        <Field label="Política de cancelación" field="cancelPolicy" placeholder="Ej: Cancelación gratuita con 24h" />
        <button className="btn-primary" onClick={handleSave} disabled={!form.name.trim()} style={{marginTop:8}}><Icon.check /> Guardar configuración</button>
      </div>
      <div style={{marginTop:14}}><div className="section-title" style={{padding:"0 0 8px"}}>Vista previa</div><div className="info-box" style={{margin:0}}>✂️ <strong>{form.name||"Nombre"}</strong>{form.address?` · ${form.address}`:""}<br />{form.schedule||"Horario"} · Citas de 30 min<br />{form.phone?`📞 ${form.phone} · `:""}{form.cancelPolicy||"Política cancelación"}</div></div>
    </div>
  );
}

// ============================================================
// SETTINGS TAB
// ============================================================
function SettingsTab({ adminPassword, onPasswordChange, showToast }) {
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = async () => {
    setError("");
    if (currentPwd !== adminPassword) { setError("La contraseña actual no es correcta."); return; }
    if (newPwd.length < 6) { setError("Mínimo 6 caracteres."); return; }
    if (newPwd !== confirmPwd) { setError("Las contraseñas no coinciden."); return; }
    await onPasswordChange(newPwd);
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    setSuccess(true); showToast("🔐 Contraseña actualizada");
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <div style={{padding:"16px 16px 36px"}}>
      <div style={{background:"white",borderRadius:16,border:"1.5px solid var(--border)",overflow:"hidden",marginBottom:16}}>
        <div style={{background:"var(--ink)",padding:"14px 18px",display:"flex",alignItems:"center",gap:10}}><span style={{color:"var(--gold)"}}><Icon.lock /></span><div><div style={{color:"var(--gold)",fontWeight:700,fontSize:"0.9rem"}}>Cambiar contraseña</div><div style={{color:"#888",fontSize:"0.7rem",marginTop:1}}>Solo tú conoces el acceso</div></div></div>
        <div style={{padding:"18px"}}>
          {success&&<div style={{background:"#f0fff4",border:"1px solid #68d391",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:"0.82rem",color:"var(--green)",fontWeight:600}}>✅ Contraseña actualizada</div>}
          {error&&<div style={{background:"#fff5f5",border:"1px solid #fcc",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:"0.82rem",color:"var(--red)"}}>⚠️ {error}</div>}
          <div className="input-group"><label>Contraseña actual</label><input type="password" placeholder="Tu contraseña actual" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} /></div>
          <div className="input-group"><label>Nueva contraseña</label><div style={{position:"relative",display:"flex",alignItems:"center"}}><input type={showNew?"text":"password"} placeholder="Mínimo 6 caracteres" value={newPwd} onChange={e => setNewPwd(e.target.value)} style={{paddingRight:44}} /><button type="button" onClick={() => setShowNew(v=>!v)} style={{position:"absolute",right:14,background:"none",border:"none",cursor:"pointer",color:"var(--smoke)"}}>👁</button></div></div>
          <div className="input-group"><label>Repetir nueva</label><input type="password" placeholder="Repite la contraseña" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} style={{borderColor:confirmPwd&&confirmPwd!==newPwd?"var(--red)":confirmPwd&&confirmPwd===newPwd?"var(--green)":undefined}} /></div>
          <button className="btn-primary" onClick={handleChange} disabled={!currentPwd||!newPwd||!confirmPwd} style={{marginTop:4}}><Icon.lock /> Guardar contraseña</button>
        </div>
      </div>
      <div className="info-box" style={{margin:0}}>💡 Usa al menos 8 caracteres combinando letras y números.</div>
    </div>
  );
}

// ============================================================
// ADMIN PANEL
// ============================================================
function AdminPanel({ appointments, blocked, onCancelAppt, onUpdateAppt, onBlock, onUnblock, onBlockDay, onBlockParcial, onUnblockParcial, onLogout, showToast, adminPassword, onPasswordChange, bizConfig, onBizConfig, capacidad, setCapacidad }) {
  const [tab, setTab] = useState("agenda");
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [editModal, setEditModal] = useState(null);
  const [noteModal, setNoteModal] = useState(null);
  const [bloqueoModal, setBloqueoModal] = useState(false);
  const [search, setSearch] = useState("");
  const days = getNext30Days();

  const dateAppts = appointments.filter(a => a.date === selectedDate && a.status === "confirmed").sort((a,b) => (a.time||"").localeCompare(b.time||""));
  const blockedDia = blocked.filter(b => b.date === selectedDate);
  const blockedTimesCompletos = ALL_SLOTS.filter(t => {
    const totalBloqueados = blockedDia.filter(b => b.time === t).reduce((s,b) => s+(b.puestos||1),0);
    return totalBloqueados >= capacidad;
  });
  const isFullBlocked = blockedTimesCompletos.length >= ALL_SLOTS.length;
  const searchResults = search.trim().length > 1 ? appointments.filter(a => a.status==="confirmed"&&(a.name.toLowerCase().includes(search.toLowerCase())||a.phone.includes(search))).sort((a,b) => a.date.localeCompare(b.date)) : [];
  const urgentAppts = appointments.filter(a => { const diff=(new Date(a.date+"T"+(a.time||"00:00"))-new Date())/3600000; return diff>0&&diff<=24&&a.status==="confirmed"; });

  return (
    <div>
      <div className="admin-header">
        <div><div style={{color:"var(--gold)",fontWeight:700,fontFamily:"'Playfair Display',serif",fontSize:"1.05rem"}}>{bizConfig?.name||BUSINESS_NAME}</div><div style={{color:"#666",fontSize:"0.68rem",marginTop:2}}>Panel de Administración</div></div>
        <button onClick={onLogout} className="btn-sm" style={{background:"#1a1a1a",color:"#888",border:"1px solid #333"}}><Icon.logout /> Salir</button>
      </div>
      <div className="admin-tab-bar">
        {[{id:"agenda",label:"Agenda"},{id:"availability",label:"Horarios"},{id:"stats",label:"Stats"},{id:"alerts",label:urgentAppts.length>0?<>Avisos<span className="badge-count">{urgentAppts.length}</span></>:"Avisos"},{id:"biz",label:"🏪"},{id:"settings",label:"⚙️"}].map(t=>(
          <div key={t.id} className={`admin-tab ${tab===t.id?"active":""}`} onClick={() => setTab(t.id)}>{t.label}</div>
        ))}
      </div>

      {tab==="agenda"&&(
        <div>
          <div className="search-box"><Icon.search /><input placeholder="Buscar nombre o teléfono..." value={search} onChange={e => setSearch(e.target.value)} />{search&&<button style={{background:"none",border:"none",cursor:"pointer",color:"var(--smoke)",display:"flex"}} onClick={() => setSearch("")}><Icon.x /></button>}</div>
          {search.trim().length>1?(
            <div style={{padding:"0 16px 20px"}}>
              <div className="section-title" style={{padding:"0 0 8px"}}>{searchResults.length} resultado{searchResults.length!==1?"s":""}</div>
              {searchResults.length===0?<div className="no-items">Sin resultados</div>:searchResults.map(appt=><ApptCard key={appt.id} appt={appt} showDate onEdit={()=>setEditModal(appt)} onNote={()=>setNoteModal(appt)} onCancel={()=>{onCancelAppt(appt.id);showToast("Cita cancelada");}} />)}
            </div>
          ):(
            <>
              <div className="calendar-strip" style={{paddingTop:10,paddingBottom:10}}>
                {days.map(d=>{
                  const count=appointments.filter(a=>a.date===d&&a.status==="confirmed").length;
                  const dateObj=new Date(d+"T12:00:00");
                  return (
                    <div key={d} className={`day-card ${selectedDate===d?"selected":""} ${d===todayStr()?"today-card":""}`} onClick={()=>setSelectedDate(d)} style={{width:52}}>
                      <div className="day-name">{dateObj.toLocaleDateString("es-ES",{weekday:"short"})}</div>
                      <div className="day-num">{dateObj.getDate()}</div>
                      {count>0&&<div style={{fontSize:"0.58rem",color:selectedDate===d?"var(--gold-light)":"var(--gold)",fontWeight:700}}>{count} citas</div>}
                    </div>
                  );
                })}
              </div>
              <div className="section-title">{formatDate(selectedDate)} — {dateAppts.length} cita{dateAppts.length!==1?"s":""}</div>
              <div style={{padding:"0 16px 24px"}}>
                {dateAppts.length===0?<div className="no-items">Sin citas para este día 🎉</div>:dateAppts.map(appt=><ApptCard key={appt.id} appt={appt} onEdit={()=>setEditModal(appt)} onNote={()=>setNoteModal(appt)} onCancel={()=>{onCancelAppt(appt.id);showToast("Cita cancelada");}} />)}
              </div>
            </>
          )}
        </div>
      )}

      {tab==="availability"&&(
        <div>
          <div className="calendar-strip" style={{paddingTop:10,paddingBottom:10}}>
            {days.map(d=>{
              const fb=blocked.filter(b=>b.date===d).reduce((s,b)=>s+(b.puestos||1),0) >= ALL_SLOTS.length * capacidad;
              const dateObj=new Date(d+"T12:00:00");
              const tieneParcial=blocked.some(b=>b.date===d);
              return (
                <div key={d} className={`day-card ${selectedDate===d?"selected":""}`} onClick={()=>setSelectedDate(d)} style={{width:52}}>
                  <div className="day-name">{dateObj.toLocaleDateString("es-ES",{weekday:"short"})}</div>
                  <div className="day-num">{dateObj.getDate()}</div>
                  {fb?<div style={{fontSize:"0.55rem",color:selectedDate===d?"#ff9999":"var(--red)",fontWeight:700}}>CERRADO</div>
                    :tieneParcial?<div style={{fontSize:"0.55rem",color:selectedDate===d?"#ffd080":"#e67e22",fontWeight:700}}>🔒 PARC.</div>
                    :null}
                </div>
              );
            })}
          </div>

          {/* Control puestos */}
          <div style={{padding:"0 16px 10px"}}>
            <div className="block-panel">
              <div className="block-panel-title">✂️ Puestos de trabajo simultáneos</div>
              <div className="stepper">
                <button className="stepper-btn" onClick={async()=>{if(capacidad>1){const n=capacidad-1;setCapacidad(n);await supabase.from("settings").update({value:String(n)}).eq("key","capacidad");}}} >−</button>
                <div className="stepper-val">{capacidad}</div>
                <button className="stepper-btn" onClick={async()=>{const n=capacidad+1;setCapacidad(n);await supabase.from("settings").update({value:String(n)}).eq("key","capacidad");}}>+</button>
                <span style={{fontSize:"0.8rem",color:"var(--smoke)"}}>reservas por franja</span>
              </div>
            </div>
          </div>

          {/* Bloqueo día completo */}
          <div style={{padding:"0 16px 10px"}}>
            <button className="btn-primary" style={{background:isFullBlocked?"#c0392b":"var(--ink)",color:isFullBlocked?"white":"var(--gold)"}}
              onClick={()=>{if(isFullBlocked){ALL_SLOTS.forEach(t=>onUnblock(selectedDate,t));showToast("Día desbloqueado");}else{onBlockDay(selectedDate);showToast("Día bloqueado");}}}>
              <Icon.ban /> {isFullBlocked?"Desbloquear día completo":"Bloquear día completo"}
            </button>
          </div>

          {/* Bloqueo parcial solo si capacidad > 1 */}
          {capacidad > 1 && (
            <div style={{padding:"0 16px 10px"}}>
              <button className="btn-gold" style={{width:"100%",justifyContent:"center"}} onClick={() => setBloqueoModal(true)}>
                🔒 Bloquear puestos parcialmente
              </button>
            </div>
          )}

          {/* Grid de franjas */}
          <div className="section-title">Franjas — {formatDateShort(selectedDate)}</div>
          <div className="info-box" style={{margin:"0 16px 10px"}}>
            {capacidad > 1
              ? "Naranja = franja con puestos bloqueados parcialmente. Toca para ver detalles."
              : "Toca una franja para bloquear o desbloquear."}
          </div>
          <div className="time-grid" style={{padding:"0 16px 24px"}}>
            {ALL_SLOTS.map(t=>{
              const hasAppt=appointments.some(a=>a.date===selectedDate&&a.time&&a.time.slice(0,5)===t&&a.status==="confirmed");
              const totalBloqueados=blockedDia.filter(b=>b.time===t).reduce((s,b)=>s+(b.puestos||1),0);
              const isFullyBlocked=totalBloqueados>=capacidad;
              const isPartiallyBlocked=totalBloqueados>0&&totalBloqueados<capacidad;
              return (
                <div key={t}
                  className={`time-slot${hasAppt?" occupied":""}${isFullyBlocked&&!hasAppt?" blocked":""}${isPartiallyBlocked&&!hasAppt?" partial":""}`}
                  style={{cursor:hasAppt?"not-allowed":"pointer"}}
                  onClick={()=>{
                    if(hasAppt)return;
                    if(capacidad===1){
                      if(isFullyBlocked){onUnblock(selectedDate,t);showToast(`${t} desbloqueado`);}
                      else{onBlock(selectedDate,t);showToast(`${t} bloqueado`);}
                    } else {
                      setBloqueoModal(true);
                    }
                  }}>
                  {t}
                  {hasAppt&&<div style={{fontSize:"0.55rem",marginTop:1}}>Con cita</div>}
                  {isFullyBlocked&&!hasAppt&&<div style={{fontSize:"0.55rem",marginTop:1}}>Bloqueado</div>}
                  {isPartiallyBlocked&&!hasAppt&&<span className="partial-badge">🔒{totalBloqueados}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab==="stats"&&<StatsTab appointments={appointments} />}

      {tab==="alerts"&&(
        <div style={{padding:"16px"}}>
          <div className="info-box" style={{margin:"0 0 14px"}}>⚡ Citas en las <strong>próximas 24 horas</strong></div>
          {urgentAppts.length===0?<div className="no-items">Sin citas urgentes ✨</div>:urgentAppts.map(appt=>(
            <div key={appt.id} className="appt-card" style={{borderLeft:"4px solid var(--gold)"}}>
              <div className="appt-time-badge">{appt.time?appt.time.slice(0,5):""}</div>
              <div className="appt-info"><div className="name">{appt.name}</div><div className="phone">📞 {appt.phone} · {formatDateShort(appt.date)}</div>{appt.email&&<div className="phone">📧 {appt.email}</div>}</div>
            </div>
          ))}
        </div>
      )}

      {tab==="biz"&&<BizSettingsTab bizConfig={bizConfig} onBizConfig={onBizConfig} showToast={showToast} />}
      {tab==="settings"&&<SettingsTab adminPassword={adminPassword} onPasswordChange={onPasswordChange} showToast={showToast} />}

      {editModal&&<EditModal appt={editModal} appointments={appointments} blocked={blocked} days={days} capacidad={capacidad} onSave={async updated=>{await onUpdateAppt(updated);setEditModal(null);showToast("✅ Cita actualizada");}} onClose={()=>setEditModal(null)} />}
      {noteModal&&<NoteModal appt={noteModal} onSave={async updated=>{await onUpdateAppt(updated);setNoteModal(null);showToast("📝 Nota guardada");}} onClose={()=>setNoteModal(null)} />}
      {bloqueoModal&&<BloqueoModal date={selectedDate} capacidad={capacidad} blocked={blocked} onAdd={(date,desde,hasta,puestos)=>{onBlockParcial(date,desde,hasta,puestos);showToast("Bloqueo aplicado");}} onRemove={(id)=>{onUnblockParcial(id);showToast("Bloqueo eliminado");}} onClose={()=>setBloqueoModal(false)} />}
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [appointments, setAppointments] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [capacidad, setCapacidad] = useState(1);
  const [route, setRoute] = useState("home");
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [toast, setToast] = useState(null);
  const [cancelId, setCancelId] = useState(null);
  const [adminPassword, setAdminPassword] = useState(DEFAULT_ADMIN_PASSWORD);
  const [bizConfig, setBizConfig] = useState({ name: BUSINESS_NAME, address: "", phone: "", schedule: "Lunes a Sábado · 09:30 – 21:30", cancelPolicy: "Cancelación gratuita con 24h de antelación" });

  const handlePasswordChange = async (p) => {
    await supabase.from("settings").update({ value: p }).eq("key", "admin_password");
    setAdminPassword(p);
  };

  const handleBizConfig = async (c) => {
    await Promise.all([
      supabase.from("settings").update({ value: c.name }).eq("key", "biz_name"),
      supabase.from("settings").update({ value: c.address }).eq("key", "biz_address"),
      supabase.from("settings").update({ value: c.phone }).eq("key", "biz_phone"),
      supabase.from("settings").update({ value: c.schedule }).eq("key", "biz_schedule"),
      supabase.from("settings").update({ value: c.cancelPolicy }).eq("key", "biz_cancel_policy"),
    ]);
    setBizConfig(c);
  };

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [{ data: appts }, { data: blk }, { data: setts }] = await Promise.all([
      supabase.from("appointments").select("*").order("date").order("time"),
      supabase.from("blocked_slots").select("*"),
      supabase.from("settings").select("*")
    ]);
    setAppointments(appts || []);
    setBlocked((blk || []).map(b => ({ ...b, time: b.time ? b.time.slice(0,5) : b.time })));
    if (setts) {
      const get = (key, def) => setts.find(s => s.key === key)?.value || def;
      setAdminPassword(get("admin_password", DEFAULT_ADMIN_PASSWORD));
      setCapacidad(parseInt(get("capacidad", "1")));
      setBizConfig({
        name: get("biz_name", BUSINESS_NAME),
        address: get("biz_address", ""),
        phone: get("biz_phone", ""),
        schedule: get("biz_schedule", "Lunes a Sábado · 09:30 – 21:30"),
        cancelPolicy: get("biz_cancel_policy", "Cancelación gratuita con 24h de antelación"),
      });
    }
    setLoading(false);
  }

  useEffect(() => {
    const channel = supabase.channel("realtime-all")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "blocked_slots" }, () => loadData())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const showToast = useCallback(msg => setToast(msg), []);

  const handleBook = async (apptData) => {
    const { data, error } = await supabase.from("appointments").insert(apptData).select().single();
    if (error) throw error;
    setAppointments(prev => [...prev, data]);
    return data;
  };

  const handleCancel = async (id) => {
    await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id);
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "cancelled" } : a));
  };

  const handleUpdate = async (updated) => {
    await supabase.from("appointments").update({ date: updated.date, time: updated.time, notes: updated.notes }).eq("id", updated.id);
    setAppointments(prev => prev.map(a => a.id === updated.id ? { ...a, ...updated } : a));
  };

  // Bloqueo total de una franja (capacidad=1)
  const handleBlock = async (date, time) => {
    const { data, error } = await supabase.from("blocked_slots").insert({ date, time, puestos: capacidad }).select().single();
    if (!error) setBlocked(prev => [...prev, { ...data, time: data.time ? data.time.slice(0,5) : data.time }]);
  };

  // Desbloqueo por fecha+hora (para bloqueo completo con capacidad=1)
  const handleUnblock = async (date, time) => {
    await supabase.from("blocked_slots").delete().eq("date", date).eq("time", time);
    setBlocked(prev => prev.filter(b => !(b.date === date && b.time === time)));
  };

  // Bloqueo día completo
  const handleBlockDay = async (date) => {
    await supabase.from("blocked_slots").delete().eq("date", date);
    const rows = ALL_SLOTS.map(t => ({ date, time: t, puestos: capacidad }));
    const { data, error } = await supabase.from("blocked_slots").insert(rows).select();
    if (!error) setBlocked(prev => [...prev.filter(b => b.date !== date), ...data.map(b => ({ ...b, time: b.time ? b.time.slice(0,5) : b.time }))]);
  };

  // Bloqueo parcial: añade N puestos en un rango de horas
  const handleBlockParcial = async (date, desde, hasta, puestos) => {
    const slots = ALL_SLOTS.filter(t => t >= desde && t <= hasta);
    const rows = slots.map(t => ({ date, time: t, puestos }));
    const { data, error } = await supabase.from("blocked_slots").insert(rows).select();
    if (!error) setBlocked(prev => [...prev, ...data.map(b => ({ ...b, time: b.time ? b.time.slice(0,5) : b.time }))]);
  };

  // Desbloqueo parcial por ID
  const handleUnblockParcial = async (id) => {
    await supabase.from("blocked_slots").delete().eq("id", id);
    setBlocked(prev => prev.filter(b => b.id !== id));
  };

  const isAdmin = route === "admin";
  const isCancel = route.startsWith("cancel/");

  if (loading) return (
    <div className="app-container">
      <div className="app-header">
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{color:"var(--gold)"}}><Icon.scissors /></div>
          <div><h1 className="serif">{bizConfig?.name||BUSINESS_NAME}</h1><p>Reserva tu cita · Online</p></div>
        </div>
      </div>
      <div className="loading-screen"><div className="spinner"/><p>Cargando...</p></div>
    </div>
  );

  return (
    <div className="app-container">
      <div className="app-header">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{color:"var(--gold)"}}><Icon.scissors /></div>
            <div><h1 className="serif">{bizConfig?.name||BUSINESS_NAME}</h1><p>Reserva tu cita · Online</p></div>
          </div>
          <div style={{display:"flex",gap:8}}>
            {!isAdmin&&!isCancel&&<button style={{background:"none",border:"1px solid #333",color:"#888",borderRadius:8,padding:"6px 10px",fontSize:"0.7rem",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}} onClick={()=>setRoute("admin")}>Admin</button>}
            {(isAdmin||isCancel)&&<button style={{background:"none",border:"1px solid #333",color:"#888",borderRadius:8,padding:"6px 10px",fontSize:"0.7rem",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}} onClick={()=>{setRoute("home");setAdminAuthed(false);}}>← Inicio</button>}
          </div>
        </div>
      </div>
      <div>
        {route==="home"&&<BookingApp appointments={appointments} blocked={blocked} onBook={handleBook} showToast={showToast} bizConfig={bizConfig} capacidad={capacidad} />}
        {route==="admin"&&!adminAuthed&&<AdminLogin onLogin={()=>setAdminAuthed(true)} adminPassword={adminPassword} onPasswordChange={handlePasswordChange} />}
        {route==="admin"&&adminAuthed&&<AdminPanel appointments={appointments} blocked={blocked} onCancelAppt={handleCancel} onUpdateAppt={handleUpdate} onBlock={handleBlock} onUnblock={handleUnblock} onBlockDay={handleBlockDay} onBlockParcial={handleBlockParcial} onUnblockParcial={handleUnblockParcial} onLogout={()=>{setAdminAuthed(false);setRoute("home");}} showToast={showToast} adminPassword={adminPassword} onPasswordChange={handlePasswordChange} bizConfig={bizConfig} onBizConfig={handleBizConfig} capacidad={capacidad} setCapacidad={setCapacidad} />}
        {isCancel&&<CancelPage appointmentId={cancelId} onCancel={handleCancel} />}
      </div>
      {toast&&<Toast message={toast} onDone={()=>setToast(null)} />}
    </div>
  );
}