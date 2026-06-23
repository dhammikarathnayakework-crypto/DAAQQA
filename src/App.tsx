/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  FilePlus, 
  TableProperties, 
  Database, 
  Trash2, 
  AlertTriangle,
  Mail,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  TrendingUp,
  Coins,
  Languages,
  UserCheck,
  Users,
  CheckCircle2,
  AlertCircle,
  Receipt
} from "lucide-react";
import { Loan, PaymentCollection, FieldOfficer, Investor, OfficerRepTransfer, OfficeExpenseItem } from "./types";
import { SAMPLE_LOANS } from "./utils";
import Dashboard from "./components/Dashboard";
import LoanForm from "./components/LoanForm";
import LoanList from "./components/LoanList";
import LoanDetails from "./components/LoanDetails";
import BackupManager from "./components/BackupManager";
import SupabaseSyncManager from "./components/SupabaseSyncManager";
import FieldOfficersManager from "./components/FieldOfficersManager";
import InvestorsManager from "./components/InvestorsManager";
import OfficeExpensesManager from "./components/OfficeExpensesManager";
import FieldOfficerHub from "./components/FieldOfficerHub";
import MembersManager from "./components/MembersManager";
import SystemLogin from "./components/SystemLogin";
import { 
  sendLoanToSupabase, 
  deleteLoanFromSupabase, 
  getSupabaseConfig, 
  getLoansFromSupabase,
  getFieldOfficersFromSupabase,
  sendFieldOfficerToSupabase,
  deleteFieldOfficerFromSupabase,
  getInvestorsFromSupabase,
  sendInvestorToSupabase,
  deleteInvestorFromSupabase,
  uploadBase64Image,
  getClient
} from "./lib/supabase";
import { translations, Language } from "./translations";

const DefaultLogoSvg = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* SCL Wing icon above */}
    <g transform="translate(10, 5)">
      {/* Left Wing (Blue) */}
      <path d="M45 28C45 28 49 18 38 12C33 9 27 12 30 18C33 24 45 28 45 28Z" fill="#0256cc" />
      {/* Right Wing (Gold/Yellow) */}
      <path d="M46 28C46 28 53 19 62 17C67 16 71 20 66 25C61 30 46 28 46 28Z" fill="#fabc04" />
    </g>
    {/* SCL bold text */}
    <text x="50" y="65" textAnchor="middle" fill="#0256cc" fontSize="24" fontWeight="900" fontFamily="sans-serif" letterSpacing="-1">
      SCL
    </text>
    {/* SETH CAPITAL small text */}
    <text x="50" y="82" textAnchor="middle" fill="#0256cc" fontSize="8" fontWeight="800" fontFamily="sans-serif" letterSpacing="0.5">
      SETH CAPITAL
    </text>
  </svg>
);

