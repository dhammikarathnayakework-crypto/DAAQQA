/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = "si" | "en";

export interface Dictionary {
  // Navigation
  dashboard: string;
  creditLedger: string;
  newApplication: string;
  backupRestore: string;
  mainMenu: string;
  supportHelp: string;
  activeCapital: string;
  clearDatabase: string;
  reloadDemo: string;
  dangerControl: string;
  dangerNotes: string;
  version: string;
  subTitle: string;

  // Dashboard Stats
  overviewTitle: string;
  overviewDesc: string;
  portfolioPrincipal: string;
  totalLoans: string;
  totalRepayable: string;
  interestIncome: string;
  totalCollections: string;
  outstandingBalance: string;
  collectedRatio: string;
  ratioSub: string;
  collectedBadgeText: string;
  activeLoans: string;
  overdueLoans: string;
  completedLoans: string;
  recentCollections: string;
  recentCollectionsSub: string;
  noRecentCollections: string;
  noRecentSub: string;

  // Loan Status
  active: string;
  completed: string;
  overdue: string;
  pending: string;

  // Loan Details
  backToLoans: string;
  statusLabel: string;
  addPaymentBtn: string;
  printInvoiceBtn: string;
  microSclNotes: string;
  printedOn: string;
  borrowerProfile: string;
  fullName: string;
  nic: string;
  phone: string;
  address: string;
  guarantorsAndRelatives: string;
  relative: string;
  guarantor1: string;
  guarantor2: string;
  calculationLedgerTitle: string;
  matchingSpreadsheet: string;
  colApproved: string;
  colRate: string;
  colInterest: string;
  colTotal: string;
  colInstallment: string;
  colCollected: string;
  colPaidMonths: string;
  colBalance: string;
  repaymentHistoryTitle: string;
  noRepaymentsText: string;
  noRepaymentsSub: string;
  tableDate: string;
  tableMonth: string;
  tableReceipt: string;
  tableNotes: string;
  tableAmount: string;
  recordsDeletePrompt: string;
  officerSignature: string;
  borrowerSignature: string;

  // Repayment Modal
  modalTitle: string;
  modalDesc: string;
  modalAmountLabel: string;
  modalDateLabel: string;
  modalMonthLabel: string;
  modalReceiptLabel: string;
  modalNotesLabel: string;
  modalSaveBtn: string;

  // Loan Form Labels
  formTitleNew: string;
  formTitleEdit: string;
  formDesc: string;
  secApplicantTitle: string;
  secRelativeTitle: string;
  secGuarantor1Title: string;
  secGuarantor2Title: string;
  secLoanRequestTitle: string;
  secOfficeUseTitle: string;

  formFullName: string;
  formNIC: string;
  formAddress: string;
  formPhone: string;
  formRelName: string;
  formRelType: string;
  formRelNic: string;
  formRelPhone: string;
  formRelWork: string;
  formG1Name: string;
  formG1Address: string;
  formG1Nic: string;
  formG1Phone: string;
  formG1Agree: string;
  formG2Name: string;
  formG2Address: string;
  formG2Nic: string;
  formG2Phone: string;
  formG2Agree: string;
  formReqAmount: string;
  formReqPurpose: string;
  formAppNumber: string;
  formApprovedAmount: string;
  formIntRate: string;
  formInstallments: string;
  formMonthlyInst: string;
  formSpecialNotes: string;
  formLoanDate: string;
  formSubmitSave: string;
  formCancel: string;

  // Loan List Labels
  listTitle: string;
  listDesc: string;
  searchPlaceholder: string;
  filterAll: string;
  filterActive: string;
  filterOverdue: string;
  filterCompleted: string;
  lhApplicant: string;
  lhLoanId: string;
  lhAmount: string;
  lhInterest: string;
  lhTotal: string;
  lhMonthly: string;
  lhStatus: string;
  lhActions: string;
  actionView: string;
  actionEdit: string;
  actionDelete: string;
  noLoansFound: string;
  noLoansSub: string;
}

