import axios from 'axios';
import { API_BASE_URL } from '@env';

export interface Chercheur {
  id: number;
  nom: string;
  photo: string; 
  sexe: string;
  annee_de_naissance: string; 
  lieu_de_naissance: string;
  diplome: string;
  specialite: string;
  id_institution: number;
  date_entre_administration: string; 
  matricule: string;
  adresse_mail: string;
}

export type CreateChercheurRequestData = Omit<Chercheur, 'id'>;

export type UpdateChercheurRequestData = Partial<Omit<Chercheur, 'id'>>;

const API = axios.create({
  baseURL: API_BASE_URL,
});

export const getChercheurs = async (): Promise<Chercheur[]> => {
  try {
    const response = await API.get('/chercheurs');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des chercheurs:', error);
    throw error;
  }
};

export const getChercheurById = async (id: number): Promise<Chercheur> => {
  try {
    const response = await API.get(`/chercheurs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération du chercheur avec l'ID ${id}:`, error);
    throw error;
  }
};

export const createChercheur = async (data: CreateChercheurRequestData): Promise<Chercheur> => {
  try {
    const response = await API.post('/chercheurs', data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du chercheur:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Backend Error Response Data:', error.response.data);
      console.error('Backend Error Status:', error.response.status);
    }
    throw error;
  }
};

export const updateChercheur = async (
  id: number,
  data: UpdateChercheurRequestData
): Promise<Chercheur> => {
  try {
    const response = await API.put(`/chercheurs/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du chercheur avec l'ID ${id}:`, error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Backend Error Response Data:', error.response.data);
      console.error('Backend Error Status:', error.response.status);
    }
    throw error;
  }
};

export const deleteChercheur = async (id: number): Promise<void> => {
  try {
    await API.delete(`/chercheurs/${id}`);
  } catch (error) {
    console.error(`Erreur lors de la suppression du chercheur avec l'ID ${id}:`, error);
    throw error;
  }
};