import axios from 'axios';
import { API_BASE_URL } from '@env';

const API = axios.create({
  baseURL: API_BASE_URL,
});

export interface Manifestation {
  id: number;
  theme: string;
  type_manifestations: string;
  intitule: string;
  lieu: string;
  organisateur: string;
  id_partenaires: string;
}

export type CreateManifestationRequestData = Omit<Manifestation, 'id'>;

export type UpdateManifestationRequestData = Partial<CreateManifestationRequestData>;

export const getManifestations = async (): Promise<Manifestation[]> => {
  try {
    const response = await API.get('/manifestations');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des manifestations:', error);
    throw error;
  }
};

export const getManifestationById = async (id: number): Promise<Manifestation> => {
  try {
    const response = await API.get(`/manifestations/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de la manifestation avec l'ID ${id}:`, error);
    throw error;
  }
};

export const createManifestation = async (data: CreateManifestationRequestData): Promise<Manifestation> => {
  try {
    const response = await API.post('/manifestations', data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de la manifestation:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Backend Error Response Data:', error.response.data);
      console.error('Backend Error Status:', error.response.status);
    }
    throw error;
  }
};

export const updateManifestation = async (id: number, data: UpdateManifestationRequestData): Promise<Manifestation> => {
  try {
    const response = await API.put(`/manifestations/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la manifestation avec l'ID ${id}:`, error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Backend Error Response Data:', error.response.data);
      console.error('Backend Error Status:', error.response.status);
    }
    throw error;
  }
};

export const deleteManifestation = async (id: number): Promise<void> => {
  try {
    await API.delete(`/manifestations/${id}`);
  } catch (error) {
    console.error(`Erreur lors de la suppression de la manifestation avec l'ID ${id}:`, error);
    throw error;
  }
};