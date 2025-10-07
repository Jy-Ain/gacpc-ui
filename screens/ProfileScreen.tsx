import React, { useEffect, useState } from 'react';

import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Image,
    TouchableOpacity,
    Alert,
    // AJOUT: Importation des modules nécessaires pour la gestion des permissions Android
    PermissionsAndroid,
    Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Assurez-vous que CURRENT_USER_ID est défini dans votre fichier .env et accessible
import { CURRENT_USER_ID } from '@env'; 

import { RootStackParamList } from '../types/navigation';
import { Chercheur, getChercheurById } from '../api/chercheurs';
import { Institution, getInstitutions } from '../api/institutions';

import { getPublicationsByChercheurId } from '../api/articles';
import { getActivitesByChercheurId } from '../api/activites';

import { generatePdf } from '../services/reportService';
import { getChercheurProfileHtml } from '../templates/chercheurProfileTemplate';


type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;
type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC = () => {
    const navigation = useNavigation<ProfileScreenNavigationProp>();
    const route = useRoute<ProfileScreenRouteProp>();

    // Le chercheur ID est soit dans les params, soit l'utilisateur courant (CURRENT_USER_ID)
    const routeChercheurId = route.params?.chercheurId;

    // Convertit CURRENT_USER_ID en string si ce n'est pas déjà le cas
    const currentUserIdAsString = String(CURRENT_USER_ID);

    // On s'assure que les deux sont des strings pour la comparaison stricte
    const isCurrentUserProfile = !routeChercheurId || routeChercheurId.toString() === currentUserIdAsString;
    
    // L'ID réel à charger pour le profil.
    const targetChercheurId = routeChercheurId || currentUserIdAsString;


    const [loading, setLoading] = useState(true);
    const [chercheur, setChercheur] = useState<Chercheur | null>(null);
    const [institution, setInstitution] = useState<Institution | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [publications, setPublications] = useState<any[]>([]); 
    const [activites, setActivites] = useState<any[]>([]); 


    useEffect(() => {
        const fetchProfileData = async () => {
            if (!targetChercheurId) {
                setError('ID du chercheur non défini.');
                setLoading(false);
                return;
            }

            try {
                // 1. Récupérer le chercheur par son ID
                const chercheurData = await getChercheurById(Number(targetChercheurId));
                setChercheur(chercheurData);

                // 2. Récupérer l'institution
                if (chercheurData && chercheurData.id_institution) {
                    const institutions = await getInstitutions();
                    const foundInstitution = institutions.find(
                        (inst) => inst.idPrimaire === chercheurData.id_institution
                    );
                    setInstitution(foundInstitution || null);
                } else {
                    setInstitution(null);
                }
                
                // 3. Récupérer les données liées (Publications et Activités)
                if (chercheurData) {
                    const numId = parseInt(String(targetChercheurId), 10); 
                    const pubs = await getPublicationsByChercheurId(numId);
                    const acts = await getActivitesByChercheurId(numId);
                    setPublications(pubs);
                    setActivites(acts);
                }

            } catch (err) {
                console.error('Erreur lors de la récupération du profil:', err);
                setError('Impossible de charger le profil ou les détails.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [targetChercheurId]); // Dépend de l'ID pour recharger si on navigue vers un autre chercheur
    
    
    /**
     * Demande la permission d'écriture sur le stockage externe pour Android.
     * @returns {Promise<boolean>} Vrai si la permission est accordée.
     */
    const requestStoragePermission = async (): Promise<boolean> => {
        if (Platform.OS !== 'android') {
            return true; // Non nécessaire sur iOS
        }

        try {
            // Sur les versions modernes (>= Android 13), cette permission pourrait ne pas être nécessaire 
            // ou être remplacée par d'autres, mais elle reste la plus sûre pour cibler les dossiers publics pour la rétrocompatibilité.
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: "Permission d'Accès au Stockage",
                    message: "Cette application a besoin d'accéder à votre stockage pour sauvegarder le fichier PDF.",
                    buttonNeutral: "Demander plus tard",
                    buttonNegative: "Annuler",
                    buttonPositive: "OK"
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                return true;
            } else {
                Alert.alert("Permission refusée", "Impossible de sauvegarder le PDF. Veuillez accorder la permission d'accès au stockage.");
                return false;
            }
        } catch (err) {
            console.warn(err);
            return false;
        }
    };


    const handleGeneratePdf = async () => {
        if (!chercheur || !institution) {
            Alert.alert("Erreur", "Données du chercheur incomplètes pour la génération du PDF.");
            return;
        }

        // Étape 1: Vérifier et demander la permission (Android seulement)
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
            return;
        }

        setGeneratingPdf(true);
        try {
            // Créer l'objet complet pour le template PDF
            const chercheurWithDetails = {
                ...chercheur,
                institution: institution,
                publications: publications,
                activites: activites,
            };

            const htmlContent = getChercheurProfileHtml(chercheurWithDetails);
            // Assurez-vous que le nom de fichier ne contient pas de caractères spéciaux pour le chemin d'accès
            const safeFileName = `Profil_Chercheur_${chercheur.nom.replace(/\s/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}_${new Date().toISOString().substring(0, 10)}`;

            const filePath = await generatePdf({ htmlContent, fileName: safeFileName });
            
            // Le message indique le chemin simple que nous avons forcé dans reportService.ts
            Alert.alert(
                "Succès", 
                `Le PDF a été généré et sauvegardé dans le dossier 'gacp' de votre stockage principal.\n\nChemin: ${filePath}`
            );

        } catch (err: any) {
            // Afficher le message d'erreur plus détaillé du service
            const errorMessage = err.message || "Une erreur inconnue est survenue lors de la génération du PDF.";
            console.error('Erreur lors de la génération du PDF:', err);
            Alert.alert("Erreur", errorMessage);
        } finally {
            setGeneratingPdf(false);
        }
    };


    if (loading) {
        // ... (contenu inchangé)
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Chargement du profil...</Text>
            </View>
        );
    }

    if (error) {
        // ... (contenu inchangé)
        return (
            <View style={styles.errorContainer}>
                <Icon name="alert-circle-outline" size={50} color="#FF6347" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => { setLoading(true); setError(null); navigation.replace("Profile", route.params); }}>
                    <Text style={styles.retryButtonText}>Réessayer</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!chercheur) {
        // ... (contenu inchangé)
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Aucun profil trouvé pour cet utilisateur.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#E0E0E0" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isCurrentUserProfile ? 'Mon Profil' : 'Profil Chercheur'}</Text>
                
                {/* Bouton d'édition (visible seulement pour l'utilisateur courant) */}
                {isCurrentUserProfile && (
                    <TouchableOpacity onPress={() => console.log('Modifier profil')} style={styles.editButton}>
                        <Icon name="pencil-outline" size={24} color="#2196F3" />
                    </TouchableOpacity>
                )}

                {/* Bouton de génération PDF (visible pour tous) */}
                <TouchableOpacity 
                    style={styles.generatePdfButton} 
                    onPress={handleGeneratePdf}
                    disabled={generatingPdf}
                >
                    {generatingPdf ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Icon name="file-pdf-box" size={24} color="#FFF" />
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.profileHeader}>
                <Image
                    source={{ uri: chercheur.photo ?? 'https://img.freepik.com/vecteurs-libre/cercle-bleu-utilisateur-blanc_78370-4707.jpg' }}
                    style={styles.profileImage}
                />
                <Text style={styles.profileName}>{chercheur.nom}</Text>
                <Text style={styles.profileSpecialite}>{chercheur.specialite}</Text>
            </View>

            <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Informations Personnelles</Text>
                <View style={styles.infoRow}>
                    <Icon name="email-outline" size={20} color="#A0A0A0" style={styles.infoIcon} />
                    <Text style={styles.infoText}>{chercheur.adresse_mail}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Icon name="gender-male-female" size={20} color="#A0A0A0" style={styles.infoIcon} />
                    <Text style={styles.infoText}>{chercheur.sexe}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Icon name="cake-variant-outline" size={20} color="#A0A0A0" style={styles.infoIcon} />
                    <Text style={styles.infoText}>Né(e) en {chercheur.annee_de_naissance.substring(0, 4)} à {chercheur.lieu_de_naissance}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Icon name="school-outline" size={20} color="#A0A0A0" style={styles.infoIcon} />
                    <Text style={styles.infoText}>{chercheur.diplome}</Text>
                </View>
            </View>

            <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Informations Administratives</Text>
                <View style={styles.infoRow}>
                    <Icon name="id-card-outline" size={20} color="#A0A0A0" style={styles.infoIcon} />
                    <Text style={styles.infoText}>Matricule: {chercheur.matricule}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Icon name="office-building-outline" size={20} color="#A0A0A0" style={styles.infoIcon} />
                    <Text style={styles.infoText}>Institution: {institution ? institution.nom : 'Chargement...'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Icon name="calendar-range-outline" size={20} color="#A0A0A0" style={styles.infoIcon} />
                    <Text style={styles.infoText}>Date d'entrée: {new Date(chercheur.date_entre_administration).toLocaleDateString()}</Text>
                </View>
            </View>

            {/* Section Publications */}
            {publications.length > 0 && (
                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Publications ({publications.length})</Text>
                    {publications.slice(0, 3).map((pub: any) => (
                        <View key={pub.id} style={styles.itemCard}>
                            <Text style={styles.itemTitle}>{pub.titre}</Text>
                            <Text style={styles.itemMeta}>{pub.type_article} ({pub.annee})</Text>
                        </View>
                    ))}
                    {publications.length > 3 && (
                        <TouchableOpacity onPress={() => console.log('Voir toutes les publications')} style={styles.viewAllButton}>
                            <Text style={styles.viewAllButtonText}>Voir les {publications.length} publications</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Section Activités */}
            {activites.length > 0 && (
                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Activités de Recherche ({activites.length})</Text>
                    {activites.slice(0, 3).map((act: any) => (
                        <View key={act.ID} style={styles.itemCard}>
                            <Text style={styles.itemTitle}>{act.intitule}</Text>
                            <Text style={styles.itemMeta}>{act.thematique} ({act.annee})</Text>
                        </View>
                    ))}
                    {activites.length > 3 && (
                        <TouchableOpacity onPress={() => console.log('Voir toutes les activités')} style={styles.viewAllButton}>
                            <Text style={styles.viewAllButtonText}>Voir les {activites.length} activités</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Pour s'assurer que le contenu n'est pas caché par la barre de navigation */}
            <View style={{ height: 50 }} /> 

        </ScrollView>
    );

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',
    },
    loadingText: {
        color: '#E0E0E0',
        marginTop: 10,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',
        padding: 20,
    },
    errorText: {
        color: '#FF6347',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 15,
    },
    retryButton: {
        backgroundColor: '#2196F3',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 20,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 10,
        backgroundColor: '#1E1E1E',
        borderBottomWidth: 1,
        borderBottomColor: '#282828',
    },
    backButton: {
        marginRight: 10,
        padding: 5,
    },
    headerTitle: {
        color: '#E0E0E0',
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    editButton: {
        padding: 5,
    },
    generatePdfButton: { 
        backgroundColor: '#FF6347', 
        padding: 8,
        borderRadius: 5,
        marginLeft: 10,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#282828',
        marginBottom: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#333',
        marginBottom: 10,
        borderWidth: 2,
        borderColor: '#2196F3',
    },
    profileName: {
        color: '#E0E0E0',
        fontSize: 22,
        fontWeight: 'bold',
    },
    profileSpecialite: {
        color: '#A0A0A0',
        fontSize: 16,
        marginTop: 5,
    },
    infoSection: {
        paddingHorizontal: 15,
        marginBottom: 20,
    },
    sectionTitle: {
        color: '#E0E0E0',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        paddingBottom: 5,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
    },
    infoIcon: {
        marginRight: 15,
    },
    infoText: {
        color: '#E0E0E0',
        fontSize: 15,
    },
    itemCard: { 
        backgroundColor: '#282828', 
        borderRadius: 8, 
        padding: 12, 
        marginBottom: 8, 
        borderLeftWidth: 3, 
        borderLeftColor: '#FF6347' 
    },
    itemTitle: { 
        color: '#E0E0E0', 
        fontSize: 16, 
        fontWeight: '600' 
    },
    itemMeta: { 
        color: '#A0A0A0', 
        fontSize: 13, 
        marginTop: 3 
    },
    viewAllButton: {
        alignItems: 'center',
        paddingVertical: 8,
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#2196F3',
        borderRadius: 5,
    },
    viewAllButtonText: {
        color: '#2196F3',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default ProfileScreen;
