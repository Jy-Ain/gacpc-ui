import axios from 'axios';
import { API_BASE_URL } from '@env';


export interface Partenaire {
  id: number;
  nom: string;
  type_partenaires: string;
  annee: string;
  pays_origine: string;
  adresse: string;
  telephone: string;
  email: string;
  domaine: string;
}

// Interface pour les données de création d'un partenaire (sans l'ID)
export type CreatePartenaireData = Omit<Partenaire, 'id'>;

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Fonction pour récupérer tous les partenaires
export const getPartenaires = async (): Promise<Partenaire[]> => {
  try {
    const response = await API.get('/partenaires');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des partenaires:', error);
    throw error;
  }
};

// Fonction pour récupérer un partenaire par son ID
export const getPartenaireById = async (id: number): Promise<Partenaire> => {
  try {
    const response = await API.get(`/partenaires/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération du partenaire avec l'ID ${id}:`, error);
    throw error;
  }
};

// Fonction pour créer un nouveau partenaire
export const createPartenaire = async (
  partenaireData: CreatePartenaireData
): Promise<Partenaire> => {
  try {
    const response = await API.post('/partenaires', partenaireData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du partenaire:', error);
    throw error;
  }
};

// Fonction pour mettre à jour un partenaire existant
export const updatePartenaire = async (
  id: number,
  partenaireData: Partial<CreatePartenaireData>
): Promise<Partenaire> => {
  try {
    const response = await API.put(`/partenaires/${id}`, partenaireData);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du partenaire avec l'ID ${id}:`, error);
    throw error;
  }
};

// Fonction pour supprimer un partenaire
export const deletePartenaire = async (id: number): Promise<void> => {
  try {
    await API.delete(`/partenaires/${id}`);
  } catch (error) {
    console.error(`Erreur lors de la suppression du partenaire avec l'ID ${id}:`, error);
    throw error;
  }
};