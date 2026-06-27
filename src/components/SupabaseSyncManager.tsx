import React, { useState, useEffect } from "react";
import { 
  Cloud, 
  CloudLightning, 
  RefreshCw, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Link2,
  ServerOff,
  Terminal,
  Activity,
  Copy,
  Check,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Loan, FieldOfficer, Investor, OfficeExpenseItem } from "../types";
import { Language } from "../translations";
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
  getOfficeExpensesFromSupabase,
  syncBulkOfficeExpensesToSupabase,
  SUPABASE_SETUP_SQL
} from "../lib/supabase";

interface SupabaseSyncProps {
  loans: Loan[];
  fieldOfficers: FieldOfficer[];
  investors: Investor[];
  officeExpenses?: OfficeExpenseItem[];
  onRestoreAll: (data: { loans?: Loan[]; fieldOfficers?: FieldOfficer[]; investors?: Investor[]; officeExpenses?: OfficeExpenseItem[] }) => void;
  lang: Language;
}

export default function SupabaseSyncManager({ 
  loans, 
  fieldOfficers, 
  investors, 
  officeExpenses = [],
  onRestoreAll, 
  lang 
}: SupabaseSyncProps) {
  const [url, setUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [syncHistory, setSyncHistory] = useState<string[]>([]);
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [showSQL, setShowSQL] = useState(false);

  // On mount check if credentials exist and are active
  useEffect(() => {
    const config = getSupabaseConfig();
    if (config) {
      setUrl(config.url);
      setAnonKey(config.anonKey);
      testSupabaseConnection(config.url, config.anonKey)
        .then((ok) => {
          setIsConnected(ok);
          if (ok) {
            addLog("Cloud Connection: Online (Auto-detected).");
          } else {
            addLog("Cloud Connection: Inactive. Credentials invalid or server sleeping.");
          }
        })
        .catch(() => {
          setIsConnected(false);
          addLog("Cloud Connection: Offline.");
        });
    }
  }, []);

  const addLog = (msg: string) => {
    const timestamp = new Date().toISOString().split("T")[1].slice(0, 8);
    setSyncHistory((prev) => [`[${timestamp}] ${msg}`, ...prev.slice(0, 9)]);
  };

  const handleTestConnection = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setIsSuccess(false);
      setStatusMessage(lang === "si" ? "පළමුව URL සහ ANON KEY ඇතුළත් කරන්න." : "Please input project URL and Anon token first.");
      return;
    }

    setIsTesting(true);
    setStatusMessage("");
    addLog("Testing cloud routing boundaries...");

    try {
      const ok = await testSupabaseConnection(url, anonKey);
      setIsConnected(ok);
      setIsSuccess(ok);
      if (ok) {
        saveSupabaseConfig(url, anonKey);
        setStatusMessage(lang === "si" ? "සම්බන්ධතාවය සාර්ථකයි! අගයන් සේව් විය." : "Test successful! Supabase cloud handshake established.");
        addLog("Sync Handshake: Established successfully.");
      } else {
        setStatusMessage(lang === "si" ? "සම්බන්ධතාවය අසාර්ථකයි. අගයන් පරීක්ෂා කරන්න." : "Handshake failed. Double-check your database policies.");
        addLog("Sync Handshake: Failed.");
      }
    } catch (e: any) {
      setIsConnected(false);
      setIsSuccess(false);
      setStatusMessage(e.message || "Failed to route to specified Supabase endpoint.");
      addLog(`Error: ${e.message || "Sync router fault"}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearConfig = () => {
    clearSupabaseConfig();
    setUrl("");
    setAnonKey("");
    setIsConnected(false);
    setIsSuccess(true);
    setStatusMessage(lang === "si" ? "පද්ධතියෙන් ක්ලවුඩ් පරිගණක සැකසුම් ඉවත් කෙරුණි." : "Cloud configurations removed from local host.");
    addLog("Cloud credentials cleared.");
  };

  const handleSyncUp = async () => {
    if (!isConnected) {
      setIsSuccess(false);
      setStatusMessage(lang === "si" ? "පළමුව සම්බන්ධතාවය සත්‍යාපනය කරන්න." : "Please establish a valid active portal uplink first.");
      return;
    }

    setIsSyncing(true);
    setStatusMessage("");
    addLog(`Initiating bulk backup upload...`);

    try {
      // 1. Sync loans
      addLog(`Uploading ${loans.length} credit ledger files...`);
      await syncBulkToSupabase(loans);

      // 2. Sync field officers
      addLog(`Uploading ${fieldOfficers.length} field officer profiles...`);
      await syncBulkFieldOfficersToSupabase(fieldOfficers);

      // 3. Sync investors
      addLog(`Uploading ${investors.length} investor ledgers...`);
      await syncBulkInvestorsToSupabase(investors);

      // 4. Sync office expenses
      addLog(`Uploading ${officeExpenses.length} office expenses...`);
      await syncBulkOfficeExpensesToSupabase(officeExpenses);

      setIsSuccess(true);
      setStatusMessage(lang === "si" ? "සියලුම දත්ත සාර්ථකව ක්ලවුඩ් ලේඛනයට අප්ලෝඩ් විය!" : "Database successfully mirrored to Supabase Cloud!");
      addLog("Upload sync stream completed.");
    } catch (e: any) {
      let cleanMessage = e.message || "Database synchronization upload stream failed.";
      if (cleanMessage.includes("does not exist") || cleanMessage.includes("relation")) {
        cleanMessage = lang === "si" 
          ? "Supabase ඩේටාබේස් එකේ ටේබල් සෑදී නැත! කරුණාකර පහත ඇති 'SQL ඩේටාබේස් එක ක්‍රියාත්මක කිරීමේ පියවර' අනුගමනය කර SQL කේතය රන් කරන්න."
          : "Database tables do not exist in Supabase! Please copy and run the SQL setup script below in your Supabase SQL Editor first.";
        setShowSQL(true); // Auto-expand SQL helper section!
      }
      setIsSuccess(false);
      setStatusMessage(cleanMessage);
      addLog(`Uplink fault: ${e.message || "Sync failure"}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncDown = async () => {
    if (!isConnected) {
      setIsSuccess(false);
      setStatusMessage(lang === "si" ? "පළමුව සම්බන්ධතාවය සත්‍යාපනය කරන්න." : "Please establish a valid active portal uplink first.");
      return;
    }

    if (!confirm(lang === "si" ? "මෙමගින් ක්ලවුඩ් පද්ධතියේ ඇති දත්ත වලින් ඔබගේ බ්‍රවුසරයේ ඇති දත්ත සියල්ල වෙනස් වනු ඇත. තහවුරු කරනවාද?" : "This will replace all your current browser records with remote Cloud database states. Continue?")) {
      return;
    }

    setIsSyncing(true);
    setStatusMessage("");
    addLog("Requesting remote database states...");

    try {
      // 1. Get remote loans
      addLog("Downloading active loans...");
      const dbLoans = await getLoansFromSupabase();

      // 2. Get remote officers
      addLog("Downloading field officers...");
      const dbOfficers = await getFieldOfficersFromSupabase();

      // 3. Get remote investors
      addLog("Downloading investor profiles...");
      const dbInvestors = await getInvestorsFromSupabase();

      // 4. Get remote office expenses
      addLog("Downloading office expenses...");
      const dbOfficeExpenses = await getOfficeExpensesFromSupabase();

      onRestoreAll({
        loans: dbLoans,
        fieldOfficers: dbOfficers,
        investors: dbInvestors,
        officeExpenses: dbOfficeExpenses
      });

      setIsSuccess(true);
      setStatusMessage(lang === "si" ? "දත්ත සාර්ථකව බ්‍රවුසරයට බාගත විය!" : "Local browser storage synchronized with Cloud models!");
      addLog(`Download synced: ${dbLoans.length} Loans, ${dbOfficers.length} Reps, ${dbInvestors.length} Investors.`);
    } catch (e: any) {
      let cleanMessage = e.message || "Database download streams aborted.";
      if (cleanMessage.includes("does not exist") || cleanMessage.includes("relation")) {
        cleanMessage = lang === "si" 
          ? "Supabase ඩේටාබේස් එකේ ටේබල් සෑදී නැත! කරුණාකර පහත ඇති 'SQL ඩේටාබේස් එක ක්‍රියාත්මක කිරීමේ පියවර' අනුගමනය කර SQL කේතය රන් කරන්න."
          : "Database tables do not exist in Supabase! Please copy and run the SQL setup script below in your Supabase SQL Editor first.";
        setShowSQL(true); // Auto-expand SQL helper section!
      }
      setIsSuccess(false);
      setStatusMessage(cleanMessage);
      addLog(`Downlink stream fault: ${e.message || "Download failed"}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-150 rounded-3xl p-6 md:p-8 shadow-xs font-sans animate-fade-in" id="supabase-sync-panel">
      
      {/* Header and Sync Indicators */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5 mb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-xl border ${
              isConnected 
                ? "bg-emerald-50 border-emerald-200 text-emerald-600 animate-pulse" 
                : "bg-slate-50 border-slate-200 text-slate-400"
            }`}>
              {isConnected ? <CloudLightning className="w-5 h-5 shrink-0" /> : <Cloud className="w-5 h-5 shrink-0" />}
            </span>
            <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">
              {lang === "si" ? "Supabase Cloud සත්‍යාපන මධ්‍යස්ථානය" : "Supabase Realtime Cloud Sync Deck"}
            </h4>
          </div>
          <p className="text-slate-400 text-xs font-semibold leading-relaxed">
            {lang === "si" 
              ? "සජීවී කාර්යාල දත්ත සේවා යොමුකිරීම් සහ ආරක්ෂක උපස්ථ Supabase ක්ලවුඩ් සර්වර්ස් සමඟ ස්වයංක්‍රීයව සිදු කරන්න." 
              : "Synchronize local microcredits, legal borrower files, offline ledger payments, and capital investors directly with enterprise Supabase."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isConnected ? (
            <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full text-[10px] font-extrabold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              <span>Cloud Active</span>
            </span>
          ) : (
            <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-400 rounded-full text-[10px] font-extrabold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-slate-350 rounded-full"></span>
              <span>Portal Closed</span>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Credentials Form Box */}
        <div className="lg:col-span-4 space-y-4 bg-slate-50 border border-slate-150 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center gap-1 text-slate-700 mb-2">
            <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
            <h5 className="font-extrabold text-xs uppercase text-slate-700">Database Uplink Handles</h5>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">
              Supabase Project URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. https://yourproj.supabase.co"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">
              Anon JWT Token Key (Anon Key)
            </label>
            <input
              type="password"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOi..."
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleTestConnection}
              disabled={isTesting || isSyncing}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-extrabold py-2 rounded-xl text-xs cursor-pointer transition select-none active:scale-95 flex items-center justify-center gap-1 font-sans"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Configuring...</span>
                </>
              ) : (
                <span>Mirror Connection</span>
              )}
            </button>

            {(url || anonKey) && (
              <button
                onClick={handleClearConfig}
                className="p-2 bg-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-300 hover:border-rose-200 rounded-xl transition cursor-pointer active:scale-95"
                title="Remove credentials"
              >
                <Trash2 className="w-4 h-4 shrink-0" />
              </button>
            )}
          </div>
        </div>

        {/* Sync Controls Section */}
        <div className="lg:col-span-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Sync Up Stream */}
            <button
              onClick={handleSyncUp}
              disabled={!isConnected || isSyncing || isTesting}
              className="bg-slate-950 hover:bg-indigo-900 disabled:bg-slate-100 border disabled:border-slate-200 text-white disabled:text-slate-400 p-5 rounded-2xl cursor-pointer transition flex flex-col items-center justify-center gap-2 min-h-[145px]"
            >
              <CloudLightning className={`w-8 h-8 ${isSyncing ? "animate-bounce text-indigo-400" : "text-white"}`} />
              <div className="text-center">
                <span className="font-extrabold text-[11px] uppercase tracking-wider block">Sync Up Stream</span>
                <span className="text-[9px] opacity-70 font-medium">Backup entire browser to Cloud</span>
              </div>
            </button>

            {/* Sync Down Stream */}
            <button
              onClick={handleSyncDown}
              disabled={!isConnected || isSyncing || isTesting}
              className="bg-indigo-50 hover:bg-indigo-100 disabled:bg-slate-100 border border-indigo-100 disabled:border-slate-200 text-indigo-700 disabled:text-slate-400 p-5 rounded-2xl cursor-pointer transition flex flex-col items-center justify-center gap-2 min-h-[145px]"
            >
              <RefreshCw className={`w-8 h-8 ${isSyncing ? "animate-spin text-indigo-600" : "text-indigo-600"}`} />
              <div className="text-center">
                <span className="font-extrabold text-[11px] uppercase tracking-wider block">Sync Down Stream</span>
                <span className="text-[9px] opacity-70 font-medium">Download Cloud entries to local</span>
              </div>
            </button>
          </div>

          {statusMessage && (
            <div className={`p-4 border rounded-2xl flex items-start gap-2 text-xs font-bold font-sans animate-fade-in ${
              isSuccess 
                ? "bg-emerald-50/70 border-emerald-100 text-emerald-800" 
                : "bg-rose-50/70 border-rose-100 text-rose-800"
            }`}>
              {isSuccess ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              )}
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Real-time sync logs terminal */}
        <div className="lg:col-span-3 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Terminal className="w-4 h-4 text-slate-400 shrink-0" />
            <h5 className="font-extrabold text-[10px] uppercase text-slate-700 tracking-wider">Sync Transaction Logs</h5>
          </div>

          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 font-mono text-[9px] text-cyan-400 space-y-1.5 min-h-[160px] max-h-[160px] overflow-y-auto leading-normal">
            <div className="flex items-center gap-1 text-slate-500 pb-1 border-b border-slate-900">
              <Activity className="w-3.5 h-3.5 text-slate-500 shrink-0 animate-pulse" />
              <span>TERMINAL STREAM</span>
            </div>
            {syncHistory.length === 0 ? (
              <p className="text-slate-600">No events logged yet. Awaiting port open...</p>
            ) : (
              syncHistory.map((item, idx) => (
                <p key={idx} className="truncate select-text">
                  {item}
                </p>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Table Activation Guide / SQL Copy section */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <button 
          onClick={() => setShowSQL(!showSQL)}
          className="w-full flex items-center justify-between text-left p-4 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-2xl cursor-pointer transition select-none"
        >
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <h5 className="font-extrabold text-xs uppercase text-slate-800 tracking-wider">
                {lang === "si" ? "Supabase SQL ඩේටාබේස් එක ක්‍රියාත්මක කිරීමේ පියවර" : "Activate Supabase SQL Database Tables"}
              </h5>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                {lang === "si" ? "ඔබගේ Supabase ප්‍රොජෙක්ට් එකෙහි ටේබල් සෑදීම සඳහා අවශ්‍ය වන SQL Script එක මෙතැනින් ලබා ගන්න." : "Get the pre-formatted SQL code needed to instantiate database tables and rules inside Supabase."}
              </p>
            </div>
          </div>
          {showSQL ? <ChevronUp className="w-4 h-4 text-slate-400 animate-fade-in" /> : <ChevronDown className="w-4 h-4 text-slate-400 animate-fade-in" />}
        </button>

        {showSQL && (
          <div className="mt-4 p-5 bg-white border border-slate-150 rounded-2xl space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
              <div className="space-y-2">
                <span className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wider block">
                  {lang === "si" ? "සිංහල උපදෙස් (Sinhala Guide):" : "Sinhala Instruction Guide:"}
                </span>
                <ul className="list-decimal list-inside space-y-1.5 font-semibold text-slate-500 text-[11px]">
                  <li>පහත ඇති <b className="text-slate-800">\"SQL Script එක කොපි කරන්න\"</b> බොත්තම ඔබා කේතය ලබා ගන්න.</li>
                  <li>ඔබගේ <b className="text-slate-800">Supabase Dashboard</b> එකට ලොග් වී අදාළ ප්‍රොජෙක්ටය තෝරන්න.</li>
                  <li>වම්පස මෙනුවේ ඇති <b className="text-slate-800">SQL Editor</b> වෙත ගොස් <span className="text-indigo-600">Create a new query</span> යන්න ක්ලික් කරන්න.</li>
                  <li>කොපි කරගත් SQL පේස්ට් (Paste) කර <b className="text-emerald-600">Run</b> බොත්තම ඔබන්න.</li>
                  <li>ඉන්පසුව ඔබගේ දත්ත සාර්ථකව සින්ක් කිරීමට හැකිවේ!</li>
                </ul>
              </div>

              <div className="space-y-2">
                <span className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wider block">
                  English Instruction Guide:
                </span>
                <ul className="list-decimal list-inside space-y-1.5 font-semibold text-slate-500 text-[11px]">
                  <li>Click <b className="text-slate-800">\"Copy SQL Script\"</b> below to copy the tables schemas to clipboard.</li>
                  <li>Open your <b className="text-slate-800">Supabase Console</b> and navigate to your active database project.</li>
                  <li>Click <b className="text-slate-850">SQL Editor</b> on the left sidebar and select \"New Query\".</li>
                  <li>Paste the copied script directly and click <b className="text-emerald-600">Run</b> to build tables and storage bounds.</li>
                  <li>Your application is now fully configured for remote database sync!</li>
                </ul>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center bg-slate-900 px-4 py-2.5 rounded-t-xl">
                <span className="text-[10px] text-slate-400 font-bold font-mono">SETH_CAPITAL_SETUP.sql</span>
                <button
                  onClick={handleCopySQL}
                  className="flex items-center gap-1.5 bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold transition select-none cursor-pointer"
                >
                  {copiedSQL ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-300" />
                      <span>{lang === "si" ? "SQL Script එක කොපි කරන්න" : "Copy SQL Script"}</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-slate-950 p-4 border border-slate-900 rounded-b-xl max-h-[185px] overflow-y-auto">
                <pre className="font-mono text-[9px] text-slate-300 leading-relaxed overflow-x-auto whitespace-pre">
                  {SUPABASE_SETUP_SQL}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
