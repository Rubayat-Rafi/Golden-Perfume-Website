import { create } from 'zustand';
import { api } from '../lib/api';

const useAdminStore = create((set) => ({
  pendingOrders:       0,
  pendingApplications: 0,
  unreadMessages:      0,

  fetchBadges: async () => {
    try {
      const res = await api.get('/admin/stats');
      const kpis = res?.data?.kpis ?? {};
      set({
        pendingOrders:       kpis.pendingOrders       ?? 0,
        pendingApplications: kpis.pendingApplications ?? 0,
        unreadMessages:      kpis.unreadMessages       ?? 0,
      });
    } catch {
      // silently ignore — badges just won't update
    }
  },
}));

export default useAdminStore;
