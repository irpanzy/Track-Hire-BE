export interface CompanyResponse {
  id: string;
  name: string;
  website: string | null;
  location: string | null;
}

export interface ApplicationHistoryResponse {
  id: string;
  oldStatus: string | null;
  newStatus: string;
  notes: string | null;
  createdAt: Date;
}

export interface ApplicationResponse {
  id: string;
  position: string;
  jobType: string;
  location: string | null;
  source: string;
  sourceUrl: string | null;
  description: string | null;
  requirements: string | null;
  salaryRange: string | null;
  status: string;
  appliedDate: Date;
  deadlineDate: Date | null;
  notes: string | null;
  createdAt: Date;
  company: CompanyResponse;
}

export interface ApplicationDetailResponse extends ApplicationResponse {
  histories: ApplicationHistoryResponse[];
}

export interface ListApplicationsQuery {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  source?: string;
  jobType?: string;
  sortBy: string;
  order: string;
}
