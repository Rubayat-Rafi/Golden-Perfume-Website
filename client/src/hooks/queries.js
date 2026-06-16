import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

const qs = (params) => params ? '?' + new URLSearchParams(params).toString() : '';

// ── Categories ────────────────────────────────────────────────────────────────
export const useCategories = (params) =>
  useQuery({
    queryKey: ['categories', params ?? null],
    queryFn: () => api.get(`/categories${qs(params)}`).then((r) => r.data ?? []),
    staleTime: 1000 * 60 * 5,
  });

// ── Products ──────────────────────────────────────────────────────────────────
export const useProducts = (params) =>
  useQuery({
    queryKey: ['products', params ?? null],
    queryFn: () => api.get(`/products${qs(params)}`).then((r) => r),
    staleTime: 1000 * 60 * 2,
    enabled: params !== null,
  });

export const useProduct = (id) =>
  useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });

export const useSearchProducts = (q) =>
  useQuery({
    queryKey: ['products', 'search', q],
    queryFn: () => api.get(`/products?search=${encodeURIComponent(q)}&limit=8`).then((r) => r.data ?? []),
    staleTime: 30 * 1000,
    enabled: typeof q === 'string' && q.length >= 2,
  });

// ── Banners ───────────────────────────────────────────────────────────────────
export const useBanners = () =>
  useQuery({
    queryKey: ['banners'],
    queryFn: () => api.get('/banners').then((r) => r.data ?? []),
    staleTime: 1000 * 60 * 5,
  });

export const useAllBanners = () =>
  useQuery({
    queryKey: ['banners', 'all'],
    queryFn: () => api.get('/banners/all').then((r) => r.data ?? []),
    staleTime: 1000 * 60 * 2,
  });

// ── Orders ────────────────────────────────────────────────────────────────────
export const useMyOrders = () =>
  useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: () => api.get('/orders/mine?limit=50').then((r) => r.data ?? []),
    staleTime: 1000 * 60,
  });

export const useTrackOrder = (q) =>
  useQuery({
    queryKey: ['orders', 'track', q],
    queryFn: () => api.get(`/orders/track?orderNumber=${encodeURIComponent(q)}`).then((r) => r.data ?? r),
    staleTime: 30 * 1000,
    enabled: !!q,
  });

export const useOrders = (params) =>
  useQuery({
    queryKey: ['orders', params ?? null],
    queryFn: () => api.get(`/orders${qs(params)}`).then((r) => r),
    staleTime: 1000 * 60,
  });

// ── Admin ─────────────────────────────────────────────────────────────────────
export const useAdminStats = () =>
  useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get('/admin/stats').then((r) => r.data ?? r),
    staleTime: 1000 * 60,
  });

export const useAdminUsers = (params) =>
  useQuery({
    queryKey: ['admin', 'users', params ?? null],
    queryFn: () => api.get(`/admin/users${qs(params)}`).then((r) => r),
    staleTime: 1000 * 60,
  });

export const useAdminUser = (id) =>
  useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => api.get(`/admin/users/${id}`).then((r) => r.data ?? r),
    staleTime: 1000 * 60 * 2,
    enabled: !!id,
  });

export const useAdminStaff = (params) =>
  useQuery({
    queryKey: ['admin', 'staff', params ?? null],
    queryFn: () => api.get(`/admin/staff${qs(params)}`).then((r) => r),
    staleTime: 1000 * 60 * 2,
  });

// ── Promos ────────────────────────────────────────────────────────────────────
export const usePromos = () =>
  useQuery({
    queryKey: ['promos'],
    queryFn: () => api.get('/promo').then((r) => r.data ?? []),
    staleTime: 1000 * 60 * 2,
  });

// ── Wholesale ─────────────────────────────────────────────────────────────────
export const useWholesaleApplications = () =>
  useQuery({
    queryKey: ['wholesale', 'applications'],
    queryFn: () => api.get('/wholesale/applications').then((r) => r.data ?? []),
    staleTime: 1000 * 60,
  });

export const useMyWholesaleApplication = (enabled = true) =>
  useQuery({
    queryKey: ['wholesale', 'mine'],
    queryFn: () => api.get('/wholesale/my-application').then((r) => r.data ?? null),
    staleTime: 1000 * 60 * 2,
    enabled,
  });

// ── Reviews ───────────────────────────────────────────────────────────────────
export const useProductReviews = (productId) =>
  useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => api.get(`/reviews/product/${productId}`).then((r) => r.data ?? []),
    staleTime: 1000 * 60 * 2,
    enabled: !!productId,
  });

// ── Contact messages ──────────────────────────────────────────────────────────
export const useContactMessages = (params) =>
  useQuery({
    queryKey: ['contact', params ?? null],
    queryFn: () => api.get(`/contact${qs(params)}`).then((r) => r),
    staleTime: 1000 * 60,
  });
