import { generatePDF } from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import Share from 'react-native-share'; // Réintroduction de Share pour le PDF

import { Chercheur } from '../api/chercheurs';
import { Article } from '../api/articles';
import { Activite } from '../api/activites';
import { Partenaire } from '../api/partenaires';

interface GeneratePdfOptions {
    htmlContent: string;
    fileName: string;
}

interface GenerateCsvOptions {
    data: (Chercheur | Article | Activite | Partenaire)[];
    fileName: string;
    headers: string[];
    extractRow: (item: any) => string[];
}

/**
 * Génère un fichier PDF à partir d'un contenu HTML.
 * Le fichier est sauvegardé dans un sous-répertoire 'gacp' du dossier public 'Download' de l'appareil.
 * @param htmlContent Le contenu HTML à convertir.
 * @param fileName Le nom du fichier PDF (sans l'extension .pdf).
 * @returns Le chemin absolu du fichier PDF généré.
 */
export const generatePdf = async ({ htmlContent, fileName }: GeneratePdfOptions): Promise<string> => {
    try {
        const basePublicPath = RNFS.DownloadDirectoryPath;
        const customDirectory = `${basePublicPath}/gacp`;

        const dirExists = await RNFS.exists(customDirectory);
        if (!dirExists) {
            await RNFS.mkdir(customDirectory);
            console.log(`Répertoire créé: ${customDirectory}`);
        } else {
            console.log(`Répertoire existant: ${customDirectory}`);
        }

        // Utilisation de base64: true pour gérer l'écriture du fichier nous-mêmes dans le dossier public
        const tempOptions = {
            html: htmlContent,
            fileName,
            base64: true,
        };

        const result = await generatePDF(tempOptions);

        if (!result.base64) {
            throw new Error("Contenu PDF Base64 introuvable après génération.");
        }

        // Définir le chemin de destination final dans notre dossier personnalisé
        const finalPath = `${customDirectory}/${fileName}.pdf`;

        // Écrire le contenu Base64 dans le chemin final désiré
        await RNFS.writeFile(finalPath, result.base64, 'base64');

        return finalPath;
    } catch (error) {
        console.error('Erreur lors de la génération ou du déplacement du PDF:', error);
        throw new Error('Impossible de générer et de sauvegarder le PDF.');
    }
};

/**
 * Génère un fichier CSV à partir des données fournies.
 * Le fichier est sauvegardé dans un sous-répertoire 'gacp' du dossier public 'Download' de l'appareil
 * pour une accessibilité facile par l'utilisateur.
 * Utilise le point-virgule (;) comme séparateur pour une meilleure compatibilité avec Excel en Europe.
 * @param data Les données à exporter.
 * @param fileName Le nom du fichier CSV (sans l'extension .csv).
 * @param headers Les en-têtes de colonne.
 * @param extractRow Fonction pour mapper un élément de données à une ligne CSV.
 * @returns Le chemin absolu du fichier CSV généré.
 */
export const generateCsv = async ({ data, fileName, headers, extractRow }: GenerateCsvOptions): Promise<string> => {
    // Le séparateur choisi pour les pays utilisant la virgule comme décimale (France, etc.)
    const SEPARATOR = ';';

    try {
        // 1. Définir le chemin du répertoire de destination (identique à generatePdf)
        const basePublicPath = RNFS.DownloadDirectoryPath;
        const customDirectory = `${basePublicPath}/gacp`;

        // 2. Créer le répertoire s'il n'existe pas
        const dirExists = await RNFS.exists(customDirectory);
        if (!dirExists) {
            await RNFS.mkdir(customDirectory);
            console.log(`Répertoire créé pour CSV: ${customDirectory}`);
        }

        // 3. Formatter le contenu CSV
        const csvRows = [
            // Ajout du marqueur UTF-8 (BOM) pour assurer l'affichage correct des accents dans Excel
            '\uFEFF' + headers.join(SEPARATOR),
            ...data.map(item =>
                extractRow(item)
                    // Encapsuler chaque valeur entre guillemets et échapper les guillemets internes
                    // Utilise SEPARATOR pour joindre les valeurs
                    .map(val => `"${String(val).replace(/"/g, '""')}"`)
                    .join(SEPARATOR)
            ),
        ];
        const csvContent = csvRows.join('\n');

        // 4. Définir le chemin de destination final
        const finalPath = `${customDirectory}/${fileName}.csv`;

        // 5. Écrire le contenu CSV dans le chemin final désiré
        await RNFS.writeFile(finalPath, csvContent, 'utf8');

        return finalPath;
    } catch (error) {
        console.error('Erreur lors de la génération ou de la sauvegarde du CSV:', error);
        throw new Error('Impossible de générer et de sauvegarder le CSV dans le dossier /Download/gacp/.');
    }
};

/**
 * Ouvre la boîte de dialogue de partage native de l'OS.
 * N'est utilisé que pour le partage immédiat après la création d'un document unitaire (PDF).
 * Pour les listes (CSV), la sauvegarde locale est suffisante.
 * @param filePath Le chemin absolu du fichier à partager.
 * @param fileType Le type MIME du fichier (ex: 'application/pdf', 'text/csv').
 * @param title Le titre de la boîte de dialogue de partage.
 */
export const shareFile = async (filePath: string, fileType: string, title: string) => {
    try {
        const url = `file://${filePath}`;
        await Share.open({
            url: url,
            type: fileType,
            title: title,
            failOnCancel: false,
        });
    } catch (error) {
        // Ignorer l'erreur si l'utilisateur annule le partage
        if ((error as Error).message !== 'User did not share') {
            console.error('Erreur lors du partage du fichier:', error);
            throw new Error('Impossible de lancer la boîte de dialogue de partage.');
        }
    }
};