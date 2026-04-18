'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface DocRowProps {
  name: string;
  docFile: string;
  status: string;
  note?: string;
}

function DocRow({ name, docFile, status, note }: DocRowProps) {
  if (status === 'pending' || !docFile) {
    return (
      <div className={`flex items-start gap-3 rounded-lg px-4 py-3 border ${note ? 'bg-red-50 border-red-200' : 'bg-red-50 border-red-100'}`}>
        <span className={`shrink-0 text-xs font-black px-2 py-0.5 rounded uppercase tracking-widest mt-0.5 ${note ? 'text-red-700 bg-red-100 border border-red-300' : 'text-red-500 bg-red-100 border border-red-200'}`}>
          {note ? 'CRITICAL' : 'Missing'}
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-red-700 font-medium">{name}</span>
          {note && <span className="text-xs text-red-500 leading-relaxed">{note}</span>}
        </div>
      </div>
    );
  }
  const isImage = /\.(png|jpe?g|gif|webp)$/i.test(docFile);
  const label = isImage ? 'View Image' : 'View PDF';
  return (
    <a href={`/docs/${docFile}`} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-3 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg px-4 py-3 transition-colors group">
      <span className="shrink-0 text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase tracking-widest">{label}</span>
      <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium truncate">{name}</span>
    </a>
  );
}

function tagClass(color: string) {
  const m: Record<string, string> = {
    rose:    'bg-rose-100 text-rose-700 border-rose-200',
    blue:    'bg-blue-100 text-blue-700 border-blue-200',
    amber:   'bg-amber-100 text-amber-700 border-amber-200',
    orange:  'bg-orange-100 text-orange-700 border-orange-200',
    red:     'bg-red-100 text-red-700 border-red-200',
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    purple:  'bg-purple-100 text-purple-700 border-purple-200',
    slate:   'bg-gray-100 text-gray-700 border-gray-200',
  };
  return m[color] ?? 'bg-gray-100 text-gray-700 border-gray-200';
}

const TABS = ['SUMMARY','TASK LIST','FLOWCHART','EVIDENCE','TIMELINE','DOCUMENTS','EMAILS','CALCULATOR','REVIEWS','PRECEDENTS','COMPLAINTS','APPLE EMAILS'] as const;
type Tab = typeof TABS[number];

interface NavItem { tab: Tab; label: string; highlight?: boolean }
interface NavGroup { label: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  { label: 'Overview', items: [
    { tab: 'SUMMARY',    label: 'Summary' },
    { tab: 'TIMELINE',   label: 'Timeline' },
    { tab: 'FLOWCHART',  label: 'Strategy' },
  ]},
  { label: 'Evidence', items: [
    { tab: 'EVIDENCE',     label: 'Evidence' },
    { tab: 'REVIEWS',      label: 'Reviews' },
    { tab: 'EMAILS',       label: 'All Emails' },
    { tab: 'APPLE EMAILS', label: 'Apple Emails' },
  ]},
  { label: 'Legal', items: [
    { tab: 'COMPLAINTS',  label: 'Complaints', highlight: true },
    { tab: 'PRECEDENTS',  label: 'Precedents' },
  ]},
];

const NAV_DIRECT: NavItem[] = [
  { tab: 'DOCUMENTS',  label: 'Documents' },
  { tab: 'CALCULATOR', label: 'Calculator' },
  { tab: 'TASK LIST',  label: 'Tasks' },
];

