import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { PatientData, Case, UploadedFile } from '@/lib/storage';

interface DbPatient {
  id: string;
  user_id: string;
  name: string;
  age: number | null;
  sex: string | null;
  cancer_type: string | null;
  created_at: string;
}

interface DbCase {
  id: string;
  user_id: string;
  patient_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface DbUploadedFile {
  id: string;
  case_id: string;
  user_id: string;
  name: string;
  type: string | null;
  size: number | null;
  file_category: string | null;
  extracted_data: Record<string, string> | null;
  storage_path: string | null;
  created_at: string;
}

export interface FullCase {
  id: string;
  caseName: string;
  patientId: string;
  patient: PatientData;
  files: UploadedFile[];
  status: 'Pending' | 'In Review' | 'Completed';
  createdDate: string;
  clinicalSummary?: string;
  ownerId?: string;
}

export function useSupabaseData() {
  const { user } = useAuth();
  const [cases, setCases] = useState<FullCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all cases for the current user
  const fetchCases = useCallback(async () => {
    if (!user) {
      setCases([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch cases
      const { data: casesData, error: casesError } = await supabase
        .from('cases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (casesError) throw casesError;

      if (!casesData || casesData.length === 0) {
        setCases([]);
        setLoading(false);
        return;
      }

      // Fetch patients for these cases
      const patientIds = [...new Set(casesData.map(c => c.patient_id))];
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .in('id', patientIds);

      if (patientsError) throw patientsError;

      // Fetch files for these cases
      const caseIds = casesData.map(c => c.id);
      const { data: filesData, error: filesError } = await supabase
        .from('uploaded_files')
        .select('*')
        .in('case_id', caseIds);

      if (filesError) throw filesError;

      // Build full cases
      const fullCases: FullCase[] = casesData.map((caseRow: DbCase) => {
        const patient = patientsData?.find((p: DbPatient) => p.id === caseRow.patient_id);
        const caseFiles = filesData?.filter((f: DbUploadedFile) => f.case_id === caseRow.id) || [];

        return {
          id: caseRow.id,
          caseName: patient?.name || 'Unknown',
          patientId: caseRow.patient_id,
          patient: {
            name: patient?.name || '',
            age: patient?.age?.toString() || '',
            sex: patient?.sex || '',
            cancerType: patient?.cancer_type || '',
            caseName: patient?.name || '',
          },
          files: caseFiles.map((f: DbUploadedFile) => ({
            id: f.id,
            name: f.name,
            size: f.size || 0,
            type: f.type || '',
            dataURL: '', // Files stored in storage, not as dataURL
            fileCategory: f.file_category || '',
            extractedData: f.extracted_data || undefined,
          })),
          status: (caseRow.status as 'Pending' | 'In Review' | 'Completed') || 'Pending',
          createdDate: caseRow.created_at,
          ownerId: caseRow.user_id,
        };
      });

      setCases(fullCases);
    } catch (err) {
      console.error('Error fetching cases:', err);
      setError('Failed to load cases');
      toast.error('Failed to load cases');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create a new patient and case
  const createPatientAndCase = async (
    patientData: PatientData,
    files: UploadedFile[],
    clinicalSummary?: string
  ): Promise<FullCase | null> => {
    if (!user) {
      toast.error('You must be logged in to create a case');
      return null;
    }

    try {
      // 1. Create patient
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .insert({
          user_id: user.id,
          name: patientData.name,
          age: patientData.age ? parseInt(patientData.age, 10) : null,
          sex: patientData.sex || null,
          cancer_type: patientData.cancerType || null,
        })
        .select()
        .single();

      if (patientError) throw patientError;

      // 2. Create case
      const { data: newCase, error: caseError } = await supabase
        .from('cases')
        .insert({
          user_id: user.id,
          patient_id: patient.id,
          status: 'Pending',
        })
        .select()
        .single();

      if (caseError) throw caseError;

      // 3. Create uploaded files records (without actual file content for now)
      if (files.length > 0) {
        const fileRecords = files.map(f => ({
          case_id: newCase.id,
          user_id: user.id,
          name: f.name,
          type: f.type,
          size: f.size,
          file_category: f.fileCategory || null,
          extracted_data: f.extractedData || null,
        }));

        const { error: filesError } = await supabase
          .from('uploaded_files')
          .insert(fileRecords);

        if (filesError) throw filesError;
      }

      const fullCase: FullCase = {
        id: newCase.id,
        caseName: patientData.caseName || patientData.name,
        patientId: patient.id,
        patient: patientData,
        files: files,
        status: 'Pending',
        createdDate: newCase.created_at,
        ownerId: user.id,
        clinicalSummary,
      };

      // Update local state
      setCases(prev => [fullCase, ...prev]);
      toast.success('Case created successfully');

      return fullCase;
    } catch (err) {
      console.error('Error creating case:', err);
      toast.error('Failed to create case');
      return null;
    }
  };

  // Delete a case
  const deleteCase = async (caseId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Delete files first (due to foreign key)
      await supabase
        .from('uploaded_files')
        .delete()
        .eq('case_id', caseId);

      // Delete case
      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', caseId)
        .eq('user_id', user.id);

      if (error) throw error;

      setCases(prev => prev.filter(c => c.id !== caseId));
      toast.success('Case deleted');
      return true;
    } catch (err) {
      console.error('Error deleting case:', err);
      toast.error('Failed to delete case');
      return false;
    }
  };

  // Update case status
  const updateCaseStatus = async (
    caseId: string,
    status: 'Pending' | 'In Review' | 'Completed'
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('cases')
        .update({ status })
        .eq('id', caseId)
        .eq('user_id', user.id);

      if (error) throw error;

      setCases(prev =>
        prev.map(c => (c.id === caseId ? { ...c, status } : c))
      );
      return true;
    } catch (err) {
      console.error('Error updating case status:', err);
      toast.error('Failed to update case');
      return false;
    }
  };

  // Fetch on mount and when user changes
  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  return {
    cases,
    loading,
    error,
    fetchCases,
    createPatientAndCase,
    deleteCase,
    updateCaseStatus,
  };
}
