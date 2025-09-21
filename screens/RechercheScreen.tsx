import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootStackParamList } from '../types/navigation';
import { Chercheur, getChercheurs } from '../api/chercheurs';
import { Article, getArticles } from '../api/articles';
import { Activite, getActivites } from '../api/activites';

type RechercheScreenNavigationProp = NavigationProp<RootStackParamList, 'Recherche'>;

const RechercheScreen: React.FC = () => {
  const navigation = useNavigation<RechercheScreenNavigationProp>();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    chercheurs: Chercheur[];
    articles: Article[];
    activites: Activite[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    Keyboard.dismiss(); // Cacher le clavier
    if (!searchText.trim()) {
      setSearchResults(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [allChercheurs, allArticles, allActivites] = await Promise.all([
        getChercheurs(),
        getArticles(),
        getActivites(),
      ]);

      const lowerCaseSearchText = searchText.toLowerCase();

      const filteredChercheurs = allChercheurs.filter(
        (chercheur) =>
          chercheur.nom.toLowerCase().includes(lowerCaseSearchText) ||
          chercheur.specialite.toLowerCase().includes(lowerCaseSearchText) ||
          chercheur.adresse_mail.toLowerCase().includes(lowerCaseSearchText)
      );

      const filteredArticles = allArticles.filter(
        (article) =>
          article.titre.toLowerCase().includes(lowerCaseSearchText) ||
          article.type_article.toLowerCase().includes(lowerCaseSearchText)
      );

      const filteredActivites = allActivites.filter(
        (activite) =>
          activite.intitule.toLowerCase().includes(lowerCaseSearchText) ||
          activite.thematique.toLowerCase().includes(lowerCaseSearchText) ||
          activite.departement.toLowerCase().includes(lowerCaseSearchText)
      );

      setSearchResults({
        chercheurs: filteredChercheurs,
        articles: filteredArticles,
        activites: filteredActivites,
      });
    } catch (err) {
      console.error('Erreur lors de la recherche:', err);
      setError('Une erreur est survenue lors de la recherche.');
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  const renderChercheurItem = (item: Chercheur) => (
    <View key={item.id} style={styles.resultCard}>
      <Text style={styles.resultTitle}>{item.nom}</Text>
      <Text style={styles.resultSubtitle}>{item.specialite}</Text>
      <Text style={styles.resultDetail}>{item.adresse_mail}</Text>
    </View>
  );

  const renderArticleItem = (item: Article) => (
    <View key={item.id} style={styles.resultCard}>
      <Text style={styles.resultTitle}>{item.titre}</Text>
      <Text style={styles.resultSubtitle}>Type: {item.type_article} ({item.annee})</Text>
      {/* Vous pouvez ajouter le nom du chercheur ici si vous avez les données complètes */}
    </View>
  );

  const renderActiviteItem = (item: Activite) => (
    <View key={item.ID} style={styles.resultCard}>
      <Text style={styles.resultTitle}>{item.intitule}</Text>
      <Text style={styles.resultSubtitle}>Thématique: {item.thematique}</Text>
      <Text style={styles.resultDetail}>Année: {item.annee}</Text>
    </View>
  );


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#E0E0E0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recherche</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher des chercheurs, articles, activités..."
          placeholderTextColor="#A0A0A0"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch} // Lance la recherche quand on appuie sur Entrée/Terminé
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Icon name="magnify" size={24} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.resultsScrollView}>
        {error && <Text style={styles.errorMessage}>{error}</Text>}

        {searchResults && (
          <View>
            {searchResults.chercheurs.length > 0 && (
              <View>
                <Text style={styles.sectionResultsTitle}>Chercheurs ({searchResults.chercheurs.length})</Text>
                {searchResults.chercheurs.map(renderChercheurItem)}
              </View>
            )}
            {searchResults.articles.length > 0 && (
              <View>
                <Text style={styles.sectionResultsTitle}>Articles ({searchResults.articles.length})</Text>
                {searchResults.articles.map(renderArticleItem)}
              </View>
            )}
            {searchResults.activites.length > 0 && (
              <View>
                <Text style={styles.sectionResultsTitle}>Activités ({searchResults.activites.length})</Text>
                {searchResults.activites.map(renderActiviteItem)}
              </View>
            )}

            {searchResults.chercheurs.length === 0 &&
             searchResults.articles.length === 0 &&
             searchResults.activites.length === 0 &&
             !loading && !error && searchText.trim() !== '' && (
              <Text style={styles.noResultsText}>Aucun résultat trouvé pour "{searchText}".</Text>
            )}
          </View>
        )}

        {!searchResults && !loading && searchText.trim() === '' && (
          <View style={styles.initialMessageContainer}>
            <Icon name="information-outline" size={50} color="#A0A0A0" />
            <Text style={styles.initialMessageText}>Entrez un mot-clé pour lancer une recherche.</Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: '#E0E0E0',
    marginRight: 10,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsScrollView: {
    padding: 10,
  },
  sectionResultsTitle: {
    color: '#E0E0E0',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  resultCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  resultTitle: {
    color: '#E0E0E0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultSubtitle: {
    color: '#A0A0A0',
    fontSize: 13,
    marginTop: 5,
  },
  resultDetail: {
    color: '#707070',
    fontSize: 12,
    marginTop: 3,
  },
  errorMessage: {
    color: '#FF6347',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  noResultsText: {
    color: '#A0A0A0',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
  },
  initialMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  initialMessageText: {
    color: '#A0A0A0',
    fontSize: 16,
    marginTop: 10,
  }
});

export default RechercheScreen;