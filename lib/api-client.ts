// import axios from 'axios';

// const apiClient = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
// });

// // "Interceptor" لإضافة التوكن تلقائياً لكل طلب يخرج من الفرونت إند
// apiClient.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token'); // سنخزن التوكن هنا عند تسجيل الدخول
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default apiClient;

import axios from 'axios';

// استبدل هذا الرابط برابط السيرفر الحقيقي للباك إند
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// إضافة "انترسيبتور" لإرفاق التوكن مع كل طلب بشكل آلي
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;