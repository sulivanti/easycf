/**
 * @contract UX-DASH-001
 * React Query hooks for dashboard API endpoints.
 */

import { useQuery } from '@tanstack/react-query';
import { apiRequest, type ApiError } from '../api/api-client';

// ── Types ──

interface DashboardMetrics {
  active_cases: number;
  pending_approvals: number;
  active_users: number;
  active_agents: number;
}

interface StatusDistributionItem {
  label: string;
  value: number;
  color: string;
}

interface StatusDistributionResponse {
  data: StatusDistributionItem[];
  total: number;
}

interface ActivityItem {
  id: string;
  dot_color: string;
  actor: string;
  description: string;
  badge?: { code: string; variant?: string };
  timestamp: string;
}

interface ActivitiesResponse {
  data: ActivityItem[];
}

// ── Hooks ──

export function useDashboardMetrics() {
  return useQuery<DashboardMetrics, ApiError>({
    queryKey: ['dashboard', 'metrics'],
    queryFn: async () => {
      const { data } = await apiRequest<DashboardMetrics>({
        method: 'GET',
        path: '/dashboard/metrics',
      });
      return data;
    },
    staleTime: 30_000,
  });
}

export function useDashboardDistribution() {
  return useQuery<StatusDistributionResponse, ApiError>({
    queryKey: ['dashboard', 'distribution'],
    queryFn: async () => {
      const { data } = await apiRequest<StatusDistributionResponse>({
        method: 'GET',
        path: '/dashboard/status-distribution',
      });
      return data;
    },
    staleTime: 60_000,
  });
}

export function useDashboardActivities() {
  return useQuery<ActivitiesResponse, ApiError>({
    queryKey: ['dashboard', 'activities'],
    queryFn: async () => {
      const { data } = await apiRequest<ActivitiesResponse>({
        method: 'GET',
        path: '/dashboard/activities',
      });
      return data;
    },
    staleTime: 15_000,
  });
}

export type {
  DashboardMetrics,
  StatusDistributionItem,
  StatusDistributionResponse,
  ActivityItem,
  ActivitiesResponse,
};
