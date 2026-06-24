import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://amu-fasor.local';
const BASE_URL = `${API_URL}/admin/fasilitas`;

export const adminService = {
  getDashboardData: async (type?: string, value?: string) => {
    const res = await axios.get(`${BASE_URL}/reservasi`, {
      params: { type, value }
    });
    return res.data;
  },
  getReservasiDetail: async (code: string) => {
    const res = await axios.get(`${BASE_URL}/reservasi/${code}`);
    return res.data;
  },
  approveReservasi: async (code: string) => {
    const res = await axios.post(`${BASE_URL}/reservasi/${code}/approve`);
    return res.data;
  },
  confirmReservasi: async (code: string) => {
    const res = await axios.post(`${BASE_URL}/reservasi/${code}/confirm`);
    return res.data;
  },
  cancelReservasi: async (code: string) => {
    const res = await axios.post(`${BASE_URL}/reservasi/${code}/cancel`);
    return res.data;
  },
  rescheduleReservasi: async (id_reservasi: string, payload: any) => {
    const res = await axios.post(`${BASE_URL}/reservasi/${id_reservasi}/reschedule`, payload);
    return res.data;
  },

  getTarif: async () => {
    const res = await axios.get(`${BASE_URL}/tarif`);
    return res.data;
  },
  createTarif: async (payload: any) => {
    const res = await axios.post(`${BASE_URL}/tarif`, payload);
    return res.data;
  },
  updateTarif: async (id: string, payload: any) => {
    const res = await axios.put(`${BASE_URL}/tarif/${id}`, payload);
    return res.data;
  },
  deleteTarif: async (id: string) => {
    const res = await axios.delete(`${BASE_URL}/tarif/${id}`);
    return res.data;
  },

  getFasilitas: async () => {
    const res = await axios.get(`${BASE_URL}/fasilitas`);
    return res.data;
  },
  createFasilitas: async (payload: any) => {
    const res = await axios.post(`${BASE_URL}/fasilitas`, payload);
    return res.data;
  },
  deleteFasilitas: async (id: string) => {
    const res = await axios.delete(`${BASE_URL}/fasilitas/${id}`);
    return res.data;
  },
  getRescheduleRequests: async () => {
    const res = await axios.get(`${BASE_URL}/reschedule-requests`);
    return res.data;
  },
  handleRescheduleRequest: async (bookingCode: string, action: 'approve' | 'reject') => {
    const res = await axios.post(`${BASE_URL}/reschedule-requests/${bookingCode}/action`, { action });
    return res.data;
  }
};
