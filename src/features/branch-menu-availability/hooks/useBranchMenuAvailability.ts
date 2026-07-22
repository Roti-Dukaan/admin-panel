import { useState, useEffect, useCallback } from 'react';
import { branchMenuAvailabilityApi, type BranchMenuAvailabilityItem, type BranchMenuSummary, type AvailabilityFilterParams } from '@/lib/api/branch-menu-availability.api';

interface UseBranchMenuAvailabilityOptions {
  initialFilters?: AvailabilityFilterParams;
}

export function useAdminAvailability(options?: UseBranchMenuAvailabilityOptions) {
  const [items, setItems] = useState<BranchMenuAvailabilityItem[]>([]);
  const [summaries, setSummaries] = useState<BranchMenuSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<AvailabilityFilterParams>(options?.initialFilters ?? {});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, summaryRes] = await Promise.all([
        branchMenuAvailabilityApi.adminList(filters),
        branchMenuAvailabilityApi.adminSummary().catch(() => null),
      ]);
      if (listRes.success) {
        setItems(listRes.data.items);
        setTotal(listRes.data.total);
        setTotalPages(listRes.data.totalPages);
      }
      if (summaryRes?.success) {
        setSummaries(summaryRes.data);
      }
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadData(); }, [loadData]);

  return { items, summaries, loading, total, totalPages, filters, setFilters, refresh: loadData };
}

export function useAdminBranchAvailability(branchId: string) {
  const [items, setItems] = useState<BranchMenuAvailabilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AvailabilityFilterParams>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await branchMenuAvailabilityApi.adminBranchList(branchId, filters);
      if (res.success) setItems(res.data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [branchId, filters]);

  useEffect(() => { loadData(); }, [loadData]);

  return { items, loading, filters, setFilters, refresh: loadData };
}

export function useManagerAvailability() {
  const [items, setItems] = useState<BranchMenuAvailabilityItem[]>([]);
  const [summary, setSummary] = useState<BranchMenuSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, summaryRes] = await Promise.all([
        branchMenuAvailabilityApi.managerList(),
        branchMenuAvailabilityApi.managerSummary().catch(() => null),
      ]);
      if (listRes.success) setItems(listRes.data);
      if (summaryRes?.success) setSummary(summaryRes.data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return { items, summary, loading, refresh: loadData };
}
