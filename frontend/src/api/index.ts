import axios from 'axios';
import type { Diagram, CreateDiagramDto, LoginRequest, RegisterRequest, AuthResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor for attaching JWT Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API Calls
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

// Diagram API Calls
export const getDiagrams = async (): Promise<Diagram[]> => {
  const response = await api.get('/diagrams');
  return response.data;
};

export const getDiagramById = async (id: number): Promise<Diagram> => {
  const response = await api.get(`/diagrams/${id}`);
  return response.data;
};

export const createDiagram = async (diagram: CreateDiagramDto): Promise<Diagram> => {
  const response = await api.post('/diagrams', diagram);
  return response.data;
};

export const updateDiagram = async (id: number, diagram: Partial<Diagram>): Promise<Diagram> => {
  const response = await api.put(`/diagrams/${id}`, diagram);
  return response.data;
};

export const deleteDiagram = async (id: number): Promise<void> => {
  await api.delete(`/diagrams/${id}`);
};
