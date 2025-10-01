export interface LoginBody {
  userNameOrEmail: string;
  password: string;
}

export interface userBody {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber: string;
  userName: string;
}

export interface SearchBody {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
  search: string;
}
