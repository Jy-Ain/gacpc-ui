import { Article, getArticles } from '../api/articles';
import { Activite, getActivites } from '../api/activites';
import { getChercheurs } from '../api/chercheurs';

// --- Interfaces pour la structure du graphique ---
export interface AnnualBreakdown {
    year: number;
    articles: number; // Publications
    activites: number; // Projets/Activités
}

// --- Fonction d'agrégation ---
/**
 * Récupère les données brutes et les agrège par année pour le graphique d'activité.
 */
export const aggregateAnnualActivity = (
    articlesData: Article[],
    activitesData: Activite[]
): AnnualBreakdown[] => {
    
    const annualMap = new Map<number, { articles: number; activites: number }>();

    // Fonction utilitaire pour incrémenter le compteur
    const incrementCount = (year: number, type: 'articles' | 'activites') => {
        // Validation de l'année pour éviter les années futures ou aberrantes
        if (year > 1900 && year <= new Date().getFullYear() + 1) { 
            if (!annualMap.has(year)) {
                annualMap.set(year, { articles: 0, activites: 0 });
            }
            const current = annualMap.get(year)!;
            current[type]++;
            annualMap.set(year, current);
        }
    };

    // 1. Agrégation des ARTICLES (par date_enregistrement)
    articlesData.forEach(article => {
        if (article.date_enregistrement) {
            const date = new Date(article.date_enregistrement);
            const year = date.getFullYear();
            incrementCount(year, 'articles');
        }
    });

    // 2. Agrégation des ACTIVITÉS (par annee)
    activitesData.forEach(activite => {
        // La colonne 'annee' est supposée être un nombre
        if (typeof activite.annee === 'number') {
            incrementCount(activite.annee, 'activites'); 
        }
    });

    // 3. Transformation du Map en tableau trié
    const annualArray: AnnualBreakdown[] = Array.from(annualMap.entries()).map(([year, data]) => ({
        year,
        ...data,
    })).sort((a, b) => a.year - b.year);

    return annualArray;
};


/**
 * Fonction principale pour récupérer et préparer toutes les données du dashboard.
 */
export const fetchDashboardData = async () => {
    // 1. Récupère toutes les données de l'API en parallèle
    const [chercheursData, articlesData, activitesData] = await Promise.all([
        getChercheurs(),
        getArticles(),
        getActivites(),
    ]);

    // 2. Calcule les statistiques simples
    const totalPublications = articlesData.length;
    const totalChercheurs = chercheursData.length;
    const projetsEnCours = activitesData.filter(act => act.type_activites === 'PR').length;

    // 3. Agrège les données pour le graphique annuel
    const annualActivity = aggregateAnnualActivity(articlesData, activitesData);

    return {
        totalPublications,
        totalChercheurs,
        projetsEnCours,
        annualActivity,
    };
};