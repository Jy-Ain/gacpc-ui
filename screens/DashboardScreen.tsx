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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { Chercheur, getChercheurs, getChercheurById } from '../api/chercheurs';
import { Article, getArticles } from '../api/articles';
import { Activite, getActivites } from '../api/activites';
import { Manifestation, getManifestations } from '../api/manifestations';


import StatCard from '../components/StatCard';
import QuickAccessButton from '../components/QuickAccessButton';

const { width } = Dimensions.get('window');

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [chercheurConnecte, setChercheurConnecte] = useState<Chercheur | null>(null);
  const [totalPublications, setTotalPublications] = useState(0);
  const [totalChercheurs, setTotalChercheurs] = useState(0);
  const [projetsEnCours, setProjetsEnCours] = useState(0);
  const [totalEvenements, setTotalEvenements] = useState(0);
  const [monthlyActivity, setMonthlyActivity] = useState<number[]>([]);


  const CURRENT_USER_ID = 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer le chercheur connecté
        const user = await getChercheurById(CURRENT_USER_ID);
        setChercheurConnecte(user);

        // Récupérer les données pour les statistiques
        const [chercheursData, articlesData, activitesData, manifestationsData] = await Promise.all([
          getChercheurs(),
          getArticles(),
          getActivites(),
          getManifestations(),
        ]);

        setTotalChercheurs(chercheursData.length);
        setTotalPublications(articlesData.length);

        // Filtrer les activités de type 'PR' (Projet de Recherche)
        // Note: Sans champ de statut 'en cours' ou 'terminé', nous comptons tous les PR.
        const projects = activitesData.filter(act => act.type_activites === 'PR');
        setProjetsEnCours(projects.length);

        setTotalEvenements(manifestationsData.length);

        // Logique simplifiée pour l'activité mensuelle (nombre d'articles + activités par mois)
        const currentYear = new Date().getFullYear();
        const monthlyCounts = Array(12).fill(0);

        articlesData.forEach(article => {
          const articleDate = new Date(article.date_enregistrement);
          if (articleDate.getFullYear() === currentYear) {
            monthlyCounts[articleDate.getMonth()]++;
          }
        });

        activitesData.forEach(activite => {
          if (activite.annee === currentYear) {
            // Approximation: si l'année est la même, on ajoute au mois en cours ou répartit
            // Pour un vrai graphique, il faudrait une date de début/fin plus précise pour chaque activité.
            // Ici, on ajoute simplement au mois de l'année en cours pour l'exemple.
            const currentMonth = new Date().getMonth();
            monthlyCounts[currentMonth]++;
          }
        });
        setMonthlyActivity(monthlyCounts);

      } catch (error) {
        console.error('Erreur lors du chargement des données du tableau de bord:', error);
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
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#E0E0E0" />
          </TouchableOpacity>
          <Image
            source={{ uri: chercheurConnecte?.photo ? chercheurConnecte?.photo : 'https://img.freepik.com/vecteurs-libre/cercle-bleu-utilisateur-blanc_78370-4707.jpg?semt=ais_incoming&w=740&q=80' }}
            style={styles.profileImage}
          />
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.appName}>CIDST Recherche</Text>
          <Text style={styles.welcomeText}>
            Bienvenue, {chercheurConnecte?.nom.split(' ')[0]}!
          </Text>
          <Text style={styles.dateText}>Fin prévue: 14 Oct. 2025</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.profileButtonText}>Profil</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Tabs (simplified for dashboard) */}
      <View style={styles.navTabs}>
        <TouchableOpacity style={styles.activeTab}>
          <Text style={styles.activeTabText}>Tableau de Bord</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Recherche')}>
          <Text style={styles.tabText}>Recherche</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.tabText}>Profil</Text>
        </TouchableOpacity>
      </View>

      {/* Statistiques Clés */}
      <Text style={styles.sectionTitle}>Statistiques Clés</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsContainer}>
        <StatCard
          title="Publications"
          value={totalPublications}
          description="en cours" // Cette description est statique, à adapter si vous avez un statut réel
          iconName="file-document-outline"
          color="#2196F3"
        />
        <StatCard
          title="Chercheurs Actifs"
          value={totalChercheurs}
          description="chercheurs au CIDST"
          iconName="account-group-outline"
          color="#4CAF50"
        />
        <StatCard
          title="Projets en Cours"
          value={projetsEnCours}
          description="projets actifs"
          iconName="flask-outline"
          color="#FFC107"
        />
        {/* Ajoutez d'autres StatCard si nécessaire */}
      </ScrollView>

      {/* Activité Mensuelle (Graphique simplifié) */}
      <Text style={styles.sectionTitle}>Activité Mensuelle</Text>
      <View style={styles.chartContainer}>
        {/* Ici, on ferait un vrai composant de graphique (ex: react-native-chart-kit)
            Pour l'instant, c'est un placeholder visuel. */}
        <View style={styles.placeholderChart}>
          {monthlyActivity.map((count, index) => (
            <View
              key={index}
              style={[
                styles.bar,
                {
                  height: Math.max(5, count * 5), // Ajustez le multiplicateur pour la visualisation
                  backgroundColor: `rgba(33, 150, 243, ${0.5 + (count / Math.max(...monthlyActivity)) * 0.5})`,
                },
              ]}
            />
          ))}
        </View>
        <Text style={styles.chartLegend}>Activités et Publications par mois (Année en cours)</Text>
      </View>

      {/* Accès Rapide */}
      <Text style={styles.sectionTitle}>Accès Rapide</Text>
      <View style={styles.quickAccessContainer}>
        <QuickAccessButton iconName="calendar-clock" label="Mes Événements" onPress={() => navigation.navigate('Evenements')} />
        <QuickAccessButton iconName="file-chart" label="Générer Rapport" onPress={() => navigation.navigate('GenerateReport')} />
        <QuickAccessButton iconName="sync" label="Synchroniser" onPress={() => console.log('Synchroniser')} />
        <QuickAccessButton iconName="account-multiple" label="Partenaires" onPress={() => navigation.navigate('Partenaires')} />
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => console.log('Ajouter quelque chose')}>
        <Icon name="plus" size={30} color="#FFF" />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Fond sombre
    padding: 10,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 10,
  },
  appName: {
    color: '#E0E0E0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  welcomeText: {
    color: '#A0A0A0',
    fontSize: 14,
  },
  dateText: {
    color: '#707070',
    fontSize: 12,
  },
  profileButton: {
    backgroundColor: '#282828',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  profileButtonText: {
    color: '#E0E0E0',
    fontSize: 14,
  },
  navTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  activeTab: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    color: '#A0A0A0',
    fontSize: 15,
  },
  activeTabText: {
    color: '#E0E0E0',
    fontSize: 15,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#E0E0E0',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 15,
    marginLeft: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    marginBottom: 20,
  },
  chartContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  placeholderChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    width: '100%',
    height: 100,
    backgroundColor: '#282828',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingBottom: 5,
  },
  bar: {
    width: 15,
    borderRadius: 3,
  },
  chartLegend: {
    color: '#A0A0A0',
    fontSize: 12,
    marginTop: 10,
  },
  quickAccessContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: 5,
    marginBottom: 80, // Espace pour le FAB
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
    elevation: 8, // Ombre pour Android
    shadowColor: '#000', // Ombre pour iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default DashboardScreen;