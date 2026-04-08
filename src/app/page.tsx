'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const REPO_BASE = 'https://github.com/surajstoic/urbainia-case/blob/main';

interface DocRowProps {
  name: string;
  path: string;
  status: string;
}

function DocRow({ name, path, status }: DocRowProps) {
  if (status === 'pending') {
    return (
      <div className="flex items-center gap-3 bg-[#1e1526] border border-rose-500/20 rounded-lg px-4 py-3">
        <span className="shrink-0 text-xs font-black text-rose-500 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded uppercase tracking-widest">Missing</span>
        <span className="text-sm text-rose-300 font-medium">{name}</span>
      </div>
    );
  }
  return (
    <a
      href={`${REPO_BASE}/${encodeURIComponent(path)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 bg-[#1a2235] hover:bg-[#1e293b] border border-slate-700/50 hover:border-slate-500 rounded-lg px-4 py-3 transition-colors group"
    >
      <span className="shrink-0 text-xs font-black text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded uppercase tracking-widest">View</span>
      <span className="text-sm text-slate-200 group-hover:text-white font-medium truncate">{name}</span>
    </a>
  );
}

export default function CaseBrief() {
  const [tasks, setTasks] = useState<{ id: string, title: string, description: string, assignee: string, rice: string, done: boolean }[]>([]);
  const [auth, setAuth] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [activeTab, setActiveTab] = useState('DASHBOARD');

  const fetchTasks = async () => {
    const { data } = await supabase.from('tasks').select('*').order('id', { ascending: true });
    if(data) setTasks(data);
  };

  useEffect(() => {
    fetchTasks();
    const sub = supabase.channel('tasks-update')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks();
      })
      .subscribe();
    return () => { supabase.removeChannel(sub) };
  }, []);

  const toggleTask = async (id: string, done: boolean) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !done } : t));
    await supabase.from('tasks').update({ done: !done }).eq('id', id);
  };

  if(!auth) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] text-slate-200 flex items-center justify-center">
        <div className="bg-[#111827] p-8 border border-slate-700 rounded-xl w-96 text-center shadow-2xl">
          <h2 className="text-xl font-bold mb-2">⚖️ Confidental Access</h2>
          <p className="text-slate-400 text-sm mb-6">Enter lawyer passcode to access the brief.</p>
          <input 
            type="password" 
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="w-full bg-[#1a2235] border border-slate-600 rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500 mb-6 text-center tracking-[0.3em] font-mono text-xl"
            placeholder="··········"
          />
          <button 
            onClick={() => { if(passcode === 'Sudhanshu1234') setAuth(true); else alert('Incorrect passcode'); }}
            className="w-full bg-blue-600 hover:bg-blue-500 font-semibold py-3 rounded-lg transition shadow-[0_0_15px_rgba(37,99,235,0.3)]"
          >
            Access Evidence Documents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-200 font-sans p-6 pb-20">
      <div className="max-w-5xl mx-auto">
        <nav className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
          <div className="font-bold text-blue-500 tracking-wide text-lg">⚖️ Suraj Satyarthi v. Urbainia Spaces</div>
          <div className="bg-red-500/15 text-red-400 text-xs font-bold px-3 py-1 rounded-full border border-red-500/30 tracking-widest uppercase">Confidential</div>
        </nav>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <h1 className="text-3xl font-extrabold mb-2 text-white drop-shadow-md">Primary Relief: Section 18 RERA Complaint</h1>
          <p className="text-slate-400 mb-8 font-medium">Project: Urbainia Trinity NX Phase-III · Promoters: Urbainia Spaces & Avdesh Infotech</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="bg-[#111827] rounded-xl p-5 border border-slate-700 hover:border-slate-500 transition duration-300 shadow-lg">
                <div className="text-xs text-slate-400 uppercase tracking-widest mb-2 font-bold">Delay</div>
                <div className="text-3xl font-black text-rose-400 drop-shadow-[0_0_10px_rgba(251,113,133,0.3)]">36+ Mos</div>
             </div>
             <div className="bg-[#111827] rounded-xl p-5 border border-slate-700 hover:border-slate-500 transition duration-300 shadow-lg">
                <div className="text-xs text-slate-400 uppercase tracking-widest mb-2 font-bold">Total Evidence</div>
                <div className="text-3xl font-black text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.3)]">12 Items</div>
             </div>
             <div className="bg-[#111827] rounded-xl p-5 border border-slate-700 hover:border-slate-500 transition duration-300 shadow-lg">
                <div className="text-xs text-slate-400 uppercase tracking-widest mb-2 font-bold">Affected Buyers</div>
                <div className="text-3xl font-black text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">402+</div>
             </div>
             <div className="bg-[#111827] rounded-xl p-5 border border-slate-700 hover:border-slate-500 transition duration-300 shadow-lg">
                <div className="text-xs text-slate-400 uppercase tracking-widest mb-2 font-bold">Total Paid (Ledger)</div>
                <div className="text-3xl font-black text-emerald-400 font-mono drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">₹20.02 L</div>
             </div>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex space-x-1 border-b border-slate-700 mb-8 pb-1 overflow-x-auto">
          {['DASHBOARD', 'FLOWCHART', 'EVIDENCE', 'TIMELINE', 'DOCUMENTS'].map(tab => (
             <button 
               key={tab} 
               onClick={() => setActiveTab(tab)}
               className={`py-2 px-6 rounded-t-lg font-bold text-sm tracking-widest transition-colors duration-200 
                  ${activeTab === tab ? 'bg-blue-600/10 text-blue-400 border-t border-x border-slate-700 border-b-2 border-b-blue-500' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
             >
               {tab}
             </button>
          ))}
        </div>

        {/* TAB CONTENT: DASHBOARD */}
        {activeTab === 'DASHBOARD' && (
           <>
              <div className="bg-[#111827] border border-slate-700 rounded-2xl p-8 mb-8 shadow-2xl relative">
                <h2 className="text-xl font-bold mb-3 flex items-center gap-3"><span className="text-2xl animate-pulse">🔄</span> Live Synchronized Task Board</h2>
                <p className="text-sm text-slate-400 mb-8 border-b border-slate-700 pb-5">Checklist syncs in real-time. Changes made by your lawyer will appear here instantly via Supabase connection.</p>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-slate-400 uppercase text-xs tracking-widest font-bold">
                        <th className="pb-3 px-4 w-16 text-center border-b border-slate-800">S.No</th>
                        <th className="pb-3 px-4 w-32 border-b border-slate-800">Assignee</th>
                        <th className="pb-3 px-4 border-b border-slate-800">Task Details</th>
                        <th className="pb-3 px-4 w-36 text-right border-b border-slate-800">Priority Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.length === 0 && <tr><td colSpan={4} className="text-center py-12 text-slate-500 font-mono text-sm animate-pulse">Connecting to Database...</td></tr>}
                      {tasks.map((t, index) => (
                        <tr key={t.id} onClick={() => toggleTask(t.id, t.done)} className={`bg-[#1a2235] hover:bg-[#1e293b] cursor-pointer transition-all duration-200 ${t.done ? 'opacity-40 grayscale-[50%]' : 'shadow-md translate-y-[-1px]'}`}>
                          <td className="py-4 px-4 text-center rounded-l-lg border-y border-l border-slate-700/50">
                            <div className={`w-8 h-8 rounded-md font-mono font-bold flex items-center justify-center transition-all ${t.done ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-800 text-slate-400 border border-slate-600'}`}>
                              {t.done ? '✓' : index + 1}
                            </div>
                          </td>
                          <td className="py-4 px-4 border-y border-slate-700/50">
                             <span className={`text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-md ${t.assignee === 'Suraj' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'}`}>
                                {t.assignee}
                             </span>
                          </td>
                          <td className="py-4 px-4 border-y border-slate-700/50">
                            <div className={`font-bold text-[15px] ${t.done ? 'line-through text-slate-400' : 'text-slate-100'}`}>{t.title}</div>
                            <div className="text-xs text-slate-400 mt-1.5 leading-relaxed pr-8">{t.description}</div>
                          </td>
                          <td className="py-4 px-4 text-right rounded-r-lg border-y border-r border-slate-700/50">
                             <span className="font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded border border-emerald-400/20">{t.rice}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
           </>
        )}

        {/* TAB CONTENT: FLOWCHART (Retrograde Analysis) */}
        {activeTab === 'FLOWCHART' && (
           <div className="bg-[#111827] border border-slate-700 rounded-2xl p-8 mb-8 shadow-2xl relative">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400"><span className="text-2xl">🗺️</span> Retrograde Strategic Flowchart</h2>
              <p className="text-sm text-slate-400 mb-10 border-b border-slate-700 pb-5">Working backwards from our ultimate win condition to today's identical tactical steps.</p>
              
              <div className="flex flex-col items-center space-y-2 mt-4 relative pb-10">
                 {/* Ultimate Goal Container */}
                 <div className="w-full max-w-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] rounded-2xl p-6 text-center z-10">
                    <h3 className="text-emerald-400 font-extrabold text-xs tracking-widest uppercase mb-1">Ultimate Objective</h3>
                    <div className="text-2xl font-black text-white drop-shadow-md">💰 100% Compensation + 18% Delay Interest</div>
                    <div className="text-sm text-emerald-200 mt-2 font-medium">Total financial emancipation from Urbainia and Sammaan Capital.</div>
                 </div>

                 {/* Upward Line segment */}
                 <div className="w-1 h-8 bg-gradient-to-t from-blue-500 to-emerald-500 z-0"></div>

                 {/* Step 4 */}
                 <div className="w-full max-w-lg bg-[#1a2235] border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)] rounded-xl p-5 text-center z-10 transform transition hover:scale-105 hover:bg-[#1e293b]">
                    <h3 className="text-blue-400 font-bold text-[10px] tracking-widest uppercase mb-1">Step 4 (Favorable Ruling)</h3>
                    <div className="text-lg font-bold text-slate-100">UP RERA Enforces Section 18 Order</div>
                    <div className="text-xs text-slate-400 mt-1">Tribunal validates Dec 2025 builder ledger admission, overcoming any 3-year limitation trap.</div>
                 </div>

                 <div className="w-1 h-8 bg-blue-500 z-0 opacity-50"></div>

                 {/* Step 3 */}
                 <div className="w-full max-w-lg bg-[#1a2235] border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)] rounded-xl p-5 text-center z-10 transform transition hover:scale-105 hover:bg-[#1e293b]">
                    <h3 className="text-blue-400 font-bold text-[10px] tracking-widest uppercase mb-1">Step 3 (The Pincer Attack)</h3>
                    <div className="text-lg font-bold text-slate-100">Formal Filing of Twin Legal Complaints</div>
                    <div className="text-xs text-slate-400 mt-1">Launch RERA proceeding concurrently with IBC/Consumer complaint to prevent Sammaan&apos;s Sec 95 IBC weaponization.</div>
                 </div>

                 <div className="w-1 h-8 bg-blue-500 z-0 opacity-50"></div>

                 {/* Step 2 */}
                 <div className="w-full max-w-lg bg-[#1a2235] border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)] rounded-xl p-5 text-center z-10 transform transition hover:scale-105 hover:bg-[#1e293b]">
                    <h3 className="text-blue-400 font-bold text-[10px] tracking-widest uppercase mb-1">Step 2 (Criminal Deterrence)</h3>
                    <div className="text-lg font-bold text-slate-100">Criminal Complaint Against Sammaan Threats</div>
                    <div className="text-xs text-slate-400 mt-1">Neutralize Sep 2024 rape/violence recovery agent threats via formal IPC 503 intimidation filings.</div>
                 </div>

                 <div className="w-1 h-12 bg-gradient-to-t from-slate-600 to-blue-500 z-0 opacity-50"></div>

                 {/* Today */}
                 <div className="w-full max-w-2xl bg-slate-800 border-2 border-slate-500 shadow-xl rounded-2xl p-6 text-center z-10 border-dashed relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-slate-700 text-white text-xs font-bold px-3 py-1 rounded-full border border-slate-500">YOU ARE HERE</div>
                    <h3 className="text-slate-400 font-extrabold text-xs tracking-widest uppercase mb-1 mt-2">Today&apos;s Baseline</h3>
                    <div className="text-2xl font-black text-white drop-shadow-md">Evidentiary Verification & Dashboard Ops</div>
                    <div className="text-sm text-slate-300 mt-2 font-medium">Securing the missing BBA, indexing all payments, and assigning tasks natively via Supabase.</div>
                 </div>

              </div>
           </div>
        )}

        {/* TAB CONTENT: EVIDENCE */}
        {activeTab === 'EVIDENCE' && (
           <div className="bg-[#111827] border border-slate-700 rounded-2xl p-8 shadow-2xl">
             <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-blue-400"><span className="text-2xl">📂</span> Verified Evidence Directory</h2>
             <table className="w-full text-left text-sm border-separate border-spacing-y-2">
                <thead>
                   <tr className="text-slate-400 font-bold uppercase text-xs tracking-widest border-b border-slate-800">
                      <th className="pb-3 px-4 border-b border-slate-800">Status</th>
                      <th className="pb-3 px-4 border-b border-slate-800">Document Type</th>
                      <th className="pb-3 px-4 border-b border-slate-800">FilePath / Proof</th>
                   </tr>
                </thead>
                <tbody>
                   <tr className="bg-[#1a2235]">
                      <td className="py-4 px-4 text-emerald-400 font-bold rounded-l-lg border border-slate-700/50">OBTAINED</td>
                      <td className="py-4 px-4 border-y border-slate-700/50 font-bold">Urbainia Buyer Ledger</td>
                      <td className="py-4 px-4 font-mono text-xs text-blue-300 rounded-r-lg border border-slate-700/50">/05_Evidence_and_Payments/ledger...pdf</td>
                   </tr>
                   <tr className="bg-[#1a2235]">
                      <td className="py-4 px-4 text-emerald-400 font-bold rounded-l-lg border border-slate-700/50">OBTAINED</td>
                      <td className="py-4 px-4 border-y border-slate-700/50 font-bold">Indiabulls Tripartite Agreement</td>
                      <td className="py-4 px-4 font-mono text-xs text-blue-300 rounded-r-lg border border-slate-700/50">/05_Evidence_and_Payments/Tripartite...pdf</td>
                   </tr>
                   <tr className="bg-[#1a2235]">
                      <td className="py-4 px-4 text-emerald-400 font-bold rounded-l-lg border border-slate-700/50">OBTAINED</td>
                      <td className="py-4 px-4 border-y border-slate-700/50 font-bold">ITAT Judgment (32Cr Fund Collection)</td>
                      <td className="py-4 px-4 font-mono text-xs text-blue-300 rounded-r-lg border border-slate-700/50">/12_Email_Attachments/ITAT_Judgment_2025.pdf</td>
                   </tr>
                   <tr className="bg-[#1e1526] border border-rose-900">
                      <td className="py-4 px-4 text-rose-500 font-bold rounded-l-lg border border-rose-500/30">MISSING</td>
                      <td className="py-4 px-4 font-bold text-rose-300 border-y border-rose-500/30">Builder Buyer Agreement (BBA)</td>
                      <td className="py-4 px-4 text-sm text-slate-400 rounded-r-lg border border-rose-500/30">Check emails. Highly critical for interest rate.</td>
                   </tr>
                </tbody>
             </table>
           </div>
        )}

        {/* TAB CONTENT: DOCUMENTS */}
        {activeTab === 'DOCUMENTS' && (
           <div className="space-y-6">
              <div className="bg-[#111827] border border-slate-700 rounded-2xl p-6 shadow-2xl">
                 <h2 className="text-xl font-bold mb-1 flex items-center gap-3 text-emerald-400"><span className="text-2xl">📁</span> Legal Document Repository</h2>
                 <p className="text-sm text-slate-400 mb-6 border-b border-slate-700 pb-4">All case documents indexed by category. Files are stored in the shared GitHub repository (surajstoic/urbainia-case).</p>

                 {/* Loan Agreements & Sanctions */}
                 <div className="mb-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-3 flex items-center gap-2"><span>📋</span> Loan Agreements &amp; Sanction Letters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                       {[
                          { name: 'Home Loan Agreement — HHLNOD00453843', path: '01_Loan_Agreements_and_Sanctions/HHLNOD00453843_LOAN AGREEMENT_1399261311PDF.PDF', status: 'obtained' },
                          { name: 'Home Loan Sanction Letter — HHLNOD00453843', path: '01_Loan_Agreements_and_Sanctions/HHLNOD00453843_SANCTION LETTER_1399261311PDF.PDF', status: 'obtained' },
                          { name: 'Top-up Loan Agreement — HHENOD00454804', path: '01_Loan_Agreements_and_Sanctions/HHENOD00454804_LOAN AGREEMENT_1458511811PDF.PDF', status: 'obtained' },
                          { name: 'Top-up Loan Sanction Letter — HHENOD00454804', path: '01_Loan_Agreements_and_Sanctions/HHENOD00454804_SANCTION LETTER_1458511811PDF.PDF', status: 'obtained' },
                          { name: 'Foreclosure Letter', path: '12_Email_Attachments/Indiabulls_Summary_2/ForeClosure Letter IHF-5700647-S1V3M1.pdf', status: 'obtained' },
                          { name: 'Repayment Schedule — Home Loan', path: '04_Interest_Certificates/Repayment_Schedule_Main_Loan.pdf', status: 'obtained' },
                          { name: 'Repayment Schedule — Top-up Loan', path: '04_Interest_Certificates/Repayment_Schedule_Emergency_Loan.pdf', status: 'obtained' },
                          { name: 'Quadripartite Agreement (BBA)', path: '', status: 'pending' },
                       ].map((doc, i) => <DocRow key={i} {...doc} />)}
                    </div>
                 </div>

                 {/* Account Statements */}
                 <div className="mb-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-purple-400 mb-3 flex items-center gap-2"><span>📊</span> Account Statements &amp; SOA</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                       {[
                          { name: 'Home Loan Statement (Feb 2026) — HHLNOD00453843', path: '03_Account_Statements_Latest/Statement_Home_Loan_HHLNOD00453843_Feb2026.pdf', status: 'obtained' },
                          { name: 'Top-up Loan Statement (Feb 2026) — HHENOD00454804', path: '03_Account_Statements_Latest/Statement_Emergency_Loan_HHENOD00454804_Feb2026.pdf', status: 'obtained' },
                          { name: 'SOA — HHLNOD00453843', path: '12_Email_Attachments/Indiabulls_Summary_2/HHLNOD00453843 - SOA.pdf', status: 'obtained' },
                          { name: 'SOA — HHENOD00454804', path: '12_Email_Attachments/Indiabulls_Summary_2/HHENOD00454804 - SOA.pdf', status: 'obtained' },
                          { name: 'RPS — HHLNOD00453843', path: '12_Email_Attachments/Indiabulls_Summary_2/HHLNOD00453843 - RPS.pdf', status: 'obtained' },
                          { name: 'RPS — HHENOD00454804', path: '12_Email_Attachments/Indiabulls_Summary_2/HHENOD00454804 - RPS.pdf', status: 'obtained' },
                       ].map((doc, i) => <DocRow key={i} {...doc} />)}
                    </div>
                 </div>

                 {/* Interest Certificates */}
                 <div className="mb-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-2"><span>🧾</span> Interest &amp; IT Certificates (FY-wise)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                       {[
                          { name: 'Home Loan Interest Cert FY 2018-19', path: '12_Email_Attachments/Indiabulls_Summary_2/HHLNOD00453843 (18-19).pdf', status: 'obtained' },
                          { name: 'Home Loan Interest Cert FY 2019-20', path: '12_Email_Attachments/Indiabulls_Summary_2/HHLNOD00453843 (19-20).pdf', status: 'obtained' },
                          { name: 'Home Loan Interest Cert FY 2020-21', path: '12_Email_Attachments/Indiabulls_Summary_2/HHLNOD00453843 (20-21).pdf', status: 'obtained' },
                          { name: 'Home Loan Interest Cert FY 2021-22', path: '12_Email_Attachments/Indiabulls_Summary_2/HHLNOD00453843 (21-22).pdf', status: 'obtained' },
                          { name: 'Home Loan Interest Cert FY 2022-23', path: '12_Email_Attachments/Indiabulls_Summary_2/HHLNOD00453843 (22-23).pdf', status: 'obtained' },
                          { name: 'Home Loan Interest Cert FY 2023-24', path: '12_Email_Attachments/Indiabulls_Summary_2/HHLNOD00453843 (23-24).pdf', status: 'obtained' },
                          { name: 'Home Loan PC Cert FY 2024-25', path: '12_Email_Attachments/Indiabulls_Summary_2/HHLNOD00453843 PC (24-25).pdf', status: 'obtained' },
                          { name: 'Top-up Interest Cert FY 2018-19', path: '12_Email_Attachments/Indiabulls_Summary_2/HHENOD00454804 (18-19).pdf', status: 'obtained' },
                          { name: 'Top-up Interest Cert FY 2019-20', path: '12_Email_Attachments/Indiabulls_Summary_2/HHENOD00454804 (19-20).pdf', status: 'obtained' },
                          { name: 'Top-up Interest Cert FY 2020-21', path: '12_Email_Attachments/Indiabulls_Summary_2/HHENOD00454804 (20-21).pdf', status: 'obtained' },
                          { name: 'Top-up Interest Cert FY 2021-22', path: '12_Email_Attachments/Indiabulls_Summary_2/HHENOD00454804 (21-22).pdf', status: 'obtained' },
                          { name: 'Top-up Interest Cert FY 2022-23', path: '12_Email_Attachments/Indiabulls_Summary_2/HHENOD00454804 (22-23).pdf', status: 'obtained' },
                          { name: 'Top-up Interest Cert FY 2023-24', path: '12_Email_Attachments/Indiabulls_Summary_2/HHENOD00454804 (23-24).pdf', status: 'obtained' },
                          { name: 'Top-up PC Cert FY 2024-25', path: '12_Email_Attachments/Indiabulls_Summary_2/HHENOD00454804 PC (24-25).pdf', status: 'obtained' },
                          { name: 'IT Certificate 2020-21 — HHENOD', path: '12_Email_Attachments/Indiabulls_Summary_2/HHENOD00454804 - IT - 2020-21.pdf', status: 'obtained' },
                          { name: 'IT Certificate 2021-22 — HHENOD', path: '12_Email_Attachments/Indiabulls_Summary_2/HHENOD00454804 - IT - 2021-22.pdf', status: 'obtained' },
                       ].map((doc, i) => <DocRow key={i} {...doc} />)}
                    </div>
                 </div>

                 {/* Property Documents */}
                 <div className="mb-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-2"><span>🏗️</span> Property &amp; Builder Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                       {[
                          { name: 'Builder Ledger Account — D-408', path: '02_Property_Documents/Ledger Account- Suraj Satyarthi D-408.pdf', status: 'obtained' },
                          { name: 'Permission to Mortgage (PTM)', path: '02_Property_Documents/Urbainia_Feb2026_Docs/PTM- Suraj Satyarthi.pdf', status: 'obtained' },
                          { name: 'RERA Registration Certificate', path: '02_Property_Documents/UP RERA _ Uttar Pradesh Real Estate Regulatory Authority.pdf', status: 'obtained' },
                          { name: 'RERA Number Certificate', path: 'RERA number certificate.pdf', status: 'obtained' },
                          { name: 'Legal Notice — Suraj vs Indiabulls', path: 'LEGAL NOTICE SURAJ INDIABULLS.pdf', status: 'obtained' },
                          { name: 'IHF Certificate 1', path: 'IHF-7236617-R6N8L7.pdf', status: 'obtained' },
                          { name: 'IHF Certificate 2', path: 'IHF-7236620-D7D3H2.pdf', status: 'obtained' },
                          { name: 'Builder Buyer Agreement (BBA) — Soft Copy', path: '', status: 'pending' },
                          { name: 'Allotment Letter — Soft Copy', path: '', status: 'pending' },
                       ].map((doc, i) => <DocRow key={i} {...doc} />)}
                    </div>
                 </div>

                 {/* Legal Correspondence */}
                 <div className="mb-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-rose-400 mb-3 flex items-center gap-2"><span>✉️</span> Legal Correspondence</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                       {[
                          { name: 'NOC Request — Release of Co-Borrower Liability', path: '06_Legal_Correspondence/Latest_NOC_Request_Feb2026.eml', status: 'obtained' },
                          { name: 'Formal Notice — Unauthorized EMI Increase (HHENOD)', path: '06_Legal_Correspondence/Re_ Formal Notice Seeking Legal Justification for EMI Increase – Loan A_c No. HHENOD00454804 CRM_00000751000004793.eml', status: 'obtained' },
                          { name: 'Formal Request — Interest Rate Reconsideration', path: '06_Legal_Correspondence/Formal Request to Reconsider Interest Rate Increase on Loan A_c No. HHENOD00454804.eml', status: 'obtained' },
                          { name: 'Urgent Clarification — Unauthorized Deductions', path: '06_Legal_Correspondence/Urgent Clarification_ Unauthorized Deductions, Penalties & Account Statement.eml', status: 'obtained' },
                          { name: 'Sammaan Capital — Letter', path: '06_Legal_Correspondence/To Samaan capital.docx', status: 'obtained' },
                          { name: 'DRAFT — UP RERA Complaint Section 18', path: 'DRAFT_UP_RERA_Complaint.md', status: 'obtained' },
                          { name: 'DRAFT — Consumer Forum Complaint', path: 'DRAFT_Consumer_Forum_Complaint.md', status: 'obtained' },
                          { name: 'DRAFT — FIR Complaint', path: 'DRAFT_FIR_Complaint.md', status: 'obtained' },
                          { name: 'DRAFT — RBI Ombudsman Complaint', path: 'DRAFT_RBI_Ombudsman_Complaint.md', status: 'obtained' },
                       ].map((doc, i) => <DocRow key={i} {...doc} />)}
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* TAB CONTENT: TIMELINE */}
        {activeTab === 'TIMELINE' && (
           <div className="bg-[#111827] border border-slate-700 rounded-2xl p-8 shadow-2xl relative">
              <div className="absolute left-10 top-24 bottom-10 w-1 bg-slate-700/50"></div>
              <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-purple-400"><span className="text-2xl">⏳</span> Chronological Offense History</h2>
              
              <div className="relative pl-12 mb-8">
                 <div className="absolute left-[-6px] top-1.5 w-4 h-4 bg-emerald-500 rounded-full border-4 border-[#111827]"></div>
                 <h3 className="text-emerald-400 font-bold text-sm tracking-widest uppercase">Jun 2018</h3>
                 <p className="font-bold text-lg text-slate-200 mt-1">Quadripartite Agreement Executed</p>
                 <p className="text-sm text-slate-400 mt-1">Loan Agreements signed 23-Jun-2018 between Urbainia, Indiabulls, Suraj, and co-allottee (father). HHENOD activated 05-Jul-2018; HHLNOD activated 10-Jul-2018.</p>
              </div>

              <div className="relative pl-12 mb-8">
                 <div className="absolute left-[-6px] top-1.5 w-4 h-4 bg-amber-500 rounded-full border-4 border-[#111827]"></div>
                 <h3 className="text-amber-400 font-bold text-sm tracking-widest uppercase">Apr 2023</h3>
                 <p className="font-bold text-lg text-slate-200 mt-1">Urbainia RERA Possession Deadline Missed</p>
                 <p className="text-sm text-slate-400 mt-1">RERA-registered completion date: April 8, 2023 (UPRERAPRJ6307). Possession still not given as of April 2026.</p>
              </div>

              <div className="relative pl-12 mb-8">
                 <div className="absolute left-[-6px] top-1.5 w-4 h-4 bg-rose-500 rounded-full border-4 border-[#111827]"></div>
                 <h3 className="text-rose-400 font-bold text-sm tracking-widest uppercase">Sep 2024</h3>
                 <p className="font-bold text-lg text-slate-200 mt-1">Sammaan Capital Recovery Agent Threats</p>
                 <p className="text-sm text-slate-400 mt-1">Documented threats of rape and physical beating. Evidence saved in &apos;Threats_from_Agents&apos; folder.</p>
              </div>

              <div className="relative pl-12">
                 <div className="absolute left-[-6px] top-1.5 w-4 h-4 bg-blue-500 rounded-full border-4 border-[#111827]"></div>
                 <h3 className="text-blue-400 font-bold text-sm tracking-widest uppercase">Present</h3>
                 <p className="font-bold text-lg text-slate-200 mt-1">Initiating UP RERA Proceeding</p>
                 <p className="text-sm text-slate-400 mt-1">Executing RERA Section 18 for full refund vs continuing cause of action limitation.</p>
              </div>
           </div>
        )}

      </div>
    </div>
  );
}
