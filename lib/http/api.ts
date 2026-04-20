import type { AxiosRequestConfig } from "axios";
import apiClient from "@/lib/api-client";

export const api = {
	get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
		const response = await apiClient.get<T>(url, config);
		return response.data;
	},
	post: async <T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> => {
		const response = await apiClient.post<T>(url, body, config);
		return response.data;
	},
	put: async <T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> => {
		const response = await apiClient.put<T>(url, body, config);
		return response.data;
	},
	patch: async <T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> => {
		const response = await apiClient.patch<T>(url, body, config);
		return response.data;
	},
	delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
		const response = await apiClient.delete<T>(url, config);
		return response.data;
	},
};


