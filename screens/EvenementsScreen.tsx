import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootStackParamList } from '../types/navigation';
import { Manifestation, getManifestations } from '../api/manifestations';

type EvenementsScreenNavigationProp = NavigationProp<RootStackParamList, 'Evenements'>;

const EvenementsScreen: React.FC = () => {
    const navigation = useNavigation<EvenementsScreenNavigationProp>();
    const [loading, setLoading] = useState(true);
    const [evenements, setEvenements] = useState<Manifestation[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvenements = async () => {
            try {
                const data = await getManifestations();
                setEvenements(data);
            } catch (err) {
                console.error('Erreur lors de la récupération des événements:', err);
                setError('Impossible de charger les événements. Veuillez vérifier la connexion.');
            } finally {
                setLoading(false);
            }
        };

        fetchEvenements();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Chargement des événements...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Icon name="alert-circle-outline" size={50} color="#FF6347" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => { setLoading(true); setError(null); /* Relancer fetchData */ }}>
                    <Text style={styles.retryButtonText}>Réessayer</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderItem = ({ item }: { item: Manifestation }) => (
        <TouchableOpacity
            style={styles.evenementCard}
            onPress={() => {
                // navigation.navigate('EvenementDetail', { evenementId: item.id });
                console.log(`Détails de l'événement: ${item.intitule}`);
            }}
        >
            <Icon name="calendar-text-outline" size={30} color="#FFC107" style={styles.cardIcon} />
            <View style={styles.evenementInfo}>
                <Text style={styles.evenementTitle}>{item.intitule}</Text>
                <Text style={styles.evenementType}>Type: {item.type_manifestations} - Thème: {item.theme}</Text>
                <Text style={styles.evenementLieu}><Icon name="map-marker-outline" size={14} color="#A0A0A0" /> {item.lieu}</Text>
                <Text style={styles.evenementOrganisateur}>Organisateur: {item.organisateur}</Text>
                {/* <Text style={styles.evenementDetail}>Partenaire ID: {item.id_partenaires}</Text> */}
            </View>
            <Icon name="chevron-right" size={24} color="#A0A0A0" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#E0E0E0" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Événements & Manifestations</Text>
            </View>

            <FlatList
                data={evenements}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
            />
        </View>
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
        paddingVertical: 15,
        paddingHorizontal: 10,
        backgroundColor: '#1E1E1E',
        borderBottomWidth: 1,
        borderBottomColor: '#282828',
    },
    backButton: {
        marginRight: 10,
    },
    headerTitle: {
        color: '#E0E0E0',
        fontSize: 20,
        fontWeight: 'bold',
    },
    listContent: {
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    evenementCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#FFC107',
    },
    cardIcon: {
        marginRight: 15,
    },
    evenementInfo: {
        flex: 1,
    },
    evenementTitle: {
        color: '#E0E0E0',
        fontSize: 16,
        fontWeight: 'bold',
    },
    evenementType: {
        color: '#A0A0A0',
        fontSize: 13,
        marginTop: 5,
    },
    evenementLieu: {
        color: '#707070',
        fontSize: 12,
        marginTop: 3,
    },
    evenementOrganisateur: {
        color: '#A0A0A0',
        fontSize: 13,
        marginTop: 5,
    }
});

export default EvenementsScreen;