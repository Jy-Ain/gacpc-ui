import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import des éléments isolés
import { fetchDashboardData, AnnualBreakdown } from '../services/dashboardService';
import GroupedBar from '../components/GroupedBar';

import { Chercheur, getChercheurById } from '../api/chercheurs';

import StatCard from '../components/StatCard';
import QuickAccessButton from '../components/QuickAccessButton';
import AddActionsModal from '../components/AddActionsModal';
import { RootStackParamList } from '../types/navigation';

import { CURRENT_USER_ID } from '@env';

type DashboardScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'Dashboard'
>;

const CHART_HEIGHT = 100; // Hauteur de référence pour le graphique

const DashboardScreen: React.FC = () => {
    const navigation = useNavigation<DashboardScreenNavigationProp>();
    const [loading, setLoading] = useState(true);
    const [chercheurConnecte, setChercheurConnecte] = useState<Chercheur | null>(null);
    const [totalPublications, setTotalPublications] = useState(0);
    const [totalChercheurs, setTotalChercheurs] = useState(0);
    const [projetsEnCours, setProjetsEnCours] = useState(0);
    const [annualActivity, setAnnualActivity] = useState<AnnualBreakdown[]>([]);
    const [maxAnnualCount, setMaxAnnualCount] = useState(1);
    const [modalVisible, setModalVisible] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = await getChercheurById(CURRENT_USER_ID);
                setChercheurConnecte(user);

                // Appel du service pour obtenir toutes les données agrégées
                const dashboardData = await fetchDashboardData();

                setTotalChercheurs(dashboardData.totalChercheurs);
                setTotalPublications(dashboardData.totalPublications);
                setProjetsEnCours(dashboardData.projetsEnCours);
                setAnnualActivity(dashboardData.annualActivity);

                // Calcul du total maximum pour la normalisation du graphique
                const maxCount = dashboardData.annualActivity.reduce(
                    (max, item) => Math.max(max, item.articles, item.activites),
                    1
                );
                setMaxAnnualCount(maxCount);

            } catch (error) {
                console.error('Erreur lors du chargement des données du tableau de bord:', error);
                // Sécurité en cas d'échec de l'API : Initialiser le graphique à vide
                setAnnualActivity([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Chargement du tableau de bord...</Text>
            </View>
        );
    }

    return (
        <View style={styles.fullScreenContainer}>
            <ScrollView style={styles.container}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Image
                            source={{ uri: chercheurConnecte?.photo ? chercheurConnecte.photo : 'https://img.freepik.com/vecteurs-libre/cercle-bleu-utilisateur-blanc_78370-4707.jpg' }}
                            style={styles.profileImage}
                        />
                    </View>
                    <View style={styles.headerCenter}>
                        <Text style={styles.appName}>CIDST Research Hub</Text>
                        <Text style={styles.welcomeText}>
                            Bienvenue, {chercheurConnecte?.nom ? chercheurConnecte.nom.split(' ')[0] : 'Utilisateur'}!
                        </Text>
                        <Text style={styles.dateText}>Fin prévue: 14 Oct. 2025</Text>
                    </View>
                    <TouchableOpacity style={styles.notificationButton} onPress={() => console.log('Notifications')}>
                        <Icon name="bell-outline" size={24} color="#E0E0E0" />
                    </TouchableOpacity>
                </View>

                {/* Navigation Tabs */}
                <View style={styles.navTabs}>
                    <TouchableOpacity style={styles.activeTab}><Text style={styles.activeTabText}>Tableau de Bord</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Recherche')}><Text style={styles.tabText}>Recherche</Text></TouchableOpacity>
                    <TouchableOpacity
                        style={styles.tab}
                        onPress={() => {
                            if (chercheurConnecte) {
                                navigation.navigate('Profile', { chercheurId: chercheurConnecte.id });
                            }
                        }}
                    >
                        <Text style={styles.tabText}>Profil</Text>
                    </TouchableOpacity>
                </View>

                {/* Statistiques Clés */}
                <Text style={styles.sectionTitle}>Statistiques Clés</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsContainer}>
                    <StatCard title="Publications" value={totalPublications} description="articles enregistrés" iconName="file-document-outline" color="#2196F3" />
                    <StatCard title="Chercheurs Actifs" value={totalChercheurs} description="chercheurs au CIDST" iconName="account-group-outline" color="#4CAF50" />
                    <StatCard title="Projets en Cours" value={projetsEnCours} description="projets actifs" iconName="flask-outline" color="#FFC107" />
                </ScrollView>

                {/* Distribution Annuelle (Graphique) */}
                <Text style={styles.sectionTitle}>Distribution Annuelle</Text>
                <View style={styles.chartContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chartBarsContainer}>
                        {/* Utilisation du composant isolé GroupedBar */}
                        {annualActivity?.map((data, index) => (
                            <View key={index} style={styles.barGroupWrapper}>
                                <GroupedBar data={data} maxCount={maxAnnualCount} chartHeight={CHART_HEIGHT} />
                                <Text style={styles.yearLabelText}>{data.year}</Text>
                            </View>
                        ))}
                    </ScrollView>

                    <Text style={styles.chartLegend}>Publications (Articles) vs. Projets (Activités) par Année</Text>


                    <View style={styles.chartLegendColors}>
                        <View style={styles.legendItem}><View style={[styles.legendColor, { backgroundColor: '#2196F3' }]} /><Text style={styles.legendText}>Publications</Text></View>
                        <View style={styles.legendItem}><View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} /><Text style={styles.legendText}>Projets/Activités</Text></View>
                    </View>
                </View>


                <Text style={styles.sectionTitle}>Accès Rapide</Text>
                <View style={styles.quickAccessContainer}>
                    <QuickAccessButton iconName="calendar-clock" label="Mes Événements" onPress={() => navigation.navigate('Evenements')} />
                    <QuickAccessButton iconName="file-chart" label="Générer Rapport" onPress={() => navigation.navigate('GenerateReport')} />
                    <QuickAccessButton iconName="sync" label="Synchroniser" onPress={() => console.log('Synchroniser')} />
                    <QuickAccessButton iconName="account-multiple" label="Partenaires" onPress={() => navigation.navigate('Partenaires')} />
                </View>
            </ScrollView>


            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} >
                <Icon name="plus" size={30} color="#FFF" />
            </TouchableOpacity>

            <AddActionsModal isVisible={modalVisible} onClose={() => setModalVisible(false)} />
        </View>
    );
};

