// src/templates/articleDetailTemplate.ts
import { Article } from '../api/articles'; // Assurez-vous d'importer le type Article
import { Chercheur } from '../api/chercheurs';

// TODO: Remplacer AuthorDetails par les vrais types de votre API
interface ArticleWithAuthors extends Article {
    authorsDetails?: Chercheur[]; // Les détails complets des auteurs
    // Si vous prévoyez d'ajouter 'resume' et 'doi' à votre API, décommentez ceci :
    // resume?: string;
    // doi?: string;
}

export const getArticleDetailHtml = (article: ArticleWithAuthors): string => {
    // IMPORTANT : Remplacez par votre logo encodé en Base64
    const logoBase64 = 'data:image/png;base64,...'; 

    const authorsHtml = article.authorsDetails && article.authorsDetails.length > 0
        ? `
        <div class="section">
            <h3>Auteurs</h3>
            <ul>
                ${article.authorsDetails.map(author => `<li>${author.nom} (${author.specialite})</li>`).join('')}
            </ul>
        </div>
        `
        : `<p>Auteurs non spécifiés.</p>`;

    // --- CORRECTION DES ERREURS DE PROPRIÉTÉS MANQUANTES ---
    // Utilisation des propriétés existantes :
    const articleId = article.id || 'N/A';
    const articleDate = article.date_enregistrement ? new Date(article.date_enregistrement).toLocaleDateString() : 'N/A';
    
    // Remplacement du 'resume' par une note générique ou un champ existant si pertinent
    const articleDetails = `ID Enregistrement: ${articleId}. Date: ${articleDate}`;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { width: 8.5in; height: 11in; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 0; box-sizing: border-box; }
            .header { background-color: #1E1E1E; color: #ffffff; padding: 20px 40px; display: flex; align-items: center; justify-content: space-between; border-bottom: 5px solid #FFC107; }
            .header .logo { height: 50px; }
            .header .title { font-size: 28px; font-weight: bold; margin: 0; }
            .content { padding: 30px 40px; }
            .article-title { color: #333; font-size: 32px; font-weight: bold; margin-bottom: 15px; }
            .article-meta { color: #666; font-size: 16px; margin-bottom: 20px; line-height: 1.6; }
            .section { margin-bottom: 25px; }
            .section h3 { color: #FFC107; border-bottom: 2px solid #EEE; padding-bottom: 5px; margin-bottom: 15px; font-size: 20px; }
            ul { list-style: none; padding: 0; margin: 0; }
            ul li { background-color: #f9f9f9; border-left: 3px solid #FFC107; margin-bottom: 10px; padding: 10px 15px; border-radius: 5px; font-size: 15px; color: #444; }
            .footer { background-color: #1E1E1E; color: #ffffff; text-align: center; padding: 15px 0; font-size: 12px; margin-top: 40px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="${logoBase64}" alt="CIDST Logo" class="logo" />
                <h1 class="title">Rapport d'Article</h1>
            </div>
            <div class="content">
                <h2 class="article-title">${article.titre}</h2>
                <p class="article-meta">
                    <strong>Type:</strong> ${article.type_article}<br/>
                    <strong>Année:</strong> ${article.annee}<br/>
                    </p>

                <div class="section">
                    <h3>Détails d'Enregistrement</h3>
                    <p>${articleDetails}</p>
                </div>

                ${authorsHtml}
            </div>
            <div class="footer">
                Généré par l'application CIDST - Date: ${new Date().toLocaleDateString()}
            </div>
        </div>
    </body>
    </html>
    `;
};