export const translations: Record<Language, Dictionary> = {
  si: {
    dashboard: "දළ විශ්ලේෂණය",
    creditLedger: "ණය ගනුදෙනු ලේඛනය",
    newApplication: "ණය අයදුම්පත",
    backupRestore: "දත්ත උපස්ථය",
    mainMenu: "ප්‍රධාන මෙනුව",
    supportHelp: "ණය කළමනාකරණ සහාය",
    activeCapital: "ක්‍රියාකාරී ප්‍රාග්ධනය",
    clearDatabase: "සියලු දත්ත මකන්න",
    reloadDemo: "ආදර්ශ දත්ත ඇතුල් කරන්න",
    dangerControl: "දත්ත පාලන මධ්‍යස්ථානය",
    dangerNotes: "මෙහි ඇති ක්‍රියා මාර්ග ආපසු හැරවිය නොහැක. කරුණාකර ප්‍රවේශමෙන් භාවිතා කරන්න.",
    version: "v1.5",
    subTitle: "ණය සහ ගෙවීම් කළමනාකරණ පරිගණක පද්ධතිය",

    // Dashboard Stats
    overviewTitle: "දළ විශ්ලේෂණය",
    overviewDesc: "ශෙත් කැපිටල් මුදල් සහ ණය කළමනාකරණ පද්ධතියේ ප්‍රධාන සංඛ්‍යාලේඛන මෙතැනින්.",
    portfolioPrincipal: "අනුමත මුළු මුදල",
    totalLoans: "ණය ගනුදෙනු ගණන",
    totalRepayable: "මුළු අයවිය යුතු මුදල",
    interestIncome: "පොලී ආදායම සමඟ",
    totalCollections: "මුළු එකතු කිරීම්",
    outstandingBalance: "ඉතිරිව ඇති මුළු මුදල",
    collectedRatio: "මුදල් එකතුකිරීමේ ප්‍රගතිය",
    ratioSub: "මුළු පොලිය සමඟ ආපසු ලැබුණු මුදලෙහි අනුපාතය",
    collectedBadgeText: "එකතු කරගෙන ඇත",
    activeLoans: "සක්‍රීය ණය",
    overdueLoans: "හිඟ ණය",
    completedLoans: "ගෙවා නිමි",
    recentCollections: "මෑතකාලීන ගෙවීම් සටහන්",
    recentCollectionsSub: "අවසානයට සිදු කරන ලද වාරික ගෙවීම් 5 පහත දැක්වේ.",
    noRecentCollections: "තවමත් කිසිදු ගෙවීම් සටහනක් ඇතුළත් කර නොමැත.",
    noRecentSub: "ගෙවීම් සටහන් කළ පසු මෙහි දිස්වනු ඇත.",

    // Loan Status
    active: "සක්‍රීය",
    completed: "ගෙවා අවසන්",
    overdue: "ප්‍රමාදිත",
    pending: "පොරොත්තු",

    // Loan Details
    backToLoans: "ආපසු සියලුම ගිණුම් වෙත",
    statusLabel: "තත්ත්වය",
    addPaymentBtn: "ගෙවීමක් එකතු කරන්න",
    printInvoiceBtn: "වාර්තාව මුද්‍රණය කරන්න",
    microSclNotes: "කුඩා පරිමාණ ණය සේවාව සහ මූල්‍ය විසඳුම්",
    printedOn: "මුද්‍රිත දිනය",
    borrowerProfile: "ණයකරුගේ විස්තර",
    fullName: "සම්පූර්ණ නම",
    nic: "ජා.හැ. අංකය (NIC)",
    phone: "දුරකථන අංකය",
    address: "ස්ථිර ලිපිනය",
    guarantorsAndRelatives: "ඇපකරුවන් සහ සහකරුවන්",
    relative: "භාර්යාව/සහකරු/ඥාතියා",
    guarantor1: "පළමු ඇපකරු (1st Guarantor)",
    guarantor2: "දෙවන ඇපකරු (2nd Guarantor)",
    calculationLedgerTitle: "ණය ගණනය කිරීම් සහ වාරික සටහන",
    matchingSpreadsheet: "රෙගුලාසි සහ පත්‍රිකා ගණනය කිරීම්",
    colApproved: "අනුමත මුදල",
    colRate: "පොලී අනුපාතිකය",
    colInterest: "පොලිය",
    colTotal: "මුළු එකතුව",
    colInstallment: "වාරිකය",
    colCollected: "එකතුකළ",
    colPaidMonths: "ගෙවූ මාස",
    colBalance: "ඉතිරි මුදල",
    repaymentHistoryTitle: "සවිස්තරාත්මක ඇතුළත් කිරීම් සටහන",
    noRepaymentsText: "තවමත් කිසිදු ණය එකතු කිරීමක් සිදු කර නැත.",
    noRepaymentsSub: "ගෙවීම් පත්‍රයට ඇතුළත් කිරීමට 'ගෙවීමක් එකතු කරන්න' බොත්තම ඔබන්න.",
    tableDate: "දිනය",
    tableMonth: "මිට අදාල මාසය",
    tableReceipt: "ලදුපත් අංකය",
    tableNotes: "වෙනත් සටහන්",
    tableAmount: "එකතු කළ මුදල",
    recordsDeletePrompt: "මෙම ගෙවීම් සටහන ගිණුමෙන් සම්පූර්ණයෙන්ම ඉවත් කිරීමට අවශ්‍යද?",
    officerSignature: "ණය කළමනාකරුගේ අත්සන",
    borrowerSignature: "ණයකරුගේ අත්සන",

    // Repayment Modal
    modalTitle: "ගෙවීම් සටහන් කිරීම",
    modalDesc: "ණය වාරික එකතු කිරීම මෙතැනින් ඇතුල් කරන්න.",
    modalAmountLabel: "ගෙවූ මුදල (Amount - LKR) *",
    modalDateLabel: "එකතු කළ දිනය (Collection Date) *",
    modalMonthLabel: "ණය එකතු කළ මාසය (Collection Month) *",
    modalReceiptLabel: "ලදුපත්/රිසිට්පත් අංකය (Receipt No) *",
    modalNotesLabel: "වෙනත් සටහන් (Notes)",
    modalSaveBtn: "ලදුපත සුරකින්න",

    // Loan Form Labels
    formTitleNew: "නව ණය අයදුම්පතක් ඇතුළත් කිරීම",
    formTitleEdit: "ණය අයදුම්පත යාවත්කාලීන කිරීම",
    formDesc: "ශෙත් කැපිටල් ණය දත්ත නිවැරදිව පද්ධතියට ඇතුළත් කරන්න.",
    secApplicantTitle: "01. ණයකරුගේ විස්තර (Borrower Particulars)",
    secRelativeTitle: "02. භාර්යාව/ළඟම ඥාතියාගේ විස්තර (Spouse / Nearest Relative)",
    secGuarantor1Title: "03. පළමු ඇපකරුගේ විස්තර (First Guarantor Particulars)",
    secGuarantor2Title: "04. දෙවන ඇපකරුගේ විස්තර (Second Guarantor Particulars)",
    secLoanRequestTitle: "05. ණය අවශ්‍යතාවය (Loan Requirements Info)",
    secOfficeUseTitle: "06. කාර්යාලයීය ප්‍රයෝජනය සඳහා පමණි (For Office Use Only)",

    formFullName: "සම්පූර්ණ නම (Full Name) *",
    formNIC: "ජාතික හැඳුනුම්පත් අංකය (NIC) *",
    formAddress: "ස්ථිර පදිංචි ලිපිනය (Residential Address) *",
    formPhone: "දුරකථන අංකය (Phone Number) *",
    formRelName: "නම (Full Name) *",
    formRelType: "ඥාතිත්වය (Relationship, e.g. Wife/Brother) *",
    formRelNic: "ජාතික හැඳුනුම්පත් අංකය (NIC) *",
    formRelPhone: "දුරකථන අංකය (Phone) *",
    formRelWork: "සේවා ස්ථානයේ ලිපිනය (Office/Work Address) *",
    formG1Name: "ඇපකරුගේ නම (Full Name) *",
    formG1Address: "පදිංචි ලිපිනය (Address) *",
    formG1Nic: "ජාතික හැඳුනුම්පත් අංකය (NIC) *",
    formG1Phone: "දුරකථන අංකය (Phone) *",
    formG1Agree: "ඇපකරු වගකීම් සහ කොන්දේසි කියවා එකඟ විය (Agreed & Signed Statement)",
    formG2Name: "ඇපකරුගේ නම (Full Name) *",
    formG2Address: "පදිංචි ලිපිනය (Address) *",
    formG2Nic: "ජාතික හැඳුනුම්පත් අංකය (NIC) *",
    formG2Phone: "දුරකථන අංකය (Phone) *",
    formG2Agree: "ඇපකරු වගකීම් සහ කොන්දේසි කියවා එකඟ විය (Agreed & Signed Statement)",
    formReqAmount: "අපේක්ෂිත ණය මුදල (Requested Amount - LKR) *",
    formReqPurpose: "ණය ලබාගැනීමේ අරමුණ (Loan Purpose) *",
    formAppNumber: "ණය අයදුම්පත් අංකය (Loan Ref Number) *",
    formApprovedAmount: "අනුමත ණය මුදල (Approved Principal Amount - LKR) *",
    formIntRate: "පොලී අනුපාතිකය % (Interest Rate Percentage, e.g., 25) *",
    formInstallments: "ගෙවිය යුතු වාරික ගණන (Installments Count Months) *",
    formMonthlyInst: "වාරික මුදල (Calculated Monthly Installment Amount - LKR) *",
    formSpecialNotes: "විශේෂ සටහන් (Approval Remarks/Notes)",
    formLoanDate: "ණය ලබාදුන් දිනය (Disbursed Date) *",
    formSubmitSave: "ණය අයදුම්පත සුරකින්න (Submit & Activate Loan Portfolio)",
    formCancel: "අවලංගු කරන්න (Cancel)",

    // Loan List Labels
    listTitle: "අනුමත ණය ගනුදෙනු ලේඛනය",
    listDesc: "පද්ධතියේ ලියාපදිංචි සාමාජිකකයින්ගේ ණය ගිණුම් පිළිබඳ සම්පූර්ණ විස්තරය.",
    searchPlaceholder: "නම, හැඳුනුම්පත් අංකය හෝ අයදුම්පත් අංකයෙන් සොයන්න...",
    filterAll: "සියලුම ණය",
    filterActive: "සක්‍රීය (Active)",
    filterOverdue: "හිඟ ණය (Overdue)",
    filterCompleted: "ගෙවා නිමි (Completed)",
    lhApplicant: "ණයකරු",
    lhLoanId: "ණය අංකය",
    lhAmount: "ණය මුදල",
    lhInterest: "පොලිය",
    lhTotal: "මුළු වටිනාකම",
    lhMonthly: "වාරිකය",
    lhStatus: "තත්ත්වය",
    lhActions: "ක්‍රියාමාර්ග",
    actionView: "විස්තර",
    actionEdit: "සංස්කරණය",
    actionDelete: "මකන්න",
    noLoansFound: "කිසිදු ගිණුමක් සොයාගත නොහැකි විය.",
    noLoansSub: "සෙවුම් පදය පරීක්ෂා කරන්න හෝ නව අයදුම්පතක් එක් කරන්න."
  },
  en: {
    dashboard: "Dashboard Overview",
    creditLedger: "Credit Ledger Matrix",
    newApplication: "New Loan Application",
    backupRestore: "Database Backup Manager",
    mainMenu: "MAIN MANAGEMENT",
    supportHelp: "SCL Active Support Desk",
    activeCapital: "Active Outstanding Portfolio",
    clearDatabase: "Factory Reset All Entries",
    reloadDemo: "Inject Demo Spreadsheet Seed",
    dangerControl: "DANGER WORKZONE PANEL",
    dangerNotes: "Commands here bypass intermediate approvals and delete persistent storage. Act with extreme caution.",
    version: "v1.5 Premium",
    subTitle: "Enterprise Credit Ledger Management System",

    // Dashboard Stats
    overviewTitle: "Analytical Intelligence Overview",
    overviewDesc: "Real-time summary dashboard of credit distribution, payment metrics, and active collections.",
    portfolioPrincipal: "Active Portfolio Principal",
    totalLoans: "Total Distributed Portfolios",
    totalRepayable: "Total Portfolio Value",
    interestIncome: "with 25% Flat Interest",
    totalCollections: "Total Collections Inflow",
    outstandingBalance: "Outstanding Portfolio Balance",
    collectedRatio: "Inflow Collection Ratio",
    ratioSub: "Aggregated Principal + Interest Repayment Progress Matrix",
    collectedBadgeText: "Recovered Inflow",
    activeLoans: "Active Accounts",
    overdueLoans: "Overdue Alerts",
    completedLoans: "Settled Accounts",
    recentCollections: "Live Collection Activity Streams",
    recentCollectionsSub: "Latest 5 payment collection actions registered in the system ledger.",
    noRecentCollections: "No transaction history has been registered yet.",
    noRecentSub: "Registered collections will populate in real-time.",

    // Loan Status
    active: "ACTIVE",
    completed: "SETTLED",
    overdue: "OVERDUE",
    pending: "PENDING",

    // Loan Details
    backToLoans: "Return to Credit Directory",
    statusLabel: "Ledger Standing Status",
    addPaymentBtn: "Record Cash Repayment Inflow",
    printInvoiceBtn: "Generate Official Statement PDF",
    microSclNotes: "Seth Capital Microcredit & Realtime Capital Security Services",
    printedOn: "Generated At",
    borrowerProfile: "Primary Borrower Master Record",
    fullName: "Legal Full Name",
    nic: "National Identity Card (NIC)",
    phone: "Active Mobile Line",
    address: "Permanent Residential Bounds",
    guarantorsAndRelatives: "Legal Guard & Family Bond Endorsers",
    relative: "Declared Associate Relative",
    guarantor1: "Primary Guarantor (1)",
    guarantor2: "Secondary Guarantor (2)",
    calculationLedgerTitle: "Credit Amortization and Payment Allocation",
    matchingSpreadsheet: "Official Asset-Backed Amortization Table",
    colApproved: "Approved Principal",
    colRate: "Flat Int. Rate",
    colInterest: "Int. Absolute",
    colTotal: "Aggregate Obligation",
    colInstallment: "Set Installment",
    colCollected: "Paid Inflow",
    colPaidMonths: "Allocated Months",
    colBalance: "Due Capital",
    repaymentHistoryTitle: "Chronological Installment Records Ledger",
    noRepaymentsText: "No financial collections recorded against this application yet.",
    noRepaymentsSub: "Click 'Record Cash Repayment' to authorize and record cash intake.",
    tableDate: "Intake Date",
    tableMonth: "Settled Cycle",
    tableReceipt: "Receipt reference",
    tableNotes: "Metadata / Notes",
    tableAmount: "Transacted Cash",
    recordsDeletePrompt: "Are you sure you want to permanently erase this transaction record?",
    officerSignature: "Authorized Signing Agent",
    borrowerSignature: "Bound Underwriter Signature",

    // Repayment Modal
    modalTitle: "Transact Cash Intake Voucher",
    modalDesc: "Record daily/monthly capital collection statement voucher to balance ledger.",
    modalAmountLabel: "Intipped Amount (LKR) *",
    modalDateLabel: "Voucher Intake Date *",
    modalMonthLabel: "Ledger Fiscal Cycle Month *",
    modalReceiptLabel: "Intake Receipt Serial *",
    modalNotesLabel: "Ledger Remarks / Memo",
    modalSaveBtn: "Authorize & Commit Cash Entry",

    // Loan Form Labels
    formTitleNew: "Commence New Credit Portfolio Application",
    formTitleEdit: "Modify Existing Underwritten Credit Application",
    formDesc: "Populate rigorous underwriting descriptors. All contract signatures must match physical IDs.",
    secApplicantTitle: "01. Applicant Core Demographics & Identity Profile",
    secRelativeTitle: "02. Obligated Partner / Primary Family Endorser",
    secGuarantor1Title: "03. Collateralized Co-Signer & Guarantor Alpha Record",
    secGuarantor2Title: "04. Collateralized Co-Signer & Guarantor Beta Record",
    secLoanRequestTitle: "05. Loan Allocation and Capital Purpose Declaration",
    secOfficeUseTitle: "06. Underwriting Calculations & Loan Issuance Variables",

    formFullName: "Contractual Full Legal Name *",
    formNIC: "National ID (NIC Number) *",
    formAddress: "Deeded Residence Address *",
    formPhone: "Mobile/Primary Contact *",
    formRelName: "Relative Full Name *",
    formRelType: "Bond Type (e.g. Spouse/Sister/Parent) *",
    formRelNic: "Relative National ID (NIC) *",
    formRelPhone: "Relative Active Phone *",
    formRelWork: "Primary Employment / Business Bounds *",
    formG1Name: "Legal Full Name *",
    formG1Address: "Residence Address *",
    formG1Nic: "National ID (NIC) *",
    formG1Phone: "Mobile Contact Line *",
    formG1Agree: "Co-Signer acknowledges joint-several liability guidelines for unpaid debts",
    formG2Name: "Legal Full Name *",
    formG2Address: "Residence Address *",
    formG2Nic: "National ID (NIC) *",
    formG2Phone: "Mobile Contact Line *",
    formG2Agree: "Co-Signer acknowledges joint-several liability guidelines for unpaid debts",
    formReqAmount: "Intended Capital Principal Amount (LKR) *",
    formReqPurpose: "Underlying Commercial / Emergency Purpose *",
    formAppNumber: "Enterprise Internal Reference (SCL Tag) *",
    formApprovedAmount: "Approved Underwritten Principal (LKR) *",
    formIntRate: "Interest Percentage (e.g., 25% flat) *",
    formInstallments: "Duration Term (Specified Cycles/Months) *",
    formMonthlyInst: "Fiscal Cycle Target Installment (LKR) *",
    formSpecialNotes: "Underwriter Discretionary Approvals / Remarks",
    formLoanDate: "Formal Disbursement & Maturity Launch Date *",
    formSubmitSave: "Approve Loan Portfolio and Launch Ledger Amortizations",
    formCancel: "Abort Underwriting (Cancel Form)",

    // Loan List Labels
    listTitle: "Underwritten Credit Ledgers",
    listDesc: "Directory of all distributed capital portfolios, underwriting statuses, outstanding risk, and accounts.",
    searchPlaceholder: "Filter across names, NIC reference codes, references...",
    filterAll: "Gross Portfolio View",
    filterActive: "Active Portfolios",
    filterOverdue: "High-Risk Overdules",
    filterCompleted: "Settled Accounts",
    lhApplicant: "Borrower Underwriter",
    lhLoanId: "Asset Ref",
    lhAmount: "Disbursed Value",
    lhInterest: "Yield Potential",
    lhTotal: "Total Due",
    lhMonthly: "Term Target",
    lhStatus: "Status",
    lhActions: "Directives",
    actionView: "Statement",
    actionEdit: "Underwrite",
    actionDelete: "Erase Asset",
    noLoansFound: "Query yielded zero matches.",
    noLoansSub: "Check search parameters or deploy a new capital underwriting request form."
  }
};
