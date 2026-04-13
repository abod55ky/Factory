import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

type GeneralUploadResponse = {
  message?: string;
  file?: {
    id?: string;
    originalName?: string;
    path?: string;
    mimeType?: string;
    size?: number;
    checksum?: string;
    uploadedAt?: string;
    uploadedBy?: string | null;
  };
};

type GeneralListedFile = {
  id?: string;
  originalName?: string;
  storedName?: string;
  path?: string;
  mimeType?: string | null;
  size?: number;
  extension?: string;
  uploadedAt?: string;
};

type GeneralFilesListResponse = {
  files?: GeneralListedFile[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
};

const GENERAL_FILES_QUERY_KEY = ['general-files'];

const toMessage = (error: unknown, fallback: string) => {
  const err = error as {
    response?: {
      status?: number;
      data?: {
        message?: string | string[];
        error?: string | { message?: string };
      };
    };
    message?: string;
  };

  if (err?.response?.status === 401) {
    return 'انتهت الجلسة أو لم يتم تسجيل الدخول. يرجى تسجيل الدخول مرة أخرى.';
  }

  const apiMessage = err?.response?.data?.message;
  if (Array.isArray(apiMessage) && apiMessage.length > 0) return apiMessage.join(' | ');
  if (typeof apiMessage === 'string' && apiMessage.trim()) return apiMessage;

  const nestedError = err?.response?.data?.error;
  if (typeof nestedError === 'string' && nestedError.trim()) return nestedError;
  if (nestedError && typeof nestedError === 'object' && nestedError.message) return nestedError.message;

  return err?.message || fallback;
};

export const useFiles = () => {
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: GENERAL_FILES_QUERY_KEY,
    queryFn: async () => {
      const response = await apiClient.get('/files', {
        params: { page: 1, limit: 20 },
      });

      return response.data as GeneralFilesListResponse;
    },
    staleTime: 30_000,
  });

  const upload = useMutation({
    mutationFn: async (payload: { file: File }) => {
      const form = new FormData();
      form.append('file', payload.file);

      const response = await apiClient.post('/files/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.data as GeneralUploadResponse;
    },
  });

  return {
    list,
    upload: {
      ...upload,
      mutateAsync: async (payload: { file: File }) => {
        try {
          const result = await upload.mutateAsync(payload);
          await queryClient.invalidateQueries({ queryKey: GENERAL_FILES_QUERY_KEY });
          return result;
        } catch (error) {
          throw new Error(toMessage(error, 'فشل رفع الملف العام'));
        }
      },
    },
  };
};