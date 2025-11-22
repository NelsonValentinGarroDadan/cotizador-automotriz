export type FilterType =
  | 'text'
  | 'select'
  | 'date'
  | 'number'
  | 'multiselect'
  | 'selectSearch';

export interface FilterConfig {
  name: string;
  type: FilterType;
  label: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  multiple?: boolean;
  loadOptions?: (search: string) => Promise<{ value: string; label: string }[]>;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable:boolean;
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, row: any) => React.ReactNode;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}
