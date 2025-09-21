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

export const getPartenaires = async (): Promise<Partenaire[]> => {
  try {
    const response = await axios.get<Partenaire[]>(`${API_BASE_URL}/partenaires`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des partenaires:', error);
    throw error;
  }
};