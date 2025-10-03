import axios from 'axios';
import { API_BASE_URL } from '@env';

const API = axios.create({
  baseURL: API_BASE_URL,
});

export interface Article {
  id: number;
  type_article: string;
  annee: string;
  titre: string;
  id_chercheur: string;
  date_enregistrement: string;
}

export type CreateArticleRequestData = Omit<Article, 'id'>;

export type UpdateArticleRequestData = Partial<CreateArticleRequestData>;

export const getArticles = async (): Promise<Article[]> => {
  try {
    const response = await API.get('/articles');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error);
    throw error;
  }
};

export const getArticleById = async (id: number): Promise<Article> => {
  try {
    const response = await API.get(`/articles/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'article avec l'ID ${id}:`, error);
    throw error;
  }
};

export const createArticle = async (data: CreateArticleRequestData): Promise<Article> => {
  try {
    const response = await API.post('/articles', data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de l\'article:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Backend Error Response Data:', error.response.data);
      console.error('Backend Error Status:', error.response.status);
    }
    throw error;
  }
};

export const updateArticle = async (id: number, data: UpdateArticleRequestData): Promise<Article> => {
  try {
    const response = await API.put(`/articles/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'article avec l'ID ${id}:`, error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Backend Error Response Data:', error.response.data);
      console.error('Backend Error Status:', error.response.status);
    }
    throw error;
  }
};

export const deleteArticle = async (id: number): Promise<void> => {
  try {
    await API.delete(`/articles/${id}`);
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'article avec l'ID ${id}:`, error);
    throw error;
  }
};

export const getPublicationsByChercheurId = async (chercheurId: number | string): Promise<Article[]> => {
  try {
    const response = await API.get(`/articles?id_chercheur=${chercheurId}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des publications du chercheur ${chercheurId}:`, error);
    throw error;
  }
};
