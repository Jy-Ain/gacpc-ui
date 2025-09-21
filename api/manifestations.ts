import axios from 'axios';
import { API_BASE_URL } from '@env';

export interface Manifestation {
  id: number;
  theme: string;
  type_manifestations: string;
  intitule: string;
  lieu: string;
  organisateur: string;
  id_partenaires: string; 
}

export const getManifestations = async (): Promise<Manifestation[]> => {
  try {
    const response = await axios.get<Manifestation[]>(`${API_BASE_URL}/manifestations`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des manifestations:', error);
    throw error;
  }
};