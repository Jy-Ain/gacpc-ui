import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

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