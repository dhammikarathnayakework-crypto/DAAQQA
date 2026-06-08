import React, { useState } from 'react';
import { Lock, User, AtSign, KeyRound, ArrowRight, Activity, ShieldAlert } from 'lucide-react';
import { FieldOfficer } from '../types';
import { Language } from '../translations';

interface SystemLoginProps {
  fieldOfficers: FieldOfficer[];
  onAdminLogin: (pin: string) => void;
  onOfficerLogin: (officerId: string) => void;
  onSetOfficerPin: (officerId: string, pin: string) => void;
  lang: Language;
}

export default function SystemLogin({ fieldOfficers, onAdminLogin, onOfficerLogin, onSetOfficerPin, lang }: SystemLoginProps) {
  const [role, setRole] = useState<'ADMIN' | 'OFFICER' | null>(null);
  
  // Admin Login States
  const [adminPin, setAdminPin] = useState('');
  const [adminError, setAdminError] = useState('');

  // Officer Login States
  const [officerEmail, setOfficerEmail] = useState('');
  const [officerPin, setOfficerPin] = useState('');
  const [officerError, setOfficerError] = useState('');
  const [foundOfficer, setFoundOfficer] = useState<FieldOfficer | null>(null);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPin) return;
    
    // Hardcoded simple pin for admin for preview purpose
    if (adminPin === '1234') {
      onAdminLogin(adminPin);
    } else {
      setAdminError(lang === 'si' ? 'පින් අංකය වැරදියි!' : 'Invalid Admin PIN!');
    }
  };

  const handleOfficerEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOfficerError('');
    if (!officerEmail) return;

    const officer = fieldOfficers.find(o => o.email?.toLowerCase().trim() === officerEmail.toLowerCase().trim());
    if (officer) {
      setFoundOfficer(officer);
    } else {
      setOfficerError(lang === 'si' ? 'මෙම ඊමේල් ලිපිනය සහිත නිලධාරියෙකු හමු නොවිණි.' : 'No officer found with this email.');
    }
  };

  const handleOfficerPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOfficerError('');
    if (!foundOfficer || !officerPin) return;

    if (!foundOfficer.pin) {
      // First time login - setting PIN
      if (officerPin.length < 4) {
        setOfficerError(lang === 'si' ? 'පින් අංකය අක්ෂර 4කට වඩා වැඩි විය යුතුය.' : 'PIN must be at least 4 characters long.');
        return;
      }
      onSetOfficerPin(foundOfficer.id, officerPin);
      onOfficerLogin(foundOfficer.id);
    } else {
      // Returning login
      if (foundOfficer.pin === officerPin) {
        onOfficerLogin(foundOfficer.id);
      } else {
        setOfficerError(lang === 'si' ? 'පින් අංකය වැරදියි!' : 'Invalid PIN!');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-indigo-500/30">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-teal-500 to-rose-500" />
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-teal-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="text-center mb-10 relative z-10">
          <div className="inline-flex items-center justify-center p-3 bg-slate-900 border border-slate-700 shadow-inner rounded-2xl mb-4">
            <Activity className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">SETH  CAPITAL</h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">
            {lang === 'si' ? 'ආරක්ෂිත පද්ධති ප්‍රවේශය' : 'Core Financial Management System'}
          </p>
        </div>

        {!role ? (
          <div className="space-y-4 relative z-10">
            <button
              onClick={() => setRole('ADMIN')}
              className="w-full flex items-center justify-between p-5 rounded-2xl bg-slate-700/50 hover:bg-slate-700 border border-slate-600 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-white font-bold text-sm tracking-wide">
                    {lang === 'si' ? 'ප්‍රධාන කාර්යාලය (Admin)' : 'Head Office (Admin)'}
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">Administrator Access</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
            </button>

            <button
              onClick={() => setRole('OFFICER')}
              className="w-full flex items-center justify-between p-5 rounded-2xl bg-slate-700/50 hover:bg-slate-700 border border-slate-600 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-teal-500/20 rounded-xl text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-white font-bold text-sm tracking-wide">
                    {lang === 'si' ? 'ක්ෂේත්‍ර නිලධාරී (Field Rep)' : 'Field Officer Hub'}
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">Agent Login</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
            </button>
          </div>
        ) : role === 'ADMIN' ? (
          <div className="animate-fade-in relative z-10">
            <button 
              onClick={() => { setRole(null); setAdminError(''); }}
              className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider mb-6 flex items-center gap-1 transition-colors cursor-pointer"
            >
              &larr; {lang === 'si' ? 'ආපසු' : 'Back'}
            </button>
            <form onSubmit={handleAdminSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase block mb-2 tracking-wider">
                  {lang === 'si' ? 'ප්‍රධාන කාර්යාලයේ පින් අංකය' : 'Master Admin PIN'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="password"
                    autoFocus
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    placeholder="•••• (1234)"
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl pl-12 pr-4 py-3 text-white font-mono tracking-[0.25em] text-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              {adminError && <p className="text-rose-400 text-xs font-bold">{adminError}</p>}
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 uppercase tracking-widest text-xs cursor-pointer"
              >
                {lang === 'si' ? 'ලොග් වන්න' : 'Access System'}
              </button>
            </form>
          </div>
        ) : (
          <div className="animate-fade-in relative z-10">
            <button 
              onClick={() => { setRole(null); setFoundOfficer(null); setOfficerError(''); }}
              className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider mb-6 flex items-center gap-1 transition-colors cursor-pointer"
            >
              &larr; {lang === 'si' ? 'ආපසු' : 'Back'}
            </button>
            
            {!foundOfficer ? (
              <form onSubmit={handleOfficerEmailSubmit} className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase block mb-2 tracking-wider">
                    {lang === 'si' ? 'ඔබගේ ඊමේල් ලිපිනය' : 'Registered Email Address'}
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      autoFocus
                      required
                      value={officerEmail}
                      onChange={(e) => setOfficerEmail(e.target.value)}
                      placeholder="name@email.com"
                      className="w-full bg-slate-900 border border-slate-600 rounded-xl pl-12 pr-4 py-3 text-white text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-sans"
                    />
                  </div>
                </div>
                {officerError && <p className="text-rose-400 text-xs font-bold">{officerError}</p>}
                <button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-500/20 transition-all active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {lang === 'si' ? 'ඉදිරියට යන්න' : 'Continue'} <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleOfficerPinSubmit} className="space-y-5 animate-fade-in">
                <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl mb-6 text-center">
                  <p className="text-xs text-teal-300 font-medium">Hello, {foundOfficer.name}</p>
                  <p className="text-[10px] text-teal-500 font-mono mt-0.5">{foundOfficer.email}</p>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase block mb-2 tracking-wider">
                    {!foundOfficer.pin 
                      ? (lang === 'si' ? 'ඔබගේ නව ප්‍රවේශ මුරපදය (PIN) පිහිටුවන්න' : 'Set your new secure PIN')
                      : (lang === 'si' ? 'ඔබගේ ප්‍රවේශ මුරපදය (PIN) ඇතුලත් කරන්න' : 'Enter your secure PIN')
                    }
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="password"
                      autoFocus
                      required
                      value={officerPin}
                      onChange={(e) => setOfficerPin(e.target.value)}
                      placeholder="••••"
                      className="w-full bg-slate-900 border border-slate-600 rounded-xl pl-12 pr-4 py-3 text-white font-mono tracking-[0.25em] text-lg outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  {!foundOfficer.pin && (
                    <p className="text-[9px] text-teal-400 mt-2 font-medium">
                      {lang === 'si' ? '* මෙම පින් එක ආධාරයෙන් ඔබට මින් මතුවට පද්ධතියට පිවිසිය හැක.' : '* You will use this PIN for all future log-ins.'}
                    </p>
                  )}
                </div>
                {officerError && <p className="text-rose-400 text-xs font-bold">{officerError}</p>}
                <button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-500/20 transition-all active:scale-95 uppercase tracking-widest text-xs cursor-pointer"
                >
                  {!foundOfficer.pin 
                    ? (lang === 'si' ? 'PIN අංකය සකසා ලොග් වන්න' : 'Set PIN & Login')
                    : (lang === 'si' ? 'ලොග් වන්න' : 'Access Hub')
                  }
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
