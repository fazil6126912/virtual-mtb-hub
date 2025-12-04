// Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  verified: boolean;
  profilePicture?: string; // Base64 or data URL
}

export interface PatientData {
  name: string;
  age: string;
  sex: string;
  cancerType: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  dataURL: string;
  fileCategory: string;
  extractedData?: Record<string, string>;
}

export interface Case {
  id: string;
  patientId: string;
  patient: PatientData;
  files: UploadedFile[];
  status: 'Pending' | 'In Review' | 'Completed';
  createdDate: string;
  clinicalSummary?: string;
}

export interface Expert {
  id: string;
  name: string;
  specialty: string;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  expertId: string;
  caseId: string;
  senderId: string;
  content: string;
  timestamp: string;
}

export interface MTB {
  id: string;
  name: string;
  doctorName: string;
  description: string;
  expertsCount: number;
  casesCount: number;
  isOwner: boolean;
  cases: string[];
  experts: string[];
}

export interface AppState {
  users: User[];
  loggedInUser: User | null;
  currentPatient: PatientData | null;
  uploadedFiles: UploadedFile[];
  cases: Case[];
  mtbs: MTB[];
  chats: Record<string, ChatMessage[]>;
  experts: Expert[];
  otpEmail: string | null;
  otp: string | null;
  emailVerificationOtp: string | null;
  emailVerificationPending: string | null; // New email awaiting verification
}

const STORAGE_KEY = 'vmtb_app_state';

const defaultExperts: Expert[] = [
  { id: 'exp1', name: 'Dr. Siddharth Srivastva', specialty: 'Medical Oncologist' },
  { id: 'exp2', name: 'Dr. Priya Sharma', specialty: 'Radiation Oncologist' },
  { id: 'exp3', name: 'Dr. Rajesh Kumar', specialty: 'Surgical Oncologist' },
  { id: 'exp4', name: 'Dr. Anita Patel', specialty: 'Pathologist' },
  { id: 'exp5', name: 'Dr. Vikram Singh', specialty: 'Radiologist' },
  { id: 'exp6', name: 'Dr. Meena Gupta', specialty: 'Genetic Counselor' },
];

const defaultMTBs: MTB[] = [
  {
    id: 'mtb1',
    name: 'Lung Cancer Board',
    doctorName: 'Dr. Siddharth Srivastva',
    description: 'Discussing molecular profiles and targeted therapies for advanced lung cancer cases.',
    expertsCount: 8,
    casesCount: 20,
    isOwner: true,
    cases: [],
    experts: ['exp1', 'exp2', 'exp3'],
  },
  {
    id: 'mtb2',
    name: 'Breast Cancer Board',
    doctorName: 'Dr. Priya Sharma',
    description: 'Comprehensive review of breast cancer cases with focus on personalized treatment.',
    expertsCount: 6,
    casesCount: 15,
    isOwner: true,
    cases: [],
    experts: ['exp2', 'exp4', 'exp5'],
  },
  {
    id: 'mtb3',
    name: 'GI Cancer Board',
    doctorName: 'Dr. Rajesh Kumar',
    description: 'Multidisciplinary approach to gastrointestinal malignancies.',
    expertsCount: 7,
    casesCount: 18,
    isOwner: false,
    cases: [],
    experts: ['exp1', 'exp3', 'exp6'],
  },
];

// Pre-seeded test accounts for development
const defaultUsers: User[] = [
  { id: 'user1', name: 'Test User', email: 'test@test.com', phone: '1234567890', password: 'test123', verified: true },
  { id: 'user2', name: 'Demo User', email: 'demo@demo.com', phone: '0987654321', password: 'demo123', verified: true },
  { id: 'user3', name: 'Admin User', email: 'admin@admin.com', phone: '1111111111', password: 'admin123', verified: true },
];

const getDefaultState = (): AppState => ({
  users: defaultUsers,
  loggedInUser: null,
  currentPatient: null,
  uploadedFiles: [],
  cases: [],
  mtbs: defaultMTBs,
  chats: {},
  experts: defaultExperts,
  otpEmail: null,
  otp: null,
  emailVerificationOtp: null,
  emailVerificationPending: null,
});

export const loadState = (): AppState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...getDefaultState(), ...parsed };
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return getDefaultState();
};

export const saveState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Mock extracted data generator
export const generateMockExtractedData = (fileCategory: string): Record<string, string> => {
  const commonFields: Record<string, Record<string, string>> = {
    'Clinical Notes': {
      'Patient History': 'Patient presents with persistent cough for 3 months',
      'Chief Complaint': 'Shortness of breath and chest pain',
      'Physical Examination': 'Decreased breath sounds in right lower lobe',
      'Assessment': 'Suspected lung malignancy',
      'Plan': 'Order CT scan and biopsy',
    },
    'Pathology': {
      'Specimen Type': 'Lung tissue biopsy',
      'Diagnosis': 'Non-small cell lung carcinoma',
      'Histologic Type': 'Adenocarcinoma',
      'Grade': 'Moderately differentiated',
      'Margins': 'Negative for malignancy',
    },
    'Radiology': {
      'Examination': 'CT Chest with contrast',
      'Findings': 'Right lower lobe mass 4.2 x 3.8 cm',
      'Lymph Nodes': 'Mediastinal lymphadenopathy noted',
      'Impression': 'Primary lung malignancy with nodal involvement',
      'Recommendation': 'PET scan for staging',
    },
    'Lab Results': {
      'Tumor Markers': 'CEA: 12.5 ng/mL (elevated)',
      'CBC': 'WBC 8.2, Hgb 11.5, Plt 245',
      'Metabolic Panel': 'Within normal limits',
      'LFTs': 'Mildly elevated ALT',
      'Creatinine': '1.1 mg/dL',
    },
    'Genomic Report': {
      'EGFR Mutation': 'Positive - Exon 19 deletion',
      'ALK Rearrangement': 'Negative',
      'ROS1': 'Negative',
      'PD-L1 Expression': '45%',
      'TMB': 'Intermediate (8 mut/Mb)',
    },
  };

  return commonFields[fileCategory] || {
    'Document Type': fileCategory,
    'Content Summary': 'Document uploaded successfully',
    'Status': 'Pending review',
  };
};
