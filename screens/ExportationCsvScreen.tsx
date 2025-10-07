import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
    PermissionsAndroid,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// Import pour le sélecteur de date natif
import DateTimePicker from '@react-native-community/datetimepicker'; 

import { generateCsv } from '../services/reportService'; 

// API pour récupérer toutes les données
import { getChercheurs, Chercheur } from '../api/chercheurs';
import { getArticles, Article } from '../api/articles';
import { getActivites, Activite } from '../api/activites';
import { getInstitutions, Institution } from '../api/institutions';


// Fonctions utilitaires pour la gestion des dates
const getCurrentYear = () => new Date().getFullYear();

// Formate un objet Date en AAAA-MM-JJ pour l'affichage et les données brutes
const formatDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

// Extrait l'année d'une chaîne de date ou d'un nombre
const getYearFromDate = (date: string | number | undefined | null): number | undefined => {
    if (date === null || date === undefined) return undefined;
    if (typeof date === 'number') return date;
    if (typeof date === 'string' && date) {
        const yearMatch = date.match(/^(\d{4})/);
        return yearMatch ? parseInt(yearMatch[1], 10) : undefined;
    }
    return undefined;
};

/**
 * Normalise une date pour la comparaison (objet Date avec heure ajustée).
 */
const normalizeDateForComparison = (date: Date | null, isEnd: boolean): Date => {
    if (date) {
        const adjustedDate = new Date(date);
        if (isEnd) {
            // Fin de la journée pour inclure tous les enregistrements de cette date
            adjustedDate.setHours(23, 59, 59, 999);
        } else {
            // Début de la journée
            adjustedDate.setHours(0, 0, 0, 0);
        }
        return adjustedDate;
    }
    // Si la date est null, on utilise les limites extrêmes pour n'appliquer aucun filtre
    return isEnd ? new Date(getCurrentYear() + 10, 0, 1) : new Date(0); 
};


type ReportDataType = 'chercheurs' | 'articles' | 'activites';