type ActiveTab = "DASHBOARD" | "NEW_LOAN" | "LOAN_LIST" | "LOAN_DETAILS" | "BACKUP_RESTORE" | "FIELD_OFFICERS" | "INVESTORS" | "OFFICE_EXPENSES" | "MEMBERS";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("DASHBOARD");
  const [logoError, setLogoError] = useState(false);
  const [logoPathIndex, setLogoPathIndex] = useState(0);
  const logoPaths = [
    "/WhatsApp Image 2026-04-28 at 19.47.22.jpeg",
    "/WhatsApp%20Image%202026-04-28%20at%2019.47.22.jpeg",
    "/logo.jpeg",
    "/logo.png"
  ];
  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem("seth-capital-loans");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // Fallback
      }
    }
    return [];
  });

  const [fieldOfficers, setFieldOfficers] = useState<FieldOfficer[]>(() => {
    const saved = localStorage.getItem("seth-capital-field-officers");
    let list: FieldOfficer[] = saved ? JSON.parse(saved) : [];
    list = list.map(o => ({
      ...o,
      allowances: o.allowances || [],
      expenses: o.expenses || [],
      remittances: o.remittances || [],
      repTransfers: o.repTransfers || []
    }));
    
    // Ensure admin user with email dhammikarathnayakework@gmail.com and PIN 1234 is pre-seeded
    const hasDhammika = list.some(o => o.email?.toLowerCase().trim() === 'dhammikarathnayakework@gmail.com');
    if (!hasDhammika) {
      list.push({
        id: "admin-dhammika",
        name: "Dhammika Rathnayake",
        nic: "SEC-ADMIN-DR",
        phone: "0770000000",
        address: "Seth Capital Headquarters",
        employeeId: "EM-DR",
        email: "dhammikarathnayakework@gmail.com",
        vehicleNumber: "WP-CAS-5678",
        joinedDate: "2026-01-01",
        targetCollection: 1000000,
        status: "ACTIVE",
        position: "ADMIN",
        canApproveLoans: true,
        pin: "1234",
        expenses: [],
        allowances: [],
        remittances: [],
        createdAt: new Date().toISOString()
      });
    }

    // Ensure admin user with email addigitalonlinework@gmail.com and PIN 1234 is pre-seeded
    const hasAdmin = list.some(o => o.email?.toLowerCase().trim() === 'addigitalonlinework@gmail.com');
    if (!hasAdmin) {
      list.push({
        id: "admin-root",
        name: "Admin Office Main",
        nic: "SEC-ADMIN",
        phone: "0770000000",
        address: "Seth Capital Headquarters",
        employeeId: "EM-ADMIN",
        email: "addigitalonlinework@gmail.com",
        vehicleNumber: "WP-CAS-1234",
        joinedDate: "2026-01-01",
        targetCollection: 1000000,
        status: "ACTIVE",
        position: "ADMIN",
        canApproveLoans: true,
        pin: "1234",
        expenses: [],
        allowances: [],
        remittances: [],
        createdAt: new Date().toISOString()
      });
    }
    return list;
  });

  const [investors, setInvestors] = useState<Investor[]>(() => {
    const saved = localStorage.getItem("seth-capital-investors");
    return saved ? JSON.parse(saved) : [];
  });

  const [officeExpenses, setOfficeExpenses] = useState<OfficeExpenseItem[]>(() => {
    const saved = localStorage.getItem("seth-capital-office-expenses");
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

  // Active User Role state (Admin vs. Field Representative)
  const [currentUserRole, setCurrentUserRole] = useState<'ADMIN' | 'OFFICER' | 'GUEST'>(() => {
    const saved = localStorage.getItem("seth-capital-user-role");
    return (saved === 'ADMIN' || saved === 'OFFICER' || saved === 'GUEST') ? saved : 'GUEST';
  });
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>(() => {
    return localStorage.getItem("seth-capital-selected-officer-id") || "";
  });

  // Find current logged user object and determine their approval authority permission
  const activeStaffOfficer = fieldOfficers.find((o) => o.id === selectedOfficerId) || null;
  const hasApprovalAuthority = !activeStaffOfficer || (activeStaffOfficer.canApproveLoans !== false);

  // User custom uploaded brand logo state
  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    return localStorage.getItem("seth-capital-custom-logo");
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert(lang === "si" ? "ලෝගෝ ගොනුව විශාල වැඩියි. කරුණාකර 2MB ට වඩා අඩු ගොනුවක් තෝරන්න." : "Logo file too large. Please select a file smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          localStorage.setItem("seth-capital-custom-logo", base64);
          setCustomLogo(base64);
          alert(lang === "si" ? "ලෝගෝව සාර්ථකව පද්ධතිය තුළ සුරකින ලදි." : "Custom logo successfully saved in system storage.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = () => {
    if (confirm(lang === "si" ? "නැවතත් පද්ධතියේ මුල් ලෝගෝව භාවිතයට ගැනීමට අවශ්‍යද?" : "Reset back to the default original logo?")) {
      localStorage.removeItem("seth-capital-custom-logo");
      setCustomLogo(null);
    }
  };

  // Load language settings, default to "en" as requested
  const [lang, setLang] = useState<Language>(() => {
    const savedLang = localStorage.getItem("seth-capital-lang");
    return (savedLang === "en" || savedLang === "si") ? savedLang : "en";
  });

  const t = translations[lang];

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("seth-capital-loans", JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem("seth-capital-field-officers", JSON.stringify(fieldOfficers));
  }, [fieldOfficers]);

  useEffect(() => {
    localStorage.setItem("seth-capital-investors", JSON.stringify(investors));
  }, [investors]);

  useEffect(() => {
    localStorage.setItem("seth-capital-office-expenses", JSON.stringify(officeExpenses));
  }, [officeExpenses]);

  useEffect(() => {
    localStorage.setItem("seth-capital-user-role", currentUserRole);
  }, [currentUserRole]);

  useEffect(() => {
    localStorage.setItem("seth-capital-selected-officer-id", selectedOfficerId);
  }, [selectedOfficerId]);

  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);
  const [dbLoading, setDbLoading] = useState(false);

  // Auto-fetch from Supabase on startup if configured
  useEffect(() => {
    const config = getSupabaseConfig();
    if (config) {
      setDbLoading(true);
      Promise.all([
        getLoansFromSupabase().catch((err) => {
          console.warn("Could not auto-fetch loans (table might not exist yet):", err);
          return null;
        }),
        getFieldOfficersFromSupabase().catch((err) => {
          console.warn("Could not auto-fetch field officers (table might not exist yet):", err);
          return null;
        }),
        getInvestorsFromSupabase().catch((err) => {
          console.warn("Could not auto-fetch investors (table might not exist yet):", err);
          return null;
        })
      ]).then(([dbLoans, dbOfficers, dbInvestors]) => {
        if (dbLoans && dbLoans.length > 0) {
          // Ensure sequential numbering starting from 0001 for all existing and past loans
          const sortedLoans = [...dbLoans].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          const sanitizedLoans = sortedLoans.map((loan, index) => {
            const sequence = (index + 1).toString().padStart(4, '0');
            const loanYear = new Date(loan.createdAt).getFullYear();
            const expectedLoanNumber = `L-${loanYear}-${sequence}`;
            const expectedMemberNumber = `MEM-${loanYear}-${sequence}`;
            
            let isChanged = false;
            let updatedLoan = { ...loan };
            
            if (updatedLoan.officeUse.loanNumber !== expectedLoanNumber) {
              updatedLoan.officeUse.loanNumber = expectedLoanNumber;
              isChanged = true;
            }
            if (updatedLoan.applicant.memberNumber !== expectedMemberNumber) {
              updatedLoan.applicant.memberNumber = expectedMemberNumber;
              isChanged = true;
            }
            
            if (isChanged) {
              sendLoanToSupabase(updatedLoan).catch(err => console.warn("Could not sync sanitized numbering", err));
            }
            return updatedLoan;
          });
          
          // Maintain newest-first display order in state
          setLoans(sanitizedLoans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
        if (dbOfficers && dbOfficers.length > 0) {
          setFieldOfficers(dbOfficers);
        }
        if (dbInvestors && dbInvestors.length > 0) {
          setInvestors(dbInvestors);
        }
        setSupabaseConnected(true);
        console.log("Successfully auto-fetched active datasets from Supabase live database.", {
          loans: dbLoans?.length || 0,
          officers: dbOfficers?.length || 0,
          investors: dbInvestors?.length || 0
        });
      }).catch((err) => {
        console.error("General startup fetch failed:", err);
        setSupabaseConnected(false);
      }).finally(() => {
        setDbLoading(false);
      });
    } else {
      setSupabaseConnected(false);
    }
  }, []);

  // Sync language selection
  const handleToggleLang = () => {
    const nextLang = lang === "si" ? "en" : "si";
    setLang(nextLang);
    localStorage.setItem("seth-capital-lang", nextLang);
  };

  // Handler for saving loan application
  const handleSaveLoan = (savedLoan: Loan) => {
    const loanExists = loans.some((l) => l.id === savedLoan.id);
    if (loanExists) {
      setLoans(loans.map((l) => (l.id === savedLoan.id ? savedLoan : l)));
    } else {
      setLoans([savedLoan, ...loans]);
    }

    // Background push to Supabase (fails gracefully if connection/table is not ready)
    sendLoanToSupabase(savedLoan).then((uploadedLoan) => {
      if (uploadedLoan) {
        setLoans((current) => current.map((l) => (l.id === uploadedLoan.id ? uploadedLoan : l)));
      }
    }).catch((err) => {
      console.warn("Auto-sync background save to Supabase skipped / failed:", err);
    });

    setEditingLoan(null);
    setSelectedLoanId(savedLoan.id);
    setActiveTab("LOAN_DETAILS");
  };

  // Handler for adding daily/installment repayment collection
  const handleAddCollection = (loanId: string, collection: PaymentCollection) => {
    let updatedLoan: Loan | null = null;
    const nextLoans = loans.map((l) => {
      if (l.id === loanId) {
        const updatedCollections = [...l.collections, collection];
        
        // Double check if outstanding becomes 0 to auto set Status to COMPLETED
        const approved = l.officeUse.approvedAmount;
        const totalWithInt = approved + (approved * (l.officeUse.interestRate / 100));
        const totalPaid = updatedCollections.reduce((sum, c) => sum + c.amount, 0);
        const outstanding = totalWithInt - totalPaid;
        const updatedStatus = outstanding <= 0 ? "COMPLETED" : l.status;

        updatedLoan = {
          ...l,
          collections: updatedCollections,
          status: updatedStatus as Loan["status"],
        };
        return updatedLoan;
      }
      return l;
    });

    setLoans(nextLoans);

    if (updatedLoan) {
      sendLoanToSupabase(updatedLoan).catch((err) => {
        console.warn("Auto-sync background collection update failed:", err);
      });
    }
  };

  // Handler for deleting collection item
  const handleDeleteCollection = (loanId: string, collectionId: string) => {
    let updatedLoan: Loan | null = null;
    const nextLoans = loans.map((l) => {
      if (l.id === loanId) {
        const updatedCollections = l.collections.filter((c) => c.id !== collectionId);
        
        // Re-evaluate auto status
        const approved = l.officeUse.approvedAmount;
        const totalWithInt = approved + (approved * (l.officeUse.interestRate / 100));
        const totalPaid = updatedCollections.reduce((sum, c) => sum + c.amount, 0);
        const outstanding = totalWithInt - totalPaid;
        const updatedStatus = outstanding > 0 && l.status === "COMPLETED" ? "ACTIVE" : l.status;

        updatedLoan = {
          ...l,
          collections: updatedCollections,
          status: updatedStatus as Loan["status"],
        };
        return updatedLoan;
      }
      return l;
    });

    setLoans(nextLoans);

    if (updatedLoan) {
      sendLoanToSupabase(updatedLoan).catch((err) => {
        console.warn("Auto-sync background collections deletion update failed:", err);
      });
    }
  };

  // Handler for manual status changes
  const handleChangeStatus = (loanId: string, status: Loan["status"]) => {
    const nextLoans = loans.map((l) => {
      if (l.id === loanId) {
        const updatedLoan = { ...l, status };
        sendLoanToSupabase(updatedLoan).catch((err) => {
          console.warn("Auto-sync background status update failed:", err);
        });
        return updatedLoan;
      }
      return l;
    });
    setLoans(nextLoans);
  };

  // Handler for deleting loan record completely
  const handleDeleteLoan = (loanId: string) => {
    if (!hasApprovalAuthority) {
      alert(lang === "si" ? "ණය ගිණුම් මකා දැමීමට ඔබට අවසර නැත." : "You do not have permission to delete loan ledgers.");
      return;
    }
    setLoans(loans.filter((l) => l.id !== loanId));
    
    // Background delete from Supabase
    deleteLoanFromSupabase(loanId).catch((err) => {
      console.warn("Auto-sync background delete failed:", err);
    });

    if (selectedLoanId === loanId) {
      setSelectedLoanId(null);
    }
    setActiveTab("LOAN_LIST");
  };

  // Quick reset to zero state
  const handleClearAllData = () => {
    if (confirm(lang === "si" ? "සියලුම ගනුදෙනු ලේඛන, ක්ෂේත්‍ර නිලධාරීන් සහ ආයෝජකයින් පද්ධතියෙන් සම්පූර්ණයෙන්ම ඉවත් කිරීමට අවශ්‍යද?" : "Delete all loan records, field officers, and investors completely? This cannot be undone.")) {
      setLoans([]);
      setFieldOfficers([]);
      setInvestors([]);
      setSelectedLoanId(null);
      setEditingLoan(null);
      setActiveTab("DASHBOARD");
    }
  };

  // Reset database back to official seed examples for demonstration
  const handleLoadDemoData = () => {
    if (confirm(lang === "si" ? "නැවතත් ආදර්ශ දත්ත ඇතුළත් කිරීමට අවශ්‍යද? දැනට ඇති සියලුම දත්ත මැකී යනු ඇත." : "Overwrite all current listings and load official demonstration seed dataset?")) {
      setLoans(SAMPLE_LOANS);
      setSelectedLoanId(null);
      setEditingLoan(null);
      setActiveTab("DASHBOARD");
    }
  };

  const handleAddOfficer = (newOfficer: FieldOfficer) => {
    setFieldOfficers([newOfficer, ...fieldOfficers]);
    sendFieldOfficerToSupabase(newOfficer).catch((err) => {
      console.warn("Auto-sync background save to Supabase skipped:", err);
    });
    if (newOfficer.email) {
      alert(lang === 'si' 
        ? `${newOfficer.name} වෙත පුරනය වීමේ උපදෙස් ඇතුළත් විද්‍යුත් තැපෑලක් (Email) සාර්ථකව යවන ලදි. (${newOfficer.email})` 
        : `A setup mail with login instructions was successfully sent to ${newOfficer.name} at ${newOfficer.email}`);
    }
  };

  const handleDeleteOfficer = (id: string) => {
    setFieldOfficers(fieldOfficers.filter((o) => o.id !== id));
    deleteFieldOfficerFromSupabase(id).catch((err) => {
      console.warn("Auto-sync background delete skipped:", err);
    });
  };

  const handleUpdateOfficer = (updated: FieldOfficer) => {
    setFieldOfficers(fieldOfficers.map((o) => o.id === updated.id ? updated : o));
    sendFieldOfficerToSupabase(updated).catch((err) => {
      console.warn("Auto-sync background update skipped:", err);
    });
  };

  const handleSetOfficerPin = (officerId: string, pin: string) => {
    const updatedOfficers = fieldOfficers.map((o) => {
      if (o.id === officerId) return { ...o, pin };
      return o;
    });
    setFieldOfficers(updatedOfficers);
    const updatedOfficer = updatedOfficers.find((o) => o.id === officerId);
    if (updatedOfficer) {
      sendFieldOfficerToSupabase(updatedOfficer).catch((err) => {
        console.warn("Auto-sync background update skipped:", err);
      });
    }
  };

  // Dynamic Officer Hub actions & state synchronization
  const handleUpdateAllowanceStatus = (officerId: string, allowanceId: string, repStatus: any, shortageAmount?: number, remarks?: string) => {
    const updatedOfficers = fieldOfficers.map((o) => {
      if (o.id === officerId) {
        return {
          ...o,
          allowances: o.allowances.map((a) => {
            if (a.id === allowanceId) {
              return { 
                ...a, 
                repStatus, 
                verifiedAt: new Date().toISOString(), 
                repRemarks: remarks,
                amount: shortageAmount ? (a.amount - shortageAmount) : a.amount
              };
            }
            return a;
          })
        };
      }
      return o;
    });
    setFieldOfficers(updatedOfficers);
    const updatedOfficer = updatedOfficers.find((o) => o.id === officerId);
    if (updatedOfficer) {
      sendFieldOfficerToSupabase(updatedOfficer).catch((err) => {
        console.warn("Auto-sync background save to Supabase skipped:", err);
      });
    }
  };

  const handleAddOfficerExpense = (officerId: string, expense: any) => {
    const updatedOfficers = fieldOfficers.map((o) => {
      if (o.id === officerId) {
        return {
          ...o,
          expenses: [expense, ...(o.expenses || [])]
        };
      }
      return o;
    });
    setFieldOfficers(updatedOfficers);
    const updatedOfficer = updatedOfficers.find((o) => o.id === officerId);
    if (updatedOfficer) {
      sendFieldOfficerToSupabase(updatedOfficer).catch((err) => {
        console.warn("Auto-sync background save to Supabase skipped:", err);
      });
    }
  };

  const handleAddOfficerRemittance = (officerId: string, remittance: any) => {
    const updatedOfficers = fieldOfficers.map((o) => {
      if (o.id === officerId) {
        return {
          ...o,
          remittances: [remittance, ...(o.remittances || [])]
        };
      }
      return o;
    });
    setFieldOfficers(updatedOfficers);
    const updatedOfficer = updatedOfficers.find((o) => o.id === officerId);
    if (updatedOfficer) {
      sendFieldOfficerToSupabase(updatedOfficer).catch((err) => {
        console.warn("Auto-sync background save to Supabase skipped:", err);
      });
    }
  };

  const handleAddRepTransfer = (fromOfficerId: string, transfer: OfficerRepTransfer) => {
    const updatedOfficers = fieldOfficers.map((o) => {
      if (o.id === fromOfficerId) {
        return {
          ...o,
          repTransfers: [transfer, ...(o.repTransfers || [])]
        };
      }
      return o;
    });
    setFieldOfficers(updatedOfficers);
    const updatedOfficer = updatedOfficers.find((o) => o.id === fromOfficerId);
    if (updatedOfficer) {
      sendFieldOfficerToSupabase(updatedOfficer).catch(err => {
        console.warn("Auto-sync background save to Supabase skipped:", err);
      });
    }
  };

  const handleUpdateRepTransfer = (fromOfficerId: string, transferId: string, status: 'ACCEPTED'|'REJECTED') => {
    const updatedOfficers = fieldOfficers.map((o) => {
      if (o.id === fromOfficerId) {
        return {
          ...o,
          repTransfers: o.repTransfers?.map(t => t.id === transferId ? { ...t, status, verifiedAt: new Date().toISOString() } : t)
        };
      }
      return o;
    });
    setFieldOfficers(updatedOfficers);
    const updatedOfficer = updatedOfficers.find((o) => o.id === fromOfficerId);
    if (updatedOfficer) {
      sendFieldOfficerToSupabase(updatedOfficer).catch(err => {
        console.warn("Auto-sync background save to Supabase skipped:", err);
      });
    }
  };

  const handleAddLoan = (newLoan: Loan) => {
    setLoans([newLoan, ...loans]);
    sendLoanToSupabase(newLoan).then((uploadedLoan) => {
      if (uploadedLoan) {
        setLoans((current) => current.map((l) => (l.id === uploadedLoan.id ? uploadedLoan : l)));
      }
    }).catch((err) => {
      console.warn("Auto-sync background save to Supabase skipped:", err);
    });
  };

  // Handlers for Investors background synced operations
  const handleAddInvestor = (newInvestor: Investor) => {
    setInvestors([newInvestor, ...investors]);
    sendInvestorToSupabase(newInvestor).catch((err) => {
      console.warn("Auto-sync background save to Supabase skipped:", err);
    });
  };

  const handleDeleteInvestor = (id: string) => {
    setInvestors(investors.filter((i) => i.id !== id));
    deleteInvestorFromSupabase(id).catch((err) => {
      console.warn("Auto-sync background delete skipped:", err);
    });
  };

  const handleUpdateInvestor = (updated: Investor) => {
    setInvestors(investors.map((i) => i.id === updated.id ? updated : i));
    sendInvestorToSupabase(updated).catch((err) => {
      console.warn("Auto-sync background update skipped:", err);
    });
  };

  // Handlers for Office Overhead Expenses
  const handleAddOfficeExpense = async (expense: OfficeExpenseItem) => {
    const defaultExpense = { ...expense };
    // Synchronously prepend to UI to show immediate feedback
    setOfficeExpenses((prev) => [defaultExpense, ...prev]);

    // Handle background upload if there is a billImage in it
    if (defaultExpense.billImage) {
      const client = getClient();
      if (client) {
        try {
          const publicUrl = await uploadBase64Image(
            client,
            defaultExpense.billImage,
            `office-expenses/${defaultExpense.id}.jpg`
          );
          if (publicUrl !== defaultExpense.billImage) {
            setOfficeExpenses((prev) => 
              prev.map(e => e.id === defaultExpense.id ? { ...e, billImage: publicUrl } : e)
            );
          }
        } catch (err) {
          console.warn("Failed to upload office expense bill to Supabase.", err);
        }
      }
    }
  };

  const handleUpdateOfficeExpenseStatus = (id: string, status: 'APPROVED' | 'REJECTED', approvedBy: string) => {
    setOfficeExpenses((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status,
              approvedBy,
              verifiedAt: new Date().toISOString().split("T")[0]
            }
          : e
      )
    );
  };

  const handleDeleteOfficeExpense = (id: string) => {
    setOfficeExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Router rendering helper
  const renderContent = () => {
    const activeOfficer = currentUserRole === "OFFICER" ? fieldOfficers.find((o) => o.id === selectedOfficerId) : null;
    if (activeOfficer) {
      return (
        <FieldOfficerHub
          officer={activeOfficer}
          fieldOfficers={fieldOfficers}
          loans={loans}
          onAddCollection={handleAddCollection}
          onUpdateAllowanceStatus={handleUpdateAllowanceStatus}
          onAddOfficerExpense={handleAddOfficerExpense}
          onAddOfficerRemittance={handleAddOfficerRemittance}
          onAddRepTransfer={handleAddRepTransfer}
          onUpdateRepTransfer={handleUpdateRepTransfer}
          onAddLoan={handleAddLoan}
          onUpdateLoan={handleSaveLoan}
          onLogout={() => {
            setCurrentUserRole("GUEST");
            setSelectedOfficerId("");
            setActiveTab("DASHBOARD");
          }}
          lang={lang}
        />
      );
    }

    switch (activeTab) {
      case "DASHBOARD":
        return (
          <Dashboard 
            loans={loans} 
            fieldOfficers={fieldOfficers}
            investors={investors}
            officeExpenses={officeExpenses}
            onSelectLoan={(id) => {
              setSelectedLoanId(id);
              setActiveTab("LOAN_DETAILS");
            }} 
            lang={lang}
          />
        );
      case "NEW_LOAN":
        return (
          <LoanForm
            onSave={handleSaveLoan}
            onCancel={() => {
              setEditingLoan(null);
              setActiveTab("LOAN_LIST");
            }}
            initialLoan={editingLoan || undefined}
            fieldOfficers={fieldOfficers}
            lang={lang}
            loans={loans}
          />
        );
      case "LOAN_LIST":
        return (
          <LoanList
            loans={loans}
            onSelectLoan={(id) => {
              setSelectedLoanId(id);
              setActiveTab("LOAN_DETAILS");
            }}
            onEditLoan={(loan) => {
              setEditingLoan(loan);
              setActiveTab("NEW_LOAN");
            }}
            onDeleteLoan={handleDeleteLoan}
            lang={lang}
          />
        );
      case "LOAN_DETAILS":
        const currentLoan = loans.find((l) => l.id === selectedLoanId);
        if (!currentLoan) {
          return (
            <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl font-sans select-none animate-fade-in">
              <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto stroke-1.5 mb-2" />
              <p className="text-xs font-bold text-slate-700">{lang === "si" ? "තෝරාගත් ණය ගිණුම සොයාගත නොහැක." : "Selected loan credit ledger not found."}</p>
              <button 
                onClick={() => setActiveTab("LOAN_LIST")} 
                className="mt-4 px-4 py-2 bg-slate-900 border border-slate-900 text-white font-bold rounded-xl text-[11px] cursor-pointer transition"
              >
                {lang === "si" ? "ලැයිස්තුවට ආපසු යන්න" : "Back to Ledger Files"}
              </button>
            </div>
          );
        }
        return (
          <LoanDetails
            loan={currentLoan}
            onBack={() => setActiveTab("LOAN_LIST")}
            onAddCollection={handleAddCollection}
            onDeleteCollection={handleDeleteCollection}
            onChangeStatus={handleChangeStatus}
            lang={lang}
            officers={fieldOfficers}
            hasApprovalAuthority={hasApprovalAuthority}
            loans={loans}
          />
        );
      case "FIELD_OFFICERS":
        return (
          <FieldOfficersManager
            officers={fieldOfficers}
            onAddOfficer={handleAddOfficer}
            onDeleteOfficer={handleDeleteOfficer}
            onUpdateOfficer={handleUpdateOfficer}
            loans={loans}
            lang={lang}
            currentLoggedOfficerId={selectedOfficerId}
            currentUserRole={currentUserRole}
          />
        );
      case "INVESTORS":
        return (
          <InvestorsManager
            investors={investors}
            onAddInvestor={handleAddInvestor}
            onDeleteInvestor={handleDeleteInvestor}
            onUpdateInvestor={handleUpdateInvestor}
            lang={lang}
          />
        );
      case "OFFICE_EXPENSES":
        return (
          <OfficeExpensesManager
            expenses={officeExpenses}
            onAddExpense={handleAddOfficeExpense}
            onUpdateExpenseStatus={handleUpdateOfficeExpenseStatus}
            onDeleteExpense={handleDeleteOfficeExpense}
            lang={lang}
            hasApprovalAuthority={hasApprovalAuthority}
            loggedOfficerName={activeStaffOfficer ? activeStaffOfficer.name : "Admin Head Office"}
            loggedOfficerId={selectedOfficerId}
          />
        );
      case "MEMBERS":
        return (
          <MembersManager
            loans={loans}
            lang={lang}
            onSelectLoan={(id) => setSelectedLoanId(id)}
            setActiveTab={(tab) => setActiveTab(tab)}
          />
        );
      case "BACKUP_RESTORE":
        return (
          <div className="space-y-8 animate-fade-in">
            <SupabaseSyncManager 
              loans={loans} 
              fieldOfficers={fieldOfficers}
              investors={investors}
              onRestoreAll={({ loans: l, fieldOfficers: fo, investors: i }) => {
                if (l) setLoans(l);
                if (fo) setFieldOfficers(fo);
                if (i) setInvestors(i);
              }}
              lang={lang} 
            />
            
            <BackupManager loans={loans} onRestore={(restored) => setLoans(restored)} />

            {/* Custom Business Logo Upload Customizer Card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs font-sans animate-fade-in">
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <Sparkles className="w-5 h-5 shrink-0" />
                </span>
                <h4 className="font-extrabold text-slate-800 text-sm">
                  {lang === "si" ? "ව්‍යාපාරික ලෝගෝව වෙනස් කිරීම (Brand Custom Logo)" : "Company Branding Custom Logo"}
                </h4>
              </div>
              <p className="text-slate-400 text-xs mb-6">
                {lang === "si" 
                  ? "පද්ධතියේ ප්‍රධාන ලිපි ශීර්ෂ සහ තිර සඳහා වෙනත් ඕනෑම පින්තූර ලෝගෝවක් (PNG, JPG, SVG) මෙතැනින් අප්ලෝඩ් කළ හැක." 
                  : "Upload any custom business logo file (PNG, JPG, SVG, etc.) to apply instantly across headers and report view layouts."}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-16 h-16 bg-white rounded-2xl border border-slate-200 p-2 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  {customLogo ? (
                    <img 
                      src={customLogo} 
                      alt="Current Logo" 
                      className="w-full h-full object-contain" 
                      referrerPolicy="no-referrer"
                    />
                  ) : logoPathIndex < logoPaths.length ? (
                    <img 
                      src={logoPaths[logoPathIndex]} 
                      alt="Current Logo" 
                      className="w-full h-full object-contain" 
                      referrerPolicy="no-referrer"
                      onError={() => setLogoPathIndex(prev => prev + 1)}
                    />
                  ) : (
                    <DefaultLogoSvg />
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-xs font-bold text-slate-700">
                    {customLogo ? (lang === "si" ? "ඔබ දැනට අප්ලෝඩ් කර ඇති පින්තූර ලෝගෝව සක්‍රියයි" : "Custom uploaded image logo is active") : (lang === "si" ? "පද්ධතියේ මුල් ලෝගෝව (Default Logo) සක්‍රියයි" : "System original logo is active")}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                    {lang === "si" ? "උපරිම ගොනු ප්‍රමාණය: 2MB. වර්ග හැඩයේ (Square) හෝ තිරස් හැඩයේ ලෝගෝ වඩාත් සුදුසු වේ." : "Recommended size: Square or horizontal aspect ratio under 2MB. Saves instantly in storage."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0 justify-center w-full sm:w-auto">
                  <label className="bg-slate-900 border border-slate-900 text-white hover:bg-slate-800 text-[11px] font-bold px-4 py-2 rounded-xl cursor-pointer shadow-xs active:scale-95 transition-all text-center">
                    {lang === "si" ? "ලෝගෝවක් තෝරන්න" : "Choose Logo File"}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleLogoUpload} 
                    />
                  </label>
                  {customLogo && (
                    <button
                      onClick={handleResetLogo}
                      className="border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-bold px-4 py-2 rounded-xl cursor-pointer active:scale-95 transition-all"
                    >
                      {lang === "si" ? "මුල් තත්වයට පත් කරන්න" : "Reset Default"}
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs font-sans">
              <h4 className="font-extrabold text-rose-600 mb-1 flex items-center gap-2 text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                {t.dangerControl}
              </h4>
              <p className="text-slate-400 text-xs mb-6">
                {t.dangerNotes}
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleClearAllData}
                  className="flex items-center gap-2 border border-rose-200 text-rose-600 hover:bg-rose-50 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition"
                >
                  <Trash2 className="w-4 h-4" />
                  {t.clearDatabase}
                </button>
                <button
                  onClick={handleLoadDemoData}
                  className="flex items-center gap-2 border border-slate-250 text-slate-700 hover:bg-slate-100 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t.reloadDemo}
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  if (currentUserRole === 'GUEST') {
    return (
      <SystemLogin 
        fieldOfficers={fieldOfficers}
        onAdminLogin={(officerIdOrPin) => {
          if (officerIdOrPin !== '1234') {
            setSelectedOfficerId(officerIdOrPin);
          } else {
            setSelectedOfficerId("");
          }
          setCurrentUserRole('ADMIN');
          setActiveTab('DASHBOARD');
        }}
        onOfficerLogin={(officerId) => {
          setSelectedOfficerId(officerId);
          setCurrentUserRole('OFFICER');
        }}
        onSetOfficerPin={handleSetOfficerPin}
        lang={lang}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans select-none">
      
      {/* 1. Global Navigation Top Header */}
      <header className="bg-slate-950 border-b border-slate-900 text-white no-print sticky top-0 z-40 shadow-sm font-display">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          
          {/* Logo Brand / Identity of SCL with exact Logo Wings and Blue/Gold Theme */}
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 select-none flex items-center justify-center bg-white rounded-xl p-1 shadow-xs border border-slate-100 overflow-hidden group">
              {customLogo ? (
                <img 
                  src={customLogo} 
                  alt="SCL Seth Capital Logo" 
                  className="w-full h-full object-contain" 
                  referrerPolicy="no-referrer" 
                />
              ) : logoPathIndex < logoPaths.length ? (
                <img 
                  src={logoPaths[logoPathIndex]} 
                  alt="SCL Seth Capital Logo" 
                  className="w-full h-full object-contain" 
                  referrerPolicy="no-referrer" 
                  onError={() => setLogoPathIndex(prev => prev + 1)}
                />
              ) : (
                <DefaultLogoSvg />
              )}
              <label className="absolute inset-0 bg-slate-950/85 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all duration-200">
                <span className="text-[8px] text-white font-extrabold text-center px-0.5 uppercase tracking-tighter leading-none">
                  {lang === "si" ? "ලෝගෝව" : "Upload"}
                </span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleLogoUpload} 
                />
              </label>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-sm tracking-wider text-slate-100 font-display">SETH CAPITAL</h1>
                <span className="bg-slate-900 text-amber-400 font-mono text-[9px] font-bold px-1.5 py-0.2 rounded border border-slate-800">
                  {t.version}
                </span>
                {customLogo && (
                  <button 
                    onClick={handleResetLogo}
                    title={lang === "si" ? "ලෝගෝව ඉවත් කරන්න" : "Reset Logo"}
                    className="text-[9px] text-rose-400 hover:text-rose-300 font-mono font-bold hover:underline cursor-pointer ml-1"
                  >
                    Reset
                  </button>
                )}
              </div>
              <p className="text-[9px] text-slate-400 font-medium font-sans">{t.subTitle}</p>
            </div>
          </div>

          {/* Persistent Translation Language Switch Panel & Details */}
          <div className="flex items-center gap-4">
            
            {/* Language Toggle Button */}
            <button
              onClick={handleToggleLang}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl px-2.5 py-1.5 shadow-sm transition-all duration-150 text-white text-[10px] sm:text-xs font-bold leading-none cursor-pointer"
              title={lang === "si" ? "Switch language to English (EN)" : "සිංහල භාෂාවට මාරු කරන්න (SI)"}
            >
              <Languages className="w-3.5 h-3.5 text-indigo-400 font-semibold" />
              <span>{lang === "en" ? "සිංහල" : "English"}</span>
            </button>

            {/* Role Header / Logout */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 shadow-sm">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase pl-1.5 hidden sm:inline">
                {lang === "si" ? "පරිශීලක:" : "User:"}
              </span>
              <span className="text-white text-xs font-black truncate max-w-[100px] sm:max-w-none">
                {currentUserRole === "ADMIN" ? (lang === "si" ? "කාර්යාල කළමනාකරු" : "Office Manager") : "System"}
              </span>
              <div className="w-px h-3 bg-slate-700 mx-1"></div>
              <button 
                onClick={() => {
                  setCurrentUserRole("GUEST");
                  setSelectedOfficerId("");
                  setActiveTab("DASHBOARD");
                }}
                className="text-rose-400 hover:text-rose-300 text-[10px] font-bold uppercase cursor-pointer transition-colors px-1"
              >
                {lang === "si" ? "ලොග්අවුට්" : "Logout"}
              </button>
            </div>
            
            {/* User Meta Panel showing developer context details */}
            <div className="hidden lg:flex items-center gap-5 text-[10px] text-slate-400 border-l border-slate-800 pl-5 select-none font-bold font-sans">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-mono">{activeStaffOfficer?.email || "dhammikarathnayakework@gmail.com"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-mono">2026-06-06</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-full text-[9px] uppercase font-black text-slate-300">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Premium Live
              </div>

              {dbLoading ? (
                <div className="flex items-center gap-1 bg-indigo-950 text-indigo-300 px-2.5 py-1 rounded-full text-[9px] uppercase font-black animate-pulse">
                  <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin" />
                  {lang === "si" ? "සමමුහුර්ත වෙමින්..." : "Syncing..."}
                </div>
              ) : supabaseConnected ? (
                <div className="flex items-center gap-1 bg-emerald-950 text-emerald-400 px-2.5 py-1 rounded-full text-[9px] uppercase font-black">
                  <CheckCircle2 className="w-3 h-3" />
                  {lang === "si" ? "සමමුහුර්තයි" : "Sys Active"}
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-rose-950 text-rose-400 px-2.5 py-1 rounded-full text-[9px] uppercase font-black cursor-pointer hover:bg-rose-900 transition-colors">
                  <AlertCircle className="w-3 h-3" />
                   {lang === "si" ? "සම්බන්ධය බිඳී ඇත" : "Offline DB"}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Page Layout Container */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-6 py-8 pb-28 md:pb-8 flex-1 flex flex-col md:flex-row gap-8">
        
        {/* Navigation Sidebar/Rail - Left Column */}
        {currentUserRole !== "OFFICER" && (
          <aside className="hidden md:block w-64 shrink-0 no-print">
            <div className="sticky top-20 md:top-24 space-y-4 md:space-y-6">
              <div className="bg-white border border-slate-100 rounded-3xl p-2.5 md:p-4 shadow-xs flex md:flex-col overflow-x-auto md:overflow-visible gap-2 md:space-y-1 scrollbar-none">
                
                <span className="hidden md:block text-[10px] font-black text-slate-400 ml-3 mb-2.5 uppercase tracking-widest font-display">
                  {t.mainMenu}
                </span>

                {/* Navigation Tabs */}
                {[
                  { id: "DASHBOARD", label: t.dashboard, sub: lang === "si" ? "සේවා මණ්ඩලය" : "Core Metrics Overview", icon: LayoutDashboard },
                  { id: "LOAN_LIST", label: t.creditLedger, sub: lang === "si" ? "ණය ගිණුම් ලේඛනය" : "All Credit Directory", icon: TableProperties },
                  { id: "NEW_LOAN", label: t.newApplication, sub: lang === "si" ? "නව ණය ඉල්ලුම්පත්" : "Underwrite Portfolio", icon: FilePlus },
                  { id: "FIELD_OFFICERS", label: lang === "si" ? "නිලධාරීන්" : "Officers", sub: lang === "si" ? "නිලධාරීන් සහ වියදම්" : "Reps & Cash-in-Hand", icon: UserCheck },
                  { id: "OFFICE_EXPENSES", label: lang === "si" ? "කාර්යාලීය වියදම්" : "Office Expenses", sub: lang === "si" ? "බිල්පත් සහ අනෙකුත් වියදම්" : "Bills & General Overheads", icon: Receipt },
                  { id: "MEMBERS", label: lang === "si" ? "සාමාජිකයින්" : "Members", sub: lang === "si" ? "සාමාජික විස්තර සහ නය ගෙවීම්" : "Member Portfolios & History", icon: Users },
                  { id: "INVESTORS", label: lang === "si" ? "ආයෝජකයින්" : "Investors", sub: lang === "si" ? "ආයෝජන සහ ප්‍රාග්ධනය" : "Capital Portfolio", icon: Coins },
                  { id: "BACKUP_RESTORE", label: t.backupRestore, sub: lang === "si" ? "උපස්ථ" : "Database System Utilities", icon: Database },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = activeTab === tab.id || (tab.id === "LOAN_LIST" && activeTab === "LOAN_DETAILS");
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        if (tab.id === "NEW_LOAN") setEditingLoan(null);
                        setActiveTab(tab.id as ActiveTab);
                      }}
                      className={`shrink-0 flex items-center md:justify-between p-2 md:p-3 rounded-2xl transition duration-150 text-left select-none cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                          : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2 md:gap-3">
                        <span className={`p-1.5 rounded-xl ${isSelected ? "bg-slate-800 text-indigo-400" : "bg-slate-100 text-slate-500"}`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <div className="hidden md:block">
                          <p className="text-xs md:text-sm font-bold font-display leading-none">{tab.label}</p>
                          <p className="hidden md:block text-[9px] font-medium mt-1 leading-none text-slate-400">{tab.sub}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Micro Quick Stat sidebar widget */}
              <div className="hidden md:block bg-indigo-950 border border-indigo-900 text-indigo-100 rounded-3xl p-5 shadow-lg relative overflow-hidden select-none font-sans">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-900/40 rounded-full animate-pulse" />
                <Layers className="w-5 h-5 text-indigo-400 mb-2" />
                <h5 className="font-bold text-xs tracking-wide">{t.supportHelp}</h5>
                <p className="text-[10px] text-indigo-300 leading-normal mt-1 mb-3">
                  {lang === "si" 
                    ? "සියලු ගණනය කිරීම් සහ පොලී අනුපාතික සහ පාරිභෝගික කොන්දේසිවලට අනුකූලව ක්‍රියාත්මක වේ." 
                    : "Underwriting calculations are fully mapped with LKR flat microfinance interest schedules."}
                </p>
                <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-indigo-400 bg-indigo-900/50 px-2.5 py-1 rounded inline-block">
                  <Coins className="w-3.5 h-3.5 text-indigo-300" />
                  {t.activeCapital}: Rs {loans.reduce((sum, l) => sum + l.officeUse.approvedAmount, 0).toLocaleString()}
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Dynamic Route Content - Right Column */}
        <main className="flex-1 min-w-0">
          <div className="transition duration-300">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* 4. Sticky Mobile Bottom Navigation Bar (Floating Dock) */}
      {currentUserRole !== "OFFICER" && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 no-print">
          <div className="bg-slate-950/95 backdrop-blur-md border border-slate-800/80 rounded-2xl flex justify-around items-center py-2 px-1 shadow-2xl">
            {[
              { id: "DASHBOARD", label: t.dashboard, icon: LayoutDashboard },
              { id: "LOAN_LIST", label: t.creditLedger, icon: TableProperties },
              { id: "NEW_LOAN", label: t.newApplication, icon: FilePlus },
              { id: "FIELD_OFFICERS", label: lang === "si" ? "නිලධාරීන්" : "Officers", icon: UserCheck },
              { id: "OFFICE_EXPENSES", label: lang === "si" ? "කාර්යාලීය වියදම්" : "Office Expenses", icon: Receipt },
              { id: "MEMBERS", label: lang === "si" ? "සාමාජිකයින්" : "Members", icon: Users },
              { id: "INVESTORS", label: lang === "si" ? "ආයෝජකයින්" : "Investors", icon: Coins },
              { id: "BACKUP_RESTORE", label: t.backupRestore, icon: Database },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id || (tab.id === "LOAN_LIST" && activeTab === "LOAN_DETAILS");
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === "NEW_LOAN") setEditingLoan(null);
                    setActiveTab(tab.id as ActiveTab);
                  }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition duration-150 select-none cursor-pointer relative ${
                    isSelected ? "text-indigo-400 text-indigo-400 bg-slate-900" : "text-slate-400 hover:text-slate-200"
                  }`}
                  title={tab.label}
                >
                  <Icon className="w-5 h-5" />
                  {isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 bg-indigo-450 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Humble footer matching negative space constraints */}
      <footer className="border-t border-slate-100 bg-[#FAFBFB] py-6 text-center text-[10px] font-bold text-slate-400 font-sans no-print select-none">
        <p>© {new Date().getFullYear()} Seth Capital Ledger Core. {lang === "si" ? "සියලුම හිමිකම් ඇවිරිණි." : "All Rights Reserved."}</p>
        <p className="text-[9px] text-slate-400 mt-1 font-medium">
          Integrated with automated alert template composers, secure JSON backup managers, and bilingual assets.
        </p>
      </footer>

    </div>
  );
}
