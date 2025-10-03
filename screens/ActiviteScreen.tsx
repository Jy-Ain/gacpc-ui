// src/screens/ActiviteScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { Activite, getActiviteById } from '../api/activites'; 
import { getChercheurById, Chercheur } from '../api/chercheurs';
import { getInstitutionById, Institution } from '../api/institutions';
import { RootStackParamList } from '../types/navigation';
import { generatePdf, shareFile } from '../services/reportService';
import { getActiviteDetailHtml } from '../templates/activiteDetailTemplate'; 

type ActiviteScreenRouteProp = RouteProp<RootStackParamList, 'ActiviteDetail'>;

interface ActiviteDetailData extends Activite {
    nomChercheur: string;
    institutionChercheur: string;
}

const ActiviteScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<ActiviteScreenRouteProp>();
    const { activiteId } = route.params; 

    const [activite, setActivite] = useState<ActiviteDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    // Fonction pour charger et enrichir les données de l'activité
    useEffect(() => {
        const loadActiviteDetails = async () => {
            if (!activiteId) {
                setLoading(false);
                return;
            }
            try {
                const fetchedActivite = await getActiviteById(activiteId); // Assurez-vous d'avoir cette fonction
                
                // Récupérer les détails du chercheur responsable
                let nomChercheur = 'Inconnu';
                let institutionChercheur = 'N/A';
                if (fetchedActivite.id_chercheur) {
                    const chercheur = await getChercheurById(fetchedActivite.id_chercheur);
                    nomChercheur = chercheur?.nom || nomChercheur;

                    if (chercheur?.id_institution) {
                        const institution = await getInstitutionById(chercheur.id_institution);
                        institutionChercheur = institution?.nom || institutionChercheur;
                    }
                }

                setActivite({
                    ...fetchedActivite,
                    nomChercheur,
                    institutionChercheur,
                });
            } catch (error) {
                console.error("Erreur lors du chargement de l'activité:", error);
                Alert.alert("Erreur", "Impossible de charger les détails de l'activité.");
            } finally {
                setLoading(false);
            }
        };
        loadActiviteDetails();
    }, [activiteId]);

    // Fonction de génération et de partage du PDF
    const handleGeneratePdf = async () => {
        if (!activite) return;

        setGenerating(true);
        try {
            const fileName = `Activite_${activite.ID}_${activite.annee}`;
            // Utiliser le template HTML pour générer le contenu
            const htmlContent = getActiviteDetailHtml(activite);

            const filePath = await generatePdf({ htmlContent, fileName });
            await shareFile(filePath, 'application/pdf', `Partager l'activité: ${activite.intitule}`);
            
            Alert.alert("Succès", "Le rapport PDF de l'activité a été généré et est prêt à être partagé.");

        } catch (error) {
            console.error("Erreur de génération PDF:", error);
            Alert.alert("Erreur", "Impossible de générer le rapport PDF.");
        } finally {
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

    if (!activite) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Activité non trouvée.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* En-tête de l'écran */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#E0E0E0" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>Détails de l'Activité</Text>
                
                <TouchableOpacity onPress={handleGeneratePdf} disabled={generating} style={styles.reportButton}>
                    {generating ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Icon name="share-variant" size={24} color="#E0E0E0" />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                <Text style={styles.title}>{activite.intitule}</Text>
                <Text style={styles.subtitle}>Année : {activite.annee}</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informations Générales</Text>
                    <DetailItem icon="flask-outline" label="Type" value={activite.type_activites} />
                    <DetailItem icon="calendar" label="Année" value={activite.annee.toString()} />
                    <DetailItem icon="tag-text-outline" label="Thématique" value={activite.thematique} />
                    <DetailItem icon="office-building" label="Département" value={activite.departement} />
                    <DetailItem icon="identifier" label="ID" value={activite.ID.toString()} />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Chercheur Responsable</Text>
                    <DetailItem icon="account-tie" label="Nom" value={activite.nomChercheur} />
                    <DetailItem icon="bank" label="Institution" value={activite.institutionChercheur} />
                    <DetailItem icon="badge-account-horizontal" label="Chercheur ID" value={activite.id_chercheur.toString()} />
                </View>
                
            </ScrollView>
        </View>
    );
};

// Composant utilitaire pour afficher les détails (réutilisé)
const DetailItem = ({ icon, label, value }: { icon: string, label: string, value: string }) => (
    <View style={detailItemStyles.container}>
        <Icon name={icon} size={20} color="#2196F3" style={detailItemStyles.icon} />
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
    reportButton: { marginLeft: 10, padding: 5, width: 34, height: 34, justifyContent: 'center', alignItems: 'center' },

    scrollContent: { padding: 20 },
    title: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
    subtitle: { color: '#A0A0A0', fontSize: 16, marginBottom: 20, textAlign: 'center' },
    
    section: { 
        backgroundColor: '#1E1E1E', 
        borderRadius: 10, 
        padding: 15, 
        marginBottom: 20, 
        borderLeftWidth: 4, 
        borderLeftColor: '#2196F3' 
    },
    sectionTitle: { 
        color: '#2196F3', 
        fontSize: 18, 
        fontWeight: 'bold', 
        marginBottom: 10, 
        borderBottomWidth: 1, 
        borderBottomColor: '#282828', 
        paddingBottom: 5 
    },
    bodyText: { color: '#E0E0E0', fontSize: 15, lineHeight: 22 },
});

export default ActiviteScreen;