// src/templates/articleListTemplate.ts
import { Article } from '../api/articles';
// Importez le type Chercheur si vous avez besoin d'afficher le nom de l'auteur principal
import { Chercheur } from '../api/chercheurs'; 

// Définition d'un type enrichi si nécessaire, sinon utilisez Article[]
interface ArticleListItem extends Article {
    // Si vous enrichissez les données, vous pouvez ajouter l'auteur principal ici
    chercheurPrincipal?: Chercheur;
}

export const getArticleListHtml = (articles: ArticleListItem[], title: string = "Rapport des Articles"): string => {
    // IMPORTANT : Remplacez par votre logo encodé en Base64
    const logoBase64 = 'data:image/png;base64,...'; 
    const dateGenerated = new Date().toLocaleDateString();

    const tableRows = articles.map(article => `
        <tr>
            <td>${article.id || 'N/A'}</td>
            <td>${article.titre || 'Titre inconnu'}</td>
            <td>${article.type_article || 'N/A'}</td>
            <td>${article.annee || 'N/A'}</td>
            <td>${article.id_chercheur || 'N/A'}</td>
        </tr>
    `).join('');

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
            h2 { color: #333; font-size: 24px; margin-bottom: 20px; border-bottom: 2px solid #EEE; padding-bottom: 5px; }
            .metadata { color: #666; font-size: 14px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 14px; }
            th { background-color: #FFC107; color: #1E1E1E; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            tr:hover { background-color: #f0f0f0; }
            .footer { background-color: #1E1E1E; color: #ffffff; text-align: center; padding: 15px 0; font-size: 12px; margin-top: 40px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="${logoBase64}" alt="Logo" class="logo" />
                <h1 class="title">${title}</h1>
            </div>
            <div class="content">
                <h2>Liste des Articles (${articles.length})</h2>
                <p class="metadata">Généré le: ${dateGenerated}</p>

                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Titre</th>
                            <th>Type</th>
                            <th>Année</th>
                            <th>ID Chercheur</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
            <div class="footer">
                Rapport généré par l'application CIDST.
            </div>
        </div>
    </body>
    </html>
    `;
};