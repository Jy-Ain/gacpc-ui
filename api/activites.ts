import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

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

export const getActivites = async (): Promise<Activite[]> => {
  try {
    const response = await axios.get<Activite[]>(`${API_BASE_URL}/activites`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des activités:', error);
    throw error;
  }
};