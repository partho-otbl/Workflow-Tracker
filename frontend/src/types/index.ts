export interface Diagram {
  id: number;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiagramDto {
  name: string;
  content: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
}

export interface User {
  username: string;
  email: string;
}

export interface Cursor {
  x: number;
  y: number;
}

export interface Presence {
  username: string;
  cursor: Cursor | null;
  color: string;
}
