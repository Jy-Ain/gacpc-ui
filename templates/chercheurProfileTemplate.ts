// src/templates/chercheurProfileTemplate.ts
import { Chercheur } from '../api/chercheurs';
import { Article } from '../api/articles';
import { Activite } from '../api/activites';
import { Institution } from '../api/institutions';

// TODO: Assurez-vous d'ajouter 'description?: string;' à votre type Chercheur dans '../api/chercheurs'
interface ChercheurWithDetails extends Chercheur {
    institution?: Institution; 
    publications?: Article[];
    activites?: Activite[];
}

export const getChercheurProfileHtml = (chercheur: ChercheurWithDetails): string => {
    // URL du logo du CIDST (soit une URL web, soit un base64)
    const logoBase64 = 'data:image/png;base64,...'; 
    const defaultPhoto = 'https://img.freepik.com/vecteurs-libre/cercle-bleu-utilisateur-blanc_78370-4707.jpg';

    const publicationsHtml = chercheur.publications && chercheur.publications.length > 0
        ? `
        <h3>Publications</h3>
        <ul>
            ${chercheur.publications.map(pub => `
                <li>
                    <strong>${pub.titre}</strong> (${pub.annee})<br/>
                    <em>Type: ${pub.type_article}</em>
                </li>
            `).join('')}
        </ul>
        `
        : '<p>Aucune publication répertoriée.</p>';

    const activitesHtml = chercheur.activites && chercheur.activites.length > 0
        ? `
        <h3>Activités de Recherche</h3>
        <ul>
            ${chercheur.activites.map(act => `
                <li>
                    <strong>${act.intitule}</strong> (${act.annee})<br/>
                    <em>Thématique: ${act.thematique}</em>
                </li>
            `).join('')}
        </ul>
        `
        : '<p>Aucune activité répertoriée.</p>';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { width: 8.5in; height: 11in; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 0; box-sizing: border-box; }
            .header { background-color: #1E1E1E; color: #ffffff; padding: 20px 40px; display: flex; align-items: center; justify-content: space-between; border-bottom: 5px solid #2196F3; }
            .header .logo { height: 50px; }
            .header .title { font-size: 28px; font-weight: bold; margin: 0; }
            .content { padding: 30px 40px; }
            .chercheur-header { display: flex; align-items: center; margin-bottom: 30px; }
            .chercheur-photo { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin-right: 30px; border: 3px solid #2196F3; }
            .chercheur-info h1 { margin: 0 0 5px 0; color: #333; font-size: 28px; }
            .chercheur-info p { margin: 0; color: #666; font-size: 16px; line-height: 1.5; }
            .section { margin-bottom: 25px; }
            .section h3 { color: #2196F3; border-bottom: 2px solid #EEE; padding-bottom: 5px; margin-bottom: 15px; font-size: 20px; }
            ul { list-style: none; padding: 0; margin: 0; }
            ul li { background-color: #f9f9f9; border-left: 3px solid #2196F3; margin-bottom: 10px; padding: 10px 15px; border-radius: 5px; font-size: 15px; color: #444; }
            .footer { background-color: #1E1E1E; color: #ffffff; text-align: center; padding: 15px 0; font-size: 12px; margin-top: 40px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="${logoBase64}" alt="CIDST Logo" class="logo" />
                <h1 class="title">Rapport de Profil Chercheur</h1>
            </div>
            <div class="content">
                <div class="chercheur-header">
                    <img src="${chercheur.photo || defaultPhoto}" alt="Photo de ${chercheur.nom}" class="chercheur-photo" />
                    <div class="chercheur-info">
                        <h1>${chercheur.nom}</h1>
                        <p><strong>Spécialité:</strong> ${chercheur.specialite}</p>
                        <p><strong>Institution:</strong> ${chercheur.institution?.nom || 'N/A'}</p>
                        <p><strong>Email:</strong> ${chercheur.adresse_mail}</p>
                        <p><strong>Matricule:</strong> ${chercheur.matricule || 'N/A'}</p>
                    </div>
                </div>

                <div class="section">
                    <h3>Spécialité / Résumé</h3>
                    <p>${chercheur.specialite || 'Aucune spécialité spécifiée.'}</p>
                </div>

                <div class="section">
                    ${publicationsHtml}
                </div>

                <div class="section">
                    ${activitesHtml}
                </div>
            </div>
            <div class="footer">
                Généré par l'application CIDST - Date: ${new Date().toLocaleDateString()}
            </div>
        </div>
    </body>
    </html>
    `;
};