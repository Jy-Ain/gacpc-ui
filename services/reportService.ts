import { generatePDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';

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

export const generatePdf = async ({ htmlContent, fileName }: GeneratePdfOptions): Promise<string> => {
    try {
        const options = {
            html: htmlContent,
            fileName,
            directory: 'Documents',
            base64: false,
        };

        const result = await generatePDF(options);

        if (!result.filePath) {
            throw new Error("Chemin du fichier PDF introuvable");
        }

        return result.filePath;
    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        throw new Error('Impossible de générer le PDF.');
    }
};

export const generateCsv = async ({ data, fileName, headers, extractRow }: GenerateCsvOptions): Promise<string> => {
    try {
        const csvRows = [
            headers.join(','),
            ...data.map(item =>
                extractRow(item)
                    .map(val => `"${String(val).replace(/"/g, '""')}"`)
                    .join(',')
            ),
        ];
        const csvContent = csvRows.join('\n');

        const path = `${RNFS.DocumentDirectoryPath}/${fileName}.csv`;

        await RNFS.writeFile(path, csvContent, 'utf8');
        return path;
    } catch (error) {
        console.error('Erreur lors de la génération du CSV:', error);
        throw new Error('Impossible de générer le CSV.');
    }
};

export const shareFile = async (filePath: string, fileType: string, title: string) => {
    try {
        await Share.open({
            url: filePath,
            type: fileType,
            title,
            failOnCancel: false,
        });
    } catch (error: any) {
        if (error.message.includes('User cancelled') || error.message === 'User did not share') {
            console.log("Partage annulé par l'utilisateur.");
        } else {
            console.error('Erreur lors du partage du fichier:', error);
            throw new Error('Impossible de partager le fichier.');
        }
    }
};
