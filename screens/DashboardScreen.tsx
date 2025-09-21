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

// Importations des API
import { Chercheur, getChercheurs, getChercheurById } from '../api/chercheurs';
import { Article, getArticles } from '../api/articles';
import { Activite, getActivites } from '../api/activites';
import { Manifestation, getManifestations } from '../api/manifestations';

// Importations des composants
import StatCard from '../components/StatCard';
import QuickAccessButton from '../components/QuickAccessButton';
import AddActionsModal from '../components/AddActionsModal'; // <-- Importez le nouveau composant

// Importation des types de navigation (assurez-vous que le chemin est correct)
import { RootStackParamList } from '../types/navigation'; // J'ai corrigé le chemin ici


type DashboardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;

const { width } = Dimensions.get('window');

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [chercheurConnecte, setChercheurConnecte] = useState<Chercheur | null>(null);
  const [totalPublications, setTotalPublications] = useState(0);
  const [totalChercheurs, setTotalChercheurs] = useState(0);
  const [projetsEnCours, setProjetsEnCours] = useState(0);
  const [totalEvenements, setTotalEvenements] = useState(0);
  const [monthlyActivity, setMonthlyActivity] = useState<number[]>([]);
  const [modalVisible, setModalVisible] = useState(false); // <-- État pour la visibilité de la modale

  const CURRENT_USER_ID = 6; // L'ID du chercheur connecté, à remplacer par une vraie logique d'auth

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getChercheurById(CURRENT_USER_ID);
        setChercheurConnecte(user);

        const [chercheursData, articlesData, activitesData, manifestationsData] = await Promise.all([
          getChercheurs(),
          getArticles(),
          getActivites(),
          getManifestations(),
        ]);

        setTotalChercheurs(chercheursData.length);
        setTotalPublications(articlesData.length);

        const projects = activitesData.filter(act => act.type_activites === 'PR');
        setProjetsEnCours(projects.length);

        setTotalEvenements(manifestationsData.length);

        const currentYear = new Date().getFullYear();
        const monthlyCounts = Array(12).fill(0);

        // Calcul des publications par mois
        articlesData.forEach(article => {
          const articleDate = new Date(article.date_enregistrement);
          if (articleDate.getFullYear() === currentYear) {
            monthlyCounts[articleDate.getMonth()]++;
          }
        });

        // Calcul des activités par mois (en supposant que 'annee' est l'année de l'activité)
        // Note: Votre logique précédente utilisait 'new Date().getMonth()' pour les activités,
        // ce qui ne reflète pas l'activité historique. Je le change pour un exemple plus réaliste
        // où une date_activite ou une annee sur l'objet activite serait utilisée.
        // Si activite.annee est juste l'année, vous ne pouvez pas obtenir le mois précis.
        // Si vous avez un champ 'date_activite' sur votre objet Activite, utilisez-le.
        // Pour l'instant, je vais utiliser un exemple simple basé sur 'annee'
        activitesData.forEach(activite => {
            // Supposons que votre interface Activite ait une propriété 'date' ou 'mois_activite'
            // Si c'est juste 'annee', vous ne pouvez pas obtenir une distribution mensuelle réelle.
            // Pour l'exemple, j'ajoute un point à un mois aléatoire ou au mois actuel si l'année correspond.
            // Vous devrez ajuster cette logique si vous avez des dates plus précises.
            if (activite.annee === currentYear) {
                // Si vous avez un champ date_creation sur Activite, utilisez-le:
                // const activiteDate = new Date(activite.date_creation);
                // monthlyCounts[activiteDate.getMonth()]++;

                // Sinon, pour l'exemple, on peut arbitrairement ajouter à un mois:
                monthlyCounts[0]++; // Ajoute 1 à janvier pour chaque activité de l'année
            }
        });

        setMonthlyActivity(monthlyCounts);

      } catch (error) {
        console.error('Erreur lors du chargement des données du tableau de bord:', error);
        // Vous pouvez ajouter un état d'erreur ici si vous voulez afficher un message à l'utilisateur
        // setError('Impossible de charger les données du tableau de bord.');
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
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={{ uri: chercheurConnecte?.photo ? `http://10.0.2.2:3000/${chercheurConnecte.photo}` : 'https://img.freepik.com/vecteurs-libre/cercle-bleu-utilisateur-blanc_78370-4707.jpg' }}
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

        <Text style={styles.sectionTitle}>Statistiques Clés</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsContainer}>
          <StatCard
            title="Publications"
            value={totalPublications}
            description="en cours"
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
        </ScrollView>

        <Text style={styles.sectionTitle}>Activité Mensuelle</Text>
        <View style={styles.chartContainer}>
          <View style={styles.placeholderChart}>
            {monthlyActivity.map((count, index) => (
              <View
                key={index}
                style={[
                  styles.bar,
                  {
                    height: Math.max(5, count * 5), // Hauteur minimale de 5
                    // Utilisation d'une couleur plus constante pour le graphique si la barre est petite
                    backgroundColor: count > 0 ? '#2196F3' : '#333',
                  },
                ]}
              />
            ))}
          </View>
          <Text style={styles.chartLegend}>Activités et Publications par mois (Année en cours)</Text>
        </View>

        <Text style={styles.sectionTitle}>Accès Rapide</Text>
        <View style={styles.quickAccessContainer}>
          <QuickAccessButton iconName="calendar-clock" label="Mes Événements" onPress={() => navigation.navigate('Evenements')} />
          <QuickAccessButton iconName="file-chart" label="Générer Rapport" onPress={() => navigation.navigate('GenerateReport')} />
          <QuickAccessButton iconName="sync" label="Synchroniser" onPress={() => console.log('Synchroniser')} />
          <QuickAccessButton iconName="account-multiple" label="Partenaires" onPress={() => navigation.navigate('Partenaires')} />
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)} 
      >
        <Icon name="plus" size={30} color="#FFF" />
      </TouchableOpacity>

      <AddActionsModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#121212', // Assurez-vous que le conteneur parent est également dark
  },
  container: {
    flex: 1,
    padding: 10,
    // Ne pas mettre de paddingBottom ici pour laisser le FAB flotter au-dessus
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  loadingText: { color: '#E0E0E0', marginTop: 10, fontSize: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    marginRight: 10, 
    borderWidth: 1,
    borderColor: '#2196F3', 
  },
  headerCenter: { flex: 1, marginLeft: 10 },
  appName: { color: '#E0E0E0', fontSize: 18, fontWeight: 'bold' },
  welcomeText: { color: '#A0A0A0', fontSize: 14 },
  dateText: { color: '#707070', fontSize: 12 },
  notificationButton: { 
    padding: 5,
  },
  navTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
    marginBottom: 20,
  },
  tab: { paddingVertical: 8, paddingHorizontal: 15 },
  activeTab: { paddingVertical: 8, paddingHorizontal: 15, borderBottomWidth: 2, borderBottomColor: '#2196F3' },
  tabText: { color: '#A0A0A0', fontSize: 15 },
  activeTabText: { color: '#E0E0E0', fontSize: 15, fontWeight: 'bold' },
  sectionTitle: { color: '#E0E0E0', fontSize: 20, fontWeight: 'bold', marginVertical: 15, marginLeft: 10 },
  statsContainer: { flexDirection: 'row', paddingHorizontal: 5, marginBottom: 20 },
  chartContainer: { backgroundColor: '#1E1E1E', borderRadius: 10, padding: 15, marginHorizontal: 10, marginBottom: 20, alignItems: 'center' },
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
    overflow: 'hidden', // Pour que les barres ne dépassent pas
  },
  bar: {
    width: 15,
    borderRadius: 3,
    marginHorizontal: 2, // Espace entre les barres
  },
  chartLegend: { color: '#A0A0A0', fontSize: 12, marginTop: 10 },
  quickAccessContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start', // Garde vos boutons QuickAccess alignés à gauche
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
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
});

export default DashboardScreen;