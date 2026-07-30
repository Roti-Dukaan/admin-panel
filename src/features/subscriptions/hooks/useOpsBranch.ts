import { create } from "zustand";

interface OpsBranchState {
  selectedBranchId: string | null;
  setSelectedBranchId: (id: string | null) => void;
}

export const useOpsBranchStore = create<OpsBranchState>((set) => ({
  selectedBranchId: null,
  setSelectedBranchId: (id) => set({ selectedBranchId: id }),
}));
