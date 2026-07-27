import type { AssignableStaff } from "./delivery-boys";

export interface AssigneeSelectProps {
  value: string;
  onChange: (value: string) => void;
  staff: AssignableStaff[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}
