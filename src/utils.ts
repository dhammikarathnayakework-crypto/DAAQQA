/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Loan, SystemStats } from "./types";

// Format currency as Sri Lankan Rupees
export function formatLKR(amount: number): string {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace("LKR", "Rs.");
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// System initial seed data based on the user's screenshot
export const SAMPLE_LOANS: Loan[] = [
  {
    id: "loan-1",
    status: "ACTIVE",
    applicant: {
      fullName: "ආරියපාල සේනාරත්න (Ariyapala Senarathne)",
      nic: "198322400512",
      address: "නොවැ: 12, විහාර මාවත, පිළියන්දල.",
      phone: "0771234567"
    },
    relative: {
      name: "සුනෙත්‍රා සේනාරත්න",
      relationship: "භාර්යාව (Wife)",
      nic: "198565400121",
      address: "නොවැ: 12, විහාර මාවත, පිළියන්දල.",
      phone: "0719876543",
      workAddress: "රාජ්‍ය බැංකු කාර්යාලය, කොළඹ 10"
    },
    loanDetails: {
      requestedAmount: 10000,
      purpose: "කුඩා පරිමාණ ව්‍යාපාරික කටයුතු සඳහා (Small Business Expansion)"
    },
    guarantor1: {
      name: "ඩබ්ලිව්. ධර්මසිරි කීර්ති",
      address: "නොවැ: 45, පන්සල පාර, මහරගම.",
      nic: "197824100554",
      phone: "0751112223",
      isAgreed: true
    },
    guarantor2: {
      name: "කේ. කසුන් ලක්මාල්",
      address: "නොවැ: 88/2, විහාර ගුරු පටුමග, කොට්ටාව.",
      nic: "199105400234",
      phone: "0724445556",
      isAgreed: true
    },
    officeUse: {
      applicationNumber: "SCL-2026-001",
      approvedAmount: 10000,
      interestRate: 25,
      installmentsCount: 12,
      monthlyInstallment: 1042,
      specialNotes: "පළමු ණය මුදල - අනුමත කරන ලදී.",
      loanDate: "2026-01-10"
    },
    collections: [
      {
        id: "coll-1-1",
        amount: 500,
        date: "2026-02-10",
        monthOfCollection: "පෙබරවාරි (February)",
        receiptNumber: "REC-0102",
        notes: "පළමු වාරිකය"
      },
      {
        id: "coll-1-2",
        amount: 500,
        date: "2026-03-12",
        monthOfCollection: "මාර්තු (March)",
        receiptNumber: "REC-0164",
        notes: "දෙවන වාරිකය"
      },
      {
        id: "coll-1-3",
        amount: 500,
        date: "2026-04-10",
        monthOfCollection: "අප්‍රේල් (April)",
        receiptNumber: "REC-0220",
        notes: "තෙවන වාරිකය"
      }
    ],
    createdAt: "2026-01-10T10:00:00Z"
  },
  {
    id: "loan-2",
    status: "ACTIVE",
    applicant: {
      fullName: "කමල් පෙරේරා (Kamal Perera)",
      nic: "198822003310",
      address: "නො: 45/A, දුම්රියපොළ පාර, හෝමාගම",
      phone: "0765432109"
    },
    relative: {
      name: "කුසුම් පෙරේරා",
      relationship: "මව (Mother)",
      nic: "196555200231",
      address: "නො: 45/A, දුම්රියපොළ පාර, හෝමාගම",
      phone: "0711122233",
      workAddress: "නිවසේ ස්වයං රැකියාව"
    },
    loanDetails: {
      requestedAmount: 20000,
      purpose: "කුකුළු පාලන ව්‍යාපාරය පුළුල් කිරීම (Poultry Farm Development)"
    },
    guarantor1: {
      name: "එම්. ප්‍රේමතිලක",
      address: "නො: 77, ඇනෙක්ස් පටුමග, පන්නිපිටිය",
      nic: "198005200213",
      phone: "0709988776",
      isAgreed: true
    },
    guarantor2: {
      name: "ටී. සුරේෂ් ශාන්ත",
      address: "නො: 156, තලවතුගොඩ",
      nic: "198421004122",
      phone: "0785566778",
      isAgreed: true
    },
    officeUse: {
      applicationNumber: "SCL-2026-002",
      approvedAmount: 20000,
      interestRate: 25,
      installmentsCount: 12,
      monthlyInstallment: 2083,
      specialNotes: "දෙවන ණය මුදල - සතුටුදායක තත්ත්වයකි.",
      loanDate: "2026-01-15"
    },
    collections: [
      {
        id: "coll-2-1",
        amount: 500,
        date: "2026-02-15",
        monthOfCollection: "පෙබරවාරි (February)",
        receiptNumber: "REC-0115",
        notes: "පළමු වාරිකය"
      },
      {
        id: "coll-2-2",
        amount: 500,
        date: "2026-03-15",
        monthOfCollection: "මාර්තු (March)",
        receiptNumber: "REC-0178",
        notes: "දෙවන වාරිකය"
      }
    ],
    createdAt: "2026-01-15T11:00:00Z"
  },
  {
    id: "loan-3",
    status: "ACTIVE",
    applicant: {
      fullName: "නිමල් සිරිවර්ධන (Nimal Siriwardhane)",
      nic: "197545200150",
      address: "නො: 104, පරණ පාර, මහරගම",
      phone: "0712348910"
    },
    relative: {
      name: "ගීතා සිරිවර්ධන",
      relationship: "භාර්යාව (Wife)",
      nic: "197855600412",
      address: "නො: 104, පරණ පාර, මහරගම",
      phone: "0715656565",
      workAddress: "මහරගම මධ්‍ය විද්‍යාලය"
    },
    loanDetails: {
      requestedAmount: 40000,
      purpose: "වී වගාව සඳහා යෙදවුම් මිලදී ගැනීම (Paddy Cultivation Inputs)"
    },
    guarantor1: {
      name: "අයි. ජයසේකර",
      address: "නො: 33, නුගේගොඩ පාර, කොට්ටාව",
      nic: "197210200542",
      phone: "0722233445",
      isAgreed: true
    },
    guarantor2: {
      name: "පී. බණ්ඩාර",
      address: "නො: 14/C, ගුණසේකර පටුමග, හෝමාගම",
      nic: "197602400125",
      phone: "0777788990",
      isAgreed: true
    },
    officeUse: {
      applicationNumber: "SCL-2026-003",
      approvedAmount: 40000,
      interestRate: 25,
      installmentsCount: 12,
      monthlyInstallment: 4166,
      specialNotes: "තෙවන ණය මුදල - ඇපකරුවන් දෙදෙනාම සුදුසුය.",
      loanDate: "2026-01-20"
    },
    collections: [
      {
        id: "coll-3-1",
        amount: 500,
        date: "2026-02-20",
        monthOfCollection: "පෙබරවාරි (February)",
        receiptNumber: "REC-0125",
        notes: "පළමු වාරිකය"
      }
    ],
    createdAt: "2026-01-20T09:30:00Z"
  },
  {
    id: "loan-4",
    status: "ACTIVE",
    applicant: {
      fullName: "සමන් කුමාර (Saman Kumara)",
      nic: "199014200511",
      address: "නො: 12, ගාලු පාර, කළුතර",
      phone: "0778899001"
    },
    relative: {
      name: "එම්. ක්‍රිෂාන්ති ලීලා",
      relationship: "භාර්යාව (Wife)",
      nic: "199252001421",
      address: "නො: 12, ගාලු පාර, කළුතර",
      phone: "0778899002",
      workAddress: "කළුතර ප්‍රාදේශීය ලේකම් කාර්යාලය"
    },
    loanDetails: {
      requestedAmount: 50000,
      purpose: "රූපලාවන්‍යගාරය අලුත්වැඩියා කිරීම (Salon Renovation)"
    },
    guarantor1: {
      name: "ඒ. බී. ලියනගේ",
      address: "නො: 89, පාසල් මාවත, පාදුක්ක",
      nic: "198501200421",
      phone: "0713344556",
      isAgreed: true
    },
    guarantor2: {
      name: "ජී. ඩී. මනෝජ් කුමාර",
      address: "නො: 110, කැස්බෑව පාර, පිළියන්දල",
      nic: "198902500124",
      phone: "0755566778",
      isAgreed: true
    },
    officeUse: {
      applicationNumber: "SCL-2026-004",
      approvedAmount: 50000,
      interestRate: 25,
      installmentsCount: 10,
      monthlyInstallment: 6250,
      specialNotes: "හතරවන ණය මුදල - අනුමත කරන ලදී.",
      loanDate: "2026-02-01"
    },
    collections: [],
    createdAt: "2026-02-01T14:00:00Z"
  },
  {
    id: "loan-5",
    status: "ACTIVE",
    applicant: {
      fullName: "ප්‍රදීප් රුවන් කුමාර (Pradeep Ruwan Kumara)",
      nic: "198424100512",
      address: "නො: 23, මැද පාර, පිළියන්දල",
      phone: "0771122334"
    },
    relative: {
      name: "කාන්ති ලතා සේන",
      relationship: "සහෝදරිය (Sister)",
      nic: "198751400234",
      address: "නො: 56/1, කැස්බෑව",
      phone: "0714455667",
      workAddress: "පෞද්ගලික රෙදිපිළි ආයතනය"
    },
    loanDetails: {
      requestedAmount: 60000,
      purpose: "නව තේ කඩයක් ආරම්භ කිරීම (New Tea Stall Setup)"
    },
    guarantor1: {
      name: "ආර්. පී. සෝමපාල",
      address: "නො: 120, කරදියාන පාර, පිළියන්දල",
      nic: "197214500514",
      phone: "0725566112",
      isAgreed: true
    },
    guarantor2: {
      name: "ඩී. වී. සමීර ආනන්ද",
      address: "නො: 90/3, වික්ටරි මාවත, බොරලැස්ගමුව",
      nic: "198822500412",
      phone: "0781122335",
      isAgreed: true
    },
    officeUse: {
      applicationNumber: "SCL-2026-005",
      approvedAmount: 60000,
      interestRate: 25,
      installmentsCount: 12,
      monthlyInstallment: 6250,
      specialNotes: "පස්වන ණය මුදල - සුදුසුයි.",
      loanDate: "2026-02-05"
    },
    collections: [
      {
        id: "coll-5-1",
        amount: 500,
        date: "2026-03-05",
        monthOfCollection: "මාර්තු (March)",
        receiptNumber: "REC-0190",
        notes: "පළමු ගෙවීම"
      }
    ],
    createdAt: "2026-02-05T08:15:00Z"
  }
];

export function getLoanStats(loans: Loan[]): SystemStats {
  let totalApprovedValue = 0;
  let totalPaid = 0;
  let totalInterest = 0;
  let totalToPay = 0;

  loans.forEach((loan) => {
    const approved = loan.officeUse.approvedAmount;
    const rate = loan.officeUse.interestRate / 100;
    const interest = approved * rate;
    const total = approved + interest;

    totalApprovedValue += approved;
    totalInterest += interest;
    totalToPay += total;

    const paid = loan.collections.reduce((sum, coll) => sum + coll.amount, 0);
    totalPaid += paid;
  });

  return {
    totalLoans: loans.length,
    totalApprovedValue,
    totalPaid,
    totalInterest,
    totalToPay,
    outstandingBalance: totalToPay - totalPaid,
  };
}
