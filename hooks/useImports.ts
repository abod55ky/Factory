import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export const useImports = () => {
  const upload = useMutation<any, any, { entity: string; file: File }>(async (payload) => {
    const form = new FormData();
    form.append('file', payload.file);
    // depending on backend route we call /imports/:entity or specific routes
    const res = await apiClient.post(`/imports/${payload.entity}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  });

  const validate = useMutation<any, any, { entity: string; file: File }>(async (payload) => {
    const form = new FormData();
    form.append('file', payload.file);
    const res = await apiClient.post(`/imports/${payload.entity}/validate`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  });

  const template = useMutation<any, any, string>(async (entity) => {
    const res = await apiClient.get(`/imports/templates/${entity}`);
    return res.data;
  });

  return { upload, validate, template };
};
