import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  AppState,
  User,
  PatientData,
  UploadedFile,
  Case,
  ChatMessage,
  loadState,
  saveState,
  generateId,
} from '@/lib/storage';

interface AppContextType {
  state: AppState;
  login: (email: string, password: string) => boolean;
  signup: (user: Omit<User, 'id' | 'verified'>) => boolean;
  logout: () => void;
  verifyOTP: (otp: string) => boolean;
  setOTPEmail: (email: string) => void;
  initializeEmailChange: (newEmail: string) => void;
  verifyEmailOTP: (otp: string) => boolean;
  setCurrentPatient: (patient: PatientData) => void;
  addUploadedFile: (file: UploadedFile) => void;
  removeUploadedFile: (id: string) => void;
  updateFileCategory: (id: string, category: string) => void;
  updateFileExtractedData: (id: string, data: Record<string, string>) => void;
  createCase: (clinicalSummary?: string) => Case | null;
  sendMessage: (caseId: string, expertId: string, content: string) => void;
  sendGroupMessage: (caseId: string, content: string) => void;
  clearUploadedFiles: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const login = (email: string, password: string): boolean => {
    const user = state.users.find(u => u.email === email && u.password === password);
    if (user && user.verified) {
      setState(prev => ({ ...prev, loggedInUser: user }));
      return true;
    }
    return false;
  };

  const signup = (userData: Omit<User, 'id' | 'verified'>): boolean => {
    const exists = state.users.some(u => u.email === userData.email);
    if (exists) return false;

    const newUser: User = {
      ...userData,
      id: generateId(),
      verified: false,
    };

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:', otp); // For testing

    setState(prev => ({
      ...prev,
      users: [...prev.users, newUser],
      otpEmail: userData.email,
      otp,
    }));

    return true;
  };

  const logout = () => {
    setState(prev => ({
      ...prev,
      loggedInUser: null,
      currentPatient: null,
      uploadedFiles: [],
    }));
  };

  const verifyOTP = (inputOtp: string): boolean => {
    if (state.otp === inputOtp && state.otpEmail) {
      setState(prev => ({
        ...prev,
        users: prev.users.map(u =>
          u.email === prev.otpEmail ? { ...u, verified: true } : u
        ),
        otp: null,
        otpEmail: null,
      }));
      return true;
    }
    return false;
  };

  const setOTPEmail = (email: string) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP for reset:', otp);
    setState(prev => ({ ...prev, otpEmail: email, otp }));
  };

  const setCurrentPatient = (patient: PatientData) => {
    setState(prev => ({ ...prev, currentPatient: patient }));
  };

  const addUploadedFile = (file: UploadedFile) => {
    setState(prev => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, file],
    }));
  };

  const removeUploadedFile = (id: string) => {
    setState(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter(f => f.id !== id),
    }));
  };

  const updateFileCategory = (id: string, category: string) => {
    setState(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.map(f =>
        f.id === id ? { ...f, fileCategory: category } : f
      ),
    }));
  };

  const updateFileExtractedData = (id: string, data: Record<string, string>) => {
    setState(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.map(f =>
        f.id === id ? { ...f, extractedData: data } : f
      ),
    }));
  };

  const createCase = (clinicalSummary?: string): Case | null => {
    if (!state.currentPatient || state.uploadedFiles.length === 0) return null;

    const newCase: Case = {
      id: generateId(),
      patientId: generateId(),
      patient: state.currentPatient,
      files: [...state.uploadedFiles],
      status: 'Pending',
      createdDate: new Date().toISOString(),
      clinicalSummary,
    };

    setState(prev => ({
      ...prev,
      cases: [...prev.cases, newCase],
      currentPatient: null,
      uploadedFiles: [],
    }));

    return newCase;
  };

  const sendMessage = (caseId: string, expertId: string, content: string) => {
    if (!state.loggedInUser) return;

    const chatKey = `${caseId}-${expertId}`;
    const message: ChatMessage = {
      id: generateId(),
      expertId,
      caseId,
      senderId: state.loggedInUser.id,
      content,
      timestamp: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      chats: {
        ...prev.chats,
        [chatKey]: [...(prev.chats[chatKey] || []), message],
      },
    }));
  };

  const clearUploadedFiles = () => {
    setState(prev => ({ ...prev, uploadedFiles: [] }));
  };

  // Send message to group chat (uses 'group' as expertId)
  const sendGroupMessage = (caseId: string, content: string) => {
    if (!state.loggedInUser) return;

    const chatKey = `${caseId}-group`;
    const message: ChatMessage = {
      id: generateId(),
      expertId: 'group',
      caseId,
      senderId: state.loggedInUser.id,
      content,
      timestamp: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      chats: {
        ...prev.chats,
        [chatKey]: [...(prev.chats[chatKey] || []), message],
      },
    }));
  };

  // Update current user profile
  const updateUser = (updates: Partial<User>) => {
    if (!state.loggedInUser) return;

    const updatedUser = { ...state.loggedInUser, ...updates };
    setState(prev => ({
      ...prev,
      loggedInUser: updatedUser,
      users: prev.users.map(u => (u.id === updatedUser.id ? updatedUser : u)),
    }));
  };

  // Initialize email change with OTP
  const initializeEmailChange = (newEmail: string) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP for email verification:', otp); // For testing
    
    setState(prev => ({
      ...prev,
      emailVerificationOtp: otp,
      emailVerificationPending: newEmail,
    }));
  };

  // Verify email OTP and complete email change
  const verifyEmailOTP = (inputOtp: string): boolean => {
    if (
      state.emailVerificationOtp === inputOtp &&
      state.emailVerificationPending &&
      state.loggedInUser
    ) {
      const updatedUser = {
        ...state.loggedInUser,
        email: state.emailVerificationPending,
      };

      setState(prev => ({
        ...prev,
        loggedInUser: updatedUser,
        users: prev.users.map(u =>
          u.id === updatedUser.id ? updatedUser : u
        ),
        emailVerificationOtp: null,
        emailVerificationPending: null,
      }));

      return true;
    }
    return false;
  };

  return (
    <AppContext.Provider
      value={{
        state,
        login,
        signup,
        logout,
        verifyOTP,
        setOTPEmail,
        initializeEmailChange,
        verifyEmailOTP,
        setCurrentPatient,
        addUploadedFile,
        removeUploadedFile,
        updateFileCategory,
        updateFileExtractedData,
        createCase,
        sendMessage,
        sendGroupMessage,
        clearUploadedFiles,
        updateUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
