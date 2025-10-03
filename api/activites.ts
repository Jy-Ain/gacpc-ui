import axios from 'axios';
import { API_BASE_URL } from '@env';

const API = axios.create({
  baseURL: API_BASE_URL,
});

export interface Activite {
  ID: number;
  type_activites: string;
  annee: number;
  duree: string;
  intitule: string;
  id_institution: number;
  departement: string;
  id_chercheur: number;
  thematique: string;
  objectifs_global: string;
  id_partenaires: number;
}

export type CreateActiviteRequestData = Omit<Activite, 'ID'>;

export type UpdateActiviteRequestData = Partial<CreateActiviteRequestData>;

export const getActivites = async (): Promise<Activite[]> => {
  try {
    const response = await API.get('/activites');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des activités:', error);
    throw error;
  }
};

export const getActiviteById = async (id: number): Promise<Activite> => {
  try {
    const response = await API.get(`/activites/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'activité avec l'ID ${id}:`, error);
    throw error;
  }
};

export const createActivite = async (data: CreateActiviteRequestData): Promise<Activite> => {
  try {
    const response = await API.post('/activites', data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de l\'activité:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Backend Error Response Data:', error.response.data);
      console.error('Backend Error Status:', error.response.status);
    }
    throw error;
  }
};

export const updateActivite = async (id: number, data: UpdateActiviteRequestData): Promise<Activite> => {
  try {
    const response = await API.put(`/activites/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'activité avec l'ID ${id}:`, error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Backend Error Response Data:', error.response.data);
      console.error('Backend Error Status:', error.response.status);
    }
    throw error;
  }
};

export const deleteActivite = async (id: number): Promise<void> => {
  try {
    await API.delete(`/activites/${id}`);
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'activité avec l'ID ${id}:`, error);
    throw error;
  }
};

export const getActivitesByChercheurId = async (chercheurId: number | string): Promise<Activite[]> => {
  try {
    const response = await API.get(`/activites?id_chercheur=${chercheurId}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des activités du chercheur ${chercheurId}:`, error);
    throw error;
  }
};