import axios from 'axios';
import { API_BASE_URL } from '@env'; 

export interface Institution {
  idPrimaire: number;
  nom: string;
  statut: string;
  annee_de_creation: string;
  sigle: string;
  id_text: number;
  responsable: string;
  fonction: string;
  domaines: string;
  adresse: string;
  telephone: string;
  email: string;
  site_web: string;
  id_historique: number;
}

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Fonction pour récupérer toutes les institutions
export const getInstitutions = async (): Promise<Institution[]> => {
  try {
    const response = await API.get('/institutions');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des institutions:', error);
    throw error;
  }
};

// Fonction pour récupérer une institution par son ID Primaire
export const getInstitutionById = async (idPrimaire: number): Promise<Institution> => {
  try {
    const response = await API.get(`/institutions/${idPrimaire}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'institution avec l'ID ${idPrimaire}:`, error);
    throw error;
  }
};

// Vous pouvez ajouter d'autres fonctions CRUD si nécessaire (create, update, delete)
// Pour la création, l'ID serait généré par le backend, donc on omet 'idPrimaire'
export type CreateInstitutionData = Omit<Institution, 'idPrimaire'>;

export const createInstitution = async (
  institutionData: CreateInstitutionData
): Promise<Institution> => {
  try {
    const response = await API.post('/institutions', institutionData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de l\'institution:', error);
    throw error;
  }
};

export const updateInstitution = async (
  idPrimaire: number,
  institutionData: Partial<CreateInstitutionData>
): Promise<Institution> => {
  try {
    const response = await API.put(`/institutions/${idPrimaire}`, institutionData);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'institution avec l'ID ${idPrimaire}:`, error);
    throw error;
  }
};

export const deleteInstitution = async (idPrimaire: number): Promise<void> => {
  try {
    await API.delete(`/institutions/${idPrimaire}`);
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'institution avec l'ID ${idPrimaire}:`, error);
    throw error;
  }
};