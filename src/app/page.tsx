'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface DocRowProps {
  name: string;
  docFile: string;   // filename inside /docs/ — empty string means missing
  status: string;
  note?: string;     // optional context note shown on pending items
}

function DocRow({ name, docFile, status, note }: DocRowProps) {
  if (status === 'pending' || !docFile) {
    return (
      <div className={`flex items-start gap-3 rounded-lg px-4 py-3 border ${note ? 'bg-[#1e0e0e] border-rose-500/50 shadow-[0_0_12px_rgba(239,68,68,0.15)]' : 'bg-[#1e1526] border-rose-500/20'}`}>
        <span className={`shrink-0 text-xs font-black px-2 py-0.5 rounded uppercase tracking-widest mt-0.5 ${note ? 'text-rose-400 bg-rose-500/20 border border-rose-400/50' : 'text-rose-500 bg-rose-500/10 border border-rose-500/30'}`}>
          {note ? 'CRITICAL' : 'Missing'}
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-rose-300 font-medium">{name}</span>
          {note && <span className="text-xs text-rose-400/80 leading-relaxed">{note}</span>}
        </div>
      </div>
    );
  }
  return (
    <a
      href={`/docs/${docFile}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 bg-[#1a2235] hover:bg-[#1e293b] border border-slate-700/50 hover:border-slate-500 rounded-lg px-4 py-3 transition-colors group"
    >
      <span className="shrink-0 text-xs font-black text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded uppercase tracking-widest">View PDF</span>
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
          {['DASHBOARD', 'FLOWCHART', 'EVIDENCE', 'TIMELINE', 'DOCUMENTS', 'EMAILS', 'CALCULATOR', 'REVIEWS', 'PRECEDENTS'].map(tab => (
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
                          { name: 'Home Loan (Flat Purchase) Agreement — HHLNOD00453843', docFile: 'HHLNOD_Loan_Agreement.pdf', status: 'obtained' },
                          { name: 'Home Loan (Flat Purchase) Sanction Letter — HHLNOD00453843', docFile: 'HHLNOD_Sanction_Letter.pdf', status: 'obtained' },
                          { name: 'Life Insurance Loan Agreement — HHENOD00454804', docFile: 'HHENOD_Loan_Agreement.pdf', status: 'obtained' },
                          { name: 'Life Insurance Loan Sanction Letter — HHENOD00454804', docFile: 'HHENOD_Sanction_Letter.pdf', status: 'obtained' },
                          { name: 'Foreclosure Letter', docFile: 'Foreclosure_Letter.pdf', status: 'obtained' },
                          { name: 'PEMI Certificate', docFile: 'PEMI.pdf', status: 'obtained' },
                          { name: 'Quadripartite Agreement (BBA)', docFile: '', status: 'pending', note: 'REQUIRED to establish contractual interest rate — determines 9% (RERA) vs 18% (SC precedent) delay compensation' },
                       ].map((doc, i) => <DocRow key={i} {...doc} />)}
                    </div>
                 </div>

                 {/* Account Statements */}
                 <div className="mb-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-purple-400 mb-3 flex items-center gap-2"><span>📊</span> Account Statements &amp; SOA</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                       {[
                          { name: 'Home Loan (Flat Purchase) Statement Feb 2026 — HHLNOD00453843', docFile: 'Statement_HHLNOD_Feb2026.pdf', status: 'obtained' },
                          { name: 'Life Insurance Loan Statement Feb 2026 — HHENOD00454804', docFile: 'Statement_HHENOD_Feb2026.pdf', status: 'obtained' },
                          { name: 'SOA — Home Loan (Flat) HHLNOD00453843', docFile: 'HHLNOD_SOA.pdf', status: 'obtained' },
                          { name: 'SOA — Life Insurance Loan HHENOD00454804', docFile: 'HHENOD_SOA.pdf', status: 'obtained' },
                          { name: 'RPS — Home Loan (Flat) HHLNOD00453843', docFile: 'HHLNOD_RPS.pdf', status: 'obtained' },
                          { name: 'RPS — Life Insurance Loan HHENOD00454804', docFile: 'HHENOD_RPS.pdf', status: 'obtained' },
                       ].map((doc, i) => <DocRow key={i} {...doc} />)}
                    </div>
                 </div>

                 {/* Interest Certificates */}
                 <div className="mb-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-2"><span>🧾</span> Interest &amp; IT Certificates (FY-wise)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                       {[
                          { name: 'Home Loan (Flat) Interest Cert FY 2018-19', docFile: 'HHLNOD_Interest_FY18_19.pdf', status: 'obtained' },
                          { name: 'Home Loan (Flat) Interest Cert FY 2019-20', docFile: 'HHLNOD_Interest_FY19_20.pdf', status: 'obtained' },
                          { name: 'Home Loan (Flat) Interest Cert FY 2020-21', docFile: 'HHLNOD_Interest_FY20_21.pdf', status: 'obtained' },
                          { name: 'Home Loan (Flat) Interest Cert FY 2021-22', docFile: 'HHLNOD_Interest_FY21_22.pdf', status: 'obtained' },
                          { name: 'Home Loan (Flat) Interest Cert FY 2022-23', docFile: 'HHLNOD_Interest_FY22_23.pdf', status: 'obtained' },
                          { name: 'Home Loan (Flat) Interest Cert FY 2023-24', docFile: 'HHLNOD_Interest_FY23_24.pdf', status: 'obtained' },
                          { name: 'Home Loan (Flat) PC Cert FY 2024-25', docFile: 'HHLNOD_Interest_FY24_25.pdf', status: 'obtained' },
                          { name: 'Life Insurance Loan Interest Cert FY 2018-19', docFile: 'HHENOD_Interest_FY18_19.pdf', status: 'obtained' },
                          { name: 'Life Insurance Loan Interest Cert FY 2019-20', docFile: 'HHENOD_Interest_FY19_20.pdf', status: 'obtained' },
                          { name: 'Life Insurance Loan Interest Cert FY 2020-21', docFile: 'HHENOD_Interest_FY20_21.pdf', status: 'obtained' },
                          { name: 'Life Insurance Loan Interest Cert FY 2021-22', docFile: 'HHENOD_Interest_FY21_22.pdf', status: 'obtained' },
                          { name: 'Life Insurance Loan Interest Cert FY 2022-23', docFile: 'HHENOD_Interest_FY22_23.pdf', status: 'obtained' },
                          { name: 'Life Insurance Loan Interest Cert FY 2023-24', docFile: 'HHENOD_Interest_FY23_24.pdf', status: 'obtained' },
                          { name: 'Life Insurance Loan PC Cert FY 2024-25', docFile: 'HHENOD_Interest_FY24_25.pdf', status: 'obtained' },
                          { name: 'IT Certificate 2020-21 — HHENOD', docFile: 'HHENOD_IT_Cert_2020_21.pdf', status: 'obtained' },
                          { name: 'IT Certificate 2021-22 — HHENOD', docFile: 'HHENOD_IT_Cert_2021_22.pdf', status: 'obtained' },
                       ].map((doc, i) => <DocRow key={i} {...doc} />)}
                    </div>
                 </div>

                 {/* Property Documents */}
                 <div className="mb-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-2"><span>🏗️</span> Property &amp; Builder Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                       {[
                          { name: 'Builder Ledger Account — D-408', docFile: 'Builder_Ledger_D408.pdf', status: 'obtained' },
                          { name: 'Permission to Mortgage (PTM)', docFile: 'Permission_to_Mortgage.pdf', status: 'obtained' },
                          { name: 'RERA Registration Certificate', docFile: 'RERA_Certificate.pdf', status: 'obtained' },
                          { name: 'RERA Number Certificate', docFile: 'RERA_Number_Certificate.pdf', status: 'obtained' },
                          { name: 'Legal Notice — NOC for Release Deed', docFile: 'Legal_Notice_NOC.pdf', status: 'obtained' },
                          { name: 'IHF Certificate 1', docFile: 'IHF_Certificate_1.pdf', status: 'obtained' },
                          { name: 'IHF Certificate 2', docFile: 'IHF_Certificate_2.pdf', status: 'obtained' },
                          { name: 'Builder Buyer Agreement (BBA) — Soft Copy', docFile: '', status: 'pending', note: 'CRITICAL — interest rate clause in BBA determines recovery amount: 9% RERA S.18 vs 18% per SC precedent (CA 6494/2023, ₹42L→₹92L). Request immediately from crm@urbainia.in' },
                          { name: 'Allotment Letter — Soft Copy', docFile: '', status: 'pending' },
                       ].map((doc, i) => <DocRow key={i} {...doc} />)}
                    </div>
                 </div>

                 {/* Legal Correspondence */}
                 <div className="mb-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-rose-400 mb-3 flex items-center gap-2"><span>✉️</span> Legal Correspondence &amp; Drafts</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                       {[
                          { name: 'Legal Notice — NOC Non-Issuance (03-Apr-2026)', docFile: 'Legal_Notice_NOC.pdf', status: 'obtained' },
                          { name: 'DRAFT — UP RERA Section 18 Complaint', docFile: '', status: 'pending' },
                          { name: 'DRAFT — Consumer Forum Complaint', docFile: '', status: 'pending' },
                          { name: 'DRAFT — FIR Complaint', docFile: '', status: 'pending' },
                          { name: 'DRAFT — RBI Ombudsman Complaint', docFile: '', status: 'pending' },
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

        {/* TAB CONTENT: EMAILS */}
        {activeTab === 'EMAILS' && (
          <div className="space-y-6">
            <div className="bg-[#111827] border border-slate-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-1 flex items-center gap-3 text-blue-400">✉️ Key Legal Email Correspondence</h2>
              <p className="text-sm text-slate-400 mb-6 border-b border-slate-700 pb-4">542 total emails archived. Critical exchanges displayed below. Full archive in case repository.</p>

              <div className="space-y-4">
                {[
                  {
                    date: '13 Feb 2026',
                    from: 'homeloans@sammaancapital.com',
                    to: 'surajstoic@gmail.com',
                    subject: 'RE: NOC for Release Deed — HHLNOD00453843 & HHENOD00454804 (CRM: IHF-7234556-D8K6B0)',
                    tag: 'SAMMAAN REPLY',
                    tagColor: 'rose',
                    body: 'We would like to inform you that as per our system records, Mr. Suraj Satyarthi is the main Applicant towards both the above mentioned loan accounts. As per the confirmation received from our concerned team, we are unable to process your request for NOC to transfer the loan rights to the Co-Applicant (Mr. Satya Narayan Satyarthi). For more clarification, we would request you to kindly visit any nearest Sammaan Capital branch.',
                    significance: 'This is Sammaan\'s official refusal — their position is that the main applicant cannot be changed without full loan closure. This is legally untenable (para 9 of legal notice) and forms the core of the consumer complaint.'
                  },
                  {
                    date: '05 Feb 2026',
                    from: 'surajstoic@gmail.com',
                    to: 'homeloans@sammaancapital.com',
                    subject: 'Request for NOC for Execution of Release Deed — HHLNOD00453843 & HHENOD00454804',
                    tag: 'FIRST NOC REQUEST',
                    tagColor: 'blue',
                    body: 'I wish to execute a Release Deed transferring my ownership rights in Flat D-408, Urbainia Trinity NX Phase-III to co-applicant Satya Narayan Satyarthi. A No Objection Certificate from Sammaan Capital is required to execute and register the Release Deed. I request you to issue the NOC at the earliest.',
                    significance: 'First documented NOC request — establishes the start of the refusal timeline. Date: 05-Feb-2026.'
                  },
                  {
                    date: '06 Dec 2025',
                    from: 'crm@urbainia.in',
                    to: 'surajstoic@gmail.com',
                    subject: 'RE: Formal Notice — Project Update Request — D-408 Urbainia Trinity NX',
                    tag: 'BUILDER ADMISSION',
                    tagColor: 'amber',
                    body: 'The agreed total sale consideration was ₹19,50,000 (exclusive of taxes and statutory charges). All subvention interest payments made by Urbainia under the subvention scheme are clearly reflected in the attached Ledger Account Statement. Your copy remains with you. Urbainia has always honored its obligations under the tripartite/loan related arrangements, including subvention payments wherever contractually applicable and due.',
                    significance: 'CRITICAL: Builder admits total consideration ₹19,50,000 and provides ledger showing subvention payments stopped after Apr 2019 — 6 years before possession. Builder also admits "your copy remains with you" re: BBA but refuses to provide soft copy.'
                  },
                  {
                    date: '10 Aug 2024',
                    from: 'surajstoic@gmail.com',
                    to: 'homeloans@sammaancapital.com',
                    subject: 'URGENT: Pre-EMI Not Converting to Full EMI — HHENOD00454804 — 4 Year Delay — ₹10L Loss',
                    tag: 'EMI DISPUTE',
                    tagColor: 'orange',
                    body: 'Despite repeated requests since 2020, the loan HHENOD00454804 has not been converted from Pre-EMI to full EMI mode. This has resulted in an estimated loss of ₹10,00,000+ over 4 years (2020–2024) as I have been paying Pre-EMI interest on the full outstanding amount rather than reducing principal. The builder stopped subvention payments in April 2019, yet the loan was never restructured.',
                    significance: 'Documents the 4-year Pre-EMI conversion failure resulting in ₹10L estimated excess interest — a major head of claim in the Consumer Forum complaint.'
                  },
                  {
                    date: 'Sep 2024',
                    from: 'Recovery Agents (6 named)',
                    to: 'Suraj Satyarthi',
                    subject: 'Threats of Rape and Physical Violence — Sammaan Capital Recovery Team',
                    tag: 'CRIMINAL THREAT',
                    tagColor: 'red',
                    body: 'Documented threats including threat of rape and physical beating received from recovery agents of Sammaan Capital. Six agents named with phone numbers. Evidence preserved in /07_Harassment_Evidence/ folder.',
                    significance: 'CRIMINAL CASE: IPC Sec 75 BNS (rape threat) + 351/115 BNS (criminal intimidation). Six named agents. NOTE: CDR records expire 1 year — audio recordings must be secured immediately as primary substitute evidence.'
                  },
                  {
                    date: '04 Jul 2025',
                    from: 'homeloans@sammaancapital.com',
                    to: 'surajstoic@gmail.com',
                    subject: 'RE: Loan Documents — HHLNOD00453843 & HHENOD00454804',
                    tag: 'SAMMAAN CONFIRMATION',
                    tagColor: 'emerald',
                    body: 'The Loan Agreement date for both accounts HHLNOD00453843 and HHENOD00454804 is 23rd June 2018. The first disbursement on HHENOD00454804 was made on 05-Jul-2018 and on HHLNOD00453843 on 10-Jul-2018.',
                    significance: 'Confirms exact loan activation dates. Establishes HHENOD (Life Insurance Loan) was activated 5 days before HHLNOD (Home Loan).'
                  },
                ].map(({ date, from, to, subject, tag, tagColor, body, significance }, i) => (
                  <div key={i} className="bg-[#1a2235] border border-slate-700/50 rounded-xl overflow-hidden">
                    <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
                      <span className={`text-xs font-black bg-${tagColor}-500/20 text-${tagColor}-400 border border-${tagColor}-500/30 px-2 py-0.5 rounded uppercase tracking-widest shrink-0`}>{tag}</span>
                      <span className="text-xs text-slate-400 font-mono">{date}</span>
                      <span className="text-xs text-slate-500">From: {from}</span>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-sm font-bold text-slate-200 mb-1">{subject}</p>
                      <p className="text-xs text-slate-400 mb-3 italic leading-relaxed border-l-2 border-slate-600 pl-3">&ldquo;{body}&rdquo;</p>
                      <p className="text-xs text-amber-300 bg-amber-900/20 border border-amber-500/20 rounded px-3 py-2"><span className="font-bold">Legal Significance: </span>{significance}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 text-center pt-4">Full email archive: 08_Kriger_Emails (196 emails) + 09_Surajstoic_Emails (251 emails) + 10_Builder_Urbainia_Emails + 06_Legal_Correspondence</p>
            </div>
          </div>
        )}

        {/* TAB CONTENT: CALCULATOR */}
        {activeTab === 'CALCULATOR' && (
          <div className="space-y-6">
            {/* Precedent Banner */}
            <div className="bg-emerald-900/30 border border-emerald-500/40 rounded-xl p-4">
              <p className="text-sm text-emerald-200"><span className="font-black text-emerald-400">SC Precedent: </span>Supreme Court has ordered 18% p.a. interest on full refund amount. MahaRERA has ordered ₹42L → ₹92L (18% × 7 years). RERA Section 18 guarantees minimum 9%. Both routes computed below.</p>
            </div>

            {/* What Was Paid */}
            <div className="bg-[#111827] border border-slate-700 rounded-2xl p-6">
              <h3 className="text-blue-400 font-bold text-sm tracking-widest uppercase mb-4">Amount Paid by Complainant (Confirmed from Documents)</h3>
              <div className="space-y-2 mb-4">
                {[
                  { label: 'Direct payments to builder (Feb–Apr 2016, pre-loan)', amount: 430000, source: 'Urbainia Ledger Dec 2025' },
                  { label: 'Pre-EMI on Life Insurance Loan (HHENOD) out of pocket', amount: 688866, source: 'Bank stmt ₹9,51,610 minus ₹2,62,744 subvention' },
                  { label: 'Principal repaid — Life Insurance Loan HHENOD00454804', amount: 277239, source: 'Bank account statement' },
                  { label: 'Pre-EMI/Interest paid — Home Loan HHLNOD00453843', amount: 49939, source: 'Bank account statement' },
                ].map(({ label, amount, source }, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 bg-[#1a2235] rounded-lg px-4 py-3 border border-slate-700/50">
                    <div>
                      <p className="text-sm text-slate-200">{label}</p>
                      <p className="text-xs text-slate-500">{source}</p>
                    </div>
                    <span className="font-mono font-bold text-slate-100 shrink-0">₹{amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-4 bg-blue-900/30 rounded-lg px-4 py-3 border border-blue-500/40 mt-2">
                  <span className="font-bold text-blue-300">TOTAL CONFIRMED PAID (out of pocket)</span>
                  <span className="font-mono font-black text-blue-300 text-xl">₹14,46,044</span>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 mt-3">
                <p className="text-xs text-slate-400"><span className="text-amber-400 font-bold">Outstanding loans (bank owes clearance): </span>HHLNOD ₹15,59,681 + HHENOD ₹54,938 = <span className="text-amber-400 font-bold">₹16,14,619</span> — builder must clear this as part of refund under RERA Sec 18.</p>
              </div>
            </div>

            {/* Two Scenarios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* RERA 9% */}
              <div className="bg-[#111827] border border-blue-500/40 rounded-2xl p-6">
                <div className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Route A — UP RERA Section 18</div>
                <div className="text-lg font-bold text-slate-100 mb-4">9% p.a. Interest</div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between text-slate-300"><span>Amount paid (confirmed)</span><span className="font-mono">₹14,46,044</span></div>
                  <div className="flex justify-between text-slate-300"><span>Interest @ 9% × 3 years</span><span className="font-mono text-blue-300">+ ₹3,90,432</span></div>
                  <div className="flex justify-between text-slate-300"><span>(from RERA deadline Apr 8, 2023)</span><span className="font-mono text-xs text-slate-500">= 36 months</span></div>
                  <div className="border-t border-slate-700 pt-2 flex justify-between font-bold text-blue-300"><span>RERA Refund Total</span><span className="font-mono text-xl">₹18,36,476</span></div>
                  <div className="flex justify-between text-amber-300 text-xs mt-1"><span>+ Builder clears outstanding loans</span><span className="font-mono">₹16,14,619</span></div>
                  <div className="flex justify-between text-emerald-400 font-bold"><span>Combined financial relief</span><span className="font-mono">₹34,51,095</span></div>
                </div>
                <p className="text-xs text-slate-500">Filed at: up-rera.nic.in | Timeline: 6–12 months</p>
              </div>

              {/* Consumer Court 18% */}
              <div className="bg-[#111827] border border-emerald-500/40 rounded-2xl p-6">
                <div className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">Route B — Consumer Court (SC Precedent)</div>
                <div className="text-lg font-bold text-slate-100 mb-4">18% p.a. Interest</div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between text-slate-300"><span>Amount paid (confirmed)</span><span className="font-mono">₹14,46,044</span></div>
                  <div className="flex justify-between text-slate-300"><span>Interest @ 18% × 3 years</span><span className="font-mono text-emerald-300">+ ₹7,80,864</span></div>
                  <div className="flex justify-between text-slate-300"><span>(from RERA deadline Apr 8, 2023)</span><span className="font-mono text-xs text-slate-500">= 36 months</span></div>
                  <div className="border-t border-slate-700 pt-2 flex justify-between font-bold text-emerald-300"><span>Consumer Court Total</span><span className="font-mono text-xl">₹22,26,908</span></div>
                  <div className="flex justify-between text-slate-300 text-xs mt-1"><span>+ Mental agony & harassment</span><span className="font-mono">₹5,00,000</span></div>
                  <div className="flex justify-between text-slate-300 text-xs"><span>+ Litigation costs</span><span className="font-mono">₹1,00,000</span></div>
                  <div className="flex justify-between text-amber-300 text-xs"><span>+ Builder clears outstanding loans</span><span className="font-mono">₹16,14,619</span></div>
                  <div className="flex justify-between text-emerald-400 font-bold"><span>Combined financial relief</span><span className="font-mono">₹44,41,527</span></div>
                </div>
                <p className="text-xs text-slate-500">SC precedent confirmed. Timeline: 12–24 months</p>
              </div>
            </div>

            {/* Additional Claims */}
            <div className="bg-[#111827] border border-amber-500/30 rounded-2xl p-6">
              <h3 className="text-amber-400 font-bold text-sm tracking-widest uppercase mb-4">Additional Heads of Claim (Consumer Forum)</h3>
              <div className="space-y-2">
                {[
                  { label: 'Pre-EMI wasted (HHENOD) — total paid, not just out-of-pocket', amount: '₹9,51,610', note: 'Bank stmt confirmed' },
                  { label: '4-year Pre-EMI → Full EMI conversion failure (2020–2024)', amount: '₹10,00,000', note: 'Suraj\'s own Aug 2024 complaint' },
                  { label: 'Moratorium wrongful denial (6 months EMI, COVID)', amount: '₹72,708', note: 'RBI circular 2019-20/186' },
                  { label: 'Excess overdue/bounce charges (identified from audit)', amount: '₹51,660+', note: 'Loan audit table' },
                  { label: 'Interest rate hike (8.55% → 13.85%, 8 hikes in 2022)', amount: '~₹3,50,000', note: 'Rate hike email chain' },
                  { label: 'Harassment via recovery agents (FIR grounds)', amount: '₹5,00,000', note: 'Sep 2024 threat evidence' },
                  { label: 'NOC non-issuance consequential loss', amount: '₹1,00,000', note: 'Legal notice Ref SS/HC/M/24' },
                ].map(({ label, amount, note }, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 bg-[#1a2235] rounded-lg px-4 py-2.5 border border-slate-700/50">
                    <div>
                      <p className="text-sm text-slate-200">{label}</p>
                      <p className="text-xs text-slate-500">{note}</p>
                    </div>
                    <span className="font-mono font-bold text-amber-300 shrink-0">{amount}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-4 bg-amber-900/30 rounded-lg px-4 py-3 border border-amber-500/40 mt-2">
                  <span className="font-bold text-amber-300">GRAND TOTAL ESTIMATED CLAIM (all routes combined)</span>
                  <span className="font-mono font-black text-amber-300 text-xl">₹30–44L</span>
                </div>
              </div>
            </div>

            {/* Legal Basis */}
            <div className="bg-[#111827] border border-slate-700 rounded-2xl p-5">
              <h3 className="text-slate-400 font-bold text-xs tracking-widest uppercase mb-3">Legal Basis for Interest Rate</h3>
              <div className="space-y-2 text-xs text-slate-400">
                <p><span className="text-blue-400 font-bold">RERA Sec 18:</span> SBI MCLR + 2% ≈ 9% p.a. on all amounts paid, from agreed possession date till actual refund.</p>
                <p><span className="text-emerald-400 font-bold">SC Precedent:</span> Supreme Court upheld 18% p.a. in multiple homebuyer cases. MahaRERA case: ₹42L → ₹92L. Cite: Wg. Cdr. Arifur Rahman Khan vs DLF Southern Homes (SC 2020).</p>
                <p><span className="text-amber-400 font-bold">Consumer Protection Act 2019:</span> Deficiency in service + unfair trade practice. Compensation for mental agony, harassment, and financial loss beyond the refund principal.</p>
                <p><span className="text-rose-400 font-bold">Outstanding loans:</span> Builder must clear the outstanding loan with Sammaan Capital — confirmed in Ravi Prakash Srivastava vs Indiabulls HFL (Delhi SCDRC 2023).</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: REVIEWS */}
        {activeTab === 'REVIEWS' && (
          <div className="space-y-6">
            {/* Key Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total Negative Reviews', value: '28+', color: 'rose' },
                { label: 'Buyers Affected (ITAT)', value: '402+', color: 'amber' },
                { label: 'Delay Duration', value: '9–11 Yrs', color: 'orange' },
                { label: 'Paid Review Campaign', value: 'CONFIRMED', color: 'red' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`bg-[#111827] border border-${color}-500/30 rounded-xl p-4`}>
                  <div className={`text-xs text-${color}-400 uppercase tracking-widest font-bold mb-1`}>{label}</div>
                  <div className={`text-2xl font-black text-${color}-400`}>{value}</div>
                </div>
              ))}
            </div>

            {/* Key Patterns */}
            <div className="bg-[#111827] border border-rose-500/30 rounded-2xl p-6">
              <h3 className="text-rose-400 font-bold text-sm tracking-widest uppercase mb-4">Critical Patterns Identified</h3>
              <div className="space-y-3">
                {[
                  { tag: 'CONFIRMED', text: 'PAID REVIEW CAMPAIGN: Reviewer Shivam Jain explicitly states "Urbainia is having a campaign in which if user give 5 star rating then lucky one of them can win 500Rs." — Direct proof of fraudulent reputation manipulation.' },
                  { tag: 'KEY', text: 'DELAY DURATION: Reviews span 8 years (2016 onwards). Latest reviews (5 days ago, 2 weeks ago) confirm possession still pending after 9–11 years for multiple buyers.' },
                  { tag: 'FRAUD', text: 'Multiple reviews explicitly name owner "Ankur" as a fraudster. A "Telegram channel Urbainia Fraud" was formed by affected investors as organised group action.' },
                  { tag: 'TACTIC', text: 'COPY-PASTE RESPONSE: Every single negative review received the IDENTICAL owner response — "Kindly let us know your concern and mention your booking details." — proving zero genuine engagement.' },
                  { tag: 'FINANCIAL', text: 'ASSURED RETURNS STOPPED: Multiple reviews confirm that even promised "assured returns" (rental income) were stopped, compounding the financial fraud beyond mere possession delay.' },
                ].map(({ tag, text }, i) => (
                  <div key={i} className="flex gap-3 bg-slate-800/50 rounded-lg p-3">
                    <span className="shrink-0 text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded h-fit">{tag}</span>
                    <p className="text-sm text-slate-300">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Reviews */}
            <div className="bg-[#111827] border border-slate-700 rounded-2xl p-6">
              <h3 className="text-slate-300 font-bold text-sm tracking-widest uppercase mb-4">Verbatim Buyer Reviews — Google Maps (Extracted April 2026)</h3>
              <div className="space-y-3">
                {[
                  { name: 'Mayank Sharma', role: 'Local Guide · 28 reviews', date: '5 years ago', votes: 11, text: '"The builder is a total fraud. Me and my friends have been mentally pressurized to pay money for the flat that we have requested cancellation in 2018. People stay away and if anyone is in the same position as we are then i would suggest to join Telegram channel Urbainia Fraud."' },
                  { name: 'Mandeep Singh', role: 'Local Guide · 68 reviews', date: '2 years ago', votes: 10, text: '"The project is so so delayed. The builder is just not committed to the promises. The hard earned money of the investors is stuck so badly. When there was time to pay instalments, they used to call on daily basis to pay. I would rate them in minus if there was option available."' },
                  { name: 'Priyanka Bhat', role: 'Local Guide · 26 reviews', date: 'Edited 1 year ago', votes: 8, text: '"Invested 6 years before in the project and as their home page says that we believe in #Integrity and #commitment, all that is false and a lie. No one responds to your emails, no one reverts to the phone calls."' },
                  { name: 'Gagandeep Sikka', role: '6 reviews', date: '5 years ago', votes: 9, text: '"This company promises something but has the audacity to go against the same as per their convenience. Investors have been made fools by this company. Refrain from investing your money in this company!"' },
                  { name: 'Anand Varani', role: '2 reviews', date: '5 years ago', votes: 4, text: '"This builder is a fraud and the owner Ankur is a Fraudster. Not getting returns at all...Hiding in the name of Corona when all reputed builders are giving returns on time..Total waste of money..Beware investors!"' },
                  { name: 'Shivam Jain', role: 'Local Guide · 7 reviews', date: '5 years ago', votes: 5, text: '"Fake 5 star reviews are being given by people. Urbainia is having a campaign in which if user give 5 star rating then lucky one of them can win 500Rs."' },
                  { name: 'RAHUL TIWARI', role: 'Local Guide · 30 reviews', date: '5 years ago', votes: 4, text: '"Worst company, they have cheated me, taken my money for 1bhk in 2016 through square yard and at that time no one was financing them."' },
                  { name: 'Shaurya-Ritvik Bisht', role: '1 review', date: '5 days ago 🆕', votes: 0, text: '"Since last 11+ yrs waiting for 1 BHK possession and getting no proper response / confirmation from Urbania team."' },
                  { name: 'Mridul Verma', role: 'Local Guide · 18 reviews', date: '2 weeks ago 🆕', votes: 0, text: '"Residential project highly delayed, absolutely poor management by developer. Friend stuck with bookings and no possession since 9+ years."' },
                  { name: 'Ravi Mehta', role: '1 review', date: '5 years ago', votes: 2, text: '"These are number one fake people, complete fraud, they show something, tell something, and change when it is time to take. Don\'t get trapped by them, friends. Don\'t invest here. You will regret it later." [Hindi original]' },
                ].map(({ name, role, date, votes, text }, i) => (
                  <div key={i} className="bg-[#1a2235] border border-slate-700/50 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <span className="font-bold text-slate-200 text-sm">{name}</span>
                        <span className="text-xs text-slate-500 ml-2">{role}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {votes > 0 && <span className="text-xs text-slate-500">{votes} found helpful</span>}
                        <span className="text-xs text-amber-500 font-bold">★ 1/5</span>
                        <span className="text-xs text-slate-500">{date}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 italic leading-relaxed">{text}</p>
                  </div>
                ))}
                <p className="text-xs text-slate-500 text-center pt-2">Showing 10 of 28 verified negative reviews. Full verbatim set in /RERA/Verbatim_Google_Reviews.txt</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: PRECEDENTS */}
        {activeTab === 'PRECEDENTS' && (
          <div className="space-y-6">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-sm text-amber-200">
              <span className="font-black text-amber-400 uppercase tracking-widest text-xs">Strategic Use: </span>
              These judgments establish that both the builder (Urbainia) and lender (Sammaan/Indiabulls) have a documented pattern of fraud and deficiency in service — validated at Supreme Court level. Cite them directly in the RERA complaint.
            </div>

            {/* Against Lender */}
            <div className="bg-[#111827] border border-slate-700 rounded-2xl p-6">
              <h3 className="text-rose-400 font-bold text-sm tracking-widest uppercase mb-4 flex items-center gap-2">⚖️ Against Sammaan Capital / Indiabulls HFL</h3>
              <div className="space-y-4">
                {[
                  {
                    badge: 'SUPREME COURT',
                    badgeColor: 'emerald',
                    title: 'Indiabulls HFL vs T. Prem Kumar',
                    ref: 'Civil Appeal No. 6494/2023 · Supreme Court · 19 Oct 2023',
                    outcome: 'SC DISMISSED Indiabulls appeal. Rs. 60 Lakhs awarded to consumer.',
                    points: [
                      'Supreme Court upheld NCDRC finding of deficiency in service against Indiabulls',
                      'Rs. 45L for property value loss + Rs. 15L for harassment & mental agony',
                      'SC held: "We see no reason to interfere with the well-reasoned order."',
                      'Establishes that Indiabulls is liable for heavy compensation at the highest court level',
                    ],
                  },
                  {
                    badge: 'DIRECTLY IDENTICAL',
                    badgeColor: 'rose',
                    title: 'Ravi Prakash Srivastava vs Indiabulls HFL',
                    ref: 'Complaint No. 235/2013 · Delhi State Consumer Commission · 4 May 2023',
                    outcome: 'Complaint ALLOWED. Full refund + 9% interest + Rs. 1L harassment + Rs. 50K costs.',
                    points: [
                      'Nearly identical facts: Indiabulls loan → Greater Noida flat → Builder fraud → Buyer kept paying EMIs',
                      'Inquiry committee found builder AND Indiabulls officers involved in fraud',
                      'Committee demanded RBI take strict action against both parties',
                      'Key principle: Indiabulls cannot keep collecting EMIs when project has collapsed',
                      '9% per annum interest on refund — same rate as RERA Section 18',
                    ],
                  },
                  {
                    badge: 'PATTERN',
                    badgeColor: 'amber',
                    title: 'Indiabulls HFL vs Anjum Ara + Dilip Goyal vs Indiabulls HFL',
                    ref: 'FA No. 220/2024 Delhi SCDRC · CM(M) 2400/2024 Delhi HC · 2024',
                    outcome: 'Multiple ongoing cases — Indiabulls routinely found liable at District level, fights through appeals.',
                    points: [
                      'Indiabulls fights consumer orders at every level: District → State → NCDRC → HC → SC',
                      'Pattern of serial litigation to exhaust complainants — expect a long fight',
                      'But ultimately SC upheld Rs. 60L award (Prem Kumar) — persistence pays',
                    ],
                  },
                ].map(({ badge, badgeColor, title, ref, outcome, points }, i) => (
                  <div key={i} className="bg-[#1a2235] border border-slate-700/50 rounded-xl p-5">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs font-black bg-${badgeColor}-500/20 text-${badgeColor}-400 border border-${badgeColor}-500/30 px-2 py-0.5 rounded uppercase tracking-widest`}>{badge}</span>
                      <span className="font-bold text-slate-100">{title}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">{ref}</p>
                    <p className="text-sm font-bold text-emerald-400 mb-3">{outcome}</p>
                    <ul className="space-y-1">
                      {points.map((p, j) => <li key={j} className="text-xs text-slate-400 flex gap-2"><span className="text-blue-500 shrink-0">›</span>{p}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Against Builder */}
            <div className="bg-[#111827] border border-slate-700 rounded-2xl p-6">
              <h3 className="text-amber-400 font-bold text-sm tracking-widest uppercase mb-4 flex items-center gap-2">🏗️ Against Builder — Urbainia Spaces Pvt. Ltd.</h3>
              <div className="space-y-4">
                {[
                  {
                    badge: 'ITAT DELHI',
                    badgeColor: 'rose',
                    title: 'Income Tax Dept. vs Urbainia Spaces Pvt. Ltd.',
                    ref: 'ITA No. 2012/Del/2024 · ITAT Delhi Bench B · 15 Oct 2025',
                    outcome: 'CONFIRMS: IT survey conducted Jan 2016. ₹32+ crore collected from 402+ buyers by 2017.',
                    points: [
                      'IT Dept conducted a SURVEY/RAID at Urbainia premises on 22.01.2016 — govt suspicious very early',
                      'Builder collected Rs. 32,06,70,245 from 402+ investors by AY 2017-18 — your money included',
                      'Builder was unable to prove creditworthiness of investor funds satisfactorily to AO',
                      'Critical question for RERA: WHERE IS THIS Rs. 32 CRORE? Project undelivered in 2026.',
                    ],
                  },
                  {
                    badge: 'DELHI HIGH COURT',
                    badgeColor: 'amber',
                    title: 'Urbainia Spaces vs ACIT (IT Reassessment)',
                    ref: 'W.P.(C) 4512/2022 · Delhi HC · 21 March 2022',
                    outcome: 'Won on technicality only. IT Dept retains right to re-issue notices.',
                    points: [
                      'Third time IT Dept attempted to scrutinize Urbainia (2016 survey → 2019 assessment → 2022 reassessment)',
                      'Won only on procedural ground — HC explicitly preserved revenue\'s right to re-issue notices',
                      'Pattern of fighting every proceeding on technicalities rather than on merits',
                    ],
                  },
                  {
                    badge: 'DIRECTOR TAX CASE',
                    badgeColor: 'slate',
                    title: 'Director Sukhjot Singh Sodhi vs ACIT',
                    ref: 'ITAT Delhi · AY 2016-17 · 31 December 2024',
                    outcome: 'Director received Rs. 61.97L interest from Urbainia. DHFL connection flagged.',
                    points: [
                      'Director borrowed from DHFL (collapsed fraudulent HFC) and invested in Urbainia',
                      'Director failed to appear in court TWICE — financial details cannot be explained satisfactorily',
                      'Suggests Urbainia\'s capital structure was built on shaky, potentially fraudulent foundations',
                    ],
                  },
                ].map(({ badge, badgeColor, title, ref, outcome, points }, i) => (
                  <div key={i} className="bg-[#1a2235] border border-slate-700/50 rounded-xl p-5">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs font-black bg-${badgeColor}-500/20 text-${badgeColor}-400 border border-${badgeColor}-500/30 px-2 py-0.5 rounded uppercase tracking-widest`}>{badge}</span>
                      <span className="font-bold text-slate-100">{title}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">{ref}</p>
                    <p className="text-sm font-bold text-amber-400 mb-3">{outcome}</p>
                    <ul className="space-y-1">
                      {points.map((p, j) => <li key={j} className="text-xs text-slate-400 flex gap-2"><span className="text-amber-500 shrink-0">›</span>{p}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* RERA citation template */}
            <div className="bg-[#111827] border border-blue-500/30 rounded-2xl p-6">
              <h3 className="text-blue-400 font-bold text-sm tracking-widest uppercase mb-3">Ready-to-Use Citation for RERA Complaint</h3>
              <div className="bg-slate-900 rounded-lg p-4 text-xs text-slate-300 leading-relaxed font-mono border border-slate-700">
                {`"The Promoter, M/s Urbainia Spaces Pvt. Ltd., has been under active scrutiny by the Income Tax Department since January 2016 (ITAT ITA No. 2012/Del/2024, dt. 15.10.2025). The assessee collected over Rs. 32 crores from 402+ allottees for Trinity NX by AY 2017-18, yet possession remains undelivered in 2026, raising grave concerns about diversion of allottee funds under Section 4(2)(l)(D) RERA.\n\nFurther, Opposite Party No. 2 (Sammaan Capital / Indiabulls HFL) has been held guilty of deficiency in service by the Hon'ble Supreme Court [Indiabulls HFL vs T. Prem Kumar, CA No. 6494/2023, dt. 19.10.2023, Rs. 60L awarded] and the Delhi State Consumer Commission [Ravi Prakash Srivastava vs Indiabulls HFL, Complaint No. 235/2013, dt. 04.05.2023] in nearly identical facts involving Greater Noida housing loans."`}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
