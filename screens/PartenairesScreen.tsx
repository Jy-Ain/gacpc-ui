import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image, // Gardons Image au cas où vous ajouteriez des logos plus tard
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootStackParamList } from '../types/navigation';
import { Partenaire, getPartenaires } from '../api/partenaires'; // Importez la vraie API

type PartenairesScreenNavigationProp = NavigationProp<RootStackParamList, 'Partenaires'>;

const PartenairesScreen: React.FC = () => {
  const navigation = useNavigation<PartenairesScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPartenaires = async () => {
      try {
        const data = await getPartenaires();
        setPartenaires(data);
      } catch (err) {
        console.error('Erreur lors de la récupération des partenaires:', err);
        setError('Impossible de charger les partenaires. Veuillez vérifier la connexion.');
      } finally {
        setLoading(false);
      }
    };

    fetchPartenaires();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Chargement des partenaires...</Text>
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

  const renderItem = ({ item }: { item: Partenaire }) => (
    <TouchableOpacity
      style={styles.partenaireCard}
      onPress={() => {
        // navigation.navigate('PartenaireDetail', { partenaireId: item.id }); // Pourrait être un écran de détail
        console.log(`Détails du partenaire: ${item.nom}`);
      }}
    >
      {/* Pas de logo_url dans vos données. On pourrait mettre une icône générique ou un placeholder */}
      <View style={styles.partenaireIconContainer}>
        <Icon name="handshake-outline" size={30} color="#00BCD4" />
      </View>

      <View style={styles.partenaireInfo}>
        <Text style={styles.partenaireName}>{item.nom}</Text>
        <Text style={styles.partenaireType}>{item.type_partenaires} ({item.annee})</Text>
        <Text style={styles.partenaireDetail}><Icon name="map-marker-outline" size={12} color="#A0A0A0" /> {item.adresse}, {item.pays_origine}</Text>
        <Text style={styles.partenaireDetail}><Icon name="phone-outline" size={12} color="#A0A0A0" /> {item.telephone}</Text>
        <Text style={styles.partenaireDetail}><Icon name="email-outline" size={12} color="#A0A0A0" /> {item.email}</Text>
        <Text style={styles.partenaireDetail}><Icon name="domain" size={12} color="#A0A0A0" /> {item.domaine}</Text>
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
        <Text style={styles.headerTitle}>Partenaires</Text>
      </View>

      <FlatList
        data={partenaires}
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
  partenaireCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#00BCD4',
  },
  partenaireIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  partenaireInfo: {
    flex: 1,
  },
  partenaireName: {
    color: '#E0E0E0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  partenaireType: {
    color: '#A0A0A0',
    fontSize: 14,
    marginTop: 5,
  },
  partenaireDetail: {
    color: '#707070',
    fontSize: 12,
    marginTop: 3,
  },
});

export default PartenairesScreen;