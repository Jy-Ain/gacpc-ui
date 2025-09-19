import axios from 'axios';
import { API_BASE_URL } from '@env';

export interface Article {
  id: number;
  type_article: string;
  annee: string;
  titre: string;
  id_chercheur: string;
  date_enregistrement: string;
}

export const getArticles = async (): Promise<Article[]> => {
  try {
    const response = await axios.get<Article[]>(`${API_BASE_URL}/articles`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error);
    throw error;
  }
};