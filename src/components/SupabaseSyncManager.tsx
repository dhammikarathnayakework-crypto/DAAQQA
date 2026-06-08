/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Database, 
  RefreshCw, 
  CloudLightning, 
  Copy, 
  Check, 
  CheckCircle, 
  Server, 
  AlertTriangle, 
  Wifi, 
  WifiOff, 
  Terminal, 
  ArrowUpRight, 
  ArrowDownLeft,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Loan, FieldOfficer, Investor } from "../types";
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  clearSupabaseConfig, 
  testSupabaseConnection, 
  getLoansFromSupabase, 
  syncBulkToSupabase, 
  getFieldOfficersFromSupabase,
  syncBulkFieldOfficersToSupabase,
  getInvestorsFromSupabase,
  syncBulkInvestorsToSupabase,
  SUPABASE_SETUP_SQL 
} from "../lib/supabase";

interface SupabaseSyncManagerProps {
  loans: Loan[];
  fieldOfficers: FieldOfficer[];
  investors: Investor[];
  onRestoreAll: (restored: { loans?: Loan[]; fieldOfficers?: FieldOfficer[]; investors?: Investor[] }) => void;
  lang: "en" | "si";
}

export default function SupabaseSyncManager({ loans, fieldOfficers, investors, onRestoreAll, lang }: SupabaseSyncManagerProps) {
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("");
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [syncing, setSyncing] = useState<"push" | "pull" | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [logMessages, setLogMessages] = useState<Array<{ type: "info" | "success" | "error"; text: string; time: string }>>([]);

  const isConfiguredByEnv = !localStorage.getItem("seth-capital-supabase-credentials") && 
    !!(import.meta as any).env?.VITE_SUPABASE_URL && 
    !!(import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  // Add event status logs
  const addLog = (type: "info" | "success" | "error", text: string) => {
    const time = new Date().toLocaleTimeString();
    setLogMessages(prev => [{ type, text, time }, ...prev.slice(0, 8)]);
  };

  // Initial credentials loading
  useEffect(() => {
    const config = getSupabaseConfig();
    if (config) {
      setSupabaseUrl(config.url);
      setSupabaseAnonKey(config.anonKey);
      testConnection(config.url, config.anonKey, true);
    } else {
      setIsConnected(false);
      addLog("info", lang === "si" 
         ? "Supabase ඩේටාබේස් සම්බන්ධතාවය වින්‍යාස කර නැත." 
         : "Supabase database credentials are not configured yet."
      );
    }
  }, [lang]);

  const testConnection = async (url: string, key: string, silent = false) => {
    if (!url || !key) {
      if (!silent) {
        addLog("error", lang === "si" ? "URL සහ Anon Key ඇතුළත් කළ යුතුය." : "URL and Anon Key must both be entered.");
      }
      setIsConnected(false);
      return;
    }

    setTestingConnection(true);
    if (!silent) {
      addLog("info", lang === "si" ? "Supabase ජාල සම්බන්ධතාවය පරීක්ෂා කරමින්..." : "Checking communication with Supabase servers...");
    }

    const success = await testSupabaseConnection(url, key);
    setIsConnected(success);
    setTestingConnection(false);

    if (success) {
      if (!silent) {
        addLog("success", lang === "si" ? "Supabase ඩේටාබේස් එක සාර්ථකව සම්බන්ධ විය!" : "Supabase database integrated successfully!");
      }
    } else {
      if (!silent) {
        addLog("error", lang === "si" 
          ? "සම්බන්ධතාවය අසාර්ථක විය. කරුණාකර URL / Key හෝ SQL Table එක නිවැරදිදැයි පරීක්ෂා කරන්න." 
          : "Connection failed. Please inspect keys, credentials, or table deployment SQL."
        );
      }
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) return;

    saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
    addLog("info", lang === "si" ? "නව සැකසුම් සුරකින ලදී! සම්බන්ධතාවය පරීක්ෂා කරමින්..." : "New credentials stored! Handshaking with server...");
    await testConnection(supabaseUrl, supabaseAnonKey);
  };

  const handleClearCredentials = () => {
    clearSupabaseConfig();
    setSupabaseUrl("");
    setSupabaseAnonKey("");
    setIsConnected(false);
    addLog("info", lang === "si" ? "සම්බන්ධතා සැකසුම් ඉවත් කරන ලදී." : "Connection settings cleared.");
  };

  const handlePush = async () => {
    if (!isConnected) {
      addLog("error", lang === "si" ? "පළමුව සක්‍රිය සම්බන්ධතාවයක් ස්ථාපිත කරන්න." : "Please establish an active server connection first.");
      return;
    }
    if (loans.length === 0 && fieldOfficers.length === 0 && investors.length === 0) {
      addLog("error", lang === "si" ? "උඩුගත කිරීමට කිසිදු දත්තයක් නොමැත." : "No data arrays exist to upload.");
      return;
    }

    setSyncing("push");
    addLog("info", lang === "si" 
      ? `සියලුම දත්ත (ණය ලේඛන ${loans.length}, නිලධාරීන් ${fieldOfficers.length}, ආයෝජකයින් ${investors.length}) Supabase වෙත උඩුගත කරමින්...` 
      : `Uploading all datasets (loans: ${loans.length}, officers: ${fieldOfficers.length}, investors: ${investors.length}) to Cloud Database...`
    );

    try {
      // 1. Sync Loans
      if (loans.length > 0) {
        await syncBulkToSupabase(loans);
        addLog("success", lang === "si" ? "ණය ගිණුම් සාර්ථකව සමමුහුර්ත කරන ලදී." : "Synced active loan ledgers.");
      }
      
      // 2. Sync Field Officers
      if (fieldOfficers.length > 0) {
        await syncBulkFieldOfficersToSupabase(fieldOfficers);
        addLog("success", lang === "si" ? "ක්ෂේත්‍ර නිලධාරීන් සාර්ථකව සමමුහුර්ත කරන ලදී." : "Synced field representatives database.");
      }

      // 3. Sync Investors
      if (investors.length > 0) {
        await syncBulkInvestorsToSupabase(investors);
        addLog("success", lang === "si" ? "ආයෝජකයින්ගේ දත්ත සාර්ථකව සමමුහුර්ත කරන ලදී." : "Synced external seed capital ledger.");
      }

      addLog("success", lang === "si" 
        ? "සියලුම දත්ත සාර්ථකව Supabase ඩේටාබේස් එක වෙත යාවත්කාලීන කරන ලදී!" 
        : "All entries successfully synchronized with Supabase cloud storage!"
      );
    } catch (e: any) {
      console.error(e);
      addLog("error", lang === "si" 
        ? `උඩුගත කිරීම අසාර්ථකයි: ${e.message || "රෝල්‍ස් ව්‍යුහයන් (Tables) සකස් කර නොමැති විය හැක."}` 
        : `Upload failed: ${e.message || "The standard SQL Relation schemas might not be fully configured."}`
      );
    } finally {
      setSyncing(null);
    }
  };

  const handlePull = async () => {
    if (!isConnected) {
      addLog("error", lang === "si" ? "පළමුව සක්‍රිය සම්බන්ධතාවයක් ස්ථාපිත කරන්න." : "Please establish an active server connection first.");
      return;
    }

    if (!confirm(lang === "si" 
      ? "පද්ධතියේ දැනට පවතින දත්ත (ණය, නිලධාරීන්, ආයෝජකයින්) මකා දමා Supabase වල ඇති දත්ත ප්‍රතිස්ථාපනය කිරීමට අවශ්‍යද?" 
      : "Downgrade and overwrite ALL current local collections (loans, officers, investors) with live Supabase database rows?")) {
      return;
    }

    setSyncing("pull");
    addLog("info", lang === "si" ? "Supabase වෙතින් දත්ත බාගත කරමින්..." : "Downloading data from Supabase live cloud storage...");

    try {
      addLog("info", lang === "si" ? "ණය ගිණුම් ලබාගනිමින්..." : "Downloading loan table records...");
      const dbLoans = await getLoansFromSupabase();
      
      addLog("info", lang === "si" ? "නිලධාරි ලැයිස්තුව ලබාගනිමින්..." : "Downloading field representative table records...");
      const dbOfficers = await getFieldOfficersFromSupabase();

      addLog("info", lang === "si" ? "ආයෝජන ලැයිස්තුව ලබාගනිමින්..." : "Downloading seed investors table records...");
      const dbInvestors = await getInvestorsFromSupabase();

      onRestoreAll({ loans: dbLoans, fieldOfficers: dbOfficers, investors: dbInvestors });

      addLog("success", lang === "si" 
        ? `සාර්ථකව ණය ගිණුම් ${dbLoans.length}, ක්ෂේත්‍ර නිලධාරීන් ${dbOfficers.length} සහ ආයෝජකයින් ${dbInvestors.length} ක් ප්‍රතිස්ථාපනය කරන ලදී!` 
        : `Successfully imported: loans ${dbLoans.length}, officers ${dbOfficers.length}, investors ${dbInvestors.length} into system!`
      );
    } catch (e: any) {
      console.error(e);
      addLog("error", lang === "si" 
        ? `බාගත කිරීම අසාර්ථකයි: ${e.message || "රෝල්ස් ව්‍යුහයන් සර්වර් හි සකස් කර නැත."}` 
        : `Download failed: ${e.message || "Tables are missing or relation scheme is uncreated on Supabase."}`
      );
    } finally {
      setSyncing(null);
    }
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
    addLog("info", lang === "si" ? "SQL කේතය ඔබගේ පසුරු පුවරුවට (Clipboard) පිටපත් කරන ලදී." : "SQL setup script copied to clipboard.");
  };

  return (
    <div className="space-y-6 select-none font-sans max-w-5xl mx-auto">
      {/* Title Header Block */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute right-0 top-0 w-36 h-36 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-805 flex items-center gap-2.5">
              <Database className="w-6 h-6 text-indigo-600 animate-pulse" />
              {lang === "si" ? "Supabase SQL වලාකුළු සම්බන්ධතාවය" : "Supabase Cloud Database Center"}
            </h2>
            <p className="text-slate-500 text-xs">
              {lang === "si" 
                ? "සියලුම ණය ගිණුම්, දිනපතා එකතු කිරීම් සහ ගනුදෙනු දත්ත Supabase SQL Database එක සමඟ සජීවීව සමමුහුර්ත (Realtime Sync) කරන්න." 
                : "Synchronize all microfinance ledger streams, customer lists, and payment receipts live using Supabase servers."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isConnected ? (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-650 px-3.5 py-1.5 rounded-full text-xs font-extrabold border border-emerald-100 shadow-xs">
                <Wifi className="w-4 h-4 text-emerald-500" />
                {lang === "si" ? "සම්බන්ධයි (ONLINE)" : "Connected (LIVE)"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-650 px-3.5 py-1.5 rounded-full text-xs font-extrabold border border-rose-100 shadow-xs">
                <WifiOff className="w-4 h-4 text-rose-500" />
                {lang === "si" ? "නොබැඳි (OFFLINE)" : "Disconnected"}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Connection Configuration Controls */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-750 text-xs uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4.5 h-4.5 text-indigo-500" />
              {lang === "si" ? "සම්බන්ධතා අක්තපත්‍ර (Credentials)" : "Database Credentials Configuration"}
            </h3>
            {isConfiguredByEnv && (
              <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded">
                Configured via .env
              </span>
            )}
          </div>

          <form onSubmit={handleSaveCredentials} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-500 uppercase tracking-widest text-[10px]">
                  Supabase URL
                </label>
                <a 
                  href="https://supabase.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[10px] text-indigo-600 hover:underline font-bold"
                >
                  Create Project →
                </a>
              </div>
              <input
                type="url"
                required
                disabled={isConfiguredByEnv}
                placeholder="https://your-project-id.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-250 font-mono text-xs text-slate-750 bg-slate-50/50 focus:outline-hidden focus:border-indigo-600 focus:bg-white transition disabled:opacity-60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-500 uppercase tracking-widest text-[10px]">
                Supabase Anon / Public API Key
              </label>
              <input
                type="text"
                required
                disabled={isConfiguredByEnv}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-key-goes-here..."
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-250 font-mono text-xs text-slate-750 bg-slate-50/50 focus:outline-hidden focus:border-indigo-600 focus:bg-white transition disabled:opacity-60"
              />
            </div>

            {!isConfiguredByEnv && (
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={testingConnection}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl transition cursor-pointer select-none border-0 flex items-center gap-1.5"
                >
                  {testingConnection ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CloudLightning className="w-3.5 h-3.5" />}
                  {lang === "si" ? "සුරකින්න සහ සම්බන්ධ කරන්න" : "Save & Connect DB"}
                </button>
                {(supabaseUrl || supabaseAnonKey) && (
                  <button
                    type="button"
                    onClick={handleClearCredentials}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-505 font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    {lang === "si" ? "මකන්න" : "Reset config"}
                  </button>
                )}
              </div>
            )}
            
            {isConfiguredByEnv && (
              <button
                type="button"
                onClick={() => testConnection(supabaseUrl, supabaseAnonKey)}
                disabled={testingConnection}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl transition cursor-pointer select-none border-0 flex items-center gap-1.5"
              >
                {testingConnection ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                {lang === "si" ? "සම්බන්ධතාවය පරික්ෂා කරන්න" : "Test Connection"}
              </button>
            )}
          </form>

          {/* Core cloud data migration action triggers */}
          <div className="pt-6 border-t border-slate-100 space-y-4 font-sans">
            <h4 className="font-extrabold text-slate-805 text-[11px] uppercase tracking-wider">
              {lang === "si" ? "සජීවී දත්ත යාවත්කාලීන ක්‍රියා (Cloud Sync Actions)" : "Live Cloud Synchronization Actions"}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Push Local -> Cloud */}
              <button
                onClick={handlePush}
                disabled={!isConnected || syncing !== null}
                className={`flex flex-col items-start p-4 border rounded-2xl text-left transition select-none ${
                  isConnected 
                    ? "bg-[#FAFBFB] hover:bg-indigo-50/25 border-slate-200 hover:border-indigo-200 cursor-pointer text-slate-750" 
                    : "opacity-45 bg-[#FAFBFB] border-slate-150 cursor-not-allowed text-slate-400"
                }`}
              >
                <div className="flex items-center gap-2 font-black text-xs font-sans">
                  <ArrowUpRight className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{lang === "si" ? "සුපර් සින්ක් වලාකුළට (Push Data)" : "Push Local to Supabase"}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-1">
                  {lang === "si" 
                    ? `පරිගණකයේ ඇති ණය ගිණුම් ${loans.length} සජීවීව වලාකුළට උඩුගත කරන්න.` 
                    : `Upload your local browser ledgers (${loans.length} files) to store safely online.`}
                </p>
                {syncing === "push" && (
                  <span className="mt-2 text-[10px] text-indigo-600 font-bold animate-pulse flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Synchronizing...
                  </span>
                )}
              </button>

              {/* Pull Cloud -> Local */}
              <button
                onClick={handlePull}
                disabled={!isConnected || syncing !== null}
                className={`flex flex-col items-start p-4 border rounded-2xl text-left transition select-none ${
                  isConnected 
                    ? "bg-[#FAFBFB] hover:bg-emerald-50/25 border-slate-200 hover:border-emerald-200 cursor-pointer text-slate-750" 
                    : "opacity-45 bg-[#FAFBFB] border-slate-150 cursor-not-allowed text-slate-400"
                }`}
              >
                <div className="flex items-center gap-2 font-black text-xs font-sans">
                  <ArrowDownLeft className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{lang === "si" ? "සර්වර් එකෙන් ලබාගන්න (Pull Data)" : "Pull live from Supabase"}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-1">
                  {lang === "si" 
                    ? "සර්වර් එකෙහි ඇති සියලුම ණය ගනුදෙනු ලේඛන බාගත කර පිහිටුවන්න." 
                    : "Retrieve cloud tables and fully replace your browser database content."}
                </p>
                {syncing === "pull" && (
                  <span className="mt-2 text-[10px] text-emerald-600 font-bold animate-pulse flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Fetching live rows...
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Real-time sync log console & details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-950 border border-slate-850 rounded-3xl p-5 md:p-6 text-white shadow-xl space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Live Sync Terminal Logs
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>

            <div className="space-y-2 h-[150px] overflow-y-auto text-[10px] scrollbar-thin text-slate-300">
              {logMessages.length === 0 ? (
                <div className="text-slate-500 text-center py-8">
                  &lt; System terminal active and awaiting queries &gt;
                </div>
              ) : (
                logMessages.map((log, index) => (
                  <div key={index} className="flex items-start gap-1.5 leading-relaxed">
                    <span className="text-slate-500 text-[9px] font-bold">[{log.time}]</span>
                    <span className={
                      log.type === "success" ? "text-emerald-400 font-bold" : 
                      log.type === "error" ? "text-rose-400 font-bold" : "text-sky-305 text-slate-300"
                    }>
                      {log.type === "success" ? "✔" : log.type === "error" ? "✖" : "•"} {log.text}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs font-sans text-xs space-y-4">
            <h4 className="font-extrabold text-slate-750 flex items-center gap-1 text-[11px] uppercase tracking-wider">
              <AlertTriangle className="w-4.5 h-4.5 text-indigo-600" />
              {lang === "si" ? "SQL Table සැකසුම් මාර්ගෝපදේශය" : "Supabase Relation Guide"}
            </h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              {lang === "si" 
                ? "Supabase ඩේටාබේස් එක සමඟින් සාර්ථකව උඩුගත (Push) සහ බාගත (Pull) කිරීම් ක්‍රියාත්මක වීමට නම්, Supabase හි Table එකක් සාදා තිබිය යුතුය. පහත දක්වා ඇති SQL කේතය පිටපත් කර ඔබගේ Supabase SQL Editor එක තුළ Run කරන්න."
                : "For synchronization to compile properly, you must deploy the 'loans' relational table first inside the Supabase control panel. Open the Supabase SQL Editor and run the instructions below."
              }
            </p>

            <button
              onClick={() => setShowSql(!showSql)}
              className="w-full justify-between flex items-center bg-slate-50 hover:bg-slate-100 px-4 py-2.5 rounded-xl transition font-bold select-none cursor-pointer"
            >
              <span>{lang === "si" ? "SQL Schema එක පෙන්වන්න" : "View SQL Script"}</span>
              {showSql ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showSql && (
              <div className="space-y-2 animate-fade-in text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-400 uppercase tracking-widest text-[9px]">SOLO TABLE BUILD SCRIPT</span>
                  <button
                    onClick={copySqlToClipboard}
                    className="flex items-center gap-1.5 text-[10px] text-indigo-650 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg active:scale-95 transition font-bold cursor-pointer"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-505" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSql ? (lang === "si" ? "පිටපත් විය!" : "Success!") : (lang === "si" ? "කොපි කරන්න (Copy)" : "Copy Script")}
                  </button>
                </div>
                <pre className="p-4 bg-slate-900 text-slate-100 font-mono text-[9px] rounded-xl overflow-x-auto leading-relaxed max-h-[170px] select-text">
                  {SUPABASE_SETUP_SQL}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
