export interface IAdmin {
  id: string;
  fullName: string;
  status: string;
  profileImage: string | null;
  email: string;
  createdAt: string;
}

export interface IOrganization {
  id: string;
  status: string;
  billingName: string;
  billingEmail: string;
  maxUsers: number;
  plan: string;
  type: string;
  createdAt: string;
  companyName?: string;
  slug?: string;
}
