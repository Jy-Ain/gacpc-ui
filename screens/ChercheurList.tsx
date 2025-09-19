import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import de votre API Chercheurs
import { Chercheur, getChercheurs } from '../api/chercheurs'; // Assurez-vous que getChercheurs est bien exporté

const ChercheurListScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [chercheurs, setChercheurs] = useState<Chercheur[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChercheurs = async () => {
      try {
        const data = await getChercheurs();
        setChercheurs(data);
      } catch (err) {
        console.error('Erreur lors de la récupération des chercheurs:', err);
        setError('Impossible de charger les chercheurs. Veuillez vérifier la connexion.');
      } finally {
        setLoading(false);
      }
    };

    fetchChercheurs();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Chargement des chercheurs...</Text>
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

  const renderItem = ({ item }: { item: Chercheur }) => (
    <TouchableOpacity
      style={styles.chercheurCard}
      onPress={() => {
        // Naviguer vers un écran de détails du chercheur (à créer si nécessaire)
        // navigation.navigate('ChercheurDetail', { chercheurId: item.id });
        console.log(`Détails du chercheur: ${item.nom}`);
      }}
    >
      <Image
        source={{ uri: item.photo ? `http://10.0.2.2:3000/${item.photo}` : 'https://via.placeholder.com/60' }} // Assurez-vous que l'URL de base est correcte (10.0.2.2 pour Android emulator)
        style={styles.chercheurPhoto}
      />
      <View style={styles.chercheurInfo}>
        <Text style={styles.chercheurName}>{item.nom}</Text>
        <Text style={styles.chercheurSpecialite}>{item.specialite}</Text>
        <Text style={styles.chercheurEmail}>{item.adresse_mail}</Text>
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
        <Text style={styles.headerTitle}>Liste des Chercheurs</Text>
      </View>

      <FlatList
        data={chercheurs}
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
  chercheurCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50', // Couleur pour différencier les cartes
  },
  chercheurPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    backgroundColor: '#333',
  },
  chercheurInfo: {
    flex: 1,
  },
  chercheurName: {
    color: '#E0E0E0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chercheurSpecialite: {
    color: '#A0A0A0',
    fontSize: 14,
    marginTop: 2,
  },
  chercheurEmail: {
    color: '#707070',
    fontSize: 12,
    marginTop: 2,
  },
});

export default ChercheurListScreen;