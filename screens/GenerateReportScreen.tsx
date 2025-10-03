// src/screens/GenerateReportScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import des services et types nécessaires
import { generatePdf, generateCsv, shareFile } from '../services/reportService';
import { getChercheurListHtml } from '../templates/chercheurListTemplate'; // Créer ce template
import { getArticleListHtml } from '../templates/articleListTemplate';   // Créer ce template
import { getActiviteListHtml } from '../templates/activiteListTemplate'; // Créer ce template

// API pour récupérer toutes les données
import { getChercheurs, Chercheur } from '../api/chercheurs';
import { getArticles, Article } from '../api/articles';
import { getActivites, Activite } from '../api/activites';
import { getInstitutions, Institution } from '../api/institutions';

// Composants de sélection
import YearRangePicker from '../components/YearRangePicker'; // Composant qui gère sa propre modale interne

type ReportDataType = 'chercheurs' | 'articles' | 'activites';
type ReportFormat = 'pdf' | 'csv';

const GenerateReportScreen: React.FC = () => {
    const navigation = useNavigation();

    // ANCIENS ÉTATS DÉCLARÉS DANS VOTRE CODE:
    // const [yearRange, setYearRange] = useState<[number, number] | null>(null);
    // const [showYearPicker, setShowYearPicker] = useState(false);

    // ✅ CORRECTION 1 : Remplacement des états yearRange et showYearPicker 
    // par les états individuels requis par le YearRangePicker pour la clarté et la compatibilité.
    const [filterStartYear, setFilterStartYear] = useState<number | null>(null);
    const [filterEndYear, setFilterEndYear] = useState<number | null>(null);

    // Autres états
    const [selectedType, setSelectedType] = useState<ReportDataType>('chercheurs'); // Par défaut
    const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('pdf'); // Par défaut
    const [generating, setGenerating] = useState(false);
    
    // Données brutes (pour le filtrage)
    const [allChercheurs, setAllChercheurs] = useState<Chercheur[]>([]);
    const [allArticles, setAllArticles] = useState<Article[]>([]);
    const [allActivites, setAllActivites] = useState<Activite[]>([]);
    const [allInstitutions, setAllInstitutions] = useState<Institution[]>([]); // Pour les jointures
    const [loadingData, setLoadingData] = useState(true);


    // Chargement initial de TOUTES les données (similaire à RechercheScreen)
    useEffect(() => {
        const loadData = async () => {
            try {
                const [chercheurs, articles, activites, institutions] = await Promise.all([
                    getChercheurs(),
                    getArticles(),
                    getActivites(),
                    getInstitutions(),
                ]);
                setAllChercheurs(chercheurs);
                setAllArticles(articles);
                setAllActivites(activites);
                setAllInstitutions(institutions);
            } catch (error) {
                console.error('Erreur lors du chargement des données pour le rapport:', error);
                Alert.alert("Erreur", "Impossible de charger les données pour générer le rapport.");
            } finally {
                setLoadingData(false);
            }
        };
        loadData();
    }, []);

    // Fonction de filtrage des données basée sur les options sélectionnées
    const getFilteredData = useCallback(() => {
        const minYear = filterStartYear || 0;
        const maxYear = filterEndYear || new Date().getFullYear() + 1;

        let filteredList: (Chercheur | Article | Activite)[] = [];

        if (selectedType === 'chercheurs') {
            filteredList = allChercheurs.filter(c => {
                // Pas de filtre d'année direct pour les chercheurs
                return true; 
            }).map(c => ({
                ...c,
                institution: allInstitutions.find(inst => inst.idPrimaire === c.id_institution)?.nom || 'N/A'
            })); 
        } else if (selectedType === 'articles') {
            filteredList = allArticles.filter(a => {
                const articleYear = a.annee ? parseInt(a.annee.toString(), 10) : NaN;
                return !isNaN(articleYear) && articleYear >= minYear && articleYear <= maxYear;
            });
        } else if (selectedType === 'activites') {
            filteredList = allActivites.filter(a => {
                const activiteYear = a.annee ? parseInt(a.annee.toString(), 10) : NaN;
                return !isNaN(activiteYear) && activiteYear >= minYear && activiteYear <= maxYear;
            });
        }
        return filteredList;
    }, [selectedType, filterStartYear, filterEndYear, allChercheurs, allArticles, allActivites, allInstitutions]); // Ajout des nouveaux états dans les dépendances


    // Fonction principale de génération
    const handleGenerateReport = async () => {
        setGenerating(true);
        try {
            const dataToExport = getFilteredData();

            if (dataToExport.length === 0) {
                Alert.alert("Aucun Résultat", "Aucune donnée ne correspond à vos critères de filtre.");
                return;
            }

            const yearRangeDisplay = (filterStartYear || filterEndYear) ? `${filterStartYear || 'Min'} - ${filterEndYear || 'Max'}` : 'Tous';
            const baseFileName = `${selectedType}_Rapport_${yearRangeDisplay.replace(/\s/g, '_')}`;

            if (selectedFormat === 'pdf') {
                let htmlContent = '';
                if (selectedType === 'chercheurs') {
                    htmlContent = getChercheurListHtml(dataToExport as Chercheur[], allInstitutions);
                } else if (selectedType === 'articles') {
                    htmlContent = getArticleListHtml(dataToExport as Article[], `Rapport des Articles (${yearRangeDisplay})`);
                } else if (selectedType === 'activites') {
                    htmlContent = getActiviteListHtml(dataToExport as Activite[], `Rapport des Activités (${yearRangeDisplay})`);
                } else {
                    throw new Error("Type de rapport PDF non supporté.");
                }

                const filePath = await generatePdf({ htmlContent, fileName: baseFileName });
                await shareFile(filePath, 'application/pdf', `Partager le rapport ${selectedType}`);
                Alert.alert("Succès", `Rapport PDF généré pour ${dataToExport.length} ${selectedType}.`);

            } else { // selectedFormat === 'csv'
                let headers: string[] = [];
                let extractRow: (item: any) => string[] = (item) => [];

                if (selectedType === 'chercheurs') {
                    headers = ['ID', 'Nom', 'Specialite', 'Institution', 'Email', 'Telephone'];
                    extractRow = (c: Chercheur & { institution: string }) => [
                        c.id?.toString() || '', c.nom, c.specialite, c.institution, c.adresse_mail || ''
                    ];
                } else if (selectedType === 'articles') {
                    // Les en-têtes sont ajustés pour ne pas inclure 'Auteurs'
                    headers = ['ID', 'Titre', 'Type', 'Année', 'ID Chercheur'];
                    extractRow = (a: Article) => [
                        a.id?.toString() || '',
                        a.titre,
                        a.type_article,
                        a.annee?.toString() || '',
                        a.id_chercheur || ''
                    ];
                } else if (selectedType === 'activites') {
                    headers = ['ID', 'Intitule', 'Thematique', 'Departement', 'Annee'];
                    extractRow = (a: Activite) => [
                        a.ID?.toString() || '', a.intitule, a.thematique, a.departement, a.annee?.toString() || ''
                    ];
                } else {
                    throw new Error("Type de rapport CSV non supporté.");
                }

                const filePath = await generateCsv({ data: dataToExport, fileName: baseFileName, headers, extractRow });
                await shareFile(filePath, 'text/csv', `Partager le rapport ${selectedType}`);
                Alert.alert("Succès", `Rapport CSV généré pour ${dataToExport.length} ${selectedType}.`);
            }

        } catch (error) {
            console.error('Erreur lors de la génération du rapport:', error);
            Alert.alert("Erreur", `Une erreur est survenue lors de la génération du rapport: ${(error as Error).message}`);
        } finally {
            setGenerating(false);
        }
    };

    const currentYear = new Date().getFullYear();
    const minSelectableYear = 1990; 
    
    // Pour l'affichage dans le bouton Année (maintenant inutile, mais je le garde au cas où vous vouliez le réintégrer dans l'UI)
    // const yearRangeDisplay = (filterStartYear && filterEndYear) ? `${filterStartYear} - ${filterEndYear}` : 'Toutes les années';


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#E0E0E0" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Générer un Rapport</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Icon name="file-chart-outline" size={80} color="#A0A0A0" style={styles.mainIcon} />
                <Text style={styles.descriptionText}>
                    Sélectionnez les critères ci-dessous pour créer votre rapport PDF ou CSV.
                </Text>

                <View style={styles.optionsContainer}>
                    <Text style={styles.sectionLabel}>Période :</Text>
                    
                    {/* ANCIEN CODE SUPPRIMÉ:
                    <TouchableOpacity style={styles.yearPickerButton} onPress={() => setShowYearPicker(true)}>
                        <Text style={styles.yearPickerButtonText}>
                            {yearRange ? `${yearRange[0]} - ${yearRange[1]}` : 'Toutes les années'}
                        </Text>
                        <Icon name="calendar" size={20} color="#E0E0E0" />
                    </TouchableOpacity>
                    */}
                    
                    {/* ✅ CORRECTION 2 : Intégration du YearRangePicker à cet endroit. 
                       Il gère son propre affichage (le bouton) et sa propre modal. */}
                    <View style={{ marginBottom: 15 }}>
                        <YearRangePicker
                            startYear={filterStartYear} // Passe l'état de début d'année
                            endYear={filterEndYear}     // Passe l'état de fin d'année
                            onRangeChange={(start, end) => {
                                setFilterStartYear(start);
                                setFilterEndYear(end);
                            }}
                            minYear={minSelectableYear}
                            maxYear={currentYear}
                        />
                    </View>

                    <Text style={styles.sectionLabel}>Type de données :</Text>
                    <View style={styles.typeSelector}>
                        {(['chercheurs', 'articles', 'activites'] as ReportDataType[]).map(type => (
                            <TouchableOpacity
                                key={type}
                                style={[styles.typeButton, selectedType === type && styles.typeButtonActive]}
                                onPress={() => setSelectedType(type)}
                                disabled={loadingData}
                            >
                                <Icon
                                    name={
                                        type === 'chercheurs' ? 'account-group-outline' :
                                            type === 'articles' ? 'file-document-outline' :
                                                'flask-outline'
                                    }
                                    size={20}
                                    color={selectedType === type ? '#FFF' : '#E0E0E0'}
                                    style={styles.typeButtonIcon}
                                />
                                <Text style={selectedType === type ? styles.typeButtonTextActive : styles.typeButtonText}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.sectionLabel}>Format :</Text>
                    <View style={styles.formatSelector}>
                        {(['pdf', 'csv'] as ReportFormat[]).map(format => (
                            <TouchableOpacity
                                key={format}
                                style={styles.formatOption}
                                onPress={() => setSelectedFormat(format)}
                            >
                                <Icon
                                    name={selectedFormat === format ? 'radiobox-marked' : 'radiobox-blank'}
                                    size={20}
                                    color={selectedFormat === format ? '#2196F3' : '#A0A0A0'}
                                />
                                <Text style={styles.formatText}>
                                    {format.toUpperCase()}
                                </Text>
                                <Icon
                                    name={format === 'pdf' ? 'file-pdf-box' : 'file-delimited-outline'}
                                    size={20}
                                    color="#E0E0E0"
                                    style={{ marginLeft: 5 }}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.generateButton}
                    onPress={handleGenerateReport}
                    disabled={generating || loadingData}
                >
                    {generating ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Text style={styles.generateButtonText}>Générer le Rapport</Text>
                    )}
                </TouchableOpacity>

                {generating && <Text style={styles.generatingText}>Génération en cours...</Text>}
            </ScrollView>

            {/* ✅ CORRECTION 3 : Suppression du bloc YearRangePicker incorrect à la fin, car il est intégré ci-dessus. 
                Le code problématique des lignes 206-213 a été supprimé. */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    header: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 10,
        backgroundColor: '#1E1E1E', borderBottomWidth: 1, borderBottomColor: '#282828',
    },
    backButton: { marginRight: 10 },
    headerTitle: { color: '#E0E0E0', fontSize: 20, fontWeight: 'bold' },
    scrollContent: {
        padding: 20,
        alignItems: 'center',
    },
    mainIcon: { marginBottom: 20 },
    descriptionText: { color: '#E0E0E0', fontSize: 15, textAlign: 'center', marginBottom: 30 },

    optionsContainer: {
        width: '100%',
        backgroundColor: '#1E1E1E',
        borderRadius: 10,
        padding: 15,
        marginBottom: 30,
    },
    sectionLabel: { color: '#E0E0E0', fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginTop: 15 },

    // Suppression des styles yearPickerButton et yearPickerButtonText (inutiles si YearRangePicker est utilisé directement)

    typeSelector: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        flexWrap: 'wrap',
    },
    typeButton: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#282828',
        borderRadius: 20,
        paddingVertical: 10, paddingHorizontal: 15,
        margin: 5,
    },
    typeButtonActive: { backgroundColor: '#2196F3' },
    typeButtonIcon: { marginRight: 8 },
    typeButtonText: { color: '#E0E0E0', fontSize: 14, fontWeight: '500' },
    typeButtonTextActive: { color: '#FFF', fontSize: 14, fontWeight: '600' },

    formatSelector: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    formatOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    formatText: { color: '#E0E0E0', fontSize: 15, marginLeft: 5 },

    generateButton: {
        backgroundColor: '#2196F3',
        paddingVertical: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    generateButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    generatingText: { color: '#A0A0A0', marginTop: 10, fontSize: 14 },
});

export default GenerateReportScreen;