export type FilterType = 'text' | 'select' | 'date' | 'number' | 'multiselect';;

export interface FilterConfig {
  name: string;
  type: FilterType;
  label: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  multiple?: boolean;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable:boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, row: any) => React.ReactNode;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}
