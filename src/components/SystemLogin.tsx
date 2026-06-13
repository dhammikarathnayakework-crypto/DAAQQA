import React, { useState } from 'react';
import { Lock, AtSign, KeyRound, ArrowRight, Activity } from 'lucide-react';
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
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  
  const [foundOfficer, setFoundOfficer] = useState<FieldOfficer | null>(null);
  const [newPinValue, setNewPinValue] = useState('');

  const isEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleMainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!inputValue.trim()) return;
    const value = inputValue.trim();

    // Check if entered value is an email
    if (isEmail(value)) {
      const emailLower = value.toLowerCase().trim();
      let officer = fieldOfficers.find(o => o.email?.toLowerCase().trim() === emailLower);
      
      // Special integration requested for addigitalonlinework@gmail.com with pin 1234
      if (!officer && emailLower === 'addigitalonlinework@gmail.com') {
        officer = {
          id: 'admin-root',
          name: 'Core System Admin',
          nic: 'SEC-ADMIN',
          phone: '0770000000',
          address: 'Seth Capital Headquarters',
          email: 'addigitalonlinework@gmail.com',
          pin: '1234',
          position: 'ADMIN',
          canApproveLoans: true,
          expenses: [],
          allowances: [],
          remittances: [],
          createdAt: new Date().toISOString()
        };
      }

      if (officer) {
        setFoundOfficer(officer);
        setInputValue('');
      } else {
         setError(lang === 'si' ? 'මෙම ඊමේල් ලිපිනය පද්ධතියේ නොමැත.' : 'This email is not registered in the system.');
      }
    } else {
      setError(lang === 'si' ? 'කරුණාකර ඔබගේ ලියාපදිංචි විද්‍යුත් තැපෑල (Email) ඇතුළත් කරන්න.' : 'Please enter your registered Email address first.');
    }
  };

  const handleSetPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!foundOfficer || !newPinValue) return;

    if (foundOfficer.pin) {
      // Verify existing pin
      if (newPinValue === foundOfficer.pin) {
        if (foundOfficer.position && foundOfficer.position !== 'FIELD_OFFICER') {
          onAdminLogin(foundOfficer.id);
        } else {
          onOfficerLogin(foundOfficer.id);
        }
      } else {
        setError(lang === 'si' ? 'වැරදි PIN අංකයකි!' : 'Invalid PIN!');
      }
    } else {
      // Registering new pin
      if (newPinValue.length < 4) {
        setError(lang === 'si' ? 'පින් අංකය අක්ෂර 4කට වඩා වැඩි විය යුතුය.' : 'PIN must be at least 4 characters long.');
        return;
      }
      
      // Set the PIN and automatically login the user based on their position/role
      onSetOfficerPin(foundOfficer.id, newPinValue);
      if (foundOfficer.position && foundOfficer.position !== 'FIELD_OFFICER') {
        onAdminLogin(foundOfficer.id);
      } else {
        onOfficerLogin(foundOfficer.id);
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
          <h1 className="text-3xl font-black text-white tracking-tight">SETH CAPITAL</h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">
            {lang === 'si' ? 'ආරක්ෂිත පද්ධති ප්‍රවේශය' : 'Core Financial Management System'}
          </p>
        </div>

        <div className="animate-fade-in relative z-10">
          {!foundOfficer ? (
            <form onSubmit={handleMainSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase block mb-2 tracking-wider">
                  {lang === 'si' ? 'විද්‍යුත් තැපෑල (Email)' : 'Email Address'}
                </label>
                <div className="relative">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    autoFocus
                    required
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={lang === 'si' ? 'ඔබගේ ලියාපදිංචි Email එක' : 'Your registered Email'}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl pl-12 pr-4 py-3 text-white text-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-sm placeholder:text-slate-500"
                  />
                </div>
              </div>
              {error && <p className="text-rose-400 text-xs font-bold">{error}</p>}
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {lang === 'si' ? 'ඉදිරියට' : 'Continue'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSetPinSubmit} className="space-y-5 animate-fade-in">
              <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl mb-6 text-center">
                <p className="text-xs text-teal-300 font-medium">
                  {lang === 'si' ? `ආයුබෝවන්, ${foundOfficer.name}` : `Hello, ${foundOfficer.name}`}
                </p>
                <p className="text-[10px] text-teal-500 font-mono mt-0.5">{foundOfficer.email}</p>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase block mb-2 tracking-wider">
                  {foundOfficer.pin 
                    ? (lang === 'si' ? 'ඔබගේ රහස්‍ය PIN අංකය ඇතුලත් කරන්න' : 'Enter your secure PIN')
                    : (lang === 'si' ? 'ඔබගේ නව ප්‍රවේශ මුරපදය (PIN) පිහිටුවන්න' : 'Set your new secure PIN')
                  }
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="password"
                    autoFocus
                    required
                    value={newPinValue}
                    onChange={(e) => setNewPinValue(e.target.value)}
                    placeholder="••••"
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl pl-12 pr-4 py-3 text-white font-mono tracking-[0.25em] text-lg outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <p className="text-[9px] text-teal-400 mt-2 font-medium">
                  {foundOfficer.pin 
                    ? (lang === 'si' ? '* පද්ධතියට ලොග් වීමට ඔබගේ අංක 4 පින් එක ඇතුලත් කරන්න.' : '* Enter your 4-digit PIN to access.')
                    : (lang === 'si' ? '* මෙම පින් එක ආධාරයෙන් ඔබට මින් මතුවට පද්ධතියට පිවිසිය හැක.' : '* You will use this PIN for all future log-ins.')
                  }
                </p>
              </div>
              {error && <p className="text-rose-400 text-xs font-bold">{error}</p>}
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFoundOfficer(null);
                    setNewPinValue('');
                    setError('');
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3.5 rounded-xl transition-all uppercase tracking-widest text-xs cursor-pointer"
                >
                  {lang === 'si' ? 'ආපසු' : 'Back'}
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-teal-600 hover:bg-teal-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-500/20 transition-all active:scale-95 uppercase tracking-widest text-xs cursor-pointer"
                >
                  {foundOfficer.pin 
                    ? (lang === 'si' ? 'ලොග් වන්න' : 'Verify & Login')
                    : (lang === 'si' ? 'PIN අංකය සකසා ලොග් වන්න' : 'Set PIN & Login')
                  }
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
