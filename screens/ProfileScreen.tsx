import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Image,
    TouchableOpacity,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CURRENT_USER_ID } from '@env';

import { RootStackParamList } from '../types/navigation';
import { Chercheur, getChercheurById } from '../api/chercheurs';

type ProfileScreenNavigationProp = NavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC = () => {
    const navigation = useNavigation<ProfileScreenNavigationProp>();
    const [loading, setLoading] = useState(true);
    const [chercheur, setChercheur] = useState<Chercheur | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getChercheurById(CURRENT_USER_ID);
                setChercheur(data);
            } catch (err) {
                console.error('Erreur lors de la récupération du profil:', err);
                setError('Impossible de charger le profil. Veuillez vérifier la connexion.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Chargement du profil...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Icon name="alert-circle-outline" size={50} color="#FF6347" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => { setLoading(true); setError(null); /* relancer fetchData */ }}>
                    <Text style={styles.retryButtonText}>Réessayer</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!chercheur) {
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
                <Text style={styles.headerTitle}>Mon Profil</Text>
                <TouchableOpacity onPress={() => console.log('Modifier profil')} style={styles.editButton}>
                    <Icon name="pencil-outline" size={24} color="#2196F3" />
                </TouchableOpacity>
            </View>

            <View style={styles.profileHeader}>
                <Image
                    source={{ uri: chercheur.photo ?? 'https://via.placeholder.com/100' }}
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
                    <Text style={styles.infoText}>Institution ID: {chercheur.id_institution}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Icon name="calendar-range-outline" size={20} color="#A0A0A0" style={styles.infoIcon} />
                    <Text style={styles.infoText}>Date d'entrée: {new Date(chercheur.date_entre_administration).toLocaleDateString()}</Text>
                </View>
            </View>

            {/* Ajoutez d'autres sections comme "Publications", "Activités", etc. si vous voulez */}

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
        flex: 1, // Permet au titre de prendre de la place
        textAlign: 'center',
        marginLeft: 30, // Pour compenser le bouton retour
    },
    editButton: {
        padding: 5,
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
});

export default ProfileScreen;