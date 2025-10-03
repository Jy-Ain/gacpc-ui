// src/templates/chercheurListTemplate.ts
import { Chercheur } from '../api/chercheurs';
import { Institution } from '../api/institutions'; // Pour le nom de l'institution

export const getChercheurListHtml = (chercheurs: Chercheur[], institutions: Institution[], yearRange?: [number, number]): string => {
    const logoBase64 = 'data:image/png;base64,...'; // Votre logo CIDST

    const getInstitutionName = (id: number | undefined) => {
        if (!id) return 'N/A';
        return institutions.find(inst => inst.idPrimaire === id)?.nom || 'N/A';
    };

    const headerText = yearRange ? `Liste des Chercheurs (${yearRange[0]} - ${yearRange[1]})` : 'Liste Complète des Chercheurs';

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
            .report-title { color: #333; font-size: 26px; font-weight: bold; margin-bottom: 20px; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 14px; }
            th { background-color: #f2f2f2; color: #333; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .footer { background-color: #1E1E1E; color: #ffffff; text-align: center; padding: 15px 0; font-size: 12px; margin-top: 40px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="${logoBase64}" alt="CIDST Logo" class="logo" />
                <h1 class="title">Rapport Chercheurs</h1>
            </div>
            <div class="content">
                <h2 class="report-title">${headerText}</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Spécialité</th>
                            <th>Institution</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${chercheurs.map(c => `
                            <tr>
                                <td>${c.nom}</td>
                                <td>${c.specialite}</td>
                                <td>${getInstitutionName(c.id_institution)}</td>
                                <td>${c.adresse_mail}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="footer">
                Généré par l'application CIDST - Date: ${new Date().toLocaleDateString()}
            </div>
        </div>
    </body>
    </html>
    `;
};