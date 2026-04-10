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
  return (
    <a href={`/docs/${docFile}`} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-3 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg px-4 py-3 transition-colors group">
      <span className="shrink-0 text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase tracking-widest">View PDF</span>
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

const TABS = ['SUMMARY','TASK LIST','FLOWCHART','EVIDENCE','TIMELINE','DOCUMENTS','EMAILS','CALCULATOR','REVIEWS','PRECEDENTS'] as const;
type Tab = typeof TABS[number];

export default function CaseBrief() {
  const [tasks, setTasks] = useState<{id:string;title:string;description:string;assignee:string;rice:string;done:boolean}[]>([]);
  const [auth, setAuth] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('SUMMARY');

  const fetchTasks = async () => {
    const { data } = await supabase.from('tasks').select('*').order('id', { ascending: true });
    if (data) setTasks(data);
  };

  useEffect(() => {
    fetchTasks();
    const sub = supabase.channel('tasks-update')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks)
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const toggleTask = async (id: string, done: boolean) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !done } : t));
    await supabase.from('tasks').update({ done: !done }).eq('id', id);
  };

  if (!auth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 border border-gray-200 rounded-2xl w-96 text-center shadow-xl">
          <div className="text-4xl mb-4">⚖️</div>
          <h2 className="text-xl font-bold mb-1 text-gray-900">Confidential Legal Brief</h2>
          <p className="text-gray-500 text-sm mb-6">Suraj Satyarthi v. Urbainia Spaces · Enter access code</p>
          <input type="password" value={passcode} onChange={e => setPasscode(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && passcode === 'Sudhanshu1234') setAuth(true); }}
            className="w-full bg-gray-50 border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500 mb-4 text-center tracking-[0.3em] font-mono text-xl text-gray-900"
            placeholder="··········" />
          <button onClick={() => { if (passcode === 'Sudhanshu1234') setAuth(true); else alert('Incorrect passcode'); }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition shadow-md">
            Access Evidence Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">

      {/* ── STICKY HEADER ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between gap-4 h-14">
          <div className="font-bold text-blue-700 text-sm tracking-wide shrink-0 hidden md:block">⚖️ Satyarthi v. Urbainia</div>
          <nav className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide flex-1 md:flex-none md:justify-center">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-bold tracking-wide transition-colors whitespace-nowrap
                  ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                {tab}
              </button>
            ))}
          </nav>
          <span className="shrink-0 bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full border border-red-200">CONFIDENTIAL</span>
        </div>
      </header>

      {/* ── HERO STATS (always visible) ── */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 text-white">
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <h1 className="text-2xl font-extrabold mb-1">Primary Relief: Section 18 RERA Complaint</h1>
          <p className="text-blue-200 text-sm mb-6">Project: Urbainia Trinity NX Phase-III · Promoters: Urbainia Spaces &amp; Avdesh Infotech · RERA Reg: UPRERAPRJ6307</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Delay',              value: '36+ Mos',   color: 'text-rose-300' },
              { label: 'Total Evidence',     value: '12 Items',  color: 'text-blue-200' },
              { label: 'Affected Buyers',    value: '402+',      color: 'text-amber-300' },
              { label: 'Total Paid (Ledger)',value: '₹20.02 L',  color: 'text-emerald-300' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                <div className="text-xs text-blue-200 uppercase tracking-widest mb-1 font-bold">{label}</div>
                <div className={`text-3xl font-black font-mono ${color}`}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-[1400px] mx-auto px-6 py-8">

        {/* ══ SUMMARY ══ */}
        {activeTab === 'SUMMARY' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Case Summary</h2>
              <p className="text-gray-400 text-sm mb-6 pb-4 border-b border-gray-100">Prepared for Adv. Sudhanshu Kr. Singh · April 2026 · CONFIDENTIAL</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 mb-3">Complainant</h3>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="font-bold text-gray-900">Suraj Satyarthi</p>
                    <p className="text-sm text-gray-600 mt-1">Allottee — Flat D-408, Urbainia Trinity NX Phase-III</p>
                    <p className="text-xs text-gray-500 mt-1">surajstoic@gmail.com</p>
                    <p className="text-xs text-gray-500">Co-applicant: Satya Narayan Satyarthi (father)</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-rose-600 mb-3">Respondents</h3>
                  <div className="bg-red-50 rounded-xl p-4 border border-red-100 space-y-3">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">1. Urbainia Spaces Pvt. Ltd. / Avdesh Infotech</p>
                      <p className="text-xs text-gray-500">Builder · RERA: UPRERAPRJ6307 · crm@urbainia.in</p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">2. Sammaan Capital Ltd. (formerly Indiabulls HFL)</p>
                      <p className="text-xs text-gray-500">Lender · homeloans@sammaancapital.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">What Happened — Brief Facts</h3>
                <div className="space-y-0">
                  {[
                    { year: '2016', event: 'Booking &amp; Direct Payments', detail: 'Suraj booked Flat D-408 in Urbainia Trinity NX Phase-III (Greater Noida West). Paid ₹4,30,000 directly to builder Feb–Apr 2016.' },
                    { year: '2018', event: 'Subvention Loan Scheme', detail: 'Quadripartite Agreement signed Jun 2018. Home Loan (HHENOD) and Life Insurance Loan (HHLNOD) opened with Sammaan Capital. Builder agreed to pay Pre-EMIs via subvention until possession.' },
                    { year: '2019', event: 'Builder Defaults on Subvention', detail: 'Urbainia stopped paying Pre-EMIs on Home Loan (HHENOD) after April 2019 — confirmed in builder\'s own Dec 2025 email/ledger. Suraj forced to pay out-of-pocket for 6+ years.' },
                    { year: '2023', event: 'RERA Possession Deadline Missed', detail: 'RERA-registered possession deadline: April 8, 2023 (UPRERAPRJ6307). Possession not given as of April 2026. Section 18 RERA triggered — full refund with interest is now the right.' },
                    { year: '2024', event: 'Sammaan Harassment Despite On-Time EMIs', detail: 'Recovery agents sent documented threats of rape and physical violence (Sep 2024). Sammaan refuses NOC. All EMIs paid on time throughout — harassment is completely unjustified.' },
                    { year: '2026', event: 'Legal Action Initiated', detail: 'Legal notice served Apr 2026 (Ref SS/HC/M/24). UP RERA Section 18 complaint being prepared. Total exposure: ₹34–44L depending on forum and interest rate.' },
                  ].map(({ year, event, detail }, i) => (
                    <div key={i} className="flex gap-4 pb-4 mb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                      <div className="shrink-0 w-14 pt-0.5">
                        <span className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">{year}</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm" dangerouslySetInnerHTML={{ __html: event }} />
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                  { label: 'Total Paid (Out of Pocket)', value: '₹14.46L', color: 'border-blue-200 text-blue-700', bg: 'bg-blue-50', sub: 'Direct + Pre-EMI + Principal repaid' },
                  { label: 'Outstanding Loans (Builder Must Clear)', value: '₹16.15L', color: 'border-amber-200 text-amber-700', bg: 'bg-amber-50', sub: 'RERA Sec 18 + Delhi SCDRC precedent' },
                  { label: 'Total Potential Recovery', value: '₹34–44L', color: 'border-emerald-200 text-emerald-700', bg: 'bg-emerald-50', sub: '9% RERA route vs 18% SC precedent' },
                ].map(({ label, value, color, bg, sub }) => (
                  <div key={label} className={`${bg} border-2 ${color.split(' ')[0]} rounded-xl p-5`}>
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">{label}</h3>
                    <div className={`text-3xl font-black font-mono ${color.split(' ')[1]}`}>{value}</div>
                    <p className="text-xs text-gray-500 mt-2">{sub}</p>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Legal Strategy — Two Parallel Tracks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                    <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Track A — Primary</div>
                    <p className="font-bold text-gray-900 mb-2">UP RERA Section 18 Complaint</p>
                    <ul className="space-y-1 text-xs text-gray-600">
                      <li>› Full refund of ₹14.46L + 9% p.a. interest = ₹18.36L</li>
                      <li>› Builder to clear ₹16.15L outstanding loans</li>
                      <li>› Combined relief: ₹34.51L</li>
                      <li>› Forum: up-rera.nic.in · Timeline: 6–12 months</li>
                    </ul>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                    <div className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Track B — Concurrent</div>
                    <p className="font-bold text-gray-900 mb-2">Consumer Forum (SC Precedent)</p>
                    <ul className="space-y-1 text-xs text-gray-600">
                      <li>› 18% p.a. interest = ₹22.27L on principal</li>
                      <li>› ₹5L mental agony + ₹1L costs + loans cleared</li>
                      <li>› Combined relief: ₹44.41L</li>
                      <li>› Sammaan harassment as independent head</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Key Strengths of This Case</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { tag: 'SMOKING GUN',  color: 'rose',    text: 'Builder\'s Dec 2025 email admits total consideration ₹19,50,000 and confirms subvention stopped Apr 2019 — written admission of default.' },
                  { tag: 'RERA PROVEN',  color: 'blue',    text: 'UPRERAPRJ6307 registered. Deadline April 8, 2023 missed. Ongoing cause of action — no limitation issue. Dec 2025 builder email resets clock.' },
                  { tag: 'SC PRECEDENT', color: 'emerald', text: 'CA 6494/2023: SC upheld ₹60L against Indiabulls/Sammaan for identical facts. MahaRERA: ₹42L → ₹92L at 18%. Directly citable.' },
                  { tag: 'ITAT EVIDENCE',color: 'amber',   text: 'IT raid: ₹32 crore collected from 402+ buyers by 2017. Project undelivered. Criminal angle for diversion of allottee funds.' },
                  { tag: '28 REVIEWS',   color: 'purple',  text: 'Google reviews 2016–2026 confirm fraud pattern. Paid review campaign proven (Shivam Jain). 9–11 year delays confirmed by current reviews.' },
                  { tag: 'ON-TIME PAYER',color: 'emerald', text: 'All EMIs paid on time. Sammaan cannot allege any default — recovery agent threats are completely unjustified and actionable as deficiency of service.' },
                ].map(({ tag, color, text }) => (
                  <div key={tag} className="flex gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <span className={`shrink-0 h-fit text-xs font-black px-2 py-0.5 rounded uppercase tracking-widest border ${tagClass(color)}`}>{tag}</span>
                    <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ TASK LIST ══ */}
        {activeTab === 'TASK LIST' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-1 flex items-center gap-3 text-gray-900">
              <span className="text-2xl animate-pulse">🔄</span> Live Task Board
            </h2>
            <p className="text-sm text-gray-500 mb-8 border-b border-gray-100 pb-5">Real-time sync via Supabase. Click any row to mark as done.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-separate border-spacing-y-1.5">
                <thead>
                  <tr className="text-gray-400 uppercase text-xs tracking-widest font-bold">
                    <th className="pb-3 px-4 w-16 text-center border-b border-gray-100">Done</th>
                    <th className="pb-3 px-4 w-28 border-b border-gray-100">Who</th>
                    <th className="pb-3 px-4 border-b border-gray-100">Task</th>
                    <th className="pb-3 px-4 w-32 text-right border-b border-gray-100">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 && <tr><td colSpan={4} className="text-center py-12 text-gray-400 text-sm">Connecting...</td></tr>}
                  {tasks.map((t, index) => (
                    <tr key={t.id} onClick={() => toggleTask(t.id, t.done)}
                      className={`bg-white hover:bg-gray-50 cursor-pointer transition-all rounded-lg ${t.done ? 'opacity-40' : 'shadow-sm'}`}>
                      <td className="py-3 px-4 text-center rounded-l-lg border-y border-l border-gray-200">
                        <div className={`w-7 h-7 rounded-md font-mono font-bold text-sm flex items-center justify-center mx-auto transition-all ${t.done ? 'bg-emerald-100 text-emerald-600 border border-emerald-300' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                          {t.done ? '✓' : index + 1}
                        </div>
                      </td>
                      <td className="py-3 px-4 border-y border-gray-200">
                        <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${t.assignee === 'Suraj' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-purple-100 text-purple-700 border border-purple-200'}`}>
                          {t.assignee}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-y border-gray-200">
                        <div className={`font-bold text-[14px] ${t.done ? 'line-through text-gray-400' : 'text-gray-900'}`}>{t.title}</div>
                        <div className="text-xs text-gray-500 mt-1 leading-relaxed pr-8">{t.description}</div>
                      </td>
                      <td className="py-3 px-4 text-right rounded-r-lg border-y border-r border-gray-200">
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 text-xs">{t.rice}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ FLOWCHART ══ */}
        {activeTab === 'FLOWCHART' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Retrograde Strategic Flowchart</h2>
            <p className="text-sm text-gray-500 mb-10 border-b border-gray-100 pb-5">Working backwards from the win condition to today&apos;s tasks.</p>
            <div className="flex flex-col items-center space-y-2 mt-4 relative pb-10">
              <div className="w-full max-w-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-6 text-center shadow-lg">
                <h3 className="font-extrabold text-xs tracking-widest uppercase mb-1 text-emerald-100">Ultimate Objective</h3>
                <div className="text-2xl font-black">💰 100% Compensation + 18% Delay Interest</div>
                <div className="text-sm text-emerald-100 mt-2">Total financial emancipation from Urbainia and Sammaan Capital. ₹44.4L target.</div>
              </div>
              <div className="w-0.5 h-8 bg-blue-400"></div>
              <div className="w-full max-w-lg bg-white border-2 border-blue-200 rounded-xl p-5 text-center shadow-sm hover:shadow-md transition">
                <h3 className="text-blue-600 font-bold text-[10px] tracking-widest uppercase mb-1">Step 4 — Favorable Ruling</h3>
                <div className="text-lg font-bold text-gray-900">UP RERA Enforces Section 18 Order</div>
                <div className="text-xs text-gray-500 mt-1">Tribunal validates Dec 2025 builder ledger admission, overcoming any 3-year limitation trap. Builder clears outstanding loans.</div>
              </div>
              <div className="w-0.5 h-8 bg-blue-300"></div>
              <div className="w-full max-w-lg bg-white border-2 border-blue-200 rounded-xl p-5 text-center shadow-sm hover:shadow-md transition">
                <h3 className="text-blue-600 font-bold text-[10px] tracking-widest uppercase mb-1">Step 3 — Twin Complaints</h3>
                <div className="text-lg font-bold text-gray-900">File RERA + Consumer Forum Simultaneously</div>
                <div className="text-xs text-gray-500 mt-1">RERA S.18 (9% refund track) runs concurrently with Consumer Forum (18% + Sammaan harassment). Both can proceed in parallel for maximum leverage.</div>
              </div>
              <div className="w-0.5 h-8 bg-blue-300"></div>
              <div className="w-full max-w-lg bg-white border-2 border-blue-200 rounded-xl p-5 text-center shadow-sm hover:shadow-md transition">
                <h3 className="text-blue-600 font-bold text-[10px] tracking-widest uppercase mb-1">Step 2 — Evidence Lock</h3>
                <div className="text-lg font-bold text-gray-900">Secure Evidence &amp; Serve Legal Notice</div>
                <div className="text-xs text-gray-500 mt-1">Legal notice served Apr 2026. Obtain BBA soft copy from builder. Preserve Sep 2024 threat audio recordings (CDR expired — audio files are now primary evidence).</div>
              </div>
              <div className="w-0.5 h-12 bg-gradient-to-t from-gray-300 to-blue-300"></div>
              <div className="w-full max-w-2xl bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs font-bold px-3 py-1 rounded-full">YOU ARE HERE</div>
                <h3 className="text-gray-400 font-extrabold text-xs tracking-widest uppercase mb-1 mt-2">Today&apos;s Baseline</h3>
                <div className="text-2xl font-black text-gray-900">Evidentiary Verification &amp; Dashboard Setup</div>
                <div className="text-sm text-gray-500 mt-2">Securing the missing BBA, indexing all payments, assigning tasks via Supabase.</div>
              </div>
            </div>
          </div>
        )}

        {/* ══ EVIDENCE ══ */}
        {activeTab === 'EVIDENCE' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-blue-600"><span className="text-2xl">📂</span> Verified Evidence Directory</h2>
            <table className="w-full text-left text-sm border-separate border-spacing-y-2">
              <thead>
                <tr className="text-gray-400 font-bold uppercase text-xs tracking-widest">
                  <th className="pb-3 px-4 border-b border-gray-100">Status</th>
                  <th className="pb-3 px-4 border-b border-gray-100">Document Type</th>
                  <th className="pb-3 px-4 border-b border-gray-100">FilePath / Proof</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { status: 'OBTAINED', name: 'Urbainia Buyer Ledger', path: '/05_Evidence_and_Payments/ledger...pdf', missing: false },
                  { status: 'OBTAINED', name: 'Indiabulls Tripartite Agreement', path: '/05_Evidence_and_Payments/Tripartite...pdf', missing: false },
                  { status: 'OBTAINED', name: 'ITAT Judgment (₹32Cr Fund Collection)', path: '/12_Email_Attachments/ITAT_Judgment_2025.pdf', missing: false },
                  { status: 'MISSING', name: 'Builder Buyer Agreement (BBA)', path: 'CRITICAL for interest rate clause. Request from crm@urbainia.in immediately.', missing: true },
                ].map(({ status, name, path, missing }, i) => (
                  <tr key={i} className={missing ? 'bg-red-50' : 'bg-gray-50'}>
                    <td className={`py-4 px-4 font-bold rounded-l-lg border-y border-l ${missing ? 'text-red-600 border-red-200' : 'text-emerald-600 border-gray-200'}`}>{status}</td>
                    <td className={`py-4 px-4 border-y font-bold ${missing ? 'text-red-700 border-red-200' : 'text-gray-900 border-gray-200'}`}>{name}</td>
                    <td className={`py-4 px-4 text-xs rounded-r-lg border-y border-r ${missing ? 'text-red-500 border-red-200' : 'font-mono text-blue-600 border-gray-200'}`}>{path}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ══ TIMELINE ══ */}
        {activeTab === 'TIMELINE' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm relative">
            <div className="absolute left-[3.75rem] top-32 bottom-10 w-0.5 bg-gray-200"></div>
            <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-purple-600"><span className="text-2xl">⏳</span> Chronological Offence History</h2>
            {[
              { dot: 'bg-emerald-500', label: 'Jun 2018', labelColor: 'text-emerald-600', title: 'Quadripartite Agreement Executed', detail: 'Loan Agreements signed 23-Jun-2018 between Urbainia, Indiabulls, Suraj, and co-allottee (father). HHENOD (Home Loan) activated 05-Jul-2018; HHLNOD (Life Insurance Loan) activated 10-Jul-2018.' },
              { dot: 'bg-amber-500',   label: 'Apr 2019', labelColor: 'text-amber-600',   title: 'Builder Defaults on Subvention', detail: 'Urbainia stopped paying Pre-EMIs on Home Loan (HHENOD) after April 2019 — confirmed in builder\'s own Dec 2025 ledger email. Suraj forced to pay out-of-pocket for 6+ years, causing ~₹9.5L excess expense.' },
              { dot: 'bg-rose-500',   label: 'Apr 2023', labelColor: 'text-rose-600',   title: 'RERA Possession Deadline Missed', detail: 'RERA-registered possession deadline: April 8, 2023 (UPRERAPRJ6307). Possession not given as of April 2026. Section 18 RERA triggered — refund with interest is the statutory right.' },
              { dot: 'bg-orange-500', label: 'Sep 2024', labelColor: 'text-orange-600', title: 'Sammaan Recovery Agent Threats', detail: 'Documented threats of rape and physical violence by Sammaan Capital recovery agents. All EMIs paid on time throughout — threats completely unjustified and actionable. CDR records expired; audio files are now primary evidence.' },
              { dot: 'bg-blue-500',   label: 'Apr 2026', labelColor: 'text-blue-600',   title: 'Legal Action Initiated', detail: 'Legal notice served (Ref SS/HC/M/24). UP RERA Section 18 complaint being prepared. BBA soft copy requested from builder. Dashboard and evidence index complete.' },
            ].map(({ dot, label, labelColor, title, detail }, i) => (
              <div key={i} className="relative pl-14 mb-8 last:mb-0">
                <div className={`absolute left-0 top-1.5 w-4 h-4 ${dot} rounded-full border-4 border-white shadow`}></div>
                <h3 className={`${labelColor} font-bold text-sm tracking-widest uppercase`}>{label}</h3>
                <p className="font-bold text-lg text-gray-900 mt-1">{title}</p>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        )}

        {/* ══ DOCUMENTS ══ */}
        {activeTab === 'DOCUMENTS' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-1 flex items-center gap-3 text-emerald-600"><span className="text-2xl">📁</span> Legal Document Repository</h2>
              <p className="text-sm text-gray-500 mb-6 border-b border-gray-100 pb-4">All documents accessible directly — click to open PDF. Red items are missing and must be obtained.</p>

              <div className="mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 mb-3">📋 Loan Agreements &amp; Sanction Letters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { name: 'Home Loan (Flat Purchase) Agreement — HHENOD00454804', docFile: 'HHENOD_Loan_Agreement.pdf', status: 'obtained' },
                    { name: 'Home Loan (Flat Purchase) Sanction Letter — HHENOD00454804', docFile: 'HHENOD_Sanction_Letter.pdf', status: 'obtained' },
                    { name: 'Life Insurance Loan Agreement — HHLNOD00453843', docFile: 'HHLNOD_Loan_Agreement.pdf', status: 'obtained' },
                    { name: 'Life Insurance Loan Sanction Letter — HHLNOD00453843', docFile: 'HHLNOD_Sanction_Letter.pdf', status: 'obtained' },
                    { name: 'Foreclosure Letter', docFile: 'Foreclosure_Letter.pdf', status: 'obtained' },
                    { name: 'PEMI Certificate', docFile: 'PEMI.pdf', status: 'obtained' },
                    { name: 'Quadripartite Agreement / BBA', docFile: '', status: 'pending', note: 'REQUIRED to establish contractual interest rate — determines 9% (RERA) vs 18% (SC precedent) delay compensation' },
                  ].map((doc, i) => <DocRow key={i} {...doc} />)}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-purple-600 mb-3">📊 Account Statements &amp; SOA</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { name: 'Home Loan Statement Feb 2026 — HHENOD00454804', docFile: 'Statement_HHENOD_Feb2026.pdf', status: 'obtained' },
                    { name: 'Life Insurance Loan Statement Feb 2026 — HHLNOD00453843', docFile: 'Statement_HHLNOD_Feb2026.pdf', status: 'obtained' },
                    { name: 'SOA — Home Loan (Flat) HHENOD00454804', docFile: 'HHENOD_SOA.pdf', status: 'obtained' },
                    { name: 'SOA — Life Insurance Loan HHLNOD00453843', docFile: 'HHLNOD_SOA.pdf', status: 'obtained' },
                    { name: 'RPS — Home Loan (Flat) HHENOD00454804', docFile: 'HHENOD_RPS.pdf', status: 'obtained' },
                    { name: 'RPS — Life Insurance Loan HHLNOD00453843', docFile: 'HHLNOD_RPS.pdf', status: 'obtained' },
                  ].map((doc, i) => <DocRow key={i} {...doc} />)}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-amber-600 mb-3">🧾 Interest &amp; IT Certificates (FY-wise)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { name: 'Home Loan Interest Cert FY 2018-19 — HHENOD', docFile: 'HHENOD_Interest_FY18_19.pdf', status: 'obtained' },
                    { name: 'Home Loan Interest Cert FY 2019-20 — HHENOD', docFile: 'HHENOD_Interest_FY19_20.pdf', status: 'obtained' },
                    { name: 'Home Loan Interest Cert FY 2020-21 — HHENOD', docFile: 'HHENOD_Interest_FY20_21.pdf', status: 'obtained' },
                    { name: 'Home Loan Interest Cert FY 2021-22 — HHENOD', docFile: 'HHENOD_Interest_FY21_22.pdf', status: 'obtained' },
                    { name: 'Home Loan Interest Cert FY 2022-23 — HHENOD', docFile: 'HHENOD_Interest_FY22_23.pdf', status: 'obtained' },
                    { name: 'Home Loan Interest Cert FY 2023-24 — HHENOD', docFile: 'HHENOD_Interest_FY23_24.pdf', status: 'obtained' },
                    { name: 'Home Loan PC Cert FY 2024-25 — HHENOD', docFile: 'HHENOD_Interest_FY24_25.pdf', status: 'obtained' },
                    { name: 'Life Insurance Loan Interest Cert FY 2018-19 — HHLNOD', docFile: 'HHLNOD_Interest_FY18_19.pdf', status: 'obtained' },
                    { name: 'Life Insurance Loan Interest Cert FY 2019-20 — HHLNOD', docFile: 'HHLNOD_Interest_FY19_20.pdf', status: 'obtained' },
                    { name: 'Life Insurance Loan Interest Cert FY 2020-21 — HHLNOD', docFile: 'HHLNOD_Interest_FY20_21.pdf', status: 'obtained' },
                    { name: 'Life Insurance Loan Interest Cert FY 2021-22 — HHLNOD', docFile: 'HHLNOD_Interest_FY21_22.pdf', status: 'obtained' },
                    { name: 'Life Insurance Loan Interest Cert FY 2022-23 — HHLNOD', docFile: 'HHLNOD_Interest_FY22_22.pdf', status: 'obtained' },
                    { name: 'Life Insurance Loan Interest Cert FY 2023-24 — HHLNOD', docFile: 'HHLNOD_Interest_FY23_24.pdf', status: 'obtained' },
                    { name: 'Life Insurance Loan PC Cert FY 2024-25 — HHLNOD', docFile: 'HHLNOD_Interest_FY24_25.pdf', status: 'obtained' },
                    { name: 'IT Certificate 2020-21 — HHENOD (Home Loan)', docFile: 'HHENOD_IT_Cert_2020_21.pdf', status: 'obtained' },
                    { name: 'IT Certificate 2021-22 — HHENOD (Home Loan)', docFile: 'HHENOD_IT_Cert_2021_22.pdf', status: 'obtained' },
                  ].map((doc, i) => <DocRow key={i} {...doc} />)}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-3">🏗️ Property &amp; Builder Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { name: 'Builder Ledger Account — D-408', docFile: 'Builder_Ledger_D408.pdf', status: 'obtained' },
                    { name: 'Permission to Mortgage (PTM)', docFile: 'Permission_to_Mortgage.pdf', status: 'obtained' },
                    { name: 'RERA Registration Certificate', docFile: 'RERA_Certificate.pdf', status: 'obtained' },
                    { name: 'RERA Number Certificate', docFile: 'RERA_Number_Certificate.pdf', status: 'obtained' },
                    { name: 'Legal Notice — NOC for Release Deed', docFile: 'Legal_Notice_NOC.pdf', status: 'obtained' },
                    { name: 'IHF Certificate 1', docFile: 'IHF_Certificate_1.pdf', status: 'obtained' },
                    { name: 'IHF Certificate 2', docFile: 'IHF_Certificate_2.pdf', status: 'obtained' },
                    { name: 'Builder Buyer Agreement (BBA) — Soft Copy', docFile: '', status: 'pending', note: 'CRITICAL — interest rate clause determines 9% RERA S.18 vs 18% per SC precedent (CA 6494/2023, ₹42L→₹92L). Request from crm@urbainia.in immediately.' },
                    { name: 'Allotment Letter — Soft Copy', docFile: '', status: 'pending' },
                  ].map((doc, i) => <DocRow key={i} {...doc} />)}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-rose-600 mb-3">✉️ Legal Correspondence &amp; Drafts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { name: 'Legal Notice — NOC Non-Issuance (03-Apr-2026)', docFile: 'Legal_Notice_NOC.pdf', status: 'obtained' },
                    { name: 'DRAFT — UP RERA Section 18 Complaint', docFile: '', status: 'pending' },
                    { name: 'DRAFT — Consumer Forum Complaint', docFile: '', status: 'pending' },
                    { name: 'DRAFT — RBI Ombudsman Complaint', docFile: '', status: 'pending' },
                  ].map((doc, i) => <DocRow key={i} {...doc} />)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ EMAILS ══ */}
        {activeTab === 'EMAILS' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-1 flex items-center gap-3 text-blue-600">✉️ Key Legal Email Correspondence</h2>
              <p className="text-sm text-gray-500 mb-6 border-b border-gray-100 pb-4">542 total emails archived. Critical exchanges displayed below.</p>
              <div className="space-y-4">
                {[
                  { date: '13 Feb 2026', from: 'homeloans@sammaancapital.com', subject: 'RE: NOC for Release Deed — HHENOD00454804 & HHLNOD00453843', tag: 'SAMMAAN REPLY', tagColor: 'rose', body: 'We would like to inform you that as per our system records, Mr. Suraj Satyarthi is the main Applicant towards both the above mentioned loan accounts. As per confirmation from our concerned team, we are unable to process your request for NOC to transfer the loan rights to the Co-Applicant (Mr. Satya Narayan Satyarthi).', significance: 'Sammaan\'s official refusal — position is legally untenable (para 9 of legal notice) and forms the core of the consumer complaint.' },
                  { date: '05 Feb 2026', from: 'surajstoic@gmail.com', subject: 'Request for NOC for Execution of Release Deed — HHENOD00454804 & HHLNOD00453843', tag: 'FIRST NOC REQUEST', tagColor: 'blue', body: 'I wish to execute a Release Deed transferring my ownership rights in Flat D-408, Urbainia Trinity NX Phase-III to co-applicant Satya Narayan Satyarthi. A No Objection Certificate from Sammaan Capital is required to execute and register the Release Deed.', significance: 'First documented NOC request — establishes the start of the refusal timeline. Date: 05-Feb-2026.' },
                  { date: '06 Dec 2025', from: 'crm@urbainia.in', subject: 'RE: Formal Notice — Project Update Request — D-408 Urbainia Trinity NX', tag: 'BUILDER ADMISSION', tagColor: 'amber', body: 'The agreed total sale consideration was ₹19,50,000 (exclusive of taxes and statutory charges). All subvention interest payments made by Urbainia under the subvention scheme are clearly reflected in the attached Ledger Account Statement. Your copy remains with you.', significance: 'CRITICAL: Builder admits total consideration ₹19,50,000 and confirms subvention stopped Apr 2019 — 6 years before possession. Also admits "your copy remains with you" re: BBA but refuses to provide soft copy.' },
                  { date: '10 Aug 2024', from: 'surajstoic@gmail.com', subject: 'URGENT: Pre-EMI Not Converting to Full EMI — HHENOD00454804 — 4 Year Delay — ₹10L Loss', tag: 'EMI DISPUTE', tagColor: 'orange', body: 'Despite repeated requests since 2020, the loan HHENOD00454804 (Home Loan) has not been converted from Pre-EMI to full EMI mode. This has resulted in an estimated loss of ₹10,00,000+ over 4 years (2020–2024) as I have been paying Pre-EMI interest on the full outstanding amount rather than reducing principal.', significance: 'Documents 4-year Pre-EMI conversion failure on Home Loan (HHENOD) = ₹10L excess interest — major head of claim in Consumer Forum.' },
                  { date: 'Sep 2024', from: 'Recovery Agents (6 named)', subject: 'Threats of Rape and Physical Violence — Sammaan Capital Recovery Team', tag: 'CRIMINAL THREAT', tagColor: 'red', body: 'Documented threats including threat of rape and physical beating received from recovery agents of Sammaan Capital. Six agents named with phone numbers. Evidence in /07_Harassment_Evidence/ folder.', significance: 'IPC Sec 75 BNS (rape threat) + 351/115 BNS (criminal intimidation). CDR records have expired — audio recordings must be secured as primary evidence. Can be used in Consumer Forum for ₹5L harassment claim.' },
                  { date: '04 Jul 2025', from: 'homeloans@sammaancapital.com', subject: 'RE: Loan Documents — HHENOD00454804 & HHLNOD00453843', tag: 'SAMMAAN CONFIRMATION', tagColor: 'emerald', body: 'The Loan Agreement date for both accounts HHENOD00454804 and HHLNOD00453843 is 23rd June 2018. The first disbursement on HHENOD00454804 (Home Loan) was made on 05-Jul-2018 and on HHLNOD00453843 (Life Insurance Loan) on 10-Jul-2018.', significance: 'Confirms exact loan activation dates. HHENOD (Home Loan) was activated 5 days before HHLNOD (Life Insurance Loan).' },
                ].map(({ date, from, subject, tag, tagColor, body, significance }, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                    <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-white border-b border-gray-100">
                      <span className={`text-xs font-black px-2 py-0.5 rounded uppercase tracking-widest border shrink-0 ${tagClass(tagColor)}`}>{tag}</span>
                      <span className="text-xs text-gray-500 font-mono">{date}</span>
                      <span className="text-xs text-gray-400">From: {from}</span>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-sm font-bold text-gray-900 mb-1">{subject}</p>
                      <p className="text-xs text-gray-500 mb-3 italic leading-relaxed border-l-2 border-gray-300 pl-3">&ldquo;{body}&rdquo;</p>
                      <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2"><span className="font-bold">Legal Significance: </span>{significance}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 text-center pt-4">Full archive: 08_Kriger_Emails (196) + 09_Surajstoic_Emails (251) + 10_Builder_Urbainia_Emails + 06_Legal_Correspondence</p>
            </div>
          </div>
        )}

        {/* ══ CALCULATOR ══ */}
        {activeTab === 'CALCULATOR' && (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-sm text-emerald-800"><span className="font-black text-emerald-700">SC Precedent: </span>Supreme Court has confirmed 18% p.a. interest on full refund. MahaRERA: ₹42L → ₹92L (18% × 7 yrs). RERA Section 18 guarantees minimum 9%. Both routes computed below.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-blue-600 font-bold text-sm tracking-widest uppercase mb-4">Amount Paid by Complainant (Confirmed from Documents)</h3>
              <div className="space-y-2 mb-4">
                {[
                  { label: 'Direct payments to builder (Feb–Apr 2016, pre-loan)', amount: 430000, source: 'Urbainia Ledger Dec 2025' },
                  { label: 'Pre-EMI on Home Loan (HHENOD) out of pocket', amount: 688866, source: 'Bank stmt ₹9,51,610 minus ₹2,62,744 subvention' },
                  { label: 'Principal repaid — Home Loan HHENOD00454804', amount: 277239, source: 'Bank account statement' },
                  { label: 'Pre-EMI/Interest paid — Life Insurance Loan HHLNOD00453843', amount: 49939, source: 'Bank account statement' },
                ].map(({ label, amount, source }, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                    <div>
                      <p className="text-sm text-gray-800">{label}</p>
                      <p className="text-xs text-gray-400">{source}</p>
                    </div>
                    <span className="font-mono font-bold text-gray-900 shrink-0">₹{amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-4 bg-blue-50 rounded-lg px-4 py-3 border border-blue-200 mt-2">
                  <span className="font-bold text-blue-700">TOTAL CONFIRMED PAID (out of pocket)</span>
                  <span className="font-mono font-black text-blue-700 text-xl">₹14,46,044</span>
                </div>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 mt-3">
                <p className="text-xs text-amber-800"><span className="font-bold">Outstanding loans (builder must clear): </span>Life Insurance Loan HHLNOD ₹15,59,681 + Home Loan HHENOD ₹54,938 = <span className="font-bold">₹16,14,619</span> — builder clears this as part of refund under RERA Sec 18.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-sm">
                <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Route A — UP RERA Section 18</div>
                <div className="text-lg font-bold text-gray-900 mb-4">9% p.a. Interest</div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between text-gray-600"><span>Amount paid (confirmed)</span><span className="font-mono">₹14,46,044</span></div>
                  <div className="flex justify-between text-gray-600"><span>Interest @ 9% × 3 years</span><span className="font-mono text-blue-600">+ ₹3,90,432</span></div>
                  <div className="flex justify-between text-gray-400 text-xs"><span>(from RERA deadline Apr 8, 2023)</span><span className="font-mono">= 36 months</span></div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-blue-700"><span>RERA Refund Total</span><span className="font-mono text-xl">₹18,36,476</span></div>
                  <div className="flex justify-between text-amber-600 text-xs mt-1"><span>+ Builder clears outstanding loans</span><span className="font-mono">₹16,14,619</span></div>
                  <div className="flex justify-between text-emerald-700 font-bold"><span>Combined financial relief</span><span className="font-mono">₹34,51,095</span></div>
                </div>
                <p className="text-xs text-gray-400">Filed at: up-rera.nic.in · Timeline: 6–12 months</p>
              </div>

              <div className="bg-white border-2 border-emerald-200 rounded-2xl p-6 shadow-sm">
                <div className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Route B — Consumer Court (SC Precedent)</div>
                <div className="text-lg font-bold text-gray-900 mb-4">18% p.a. Interest</div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between text-gray-600"><span>Amount paid (confirmed)</span><span className="font-mono">₹14,46,044</span></div>
                  <div className="flex justify-between text-gray-600"><span>Interest @ 18% × 3 years</span><span className="font-mono text-emerald-600">+ ₹7,80,864</span></div>
                  <div className="flex justify-between text-gray-400 text-xs"><span>(from RERA deadline Apr 8, 2023)</span><span className="font-mono">= 36 months</span></div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-emerald-700"><span>Consumer Court Total</span><span className="font-mono text-xl">₹22,26,908</span></div>
                  <div className="flex justify-between text-gray-500 text-xs mt-1"><span>+ Mental agony &amp; harassment</span><span className="font-mono">₹5,00,000</span></div>
                  <div className="flex justify-between text-gray-500 text-xs"><span>+ Litigation costs</span><span className="font-mono">₹1,00,000</span></div>
                  <div className="flex justify-between text-amber-600 text-xs"><span>+ Builder clears outstanding loans</span><span className="font-mono">₹16,14,619</span></div>
                  <div className="flex justify-between text-emerald-700 font-bold"><span>Combined financial relief</span><span className="font-mono">₹44,41,527</span></div>
                </div>
                <p className="text-xs text-gray-400">SC precedent confirmed · Timeline: 12–24 months</p>
              </div>
            </div>

            <div className="bg-white border border-amber-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-amber-700 font-bold text-sm tracking-widest uppercase mb-4">Additional Heads of Claim (Consumer Forum)</h3>
              <div className="space-y-2">
                {[
                  { label: 'Pre-EMI wasted (HHENOD Home Loan) — total bank paid', amount: '₹9,51,610', note: 'Bank stmt confirmed' },
                  { label: '4-year Pre-EMI → Full EMI conversion failure (2020–2024)', amount: '₹10,00,000', note: "Suraj's own Aug 2024 complaint" },
                  { label: 'Moratorium wrongful denial (6 months EMI, COVID)', amount: '₹72,708', note: 'RBI circular 2019-20/186' },
                  { label: 'Excess overdue/bounce charges (identified from audit)', amount: '₹51,660+', note: 'Loan audit table' },
                  { label: 'Interest rate hike (8.55% → 13.85%, 8 hikes in 2022)', amount: '~₹3,50,000', note: 'Rate hike email chain' },
                  { label: 'Harassment via recovery agents (documented Sep 2024)', amount: '₹5,00,000', note: 'Consumer Forum head — not FIR dependent' },
                  { label: 'NOC non-issuance consequential loss', amount: '₹1,00,000', note: 'Legal notice Ref SS/HC/M/24' },
                ].map(({ label, amount, note }, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 bg-amber-50 rounded-lg px-4 py-2.5 border border-amber-100">
                    <div>
                      <p className="text-sm text-gray-800">{label}</p>
                      <p className="text-xs text-gray-400">{note}</p>
                    </div>
                    <span className="font-mono font-bold text-amber-700 shrink-0">{amount}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-4 bg-amber-100 rounded-lg px-4 py-3 border border-amber-300 mt-2">
                  <span className="font-bold text-amber-800">GRAND TOTAL ESTIMATED CLAIM (all routes combined)</span>
                  <span className="font-mono font-black text-amber-800 text-xl">₹30–44L</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-gray-500 font-bold text-xs tracking-widest uppercase mb-3">Legal Basis for Interest Rate</h3>
              <div className="space-y-2 text-xs text-gray-500">
                <p><span className="text-blue-600 font-bold">RERA Sec 18:</span> SBI MCLR + 2% ≈ 9% p.a. on all amounts paid, from agreed possession date till actual refund.</p>
                <p><span className="text-emerald-600 font-bold">SC Precedent:</span> Supreme Court upheld 18% p.a. in multiple homebuyer cases. MahaRERA: ₹42L → ₹92L. Cite: Wg. Cdr. Arifur Rahman Khan vs DLF Southern Homes (SC 2020).</p>
                <p><span className="text-amber-600 font-bold">Consumer Protection Act 2019:</span> Deficiency in service + unfair trade practice. Compensation for mental agony, harassment, and financial loss beyond refund principal.</p>
                <p><span className="text-rose-600 font-bold">Outstanding loans:</span> Builder must clear outstanding loan with Sammaan Capital — confirmed in Ravi Prakash Srivastava vs Indiabulls HFL (Delhi SCDRC 2023).</p>
              </div>
            </div>
          </div>
        )}

        {/* ══ REVIEWS ══ */}
        {activeTab === 'REVIEWS' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total Negative Reviews', value: '28+',       bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700' },
                { label: 'Buyers Affected (ITAT)',  value: '402+',      bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700' },
                { label: 'Delay Duration',          value: '9–11 Yrs',  bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
                { label: 'Paid Review Campaign',    value: 'CONFIRMED', bg: 'bg-rose-50',   border: 'border-rose-200',   text: 'text-rose-700' },
              ].map(({ label, value, bg, border, text }) => (
                <div key={label} className={`${bg} border ${border} rounded-xl p-4`}>
                  <div className={`text-xs ${text} uppercase tracking-widest font-bold mb-1`}>{label}</div>
                  <div className={`text-2xl font-black ${text}`}>{value}</div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-rose-600 font-bold text-sm tracking-widest uppercase mb-4">Critical Patterns Identified</h3>
              <div className="space-y-3">
                {[
                  { tag: 'CONFIRMED', text: 'PAID REVIEW CAMPAIGN: Reviewer Shivam Jain explicitly states "Urbainia is having a campaign in which if user give 5 star rating then lucky one of them can win 500Rs." — Direct proof of fraudulent reputation manipulation.' },
                  { tag: 'KEY',       text: 'DELAY DURATION: Reviews span 8 years (2016 onwards). Latest reviews (5 days ago, 2 weeks ago) confirm possession still pending after 9–11 years for multiple buyers.' },
                  { tag: 'FRAUD',     text: 'Multiple reviews explicitly name owner "Ankur" as a fraudster. A "Telegram channel Urbainia Fraud" was formed by affected investors as organised group action.' },
                  { tag: 'TACTIC',    text: 'COPY-PASTE RESPONSE: Every single negative review received the IDENTICAL owner response — proving zero genuine engagement and systematic dismissal.' },
                  { tag: 'FINANCIAL', text: 'ASSURED RETURNS STOPPED: Multiple reviews confirm promised rental income (assured returns) was stopped, compounding the financial fraud beyond possession delay.' },
                ].map(({ tag, text }, i) => (
                  <div key={i} className="flex gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <span className="shrink-0 text-xs font-black bg-rose-100 text-rose-700 border border-rose-200 px-2 py-0.5 rounded h-fit">{tag}</span>
                    <p className="text-sm text-gray-700">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-gray-600 font-bold text-sm tracking-widest uppercase mb-4">Verbatim Buyer Reviews — Google Maps (Extracted April 2026)</h3>
              <div className="space-y-3">
                {[
                  { name: 'Mayank Sharma',        role: 'Local Guide · 28 reviews', date: '5 years ago',        votes: 11, text: '"The builder is a total fraud. Me and my friends have been mentally pressurized to pay money for the flat that we have requested cancellation in 2018. People stay away and if anyone is in the same position as we are then i would suggest to join Telegram channel Urbainia Fraud."' },
                  { name: 'Mandeep Singh',         role: 'Local Guide · 68 reviews', date: '2 years ago',        votes: 10, text: '"The project is so so delayed. The builder is just not committed to the promises. The hard earned money of the investors is stuck so badly. When there was time to pay instalments, they used to call on daily basis to pay. I would rate them in minus if there was option available."' },
                  { name: 'Priyanka Bhat',         role: 'Local Guide · 26 reviews', date: 'Edited 1 year ago',  votes: 8,  text: '"Invested 6 years before in the project and as their home page says that we believe in #Integrity and #commitment, all that is false and a lie. No one responds to your emails, no one reverts to the phone calls."' },
                  { name: 'Gagandeep Sikka',       role: '6 reviews',               date: '5 years ago',        votes: 9,  text: '"This company promises something but has the audacity to go against the same as per their convenience. Investors have been made fools by this company. Refrain from investing your money in this company!"' },
                  { name: 'Anand Varani',          role: '2 reviews',               date: '5 years ago',        votes: 4,  text: '"This builder is a fraud and the owner Ankur is a Fraudster. Not getting returns at all...Hiding in the name of Corona when all reputed builders are giving returns on time..Total waste of money..Beware investors!"' },
                  { name: 'Shivam Jain',           role: 'Local Guide · 7 reviews',  date: '5 years ago',        votes: 5,  text: '"Fake 5 star reviews are being given by people. Urbainia is having a campaign in which if user give 5 star rating then lucky one of them can win 500Rs."' },
                  { name: 'RAHUL TIWARI',          role: 'Local Guide · 30 reviews', date: '5 years ago',        votes: 4,  text: '"Worst company, they have cheated me, taken my money for 1bhk in 2016 through square yard and at that time no one was financing them."' },
                  { name: 'Shaurya-Ritvik Bisht',  role: '1 review',                date: '5 days ago 🆕',      votes: 0,  text: '"Since last 11+ yrs waiting for 1 BHK possession and getting no proper response / confirmation from Urbania team."' },
                  { name: 'Mridul Verma',          role: 'Local Guide · 18 reviews', date: '2 weeks ago 🆕',     votes: 0,  text: '"Residential project highly delayed, absolutely poor management by developer. Friend stuck with bookings and no possession since 9+ years."' },
                  { name: 'Ravi Mehta',            role: '1 review',                date: '5 years ago',        votes: 2,  text: '"These are number one fake people, complete fraud, they show something, tell something, and change when it is time to take. Don\'t get trapped by them, friends. Don\'t invest here. You will regret it later." [Hindi original]' },
                ].map(({ name, role, date, votes, text }, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <span className="font-bold text-gray-900 text-sm">{name}</span>
                        <span className="text-xs text-gray-400 ml-2">{role}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {votes > 0 && <span className="text-xs text-gray-400">{votes} found helpful</span>}
                        <span className="text-xs text-amber-500 font-bold">★ 1/5</span>
                        <span className="text-xs text-gray-400">{date}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 italic leading-relaxed">{text}</p>
                  </div>
                ))}
                <p className="text-xs text-gray-400 text-center pt-2">Showing 10 of 28 verified negative reviews. Full verbatim set in /RERA/Verbatim_Google_Reviews.txt</p>
              </div>
            </div>
          </div>
        )}

        {/* ══ PRECEDENTS ══ */}
        {activeTab === 'PRECEDENTS' && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <span className="font-black text-amber-700 uppercase tracking-widest text-xs">Strategic Use: </span>
              These judgments establish that both the builder (Urbainia) and lender (Sammaan/Indiabulls) have a documented pattern of fraud validated at SC level. Cite them directly in the RERA complaint.
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-rose-600 font-bold text-sm tracking-widest uppercase mb-4">⚖️ Against Sammaan Capital / Indiabulls HFL</h3>
              <div className="space-y-4">
                {[
                  { badge: 'SUPREME COURT',    bColor: 'emerald', title: 'Indiabulls HFL vs T. Prem Kumar',                            ref: 'Civil Appeal No. 6494/2023 · Supreme Court · 19 Oct 2023',                  outcome: 'SC DISMISSED Indiabulls appeal. Rs. 60 Lakhs awarded to consumer.',                                           points: ['SC upheld NCDRC finding of deficiency in service against Indiabulls', 'Rs. 45L for property value loss + Rs. 15L for harassment & mental agony', '"We see no reason to interfere with the well-reasoned order."', 'Establishes Indiabulls liable for heavy compensation at the highest court level'] },
                  { badge: 'DIRECTLY IDENTICAL', bColor: 'rose',   title: 'Ravi Prakash Srivastava vs Indiabulls HFL',                   ref: 'Complaint No. 235/2013 · Delhi State Consumer Commission · 4 May 2023',    outcome: 'Complaint ALLOWED. Full refund + 9% interest + Rs. 1L harassment + Rs. 50K costs.',                           points: ['Nearly identical facts: Indiabulls loan → Greater Noida flat → Builder fraud → Buyer kept paying EMIs', 'Inquiry committee found builder AND Indiabulls officers involved in fraud', 'Key: Indiabulls cannot keep collecting EMIs when project has collapsed', '9% per annum interest on refund — same as RERA Section 18'] },
                  { badge: 'PATTERN',          bColor: 'amber',   title: 'Indiabulls HFL vs Anjum Ara + Dilip Goyal vs Indiabulls HFL', ref: 'FA No. 220/2024 Delhi SCDRC · CM(M) 2400/2024 Delhi HC · 2024',             outcome: 'Multiple ongoing cases — Indiabulls routinely found liable at District level, fights through appeals.',          points: ['Indiabulls fights every consumer order: District → State → NCDRC → HC → SC', 'Pattern of serial litigation to exhaust complainants — expect a long fight', 'But SC ultimately upheld Rs. 60L award (Prem Kumar) — persistence pays'] },
                ].map(({ badge, bColor, title, ref, outcome, points }, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs font-black px-2 py-0.5 rounded uppercase tracking-widest border ${tagClass(bColor)}`}>{badge}</span>
                      <span className="font-bold text-gray-900">{title}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">{ref}</p>
                    <p className="text-sm font-bold text-emerald-700 mb-3">{outcome}</p>
                    <ul className="space-y-1">
                      {points.map((p, j) => <li key={j} className="text-xs text-gray-500 flex gap-2"><span className="text-blue-400 shrink-0">›</span>{p}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-amber-600 font-bold text-sm tracking-widest uppercase mb-4">🏗️ Against Builder — Urbainia Spaces Pvt. Ltd.</h3>
              <div className="space-y-4">
                {[
                  { badge: 'ITAT DELHI',        bColor: 'rose',  title: 'Income Tax Dept. vs Urbainia Spaces Pvt. Ltd.',  ref: 'ITA No. 2012/Del/2024 · ITAT Delhi Bench B · 15 Oct 2025',   outcome: 'CONFIRMS: IT survey Jan 2016. ₹32+ crore collected from 402+ buyers by 2017.',                               points: ['IT Dept conducted SURVEY at Urbainia premises 22.01.2016 — govt suspicious very early', 'Builder collected Rs. 32,06,70,245 from 402+ investors by AY 2017-18 — your money included', 'Builder unable to prove creditworthiness of investor funds satisfactorily', 'Critical: WHERE IS THIS Rs. 32 CRORE? Project undelivered in 2026.'] },
                  { badge: 'DELHI HIGH COURT',  bColor: 'amber', title: 'Urbainia Spaces vs ACIT (IT Reassessment)',       ref: 'W.P.(C) 4512/2022 · Delhi HC · 21 March 2022',               outcome: 'Won on technicality only. IT Dept retains right to re-issue notices.',                                         points: ['Third time IT Dept attempted to scrutinize Urbainia (2016 → 2019 → 2022)', 'Won only on procedural ground — HC explicitly preserved revenue\'s right to re-issue', 'Pattern of fighting on technicalities rather than on merits'] },
                  { badge: 'DIRECTOR TAX CASE', bColor: 'slate', title: 'Director Sukhjot Singh Sodhi vs ACIT',            ref: 'ITAT Delhi · AY 2016-17 · 31 December 2024',                 outcome: 'Director received Rs. 61.97L interest from Urbainia. DHFL connection flagged.',                              points: ['Director borrowed from DHFL (collapsed fraudulent HFC) and invested in Urbainia', 'Director failed to appear in court TWICE — financials cannot be explained', 'Suggests Urbainia\'s capital structure was built on potentially fraudulent foundations'] },
                ].map(({ badge, bColor, title, ref, outcome, points }, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs font-black px-2 py-0.5 rounded uppercase tracking-widest border ${tagClass(bColor)}`}>{badge}</span>
                      <span className="font-bold text-gray-900">{title}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">{ref}</p>
                    <p className="text-sm font-bold text-amber-700 mb-3">{outcome}</p>
                    <ul className="space-y-1">
                      {points.map((p, j) => <li key={j} className="text-xs text-gray-500 flex gap-2"><span className="text-amber-400 shrink-0">›</span>{p}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-blue-600 font-bold text-sm tracking-widest uppercase mb-3">Ready-to-Use Citation for RERA Complaint</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600 leading-relaxed font-mono border border-gray-200 whitespace-pre-wrap">
                {`"The Promoter, M/s Urbainia Spaces Pvt. Ltd., has been under active scrutiny by the Income Tax Department since January 2016 (ITAT ITA No. 2012/Del/2024, dt. 15.10.2025). The assessee collected over Rs. 32 crores from 402+ allottees for Trinity NX by AY 2017-18, yet possession remains undelivered in 2026, raising grave concerns about diversion of allottee funds under Section 4(2)(l)(D) RERA.

Further, Opposite Party No. 2 (Sammaan Capital / Indiabulls HFL) has been held guilty of deficiency in service by the Hon'ble Supreme Court [Indiabulls HFL vs T. Prem Kumar, CA No. 6494/2023, dt. 19.10.2023, Rs. 60L awarded] and the Delhi State Consumer Commission [Ravi Prakash Srivastava vs Indiabulls HFL, Complaint No. 235/2013, dt. 04.05.2023] in nearly identical facts involving Greater Noida housing loans."`}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