const GenerateReportScreen: React.FC = () => {
    const navigation = useNavigation();

    // UTILISATION DE L'OBJET DATE: États de filtrage temporel
    const [filterStartDate, setFilterStartDate] = useState<Date | null>(null); 
    const [filterEndDate, setFilterEndDate] = useState<Date | null>(null); 
    
    // ÉTATS pour l'affichage des DatePickers
    const [showDatePickerStart, setShowDatePickerStart] = useState(false);
    const [showDatePickerEnd, setShowDatePickerEnd] = useState(false);

    // Autres états
    const [selectedType, setSelectedType] = useState<ReportDataType>('chercheurs');
    const [generating, setGenerating] = useState(false);
    
    // Données brutes
    const [allChercheurs, setAllChercheurs] = useState<Chercheur[]>([]);
    const [allArticles, setAllArticles] = useState<Article[]>([]);
    const [allActivites, setAllActivites] = useState<Activite[]>([]);
    const [allInstitutions, setAllInstitutions] = useState<Institution[]>([]); 
    const [loadingData, setLoadingData] = useState(true);


    // Chargement initial de TOUTES les données
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

    /**
     * Demande la permission d'écriture sur le stockage externe pour Android.
     */
    const requestStoragePermission = async (): Promise<boolean> => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: "Permission d'Accès au Stockage",
                        message: "Cette application a besoin d'accéder à votre stockage pour sauvegarder le fichier CSV.",
                        buttonNeutral: "Demander plus tard",
                        buttonNegative: "Annuler",
                        buttonPositive: "OK"
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true; 
    };

    /**
     * Gestionnaire de changement de date pour la date de DEBUT.
     */
    const onDateChangeStart = (event: any, selectedDate?: Date) => {
        // Cacher le DatePicker sur toutes les plateformes
        setShowDatePickerStart(false); 
        
        // Si l'utilisateur annule sur Android/iOS (event.type === 'dismissed'), on ne fait rien
        if (event.type !== 'dismissed') {
            setFilterStartDate(selectedDate || null);
        }
        console.log('Date de début sélectionnée:', selectedDate);
    };

    /**
     * Gestionnaire de changement de date pour la date de FIN.
     */
    const onDateChangeEnd = (event: any, selectedDate?: Date) => {
        // Cacher le DatePicker sur toutes les plateformes
        setShowDatePickerEnd(false);
        
        // Si l'utilisateur annule sur Android/iOS (event.type === 'dismissed'), on ne fait rien
        if (event.type !== 'dismissed') {
            setFilterEndDate(selectedDate || null);
        }
        console.log('Date de fin sélectionnée:', selectedDate);
    };


    // Fonction de filtrage des données basée sur les options sélectionnées
    const getFilteredData = useCallback(() => {
        // Préparation des objets Date pour la comparaison (conversion des objets Date | null en objets Date pour comparaison)
        const minDateObj = normalizeDateForComparison(filterStartDate, false);
        const maxDateObj = normalizeDateForComparison(filterEndDate, true);

        // Récupération des timestamps pour une comparaison numérique efficace (en millisecondes)
        const minTimestamp = minDateObj.getTime();
        const maxTimestamp = maxDateObj.getTime();
        
        // Récupération des années pour le filtre des activités (moins précis, mais nécessaire)
        const minYear = minDateObj.getFullYear();
        const maxYear = maxDateObj.getFullYear();


        let filteredList: (Chercheur | Article | Activite)[] = [];

        if (selectedType === 'chercheurs') {
            filteredList = allChercheurs.filter(c => {
                // Filtre Temporel : date_entre_administration
                const entryDate = c.date_entre_administration ? new Date(c.date_entre_administration) : null;
                const entryTimestamp = entryDate && !isNaN(entryDate.getTime()) ? entryDate.getTime() : 0;
                
                const passDateFilter = entryDate ? (entryTimestamp >= minTimestamp && entryTimestamp <= maxTimestamp) : true;

                return passDateFilter;
            })
            // Jointure pour afficher le nom de l'institution dans le CSV
            .map(c => ({
                ...c,
                // Correction : S'assurer que c.id_institution est défini avant de chercher
                institution: c.id_institution ? (allInstitutions.find(inst => inst.idPrimaire === c.id_institution)?.nom || 'N/A') : 'N/A'
            })); 

        } else if (selectedType === 'articles') {
            filteredList = allArticles.filter(a => {
                // Filtre Temporel : date_enregistrement
                const articleDate = a.date_enregistrement ? new Date(a.date_enregistrement) : null;
                const articleTimestamp = articleDate && !isNaN(articleDate.getTime()) ? articleDate.getTime() : 0;

                const passDateFilter = articleDate ? (articleTimestamp >= minTimestamp && articleTimestamp <= maxTimestamp) : true;

                return passDateFilter;
            });
        } else if (selectedType === 'activites') {
            filteredList = allActivites.filter(a => {
                // Filtre Temporel : annee (on compare l'année de l'activité avec l'année des dates sélectionnées)
                const activiteYear = getYearFromDate(a.annee);
                
                // Si aucune année n'est définie pour l'activité, elle passe le filtre par défaut
                const passYearFilter = activiteYear !== undefined ? (activiteYear >= minYear && activiteYear <= maxYear) : true;
                
                return passYearFilter;
            });
        }
        return filteredList;
    }, [selectedType, filterStartDate, filterEndDate, allChercheurs, allArticles, allActivites, allInstitutions]); 


    // Renommage pour plus de clarté
    const handleGenerateCsvReport = async () => {
        // 1. Vérifier la permission
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
            Alert.alert("Permission Refusée", "Impossible de sauvegarder le rapport CSV sans l'accès au stockage.");
            return;
        }

        setGenerating(true);
        try {
            const dataToExport = getFilteredData();

            if (dataToExport.length === 0) {
                Alert.alert("Aucun Résultat", "Aucune donnée ne correspond à vos critères de filtre.");
                return;
            }

            const startDisplay = filterStartDate ? formatDate(filterStartDate) : 'Min';
            const endDisplay = filterEndDate ? formatDate(filterEndDate) : 'Max';
            const dateRangeDisplay = `${startDisplay}_a_${endDisplay}`; // Formatage pour nom de fichier
            
            // Nettoyage du nom de fichier
            const baseFileName = `${selectedType}_Rapport_${dateRangeDisplay.replace(/[^a-zA-Z0-9_]/g, '')}`;

            // *** DÉBUT LOGIQUE CSV : Définition des Headers et Extracteurs ***
            let headers: string[] = [];
            // Le type 'any' est utilisé ici car le type exact est déterminé dynamiquement par selectedType
            let extractRow: (item: any) => string[] = (item) => []; 

            if (selectedType === 'chercheurs') {
                headers = ['ID', 'Nom', 'Specialite', 'Institution', 'Date_Entree_Administration', 'Email', 'Telephone'];
                extractRow = (c: Chercheur & { institution: string }) => [
                    c.id?.toString() || '', 
                    c.nom, 
                    c.specialite, 
                    c.institution, 
                    c.date_entre_administration || '', // Champ précis
                    c.adresse_mail || '', 
                ];
            } else if (selectedType === 'articles') {
                headers = ['ID', 'Titre', 'Type', 'Année', 'Date_Enregistrement', 'ID Chercheur'];
                extractRow = (a: Article) => [
                    a.id?.toString() || '',
                    a.titre,
                    a.type_article,
                    a.annee?.toString() || '',
                    a.date_enregistrement || '', // Champ précis
                    a.id_chercheur || ''
                ];
            } else if (selectedType === 'activites') {
                headers = ['ID', 'Intitule', 'Thematique', 'Departement', 'Annee'];
                extractRow = (a: Activite) => [
                    a.ID?.toString() || '', a.intitule, a.thematique, a.departement, a.annee?.toString() || ''
                ];
            } else {
                // S'il n'y a pas de type sélectionné (cas théorique)
                throw new Error("Type de rapport CSV non supporté ou non sélectionné.");
            }

            // Génération du CSV et sauvegarde locale
            const filePath = await generateCsv({ data: dataToExport, fileName: baseFileName, headers, extractRow });
            
            // Afficher un chemin de sauvegarde précis et descriptif
            const displayPath = Platform.select({
                ios: `iCloud Drive ou "Sur mon iPhone" > Dossier GACP`,
                android: `Téléchargements (Downloads) > Dossier GACP`,
                default: 'Dossier GACP local'
            });

            Alert.alert(
                "Succès de l'Exportation CSV", 
                `Le rapport CSV a été généré et sauvegardé pour ${dataToExport.length} ${selectedType}.\n\nChemin de sauvegarde :\n**${displayPath}**\n\nNom du fichier: ${baseFileName}.csv`
            );

        } catch (error) {
            console.error('Erreur lors de la génération du rapport:', error);
            Alert.alert("Erreur", `Une erreur est survenue lors de la génération du rapport CSV: ${(error as Error).message}`);
        } finally {
            setGenerating(false);
        }
    };
    

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#E0E0E0" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Générer un Rapport CSV</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Icon name="file-delimited-outline" size={80} color="#FFC107" style={styles.mainIcon} />
                <Text style={styles.descriptionText}>
                    Sélectionnez les critères ci-dessous pour créer votre rapport au format **CSV**.
                </Text>

                <View style={styles.optionsContainer}>
                    <Text style={styles.sectionLabel}>Type de données à exporter :</Text>
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

                    <Text style={styles.sectionLabel}>Période de temps :</Text>
                    
                    {/* SÉLECTEUR DE DATE DE DÉBUT */}
                    <View style={styles.dateRangeContainer}>
                        <TouchableOpacity 
                            style={styles.dateButton}
                            onPress={() => setShowDatePickerStart(true)}
                            disabled={loadingData}
                        >
                            <Text style={styles.dateButtonText}>
                                Début: {filterStartDate ? formatDate(filterStartDate) : 'Sélectionner'}
                            </Text>
                            <Icon name="calendar" size={20} color="#E0E0E0" />
                        </TouchableOpacity>
                        
                        {/* AFFICHE LE DATE PICKER DE DÉBUT */}
                        {showDatePickerStart && (
                            <DateTimePicker
                                testID="datePickerStart"
                                value={filterStartDate || new Date()}
                                mode="date"
                                display="default"
                                onChange={onDateChangeStart}
                                // Permet de s'assurer que la date de fin est après la date de début si déjà sélectionnée
                                maximumDate={filterEndDate || undefined} 
                            />
                        )}

                        <Icon name="arrow-right" size={20} color="#E0E0E0" style={{ marginHorizontal: 10 }} />
                        
                        {/* SÉLECTEUR DE DATE DE FIN */}
                        <TouchableOpacity 
                            style={styles.dateButton}
                            onPress={() => setShowDatePickerEnd(true)}
                            disabled={loadingData}
                        >
                            <Text style={styles.dateButtonText}>
                                Fin: {filterEndDate ? formatDate(filterEndDate) : 'Sélectionner'}
                            </Text>
                            <Icon name="calendar" size={20} color="#E0E0E0" />
                        </TouchableOpacity>

                        {/* AFFICHE LE DATE PICKER DE FIN */}
                          {showDatePickerEnd && (
                            <DateTimePicker
                                testID="datePickerEnd"
                                value={filterEndDate || new Date()}
                                mode="date"
                                display="default"
                                onChange={onDateChangeEnd}
                                minimumDate={filterStartDate || undefined} // Permet de s'assurer que la date de fin est après la date de début
                            />
                        )}
                    </View>
                    <Text style={styles.filterHint}>
                        * Filtre basé sur : **{
                            selectedType === 'chercheurs' ? 'Date d\'entrée administration' :
                            selectedType === 'articles' ? 'Date d\'enregistrement' :
                            'Année d\'activité'
                        }**
                    </Text>

                </View>

                <TouchableOpacity
                    style={styles.generateButton}
                    onPress={handleGenerateCsvReport} // Remplacement du nom de fonction
                    disabled={generating || loadingData}
                >
                    {generating ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Text style={styles.generateButtonText}>Générer le Fichier CSV</Text>
                    )}
                </TouchableOpacity>

                {generating && <Text style={styles.generatingText}>Génération en cours...</Text>}
            </ScrollView>

        </View>
    );
};

// ... Styles restent inchangés
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
    filterHint: { color: '#AAAAAA', fontSize: 12, fontStyle: 'italic', marginTop: 5, marginBottom: 15 },


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
    
    dateRangeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    dateButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#282828',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    dateButtonText: { color: '#E0E0E0', fontSize: 14 },
    
    generateButton: {
        backgroundColor: '#FF6347', 
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