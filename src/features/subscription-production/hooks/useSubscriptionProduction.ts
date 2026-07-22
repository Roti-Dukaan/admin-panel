import { useState, useEffect, useCallback } from 'react';
import {
  subscriptionProductionApi,
  type SubscriptionProductionItem,
  type ProductionSummary,
  type DaySummary,
  type CookingSheet,
  type ProductionQueryParams,
  type ProductionUpcomingItem,
  type UpdateProductionStatusDto,
} from '@/lib/api/subscription-production.api';

interface UseAdminProductionOptions {
  initialFilters?: ProductionQueryParams;
}

export function useAdminProduction(options?: UseAdminProductionOptions) {
  const [items, setItems] = useState<SubscriptionProductionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<ProductionQueryParams>(options?.initialFilters ?? {});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await subscriptionProductionApi.adminList(filters);
      if (res.success) {
        setItems(res.data.items);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadData(); }, [loadData]);

  return { items, loading, total, totalPages, filters, setFilters, refresh: loadData };
}

export function useAdminToday() {
  const [summary, setSummary] = useState<DaySummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await subscriptionProductionApi.adminToday();
      if (res.success) setSummary(res.data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return { summary, loading, refresh: loadData };
}

export function useAdminTomorrow() {
  const [summary, setSummary] = useState<DaySummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await subscriptionProductionApi.adminTomorrow();
      if (res.success) setSummary(res.data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return { summary, loading, refresh: loadData };
}

export function useAdminSummary(date: string) {
  const [summary, setSummary] = useState<DaySummary | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!date) return;
    setLoading(true);
    try {
      const res = await subscriptionProductionApi.adminSummary(date);
      if (res.success) setSummary(res.data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { loadData(); }, [loadData]);

  return { summary, loading, refresh: loadData };
}

export function useAdminBranchProduction(branchId: string, date?: string, slot?: string) {
  const [items, setItems] = useState<SubscriptionProductionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    try {
      const res = await subscriptionProductionApi.adminBranch(branchId, date, slot);
      if (res.success) setItems(res.data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [branchId, date, slot]);

  useEffect(() => { loadData(); }, [loadData]);

  return { items, loading, refresh: loadData };
}

export function useAdminCookingSheet(branchId: string, date: string, slot?: string) {
  const [sheet, setSheet] = useState<CookingSheet | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!branchId || !date) return;
    setLoading(true);
    try {
      const res = await subscriptionProductionApi.adminCookingSheet(branchId, date, slot);
      if (res.success) setSheet(res.data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [branchId, date, slot]);

  useEffect(() => { loadData(); }, [loadData]);

  return { sheet, loading, refresh: loadData };
}

export function useAdminUpdateStatus() {
  const [updating, setUpdating] = useState<string | null>(null);

  const update = async (id: string, dto: UpdateProductionStatusDto) => {
    setUpdating(id);
    try {
      const res = await subscriptionProductionApi.adminUpdateStatus(id, dto);
      return res.success ? res.data : null;
    } finally {
      setUpdating(null);
    }
  };

  return { update, updating };
}

export function useAdminGenerate() {
  const [generating, setGenerating] = useState(false);

  const generate = async (date: string) => {
    setGenerating(true);
    try {
      const res = await subscriptionProductionApi.adminGenerate(date);
      return res.success ? res.data : null;
    } finally {
      setGenerating(false);
    }
  };

  return { generate, generating };
}

export function useManagerProduction() {
  const [items, setItems] = useState<SubscriptionProductionItem[]>([]);
  const [summary, setSummary] = useState<DaySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductionQueryParams>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, summaryRes] = await Promise.all([
        subscriptionProductionApi.managerList(filters.date, filters.deliverySlot),
        subscriptionProductionApi.managerSummary(filters.date).catch(() => null),
      ]);
      if (listRes.success) setItems(listRes.data);
      if (summaryRes?.success) setSummary(summaryRes.data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadData(); }, [loadData]);

  return { items, summary, loading, filters, setFilters, refresh: loadData };
}

export function useManagerCookingSheet(date?: string, slot?: string) {
  const [sheet, setSheet] = useState<CookingSheet | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!date) return;
    setLoading(true);
    try {
      const res = await subscriptionProductionApi.managerCookingSheet(date, slot);
      if (res.success) setSheet(res.data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [date, slot]);

  useEffect(() => { loadData(); }, [loadData]);

  return { sheet, loading, refresh: loadData };
}

export function useManagerUpdateStatus() {
  const [updating, setUpdating] = useState<string | null>(null);

  const update = async (id: string, dto: UpdateProductionStatusDto) => {
    setUpdating(id);
    try {
      const res = await subscriptionProductionApi.managerUpdateStatus(id, dto);
      return res.success ? res.data : null;
    } finally {
      setUpdating(null);
    }
  };

  return { update, updating };
}

export function useCustomerUpcoming() {
  const [upcoming, setUpcoming] = useState<ProductionUpcomingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await subscriptionProductionApi.customerUpcoming();
      if (res.success) setUpcoming(res.data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return { upcoming, loading, refresh: loadData };
}