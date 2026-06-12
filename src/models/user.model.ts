export interface UserResponse {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  createdAt: Date;
}

export interface UpdateUserPayload {
  name?: string;
  username?: string;
}

export interface ListUsersQuery {
  page: number;
  limit: number;
  search?: string;
  role?: string;
  sortBy: string;
  order: string;
}
