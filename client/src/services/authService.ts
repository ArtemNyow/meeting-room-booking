import { api } from "@/lib/api";

export type User = {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type GetMeResponse = {
  user: User;
};

export type LoginData = {
  email: string;
  password: string;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", data);

  return response.data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/register", data);

  return response.data;
};

export const getMe = async (): Promise<GetMeResponse> => {
  const response = await api.get<GetMeResponse>("/auth/me");

  return response.data;
};