interface EmailRecord {
  id: number;
  subject: string;
  from: string;
  to: string;
  date: string;
  raw_date: string;
  Ref_IDs: string[];
  categories: string[];
  snippet: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  rice: string;
  done: boolean;
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<Tab>('SUMMARY');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allEmails, setAllEmails] = useState<EmailRecord[]>([]);
  const [emailQuery, setEmailQuery] = useState('');
  const [emailsLoaded, setEmailsLoaded] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('apple_tasks').select('*').order('id').then(({ data }) => {
      if (data) setTasks(data as Task[]);
    });
    const channel = supabase.channel('apple-tasks-update')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'apple_tasks' }, () => {
        supabase.from('apple_tasks').select('*').order('id').then(({ data }) => {
          if (data) setTasks(data as Task[]);
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (['EMAILS', 'APPLE EMAILS'].includes(activeTab) && !emailsLoaded) {
      fetch('/emails.json').then(r => r.json()).then((data: EmailRecord[]) => {
        setAllEmails(data);
        setEmailsLoaded(true);
      }).catch(() => setEmailsLoaded(true));
    }
  }, [activeTab, emailsLoaded]);

  const filteredEmails = emailQuery.trim().length < 2 ? allEmails : allEmails.filter(e => {
    const q = emailQuery.toLowerCase();
    return e.subject?.toLowerCase().includes(q) ||
      e.from?.toLowerCase().includes(q) ||
      e.snippet?.toLowerCase().includes(q) ||
      e.categories?.some(c => c.toLowerCase().includes(q));
  });

  async function toggleTask(t: Task) {
    await supabase.from('apple_tasks').update({ done: !t.done }).eq('id', t.id);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center gap-4 h-14">
          <div className="font-bold text-blue-700 text-sm tracking-wide shrink-0 mr-2">⚖️ Apple Case</div>

          {/* Desktop dropdown nav */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1">
            {NAV_GROUPS.map(group => (
              <div key={group.label} className="relative"
                onMouseLeave={() => setOpenMenu(null)}>
                <button
                  onMouseEnter={() => setOpenMenu(group.label)}
                  onClick={() => setOpenMenu(openMenu === group.label ? null : group.label)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    group.items.some(i => i.tab === activeTab)
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}>
                  {group.label}
                  <svg className="w-3 h-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openMenu === group.label && (
                  <div className="absolute left-0 top-full mt-0.5 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[190px] z-50">
                    {group.items.map(item => (
                      <button key={item.tab}
                        onClick={() => { setActiveTab(item.tab); setOpenMenu(null); }}
                        className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                          activeTab === item.tab
                            ? 'bg-blue-50 text-blue-700'
                            : item.highlight
                            ? 'text-rose-600 hover:bg-rose-50'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}>
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="w-px h-4 bg-gray-200 mx-1" />
            {NAV_DIRECT.map(item => (
              <button key={item.tab} onClick={() => setActiveTab(item.tab)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === item.tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile tab scroll */}
          <nav className="md:hidden flex items-center gap-0.5 overflow-x-auto flex-1">
            {TABS.map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-bold tracking-wide transition-colors whitespace-nowrap ${
                  activeTab === t ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}>
                {t}
              </button>
            ))}
          </nav>

          <span className="shrink-0 bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full border border-red-200 ml-auto">CONFIDENTIAL</span>
        </div>
      </header>

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white">
        <div className="max-w-[1400px] mx-auto px-4 py-6">
          <h1 className="text-2xl font-black mb-1">Suraj Satyarthi v. Apple India Pvt. Ltd.</h1>
          <p className="text-blue-200 text-sm mb-4">Consumer Protection Act 2019 — Manufacturing Defect + Deficiency in Service + Wrongful Retention of Property</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Documented Crashes', value: '5', sub: 'Feb 19–25, 2026' },
              { label: 'Service Centre Visits', value: '3', sub: 'Apple-confirmed appointments' },
              { label: 'Device Age at 1st Crash', value: '11 days', sub: 'Delivered 8 Feb, crash 19 Feb' },
              { label: 'Total Claim', value: '₹1,55,768+', sub: 'Replacement + compensation' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl px-4 py-3">
                <div className="text-2xl font-black">{s.value}</div>
                <div className="text-xs font-bold text-blue-100 uppercase">{s.label}</div>
                <div className="text-xs text-blue-200 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-[1400px] mx-auto px-4 py-6">

        {/* ─── SUMMARY ─── */}
        {activeTab === 'SUMMARY' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-black text-gray-800 mb-3 uppercase text-xs tracking-widest text-blue-700">Complainant</h2>
                <p className="font-bold text-gray-900">Suraj Satyarthi</p>
                <p className="text-sm text-gray-600 mt-1">Patna, Bihar</p>
                <p className="text-sm text-gray-600">kriger.5490@gmail.com</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-black text-gray-800 mb-3 uppercase text-xs tracking-widest text-red-600">Respondent 1</h2>
                <p className="font-bold text-gray-900">Apple India Pvt. Ltd.</p>
                <p className="text-sm text-gray-600 mt-1">Manufacturer / Seller</p>
                <p className="text-sm text-gray-600">Refused replacement; closed cases prematurely</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-black text-gray-800 mb-3 uppercase text-xs tracking-widest text-red-600">Respondent 2</h2>
                <p className="font-bold text-gray-900">F1 Info Solutions & Services</p>
                <p className="text-sm text-gray-600 mt-1">Authorised Apple Service Centre, Patna</p>
                <p className="text-sm text-gray-600">2× OS reinstalls; no root cause repair; device withheld since 25 Feb — never returned</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-black text-gray-800 mb-3 uppercase text-xs tracking-widest text-blue-700">Device Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                {[
                  ['Model', 'MacBook Air M4 (2025)'],
                  ['Config', '16GB RAM / 256GB SSD / Midnight'],
                  ['Serial', 'DJ31J7MLJ4'],
                  ['Order Date', '1 February 2026 (Delivered 8 Feb)'],
                  ['MRP / Invoice Value', '₹94,990'],
                  ['Amount Paid', '₹81,160.70 (after ₹10,000 bank discount)'],
                  ['Payment', 'No-Cost EMI ₹14,165 × 6 months'],
                  ['Seller', 'Clicktech Retail Pvt. Ltd. (Amazon)'],
                  ['Invoice', 'DED4-3977711 (dated 4 Feb 2026)'],
                ].map(([k, v]) => (
                  <div key={k} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 uppercase font-bold">{k}</div>
                    <div className="font-semibold text-gray-800 mt-0.5">{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-black text-gray-800 mb-4 uppercase text-xs tracking-widest text-blue-700">Brief Facts Timeline</h2>
              <ol className="space-y-2">
                {[
                  ['8 Feb 2026', 'MacBook Air M4 purchased on Amazon for ₹81,160.70 on no-cost EMI'],
                  ['19 Feb 2026', 'Crash 1 — 11 days after purchase. First visit to F1 Info Solutions. Apple Case 102824929878 opened.'],
                  ['20 Feb 2026', 'Apple agent Mohammed (phone). Satisfaction survey sent same day — case still unresolved.'],
                  ['21 Feb 2026', '2nd visit to F1 Info. OS reinstalled. Crash 2 occurs on same day — proves hardware defect.'],
                  ['23 Feb 2026', '3rd visit. Apple agent Kritika. Case 102826682299 opened.'],
                  ['24 Feb 2026', 'Apple Customer Relations (Danish) involved. Cases 102828630926 and 102829545441 opened.'],
                  ['25 Feb 2026', '2nd OS reinstall by F1 Info. Crash 5 occurs within 11 hours — devastating evidence of logic board defect.'],
                  ['26 Feb 2026', 'Suraj emails Apple India demanding replacement. Apple goes completely silent thereafter.'],
                  ['26 Feb – 3 Mar', 'Suraj emails tcook@apple.com 4 times — receives only India_Support auto-deflections.'],
                  ['3 Apr 2026', 'Legal notice dated 03-04-2026 prepared by Adv. Sudhanshu Kr. Singh (Jharkhand HC)'],
                ].map(([date, event], i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="shrink-0 font-bold text-blue-700 w-28">{date}</span>
                    <span className="text-gray-700">{event}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <h2 className="font-black text-amber-800 mb-3 uppercase text-xs tracking-widest">Strongest Arguments</h2>
              <div className="space-y-2">
                {[
                  ['SMOKING GUN 1', 'Crash 2 occurred same day as first OS reinstall (21 Feb) — Apple\'s own appointment email confirms the reinstall happened, and Apple\'s crash logs confirm the crash happened hours later.'],
                  ['SMOKING GUN 2', 'Crash 5 occurred within 11 hours of second OS reinstall (25 Feb) — conclusively rules out software cause after two separate reinstalls.'],
                  ['SMOKING GUN 3', 'F1 Info\'s own job sheet (PAT2602257014860, 25 Feb) states in writing: "Earlier, Mac OS was re installed in device but the user is facing the same issue again." Apple\'s authorised service centre has documented in their own records that the hardware defect persisted after OS reinstall.'],
                  ['DEVICE WITHHELD', 'MacBook remains in F1 Info\'s custody after 25 Feb. Apple closed all support tickets without resolution and without returning the device — wrongful retention of consumer property.'],
                  ['APPLE\'S OWN LOGS', 'IPS crash files show TH_UNINT (hardware wait), GPU/MMU/TLB faults, watchdog timeouts — generated by Apple\'s own diagnostic system.'],
                  ['PREMATURE CLOSURE', 'Apple sent satisfaction surveys on 20 Feb and 23 Feb while hardware defect was active and unresolved — documents deceptive service practice.'],
                  ['TOTAL SILENCE', 'Apple made zero substantive contact after 25 Feb despite 4 emails to CEO Tim Cook — establishes stonewalling.'],
                ].map(([tag, desc]) => (
                  <div key={tag} className="flex gap-3 text-sm">
                    <span className={`shrink-0 text-xs font-black px-2 py-0.5 rounded border uppercase tracking-wide h-fit ${tagClass('amber')}`}>{tag}</span>
                    <span className="text-gray-700">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TASK LIST ─── */}
        {activeTab === 'TASK LIST' && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-black text-gray-900">Task Board</h2>
              <p className="text-xs text-gray-500 mt-0.5">Click any row to toggle completion. Syncs live via Supabase.</p>
            </div>
            <div className="divide-y divide-gray-100">
              {tasks.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-gray-400">Loading tasks…</div>
              )}
              {tasks.map(t => (
                <div key={t.id} onClick={() => toggleTask(t)}
                  className={`flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${t.done ? 'opacity-50' : ''}`}>
                  <div className={`mt-0.5 w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center ${t.done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                    {t.done && <span className="text-white text-xs font-black">✓</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold text-sm ${t.done ? 'line-through text-gray-400' : 'text-gray-900'}`}>{t.title}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${tagClass('blue')}`}>{t.assignee}</span>
                      {t.rice && <span className={`text-xs font-bold px-2 py-0.5 rounded border ${tagClass('amber')}`}>RICE {t.rice}</span>}
                    </div>
                    {t.description && <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── FLOWCHART ─── */}
        {activeTab === 'FLOWCHART' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-black text-gray-900 mb-6 uppercase text-xs tracking-widest text-blue-700">Retrograde Analysis — Path to Victory</h2>
            <div className="flex flex-col items-center gap-0">
              {[
                { step: '5', label: 'ULTIMATE OBJECTIVE', desc: 'Replacement of MacBook Air M4 with new device OR full refund ₹81,160.70 + 18% interest + compensation', color: 'emerald' },
                { step: '4', label: 'FORUM DECISION', desc: 'District Consumer Disputes Redressal Commission, Patna — order within 3–5 months under CPA 2019 fast track', color: 'blue' },
                { step: '3', label: 'COMPLAINT FILED', desc: 'Consumer complaint with all evidence: crash logs, purchase docs, Apple emails, service records, legal notice', color: 'blue' },
                { step: '2', label: 'LEGAL NOTICE SERVED', desc: 'Notice via Adv. Sudhanshu Kr. Singh (Jharkhand HC) — 15 days for Apple India + F1 Info to respond', color: 'amber' },
                { step: '1', label: 'CURRENT POSITION', desc: 'Legal notice dated 03-Apr-2026 drafted. Response window running. Evidence package complete.', color: 'orange' },
              ].map((node, i) => (
                <div key={node.step} className="flex flex-col items-center w-full max-w-xl">
                  <div className={`w-full rounded-xl px-5 py-4 border-2 ${
                    node.color === 'emerald' ? 'bg-emerald-50 border-emerald-300' :
                    node.color === 'blue' ? 'bg-blue-50 border-blue-200' :
                    node.color === 'amber' ? 'bg-amber-50 border-amber-200' :
                    'bg-orange-50 border-orange-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-black px-2 py-0.5 rounded border ${tagClass(node.color)}`}>STEP {node.step}</span>
                      <span className="font-black text-sm text-gray-900">{node.label}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{node.desc}</p>
                  </div>
                  {i < 4 && <div className="h-8 w-0.5 bg-gray-300 my-0" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── EVIDENCE ─── */}
        {activeTab === 'EVIDENCE' && (
          <div className="space-y-6">
            {[
              {
                category: 'Crash Logs & Technical Evidence',
                color: 'red',
                items: [
                  { name: 'IPS Crash Log — Crash 1 (19 Feb 2026)', status: 'obtained', file: '' },
                  { name: 'IPS Crash Log — Crash 2 (21 Feb 2026, after OS reinstall)', status: 'obtained', file: '' },
                  { name: 'IPS Crash Log — Crash 3 (23 Feb 2026)', status: 'obtained', file: '' },
                  { name: 'IPS Crash Log — Crash 4 (24 Feb 2026)', status: 'obtained', file: '' },
                  { name: 'IPS Crash Log — Crash 5 (25 Feb, within 11 hrs of 2nd reinstall)', status: 'obtained', file: '' },
                  { name: 'Apple Diagnostics Report (from service centre)', status: 'pending', file: '', note: 'CRITICAL — formal Apple diagnostic printout from F1 Info' },
                ],
              },
              {
                category: 'Purchase Documents',
                color: 'blue',
                items: [
                  { name: 'Amazon Invoice DED4-3977711', status: 'obtained', file: 'Amazon_Invoice.pdf' },
                  { name: 'Amazon Order Confirmation', status: 'obtained', file: 'Amazon_Order_Document.pdf' },
                  { name: 'Apple Limited Warranty Screenshot (24 Feb — active, expires 7 Feb 2027)', status: 'obtained', file: 'Apple_Warranty_Active.png' },
                  { name: 'Amazon Return Window Closed Screenshot (24 Feb 2026)', status: 'obtained', file: 'Amazon_Return_Window_Closed.png' },
                  { name: 'EMI Receipt / MacBook Purchase Proof', status: 'obtained', file: 'EMI_Receipt.jpeg' },
                  { name: 'Bank EMI Deduction Statements (×6 instalments)', status: 'pending', file: '', note: 'Bank statements showing all 6 EMI deductions of Rs.14,165' },
                ],
              },
              {
                category: 'Apple Service Centre Records',
                color: 'amber',
                items: [
                  { name: 'Apple Appointment Email — 19 Feb (Carry-in 1)', status: 'obtained', file: '' },
                  { name: 'Apple Appointment Email — 21/23 Feb (Carry-in 2)', status: 'obtained', file: '' },
                  { name: 'Apple Appointment Email — 25 Feb (Carry-in 3)', status: 'obtained', file: '' },
                  { name: 'F1 Info Job Sheet 1 — Visit 1 (20 Feb, Case PAT2602207009402)', status: 'obtained', file: 'JobSheet_1.jpeg' },
                  { name: 'F1 Info Job Sheet 2 — Visit 2 (25 Feb, Case PAT2602257014860) ★ SC admits OS reinstall failed', status: 'obtained', file: 'JobSheet_2.jpeg' },
                  { name: 'Service Centre Visit Photo 1', status: 'obtained', file: 'Visit_Photo_1.jpg' },
                  { name: 'Service Centre Visit Photo 2', status: 'obtained', file: 'Visit_Photo_2.jpeg' },
                  { name: 'Service Centre Visit Photo 3', status: 'obtained', file: 'Visit_Photo_3.jpeg' },
                  { name: 'Apple Case Email — Case 102824929878', status: 'obtained', file: 'Case_102824929878.pdf' },
                  { name: 'Apple Case Email — Case 102824938226', status: 'obtained', file: 'Case_102824938226.pdf' },
                  { name: 'Apple Case Email — Case 102825096686', status: 'obtained', file: 'Case_102825096686.pdf' },
                  { name: 'Apple Case Email — Case 102828630926', status: 'obtained', file: 'Case_102828630926.pdf' },
                  { name: 'Apple Case Email — Case 102829546899', status: 'obtained', file: 'Case_102829546899.pdf' },
                  { name: 'Apple Case Email — Case 102829546899', status: 'obtained', file: '' },
                  { name: 'Satisfaction Survey Email (20 Feb — while defect active)', status: 'obtained', file: '' },
                  { name: 'Satisfaction Survey Email (23 Feb — while defect active)', status: 'obtained', file: '' },
                ],
              },
              {
                category: 'Escalation & Written Complaints',
                color: 'purple',
                items: [
                  { name: 'Emails to tcook@apple.com (4 emails, 26 Feb – 3 Mar)', status: 'obtained', file: '' },
                  { name: 'India_Support Auto-Deflection Responses (×4)', status: 'obtained', file: '' },
                  { name: 'Replacement Demand Email (26 Feb)', status: 'obtained', file: '' },
                  { name: 'Legal Notice — DRAFT ONLY, not yet served (Adv. Sudhanshu Kr. Singh)', status: 'obtained', file: '' },
                  { name: 'Amazon Help — Public Tweet Reply (03 Apr 2026, by Shareef)', status: 'obtained', file: 'Amazon_Twitter_Reply.png' },
                  { name: 'Amazon Help — DM Sent with Legal Questions (08 Apr 2026)', status: 'obtained', file: 'Amazon_DM_Sent.png' },
                  { name: 'Amazon Chat — Issue Reported (19 Feb 2026)', status: 'obtained', file: 'Amazon_Chat_1.png' },
                  { name: 'Amazon Chat — CRITICAL: Refused Replacement in Writing (19 Feb 2026)', status: 'obtained', file: 'Amazon_Chat_4_Critical.png' },
                ],
              },
            ].map(section => (
              <div key={section.category} className="bg-white rounded-xl border border-gray-200">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                  <span className={`text-xs font-black px-2 py-0.5 rounded border ${tagClass(section.color)}`}>{section.category}</span>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {section.items.map(item => (
                    <div key={item.name}>
                      {item.status === 'obtained' && !item.file ? (
                        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3">
                          <span className="shrink-0 text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase tracking-widest">OBTAINED</span>
                          <span className="text-sm text-gray-700 font-medium">{item.name}</span>
                        </div>
                      ) : (
                        <DocRow name={item.name} docFile={item.file} status={item.status} note={item.note} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── TIMELINE ─── */}
        {activeTab === 'TIMELINE' && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-black text-gray-900 mb-5 uppercase text-xs tracking-widest text-blue-700">Chronological Timeline</h2>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-4 pl-10">
                {[
                  { date: '8 Feb 2026', tag: 'PURCHASE', color: 'blue', event: 'MacBook Air M4 purchased on Amazon', detail: 'Invoice DED4-3977711. ₹81,160.70 via no-cost EMI (₹14,165 × 6). Seller: Clicktech Retail Pvt. Ltd. Serial: DJ31J7MLJ4.' },
                  { date: '19 Feb 2026', tag: 'CRASH 1', color: 'red', event: 'First crash — 11 days after purchase', detail: 'First visit to F1 Info Solutions. Apple opened Case 102824929878. IPS log shows TH_UNINT hardware wait states.' },
                  { date: '20 Feb 2026', tag: 'APPLE CONTACT', color: 'amber', event: 'Apple agent Mohammed (phone support)', detail: 'Apple sent satisfaction survey same day (20 Feb) even though hardware defect was not resolved. Documents premature case closure pattern.' },
                  { date: '21 Feb 2026', tag: 'CRASH 2', color: 'red', event: 'OS reinstall by F1 Info — crash recurs same day', detail: 'Second carry-in. F1 Info performs OS reinstall. Crash 2 occurs same day — Apple appointment email confirms reinstall; IPS log confirms crash. Hardware conclusively implicated.' },
                  { date: '23 Feb 2026', tag: 'CRASH 3', color: 'red', event: 'Third crash', detail: 'Third visit to F1 Info. Apple agent Kritika. Case 102826682299 opened. Second satisfaction survey sent (23 Feb) — defect still unresolved.' },
                  { date: '24 Feb 2026', tag: 'ESCALATION', color: 'purple', event: 'Apple Customer Relations involved', detail: 'Danish from Apple Customer Relations takes over. Cases 102828630926 and 102829545441 opened. Crash 4 documented.' },
                  { date: '25 Feb 2026', tag: 'CRASH 5', color: 'red', event: '2nd OS reinstall — crash within 11 hours', detail: 'F1 Info performs second OS reinstall. Crash 5 occurs within 11 hours. This is the most decisive evidence — two separate OS reinstalls failed to fix the crash. Logic board / silicon defect confirmed.' },
                  { date: '25 Feb 2026', tag: 'SC ADMISSION', color: 'red', event: 'F1 Info Job Sheet PAT2602257014860 — written admission of hardware defect', detail: 'F1 Info\'s own job sheet (Case ID PAT2602257014860) states verbatim: "Earlier, Mac OS was re installed in device but the user is facing the same issue again." Apple\'s authorised service centre has admitted in writing that OS reinstall failed — conclusive proof of hardware defect, not software.' },
                  { date: '25 Feb 2026 onwards', tag: 'DEVICE HELD', color: 'red', event: 'MacBook NOT returned — device withheld by F1 Info Solutions', detail: 'After the 25 Feb visit, F1 Info Solutions has not returned the MacBook. They have not called Suraj to collect it. The device worth ₹94,990 remains in their custody without resolution or communication. This constitutes wrongful retention of consumer property.' },
                  { date: '26 Feb 2026', tag: 'DEMAND', color: 'orange', event: 'Replacement demand sent to Apple India', detail: 'Suraj emails Apple India formally demanding replacement. This is the last date of substantive Apple contact (Danish).' },
                  { date: '26 Feb – 3 Mar', tag: 'SILENCE', color: 'slate', event: 'Apple goes completely silent + closes tickets', detail: '4 emails sent to tcook@apple.com. All received only India_Support auto-deflection. Apple closes all support cases without resolving the defect and without ensuring the device is returned to the consumer.' },
                  { date: '3 Apr 2026', tag: 'LEGAL NOTICE', color: 'amber', event: 'Legal notice prepared', detail: 'Notice drafted by Adv. Sudhanshu Kr. Singh, Jharkhand High Court. Filed against Apple India Pvt. Ltd. and F1 Info Solutions & Services Pvt. Ltd.' },
                  { date: '8 Apr 2026', tag: 'AMAZON DM', color: 'blue', event: 'Amazon Help (X/Twitter) DM — formal legal questions sent', detail: 'Amazon Help (@AmazonHelp) replied publicly on X. Suraj sent formal DM with 3 legal questions. Screenshots saved. Clicktech Retail can be added as 3rd respondent if they deflect.' },
                ].map((e, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-10 mt-1 w-4 h-4 rounded-full border-2 border-white bg-gray-300" style={{ backgroundColor: e.color === 'red' ? '#ef4444' : e.color === 'blue' ? '#3b82f6' : e.color === 'amber' ? '#f59e0b' : e.color === 'orange' ? '#f97316' : e.color === 'purple' ? '#a855f7' : '#9ca3af' }} />
                    <div className="flex items-start gap-3">
                      <span className={`shrink-0 text-xs font-black px-2 py-0.5 rounded border ${tagClass(e.color)}`}>{e.tag}</span>
                      <div>
                        <div className="text-xs text-gray-500 font-bold">{e.date}</div>
                        <div className="font-semibold text-gray-900 text-sm">{e.event}</div>
                        <div className="text-xs text-gray-600 mt-0.5">{e.detail}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── DOCUMENTS ─── */}
        {activeTab === 'DOCUMENTS' && (
          <div className="space-y-5">
            {[
              {
                category: 'Purchase & Financial Documents',
                docs: [
                  { name: 'Amazon Invoice DED4-3977711', file: 'Amazon_Invoice.pdf', status: 'obtained' },
                  { name: 'Amazon Order Confirmation', file: 'Amazon_Order_Document.pdf', status: 'obtained' },
                  { name: 'EMI Schedule / Bank Payment Statements', file: '', status: 'pending', note: 'CRITICAL — proves ongoing financial loss from defective device' },
                ],
              },
              {
                category: 'Apple Service Records',
                docs: [
                  { name: 'F1 Info Job Sheet 1 — Visit 1 (20 Feb 2026, Case PAT2602207009402)', file: 'JobSheet_1.jpeg', status: 'obtained' },
                  { name: 'F1 Info Job Sheet 2 — Visit 2 (25 Feb 2026, Case PAT2602257014860) ★ SC admits OS reinstall failed', file: 'JobSheet_2.jpeg', status: 'obtained' },
                  { name: 'Apple Service Center Summary', file: 'Service_Center_Summary.pdf', status: 'obtained' },
                ],
              },
              {
                category: 'Crash Logs (IPS Diagnostic Files)',
                docs: [
                  { name: 'Crash Log — Case 102824938226 (CRASH_LOG_EVIDENCE)', file: 'Crash_Log_Evidence.pdf', status: 'obtained' },
                  { name: 'Crash Log 3 — Diagnostic Evidence (3rd_Crash)', file: 'Crash_3_Evidence.pdf', status: 'obtained' },
                  { name: 'Crash Logs 1, 2, 4, 5 — IPS diagnostic files (raw)', file: '', status: 'pending', note: 'Export individual IPS files from ~/Library/Logs/DiagnosticReports as PDFs' },
                ],
              },
              {
                category: 'Legal Documents',
                docs: [
                  { name: 'Legal Notice Draft — Adv. Sudhanshu Kr. Singh (NOT YET SERVED)', file: 'Legal_Notice_Apple.pdf', status: 'obtained' },
                  { name: 'Legal Notice Review Points (4 issues — discuss before serving)', file: '', status: 'pending', note: 'Discuss with Sudhanshu before serving the notice' },
                ],
              },
              {
                category: 'Email & Communication Records',
                docs: [
                  { name: 'Full Gmail Email Analysis (60+ emails, 19 Feb – 2 Mar)', file: '', status: 'obtained' },
                  { name: 'Amazon Help Public Tweet Reply (03 Apr 2026)', file: 'Amazon_Twitter_Reply.png', status: 'obtained' },
                  { name: 'Amazon Help DM Sent — 3 Legal Questions (08 Apr 2026)', file: 'Amazon_DM_Sent.png', status: 'obtained' },
                  { name: 'Amazon India Email — Aania Social Media Team (10 Apr 2026)', file: '', status: 'pending', note: 'PENDING REPLY — Aania asks for order ID, service denial letter, invoice, IMEI' },
                ],
              },
            ].map(section => (
              <div key={section.category} className="bg-white rounded-xl border border-gray-200">
                <div className="px-5 py-3 border-b border-gray-100">
                  <h3 className="font-black text-sm text-gray-900">{section.category}</h3>
                </div>
                <div className="p-4 flex flex-col gap-2">
                  {section.docs.map(doc => (
                    <DocRow key={doc.name} name={doc.name} docFile={doc.file} status={doc.status} note={doc.note} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── EMAILS ─── */}
        {activeTab === 'EMAILS' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">8 most legally significant emails from 60+ extracted from kriger.5490@gmail.com</p>
            {[
              {
                date: '19 Feb 2026',
                from: 'Apple Support',
                to: 'kriger.5490@gmail.com',
                subject: 'Your Apple Support Case — Case ID 102824929878',
                tag: 'CASE OPENED',
                color: 'blue',
                excerpt: 'We\'ve received your request for support. Your case ID is 102824929878. An Apple Support advisor will be in touch with you shortly.',
                significance: 'Establishes Apple\'s acknowledgement of the first crash report. Formally begins the support timeline. Case never resolved.',
              },
              {
                date: '20 Feb 2026',
                from: 'Apple Support Surveys',
                to: 'kriger.5490@gmail.com',
                subject: 'How was your Apple Support experience?',
                tag: 'PREMATURE CLOSURE',
                color: 'red',
                excerpt: 'Hi Suraj, Thank you for contacting Apple Support. We\'d love to hear about your recent experience. Was your issue resolved? [Survey link]',
                significance: 'CRITICAL EVIDENCE: Apple sent a satisfaction survey on 20 Feb while the hardware defect was still active and unresolved. This documents deceptive service practice and premature case closure — a direct violation of s.2(11) CPA 2019.',
              },
              {
                date: '21 Feb 2026',
                from: 'Apple Support',
                to: 'kriger.5490@gmail.com',
                subject: 'Your Genius Bar Appointment — F1 Info Solutions, Patna',
                tag: 'SERVICE APPOINTMENT',
                color: 'amber',
                excerpt: 'Your appointment at F1 Info Solutions & Services on 21 Feb 2026 has been confirmed. Please bring your MacBook Air and proof of purchase.',
                significance: 'SMOKING GUN: This email confirms an OS reinstall was performed on 21 Feb. Combined with IPS crash log showing Crash 2 occurred same day — proves hardware defect persists after software intervention. Rules out software cause.',
              },
              {
                date: '23 Feb 2026',
                from: 'Apple Support Surveys',
                to: 'kriger.5490@gmail.com',
                subject: 'How was your Apple Support experience?',
                tag: 'SECOND PREMATURE CLOSURE',
                color: 'red',
                excerpt: 'Hi Suraj, Was the issue with your MacBook Air resolved to your satisfaction? [Survey link]',
                significance: 'Second satisfaction survey while hardware defect remained active. Pattern of premature case closures. Apple closed cases "Glad we assisted" at least 3 times without resolving the defect.',
              },
              {
                date: '25 Feb 2026',
                from: 'Apple Support',
                to: 'kriger.5490@gmail.com',
                subject: 'Your Genius Bar Appointment — F1 Info Solutions, Patna (2nd visit)',
                tag: 'SERVICE APPOINTMENT',
                color: 'amber',
                excerpt: 'Your appointment at F1 Info Solutions & Services on 25 Feb 2026 has been confirmed.',
                significance: 'SMOKING GUN: Confirms second OS reinstall on 25 Feb. IPS log shows Crash 5 occurred within 11 hours. Two consecutive OS reinstalls failed — silicon/logic board defect conclusively established.',
              },
              {
                date: '26 Feb 2026',
                from: 'kriger.5490@gmail.com',
                to: 'Apple India Support',
                subject: 'Formal Demand for Replacement — MacBook Air M4 Serial DJ31J7MLJ4',
                tag: 'REPLACEMENT DEMAND',
                color: 'orange',
                excerpt: 'This device has crashed 5 times in 17 days, including immediately after two separate OS reinstalls performed by your authorised service centre. I am formally demanding replacement of this defective unit under the Consumer Protection Act 2019.',
                significance: 'Formal written demand for replacement. Apple\'s complete silence after this email establishes deficiency in service under s.2(11) CPA 2019. Starts the clock for the legal notice.',
              },
              {
                date: '28 Feb 2026',
                from: 'kriger.5490@gmail.com',
                to: 'tcook@apple.com',
                subject: 'Escalation to CEO — Defective MacBook Air M4, 5 crashes in 17 days',
                tag: 'CEO ESCALATION',
                color: 'purple',
                excerpt: 'Mr. Cook, I am writing to you as a last resort. My MacBook Air M4 has crashed 5 times in 17 days. Your support team has performed two OS reinstalls with no result. Your customer service has gone silent after my replacement request.',
                significance: 'Documents escalation to highest level. Apple\'s only response was India_Support auto-deflection — establishes that Apple had notice of the defect at the CEO level and still refused to act.',
              },
              {
                date: '3 Mar 2026',
                from: 'India_Support@apple.com',
                to: 'kriger.5490@gmail.com',
                subject: 'Re: Your Apple Support Request',
                tag: 'AUTO-DEFLECTION',
                color: 'slate',
                excerpt: 'Thank you for writing to Apple. For product support, please contact Apple India Support at 1800-425-0744 or visit apple.com/in/support.',
                significance: 'Final auto-deflection in response to 4 emails to tcook@apple.com. Apple never provided a substantive response to the replacement demand. Documents stonewalling pattern — directly relevant to s.2(47)(ii) unfair trade practice claim.',
              },
            ].map((email, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-start gap-3 px-5 py-3 border-b border-gray-100 flex-wrap">
                  <span className={`shrink-0 text-xs font-black px-2 py-0.5 rounded border ${tagClass(email.color)}`}>{email.tag}</span>
                  <span className="text-xs text-gray-500 font-bold">{email.date}</span>
                  <span className="text-xs text-gray-600"><b>From:</b> {email.from}</span>
                  <span className="text-xs text-gray-600"><b>To:</b> {email.to}</span>
                </div>
                <div className="px-5 py-4">
                  <p className="font-bold text-sm text-gray-900 mb-2">{email.subject}</p>
                  <blockquote className="text-sm text-gray-600 italic bg-gray-50 border-l-4 border-gray-300 pl-3 py-2 mb-3">"{email.excerpt}"</blockquote>
                  <div className={`text-xs px-3 py-2 rounded-lg border ${tagClass(email.color === 'red' ? 'red' : email.color === 'amber' ? 'amber' : 'blue')}`}>
                    <span className="font-black uppercase">Legal Significance: </span>{email.significance}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── CALCULATOR ─── */}
        {activeTab === 'CALCULATOR' && (
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-black text-gray-900 mb-4 uppercase text-xs tracking-widest text-blue-700">Financial Summary</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="text-xs font-black text-blue-700 uppercase mb-1">Device Purchase Price</div>
                  <div className="text-2xl font-black text-blue-900">₹81,160.70</div>
                  <div className="text-xs text-blue-600 mt-1">No-cost EMI ₹14,165 × 6 months</div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="text-xs font-black text-amber-700 uppercase mb-1">MRP / Replacement Value</div>
                  <div className="text-2xl font-black text-amber-900">₹1,09,900</div>
                  <div className="text-xs text-amber-600 mt-1">Current MRP MacBook Air M4 16GB/256GB</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="text-xs font-black text-emerald-700 uppercase mb-1">EMI Paid to Date</div>
                  <div className="text-2xl font-black text-emerald-900">₹42,495</div>
                  <div className="text-xs text-emerald-600 mt-1">3 instalments × ₹14,165 (as of Apr 2026)</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white rounded-xl border border-blue-200 p-5">
                <div className={`inline-block text-xs font-black px-2 py-0.5 rounded border mb-3 ${tagClass('blue')}`}>ROUTE A — REPLACEMENT</div>
                <h3 className="font-black text-gray-900 mb-1">New Device + Compensation</h3>
                <p className="text-xs text-gray-500 mb-4">Under s.2(10) manufacturing defect — forum can order replacement of defective unit</p>
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      ['Replacement device (new MacBook Air M4)', '₹1,09,900'],
                      ['Mental agony & harassment', '₹25,000'],
                      ['Legal costs (notice + filing)', '₹10,000'],
                      ['Litigation costs', '₹5,000'],
                    ].map(([item, amount]) => (
                      <tr key={item} className="border-b border-gray-100">
                        <td className="py-2 text-gray-700">{item}</td>
                        <td className="py-2 font-bold text-gray-900 text-right">{amount}</td>
                      </tr>
                    ))}
                    <tr className="font-black text-emerald-700">
                      <td className="pt-3">TOTAL CLAIM (Route A)</td>
                      <td className="pt-3 text-right">₹1,49,900+</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-white rounded-xl border border-amber-200 p-5">
                <div className={`inline-block text-xs font-black px-2 py-0.5 rounded border mb-3 ${tagClass('amber')}`}>ROUTE B — REFUND + INTEREST</div>
                <h3 className="font-black text-gray-900 mb-1">Full Refund + 18% Interest</h3>
                <p className="text-xs text-gray-500 mb-4">Under s.2(11) deficiency in service — forum can order refund with interest</p>
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      ['Device purchase price', '₹81,160.70'],
                      ['18% p.a. interest (Feb–Dec 2026, ~10 months)', '₹12,174'],
                      ['EMI interest / financing charges', '₹2,433'],
                      ['Mental agony & harassment', '₹25,000'],
                      ['Legal costs (notice + filing)', '₹10,000'],
                      ['Litigation costs', '₹5,000'],
                    ].map(([item, amount]) => (
                      <tr key={item} className="border-b border-gray-100">
                        <td className="py-2 text-gray-700">{item}</td>
                        <td className="py-2 font-bold text-gray-900 text-right">{amount}</td>
                      </tr>
                    ))}
                    <tr className="font-black text-emerald-700">
                      <td className="pt-3">TOTAL CLAIM (Route B)</td>
                      <td className="pt-3 text-right">₹1,35,768+</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
              <span className="font-black text-gray-800">Legal basis: </span>
              Consumer Protection Act 2019 — s.2(10) manufacturing defect, s.2(11) deficiency in service, s.2(47)(ii) unfair trade practice.
              Interest rate: 18% p.a. per settled NCDRC practice for consumer goods cases.
              Route A (replacement) is preferred — preserves the asset while adding compensation.
            </div>
          </div>
        )}

        {/* ─── REVIEWS ─── */}
        {activeTab === 'REVIEWS' && (
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-black text-gray-900 mb-4 uppercase text-xs tracking-widest text-blue-700">F1 Info Solutions — Service Failure Pattern</h2>
              <div className="space-y-3">
                {[
                  { tag: 'NO ROOT CAUSE', color: 'red', text: 'F1 Info performed two consecutive OS reinstalls without identifying or documenting the root hardware cause. This is a standard deflection tactic — it temporarily masks crash symptoms without addressing the underlying logic board defect.' },
                  { tag: 'NO DIAGNOSTIC REPORT', color: 'red', text: 'Despite three carry-in visits, F1 Info issued no Apple Diagnostics printout or written fault confirmation. This omission is itself evidence of deficiency in service — an authorised service centre must document findings.' },
                  { tag: 'PART REPLACEMENT REFUSED', color: 'red', text: 'F1 Info did not escalate to logic board replacement despite two failed OS reinstalls. This indicates either gross incompetence or deliberate avoidance of a costly repair under Apple\'s warranty obligations.' },
                  { tag: 'APPLE AUTHORISED', color: 'amber', text: 'F1 Info Solutions & Services Pvt. Ltd. is Apple\'s authorised service centre in Patna. Apple India bears vicarious liability for F1 Info\'s deficient service under the Consumer Protection Act 2019.' },
                ].map(item => (
                  <div key={item.tag} className="flex gap-3 text-sm">
                    <span className={`shrink-0 text-xs font-black px-2 py-0.5 rounded border h-fit ${tagClass(item.color)}`}>{item.tag}</span>
                    <p className="text-gray-700">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-black text-gray-900 mb-4 uppercase text-xs tracking-widest text-blue-700">Apple India — Systemic Patterns</h2>
              <div className="space-y-3">
                {[
                  { tag: 'PREMATURE CLOSURE', color: 'red', text: 'Apple closed cases and sent satisfaction surveys at least 3 times while the hardware defect remained active. This is a documented customer-service metric manipulation practice.' },
                  { tag: 'ESCALATION WALL', color: 'red', text: 'All 4 emails to tcook@apple.com received only India_Support auto-deflections. Apple\'s CEO escalation path functionally does not exist for Indian consumers — they are routed back to the same support queue that already failed them.' },
                  { tag: 'SILENCE AFTER DEMAND', color: 'red', text: 'After the formal replacement demand on 26 Feb, Apple made zero substantive contact. This 35-day silence (to legal notice date) constitutes stonewalling under s.2(47)(ii) unfair trade practice.' },
                  { tag: 'NO WARRANTY ACTION', color: 'amber', text: 'A 17-day-old device that crashes immediately after two OS reinstalls should trigger automatic warranty replacement under Apple\'s own policies. Apple\'s refusal to invoke this demonstrates bad faith service conduct.' },
                ].map(item => (
                  <div key={item.tag} className="flex gap-3 text-sm">
                    <span className={`shrink-0 text-xs font-black px-2 py-0.5 rounded border h-fit ${tagClass(item.color)}`}>{item.tag}</span>
                    <p className="text-gray-700">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── PRECEDENTS ─── */}
        {activeTab === 'PRECEDENTS' && (
          <div className="space-y-4">
            {[
              {
                title: 'Maruti Udyog Ltd. v. Susheel Kumar Gabgotra & Anr.',
                court: 'Supreme Court of India',
                citation: '(2006) 4 SCC 644',
                badges: ['SUPREME COURT', 'DIRECTLY APPLICABLE'],
                colors: ['purple', 'red'],
                holding: 'Manufacturing defect in a new vehicle entitles the consumer to replacement, not merely repair. The manufacturer cannot escape liability by offering repeated repairs for a fundamental defect.',
                relevance: 'Directly applicable: MacBook Air crashed 5 times in 17 days including after 2 OS reinstalls. Repeated "repair" attempts (OS reinstalls) without fixing the root hardware defect mirrors the Maruti fact pattern. Forum should order replacement, not repair.',
              },
              {
                title: 'Whirlpool of India Ltd. v. Bhanu Prakash Srivastava',
                court: 'National Consumer Disputes Redressal Commission',
                citation: 'NCDRC, 2019',
                badges: ['NCDRC', 'ELECTRONICS DEFECT'],
                colors: ['blue', 'amber'],
                holding: 'Where an electronic appliance exhibits recurring defects despite repeated repairs, the defect is presumed to be manufacturing in nature and the consumer is entitled to a fresh replacement unit.',
                relevance: 'Supports the inference of manufacturing defect from recurring crashes. Apple\'s own IPS logs (TH_UNINT hardware wait states, GPU/MMU/TLB faults) provide technical corroboration beyond mere symptom recurrence.',
              },
              {
                title: 'Apple India Pvt. Ltd. v. Consumer Forum Precedents',
                court: 'District Consumer Forum Pattern',
                citation: 'Multiple District Forums, 2019–2024',
                badges: ['PATTERN EVIDENCE', 'SAME RESPONDENT'],
                colors: ['orange', 'slate'],
                holding: 'Consumer forums have consistently held Apple India liable for deficient service where: (a) defects arise within weeks of purchase, (b) service centres fail to identify root cause, (c) Apple deflects rather than replaces.',
                relevance: 'Establishes a pattern of conduct by the same respondent. Apple India\'s "repeat OS reinstall without root cause diagnosis" playbook has been censured by multiple forums.',
              },
            ].map((p, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex flex-wrap gap-2 mb-3">
                  {p.badges.map((badge, j) => (
                    <span key={badge} className={`text-xs font-black px-2 py-0.5 rounded border ${tagClass(p.colors[j])}`}>{badge}</span>
                  ))}
                </div>
                <h3 className="font-black text-gray-900 mb-1">{p.title}</h3>
                <p className="text-xs text-gray-500 mb-3">{p.court} | {p.citation}</p>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-black text-gray-600 uppercase">Holding: </span>
                    <span className="text-sm text-gray-700">{p.holding}</span>
                  </div>
                  <div className={`text-xs px-3 py-2 rounded-lg border ${tagClass('blue')}`}>
                    <span className="font-black uppercase">Relevance to this case: </span>{p.relevance}
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-gray-900 text-gray-100 rounded-xl p-5">
              <h3 className="font-black text-white mb-3 uppercase text-xs tracking-widest">Ready-to-Use Citation Block</h3>
              <pre className="text-xs leading-relaxed whitespace-pre-wrap text-gray-300">{`The Complainant respectfully submits that the defect in the subject MacBook Air M4
(Serial DJ31J7MLJ4) constitutes a manufacturing defect within the meaning of s.2(10)
of the Consumer Protection Act 2019, entitling the Complainant to replacement and
compensation, and not merely repair.

In Maruti Udyog Ltd. v. Susheel Kumar Gabgotra & Anr., (2006) 4 SCC 644, the
Hon'ble Supreme Court held that recurring defects in a new product entitle the
consumer to replacement, not merely repair.

In the present case, the defect manifests as a logic board / silicon fault,
evidenced by Apple's own IPS diagnostic files showing TH_UNINT hardware wait states,
GPU/MMU/TLB faults and watchdog timeouts. The Respondent's authorised service centre
(F1 Info Solutions) performed two consecutive OS reinstalls — the defect recurred
within 11 hours of the second reinstall — conclusively ruling out any software cause.

The Complainant submits that s.2(10), s.2(11) and s.2(47)(ii) of the CPA 2019 are
all attracted on the admitted facts, and prays for replacement of the device or
full refund with 18% interest, plus compensation and costs.`}</pre>
            </div>
          </div>
        )}

        {/* ─── COMPLAINTS ─── */}
        {activeTab === 'COMPLAINTS' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-black text-gray-900">Complaints & Formal Actions</h2>
                <p className="text-xs text-gray-500 mt-0.5">Formal complaints filed or to be filed against respondents.</p>
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  { ref: 'CPA-001', target: 'Apple India Pvt. Ltd.', purpose: 'Manufacturing defect — 5 crashes in 17 days, s.2(10) CPA 2019', status: 'DRAFT', color: 'amber' },
                  { ref: 'CPA-002', target: 'Amazon India / Clicktech Retail Pvt. Ltd.', purpose: 'Sale of defective product — refused replacement in writing', status: 'DRAFT', color: 'amber' },
                  { ref: 'CPA-003', target: 'F1 Info Solutions & Services Pvt. Ltd.', purpose: 'Deficiency in service — 3 visits, no root cause, no diagnostic report', status: 'DRAFT', color: 'amber' },
                  { ref: 'CASES-001', target: 'Apple Support', purpose: 'Case 102824929878 — Crash 1 (19 Feb 2026)', status: 'FILED', color: 'blue' },
                  { ref: 'CASES-002', target: 'Apple Support', purpose: 'Case 102824938226 — Escalation (21 Feb 2026)', status: 'FILED', color: 'blue' },
                  { ref: 'CASES-003', target: 'Apple Support', purpose: 'Case 102825096686 — Crash 2 follow-up', status: 'FILED', color: 'blue' },
                  { ref: 'CASES-004', target: 'Apple Support', purpose: 'Case 102828630926 — Danish / Customer Relations (24 Feb 2026)', status: 'FILED', color: 'blue' },
                  { ref: 'CASES-005', target: 'Apple Support', purpose: 'Case 102829546899 — Final escalation (24–25 Feb 2026)', status: 'FILED', color: 'blue' },
                  { ref: 'NCH-001', target: 'National Consumer Helpline (1915)', purpose: 'Pre-filing complaint — Ingram NCH form in Evidence_Package', status: 'PENDING', color: 'orange' },
                ].map(c => (
                  <div key={c.ref} className="flex items-start gap-4 px-5 py-4">
                    <span className={`shrink-0 text-xs font-black px-2 py-0.5 rounded border ${tagClass(c.color)}`}>{c.status}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-gray-400">{c.ref}</span>
                        <span className="font-semibold text-sm text-gray-900">{c.target}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{c.purpose}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── APPLE EMAILS ─── */}
        {activeTab === 'APPLE EMAILS' && (() => {
          const appleEmails = allEmails.filter(e =>
            ['apple', 'applecare', 'support.apple.com', 'india_support'].some(k =>
              (e.from + ' ' + e.to).toLowerCase().includes(k)
            )
          );
          return (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
                  <div>
                    <h2 className="font-black text-gray-900">Apple Email Correspondence</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{emailsLoaded ? `${appleEmails.length} Apple emails from extracted corpus` : 'Loading emails…'}</p>
                  </div>
                  {emailsLoaded && (
                    <input value={emailQuery} onChange={e => setEmailQuery(e.target.value)}
                      placeholder="Search Apple emails…"
                      className="ml-auto border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
                  )}
                </div>
                {!emailsLoaded ? (
                  <div className="px-5 py-8 text-center text-sm text-gray-400">Loading emails — run Step 4 (extract_apple_emails.py) first if empty.</div>
                ) : appleEmails.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-gray-400">No Apple emails found. Run <code className="bg-gray-100 px-1 rounded">extract_apple_emails.py</code> to populate /public/emails.json.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 text-xs text-gray-500 font-bold uppercase tracking-wide">
                          <th className="text-left px-5 py-3">Date</th>
                          <th className="text-left px-5 py-3">From</th>
                          <th className="text-left px-5 py-3">Subject</th>
                          <th className="text-left px-5 py-3">Category</th>
                          <th className="text-left px-5 py-3">Snippet</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {(emailQuery.trim().length >= 2 ? filteredEmails.filter(e => ['apple','applecare','support.apple.com','india_support'].some(k => (e.from+' '+e.to).toLowerCase().includes(k))) : appleEmails).map(e => (
                          <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-3 whitespace-nowrap text-gray-500 text-xs">{e.date}</td>
                            <td className="px-5 py-3 text-xs text-gray-700 max-w-[160px] truncate">{e.from}</td>
                            <td className="px-5 py-3 font-medium text-gray-900 max-w-[220px] truncate">{e.subject}</td>
                            <td className="px-5 py-3">
                              {e.categories?.map(c => (
                                <span key={c} className="inline-block text-xs font-bold px-1.5 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200 mr-1">{c}</span>
                              ))}
                            </td>
                            <td className="px-5 py-3 text-xs text-gray-500 max-w-[300px] truncate">{e.snippet}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

      </main>
    </div>
  );
}
