import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

type ImportEntity = 'employees' | 'products' | 'inventory' | 'attendance';

const entityToBackend: Record<ImportEntity, 'employees' | 'products' | 'attendance'> = {
  employees: 'employees',
  products: 'products',
  inventory: 'products',
  attendance: 'attendance',
};

const supportedForUpload = new Set<string>(['employees', 'products']);

const toMessage = (error: unknown, fallback: string) => {
  const err = error as {
    response?: {
      data?: {
        message?: string | string[];
        error?: string | { message?: string };
      };
    };
    message?: string;
  };

  const apiMessage = err?.response?.data?.message;
  if (Array.isArray(apiMessage) && apiMessage.length > 0) return apiMessage.join(' | ');
  if (typeof apiMessage === 'string' && apiMessage.trim()) return apiMessage;

  const nestedError = err?.response?.data?.error;
  if (typeof nestedError === 'string' && nestedError.trim()) return nestedError;
  if (nestedError && typeof nestedError === 'object' && nestedError.message) return nestedError.message;

  return err?.message || fallback;
};

const resolveEntity = (entity: string) => {
  return entityToBackend[(entity as ImportEntity)] || entity;
};

export const useImports = () => {
  const upload = useMutation({
    mutationFn: async (payload: { entity: string; file: File }) => {
      const backendEntity = resolveEntity(payload.entity);
      if (!supportedForUpload.has(backendEntity)) {
        throw new Error('الاستيراد لهذا القسم غير مدعوم حالياً من الخادم');
      }

      const form = new FormData();
      form.append('file', payload.file);
      const res = await apiClient.post(`/imports/${backendEntity}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
  });

  const validate = useMutation({
    mutationFn: async (payload: { entity: string; file: File }) => {
      const backendEntity = resolveEntity(payload.entity);
      if (!supportedForUpload.has(backendEntity)) {
        throw new Error('التحقق لهذا القسم غير مدعوم حالياً من الخادم');
      }

      const form = new FormData();
      form.append('file', payload.file);
      const res = await apiClient.post(`/imports/${backendEntity}/validate`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
  });

  const template = useMutation({
    mutationFn: async (entity: string) => {
      const backendEntity = resolveEntity(entity);
      if (!supportedForUpload.has(backendEntity)) {
        throw new Error('لا يوجد قالب لهذا القسم حالياً');
      }

      const res = await apiClient.get(`/imports/templates/${backendEntity}`, {
        responseType: 'blob',
      });
      return res.data;
    },
  });

  return {
    upload: {
      ...upload,
      mutateAsync: async (payload: { entity: string; file: File }) => {
        try {
          return await upload.mutateAsync(payload);
        } catch (error) {
          throw new Error(toMessage(error, 'فشل رفع الملف'));
        }
      },
    },
    validate: {
      ...validate,
      mutateAsync: async (payload: { entity: string; file: File }) => {
        try {
          return await validate.mutateAsync(payload);
        } catch (error) {
          throw new Error(toMessage(error, 'فشل التحقق من الملف'));
        }
      },
    },
    template: {
      ...template,
      mutateAsync: async (entity: string) => {
        try {
          return await template.mutateAsync(entity);
        } catch (error) {
          throw new Error(toMessage(error, 'فشل تحميل القالب'));
        }
      },
    },
  };
};
