export type CompanyType = 'MEI' | 'LTDA' | 'SA';

export interface Partner {
  id: string;
  name: string;
  cpf: string;
  share: number;
  isAdmin: boolean;
}

export interface UserPublic {
  id: string;
  email: string;
  companyName: string;
  cnpj: string;
  companyType: CompanyType;
  partners: Partner[];
}

export interface RegisterPayload {
  companyName: string;
  cnpj: string;
  companyType: CompanyType;
  email: string;
  partners: Partner[];
  password: string;
  confirmPassword?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ProfilePayload {
  companyName: string;
  cnpj: string;
  companyType: CompanyType;
  email: string;
  partners: Partner[];
}

export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  user: UserPublic;
}

export interface ApiErrorBody {
  error: string;
}
