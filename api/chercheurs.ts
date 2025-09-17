import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

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

export const getChercheurs = async (): Promise<Chercheur[]> => {
  try {
    const response = await axios.get<Chercheur[]>(`${API_BASE_URL}/chercheurs`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des chercheurs:', error);
    throw error;
  }
};


export const getChercheurById = async (id: number): Promise<Chercheur> => {
    try {
      const response = await axios.get<Chercheur>(`${API_BASE_URL}/chercheurs/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du chercheur avec l'ID ${id}:`, error);
      throw error;
    }
  };