const styles = StyleSheet.create({
    fullScreenContainer: { flex: 1, backgroundColor: '#121212' },
    container: { flex: 1, padding: 10 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
    loadingText: { color: '#E0E0E0', marginTop: 10, fontSize: 16 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, paddingHorizontal: 5, borderBottomWidth: 1, borderBottomColor: '#282828' },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    profileImage: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#333', marginRight: 10, borderWidth: 1, borderColor: '#2196F3' },
    headerCenter: { flex: 1, marginLeft: 10 },
    appName: { color: '#E0E0E0', fontSize: 18, fontWeight: 'bold' },
    welcomeText: { color: '#A0A0A0', fontSize: 14 },
    dateText: { color: '#707070', fontSize: 12 },
    notificationButton: { padding: 5 },
    navTabs: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#282828', marginBottom: 20 },
    tab: { paddingVertical: 8, paddingHorizontal: 15 },
    activeTab: { paddingVertical: 8, paddingHorizontal: 15, borderBottomWidth: 2, borderBottomColor: '#2196F3' },
    tabText: { color: '#A0A0A0', fontSize: 15 },
    activeTabText: { color: '#E0E0E0', fontSize: 15, fontWeight: 'bold' },
    sectionTitle: { color: '#E0E0E0', fontSize: 20, fontWeight: 'bold', marginVertical: 15, marginLeft: 10 },
    statsContainer: { flexDirection: 'row', paddingHorizontal: 5, marginBottom: 20 },

    // --- Styles du Graphique Annuel ---
    chartContainer: { backgroundColor: '#1E1E1E', borderRadius: 10, padding: 15, marginHorizontal: 10, marginBottom: 20, alignItems: 'center' },
    chartBarsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        width: '100%',
        height: CHART_HEIGHT,
        backgroundColor: '#282828',
        borderRadius: 8,
        paddingHorizontal: 10,
        overflow: 'hidden',
    },
    barGroupWrapper: {
        alignItems: 'center',
        marginHorizontal: 10,
        paddingTop: 5,
    },
    yearLabelText: {
        color: '#A0A0A0',
        fontSize: 10,
        marginTop: 5,
        width: 32,
        textAlign: 'center',
    },
    chartLegend: { color: '#A0A0A0', fontSize: 12, marginTop: 10 },
    chartLegendColors: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '80%',
        marginTop: 10,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center' },
    legendColor: { width: 10, height: 10, borderRadius: 5, marginRight: 5 },
    legendText: { color: '#E0E0E0', fontSize: 12 },
    // --- Fin Styles du Graphique Annuel ---

    quickAccessContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginHorizontal: 5,
        marginBottom: 80,
    },
    fab: {
        position: 'absolute',
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        right: 30,
        bottom: 30,
        backgroundColor: '#2196F3',
        borderRadius: 30,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84
    },
});

export default DashboardScreen;