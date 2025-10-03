// src/templates/activiteDetailTemplate.ts
import { Activite } from '../api/activites';

// Vous pouvez enrichir l'Activité avec le nom de l'auteur principal
interface ActiviteDetail extends Activite {
    nomChercheur: string;
    institutionChercheur?: string; // Si disponible
}

export const getActiviteDetailHtml = (activite: ActiviteDetail, isReport = true): string => {
    // IMPORTANT : Remplacez par votre logo encodé en Base64
    // NOTE: Ceci doit être une chaîne de caractères Base64 valide pour que le logo s'affiche dans le PDF.
    const logoBase64 = 'data:image/png;base64,...'; 
    const dateGenerated = new Date().toLocaleDateString();
    

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { width: 8.5in; height: 11in; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 0; box-sizing: border-box; }
            /* Utilisation d'une couleur d'accent bleue pour l'activité */
            .header { background-color: ${isReport ? '#1E1E1E' : '#2196F3'}; color: #ffffff; padding: 20px 40px; display: flex; align-items: center; justify-content: space-between; border-bottom: 5px solid #2196F3; }
            .header .logo { height: 50px; }
            .header .title { font-size: 28px; font-weight: bold; margin: 0; }
            .content { padding: 30px 40px; }
            h2 { color: #333; font-size: 24px; margin-bottom: 20px; border-bottom: 2px solid #EEE; padding-bottom: 5px; }
            .section-title { color: #2196F3; font-size: 18px; font-weight: bold; margin-top: 25px; margin-bottom: 10px; border-left: 4px solid #2196F3; padding-left: 10px; }
            .info-box { background-color: #f7f7f7; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #eee; }
            .info-item { margin-bottom: 8px; font-size: 15px; }
            .info-label { font-weight: bold; color: #555; display: inline-block; width: 150px; }
            .info-value { color: #333; }
            .description-content { line-height: 1.6; color: #444; }
            .footer { background-color: #1E1E1E; color: #ffffff; text-align: center; padding: 15px 0; font-size: 12px; margin-top: 40px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="${logoBase64}" alt="Logo" class="logo" />
                <h1 class="title">Rapport d'Activité de Recherche</h1>
            </div>
            <div class="content">
                <h2>${activite.intitule || 'Détails de l\'Activité'}</h2>

                <div class="section-title">Informations Générales</div>
                <div class="info-box">
                    <div class="info-item"><span class="info-label">ID :</span> <span class="info-value">${activite.ID || 'N/A'}</span></div>
                    <div class="info-item"><span class="info-label">Type :</span> <span class="info-value">${activite.type_activites || 'N/A'}</span></div>
                    <div class="info-item"><span class="info-label">Année :</span> <span class="info-value">${activite.annee || 'N/A'}</span></div>
                    <div class="info-item"><span class="info-label">Thématique :</span> <span class="info-value">${activite.thematique || 'N/A'}</span></div>
                    <div class="info-item"><span class="info-label">Département :</span> <span class="info-value">${activite.departement || 'N/A'}</span></div>
                </div>
                
                <div class="section-title">Chercheur Responsable</div>
                <div class="info-box">
                    <div class="info-item"><span class="info-label">Chercheur ID :</span> <span class="info-value">${activite.id_chercheur || 'N/A'}</span></div>
                    <div class="info-item"><span class="info-label">Nom :</span> <span class="info-value">${activite.nomChercheur || 'Inconnu'}</span></div>
                    ${activite.institutionChercheur ? `<div class="info-item"><span class="info-label">Institution :</span> <span class="info-value">${activite.institutionChercheur}</span></div>` : ''}
                </div>

                <div class="section-title">Description</div>
                <p style="margin-top: 30px; font-size: 13px; color: #888;">Ce rapport a été généré le: ${dateGenerated}</p>
            </div>
            <div class="footer">
                Rapport d'activité généré par l'application CIDST.
            </div>
        </div>
    </body>
    </html>
    `;
};