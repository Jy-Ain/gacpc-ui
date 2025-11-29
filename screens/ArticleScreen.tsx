import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    PermissionsAndroid,
    Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import des types et API
import { Article, getArticleById } from '../api/articles';
import { getChercheurById } from '../api/chercheurs';
import { getInstitutionById } from '../api/institutions';
import { RootStackParamList } from '../types/navigation';
// MODIF : Retrait de shareFile
import { generatePdf } from '../services/reportService';
import { getArticleDetailHtml } from '../templates/articleDetailTemplate';

type ArticleScreenRouteProp = RouteProp<RootStackParamList, 'ArticleDetail'>;

interface ArticleDetailData extends Article {
    nomChercheur: string;
    institutionChercheur?: string;
}

const ArticleScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<ArticleScreenRouteProp>();
    const { articleId } = route.params;

    const [article, setArticle] = useState<ArticleDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    // Fonction pour charger et enrichir les données de l'article
    useEffect(() => {
        const loadArticleDetails = async () => {
            if (!articleId) {
                setLoading(false);
                return;
            }
            try {
                const fetchedArticle = await getArticleById(Number(articleId));

                let nomChercheur = 'Inconnu';
                let institutionChercheur = 'N/A';
                if (fetchedArticle.id_chercheur) {
                    const chercheur = await getChercheurById(Number(fetchedArticle.id_chercheur));
                    nomChercheur = chercheur?.nom || nomChercheur;

                    if (chercheur?.id_institution) {
                        const institution = await getInstitutionById(chercheur.id_institution);
                        institutionChercheur = institution?.nom || institutionChercheur;
                    }
                }

                setArticle({
                    ...fetchedArticle,
                    nomChercheur,
                    institutionChercheur,
                });
            } catch (error) {
                console.error("Erreur lors du chargement de l'article:", error);
                Alert.alert("Erreur", "Impossible de charger les détails de l'article.");
            } finally {
                setLoading(false);
            }
        };
        loadArticleDetails();
    }, [articleId]);

    /**
     * Demande la permission d'écriture sur le stockage externe pour Android.
     * @returns {Promise<boolean>} Vrai si la permission est accordée.
     */
    const requestStoragePermission = async (): Promise<boolean> => {
        if (Platform.OS !== 'android') {
            return true; // Non nécessaire sur iOS
        }

        try {
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
        if (!article) return;

        // Étape 1: Vérifier et demander la permission (Android seulement)
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
            return;
        }

        setGenerating(true);
        try {
            // Assurez-vous que le nom de fichier ne contient pas de caractères spéciaux
            const safeFileName = `Article_${article.id}_${article.annee}`.replace(/\s/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

            // Le template reçoit maintenant l'objet article enrichi
            const htmlContent = getArticleDetailHtml(article);

            // generatePdf utilise le chemin /Download/gacp/
            const filePath = await generatePdf({ htmlContent, fileName: safeFileName });

            // MODIF : Confirmation de la sauvegarde et affichage du chemin
            Alert.alert(
                "Succès",
                `Le PDF a été généré et sauvegardé dans le dossier 'gacp' de votre dossier Téléchargements.\n\nChemin: ${filePath}`
            );

        } catch (err: any) {
            console.error("Erreur de génération PDF:", err);
            const errorMessage = err.message || "Impossible de générer le rapport PDF.";
            Alert.alert("Erreur", errorMessage);
        } finally {
            // ARRÊT : On ne partage plus après la génération
            setGenerating(false);
        }
    };


    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
            </View>
        );
    }

    if (!article) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Article non trouvé.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#E0E0E0" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>Détails de l'Article</Text>

                <TouchableOpacity
                    onPress={handleGeneratePdf}
                    disabled={generating}
                    style={styles.reportButton}
                >
                    {generating ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Icon name="file-pdf-box" size={24} color="#E0E0E0" />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                <Text style={styles.title}>{article.titre}</Text>
                <Text style={styles.subtitle}>Publié en {article.annee}</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informations Générales</Text>
                    <DetailItem icon="file-document-outline" label="Type" value={article.type_article} />
                    <DetailItem icon="calendar" label="Année" value={article.annee.toString()} />
                    <DetailItem icon="identifier" label="ID" value={article.id.toString()} />
                    <DetailItem icon="update" label="Enregistré le" value={article.date_enregistrement} />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Auteur Principal</Text>
                    <DetailItem icon="account-tie" label="Nom" value={article.nomChercheur} />
                    {article.institutionChercheur && <DetailItem icon="bank" label="Institution" value={article.institutionChercheur} />}
                    <DetailItem icon="badge-account-horizontal" label="Chercheur ID" value={article.id_chercheur.toString()} />
                </View>

            </ScrollView>
        </View>
    );
};

// ... (Le composant DetailItem et les styles restent inchangés)
const DetailItem = ({ icon, label, value }: { icon: string, label: string, value: string }) => (
    <View style={detailItemStyles.container}>
        <Icon name={icon} size={20} color="#FFC107" style={detailItemStyles.icon} />
        <Text style={detailItemStyles.label}>{label} :</Text>
        <Text style={detailItemStyles.value}>{value}</Text>
    </View>
);

const detailItemStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#282828',
    },
    icon: { marginRight: 10 },
    label: { color: '#A0A0A0', fontWeight: 'bold', minWidth: 100 },
    value: { color: '#E0E0E0', flexShrink: 1 },
});


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
    errorText: { color: '#FF6347', fontSize: 18 },

    header: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 10,
        backgroundColor: '#1E1E1E', borderBottomWidth: 1, borderBottomColor: '#282828',
    },
    backButton: { marginRight: 10, padding: 5 },
    headerTitle: { color: '#E0E0E0', fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' },
    reportButton: {
        marginLeft: 10,
        padding: 8,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FF6347', 
        borderRadius: 5,
    },

    scrollContent: { padding: 20 },
    title: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
    subtitle: { color: '#A0A0A0', fontSize: 16, marginBottom: 20, textAlign: 'center' },

    section: {
        backgroundColor: '#1E1E1E',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#FFC107'
    },
    sectionTitle: {
        color: '#FFC107',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#282828',
        paddingBottom: 5
    },
    bodyText: { color: '#E0E0E0', fontSize: 15, lineHeight: 22 },
});

export default ArticleScreen;
