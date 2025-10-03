// src/screens/RechercheScreen.tsx (COMPLET ET CORRIGÉ)

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  Image,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Assurez-vous que ces types et fonctions API existent et sont corrects
import { RootStackParamList } from '../types/navigation';
import { Chercheur, getChercheurs } from '../api/chercheurs';
import { Article, getArticles } from '../api/articles';
import { Activite, getActivites } from '../api/activites';
import { Institution, getInstitutions } from '../api/institutions';

// Import des composants
import FilterModal from '../components/FilterModal';
import QuickFilters from '../components/QuickFilters';

type RechercheScreenNavigationProp = NavigationProp<RootStackParamList, 'Recherche'>;

// Types de filtres
type FilterType = 'all' | 'chercheurs' | 'articles' | 'activites';

interface ActiveFilters {
  type: FilterType;
  yearRange: [number, number] | null;
  domain: string | null;
}

interface ModalState {
  visible: boolean;
  type: 'year' | 'domain' | null;
}

const RechercheScreen: React.FC = () => {
  const navigation = useNavigation<RechercheScreenNavigationProp>();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Données complètes pré-chargées
  const [allChercheurs, setAllChercheurs] = useState<Chercheur[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [allActivites, setAllActivites] = useState<Activite[]>([]);
  const [allInstitutions, setAllInstitutions] = useState<Institution[]>([]);
  const [uniqueDomainsList, setUniqueDomainsList] = useState<string[]>([]);

  // Résultats filtrés
  const [filteredResults, setFilteredResults] = useState<{
    chercheurs: Chercheur[];
    articles: Article[];
    activites: Activite[];
  } | null>(null);

  // États des filtres actifs
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    type: 'all',
    yearRange: null,
    domain: null,
  });

  // État pour la modale de filtre
  const [modalState, setModalState] = useState<ModalState>({ visible: false, type: null });

  // --- Pré-chargement de TOUTES les données et calcul des domaines ---
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [chercheurs, articles, activites, institutions] = await Promise.all([
          getChercheurs(),
          getArticles(),
          getActivites(),
          getInstitutions(),
        ]);

        setAllChercheurs(chercheurs);
        setAllArticles(articles);
        setAllActivites(activites);
        setAllInstitutions(institutions);

        // Calculer les domaines uniques (Spécialités) à partir des chercheurs
        const uniqueDomains = Array.from(new Set(chercheurs
          .map(c => c.specialite)
          .filter(s => s && s.trim() !== '')
        )).sort();

        setUniqueDomainsList(uniqueDomains);

      } catch (err) {
        console.error('Erreur lors du pré-chargement des données:', err);
        setError('Impossible de charger les données initiales.');
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  // --- Logique de Filtrage Unifiée ---
  const applyFilters = useCallback(() => {
    if (loading) return;

    let currentChercheurs = [...allChercheurs];
    let currentArticles = [...allArticles];
    let currentActivites = [...allActivites];

    const lowerCaseSearchText = searchText.toLowerCase();

    // 1. Filtrage par texte global
    if (searchText.trim()) {
      currentChercheurs = currentChercheurs.filter(
        (chercheur) =>
          chercheur.nom.toLowerCase().includes(lowerCaseSearchText) ||
          chercheur.specialite.toLowerCase().includes(lowerCaseSearchText) ||
          chercheur.adresse_mail.toLowerCase().includes(lowerCaseSearchText) ||
          (chercheur.id_institution && allInstitutions.find(inst => inst.idPrimaire === chercheur.id_institution)?.nom.toLowerCase().includes(lowerCaseSearchText))
      );
      currentArticles = currentArticles.filter(
        (article) =>
          article.titre.toLowerCase().includes(lowerCaseSearchText) ||
          article.type_article.toLowerCase().includes(lowerCaseSearchText)
      );
      currentActivites = currentActivites.filter(
        (activite) =>
          activite.intitule.toLowerCase().includes(lowerCaseSearchText) ||
          activite.thematique.toLowerCase().includes(lowerCaseSearchText) ||
          activite.departement.toLowerCase().includes(lowerCaseSearchText)
      );
    }

    // 2. Filtrage par Type
    if (activeFilters.type !== 'all') {
      if (activeFilters.type === 'chercheurs') { currentArticles = []; currentActivites = []; }
      if (activeFilters.type === 'articles') { currentChercheurs = []; currentActivites = []; }
      if (activeFilters.type === 'activites') { currentChercheurs = []; currentArticles = []; }
    }

    // 3. Filtrage par Année
    if (activeFilters.yearRange) {
      const [minYear, maxYear] = activeFilters.yearRange;

      currentArticles = currentArticles.filter(article => {
        const articleYear = article.annee ? parseInt(article.annee.toString(), 10) : NaN;
        return !isNaN(articleYear) && articleYear >= minYear && articleYear <= maxYear;
      });

      currentActivites = currentActivites.filter(activite => {
        const activiteYear = activite.annee ? parseInt(activite.annee.toString(), 10) : NaN;
        return !isNaN(activiteYear) && activiteYear >= minYear && activiteYear <= maxYear;
      });
    }

    // 4. Filtrage par Domaine
    if (activeFilters.domain) {
      const lowerCaseDomain = activeFilters.domain.toLowerCase();

      currentChercheurs = currentChercheurs.filter(chercheur =>
        chercheur.specialite.toLowerCase().includes(lowerCaseDomain)
      );

      currentArticles = currentArticles.filter(article =>
        article.titre.toLowerCase().includes(lowerCaseDomain)
      );

      currentActivites = currentActivites.filter(activite =>
        activite.thematique.toLowerCase().includes(lowerCaseDomain)
      );
    }

    setFilteredResults({
      chercheurs: currentChercheurs,
      articles: currentArticles,
      activites: currentActivites,
    });

  }, [searchText, activeFilters, allChercheurs, allArticles, allActivites, allInstitutions, loading]);


  useEffect(() => {
    if (!loading) {
      // Re-appliquer les filtres à chaque changement de texte ou de filtre actif
      applyFilters();
    }
  }, [loading, searchText, activeFilters, applyFilters]); // Ajoutez searchText ici pour déclencher la recherche en temps réel

  // --- Handlers pour les filtres ---
  const handleTypeFilter = useCallback((type: FilterType) => {
    setActiveFilters(prev => ({ ...prev, type: prev.type === type ? 'all' : type }));
  }, []);

  const openFilterModal = useCallback((type: 'year' | 'domain') => {
    setModalState({ visible: true, type });
  }, []);

  const handleModalClose = useCallback(() => {
    setModalState({ visible: false, type: null });
  }, []);

  const handleValueSelect = useCallback((type: 'year' | 'domain', value: string | [number, number] | null) => {
    handleModalClose();
    if (type === 'year' && (value === null || Array.isArray(value))) {
      setActiveFilters(prev => ({ ...prev, yearRange: value }));
    } else if (type === 'domain' && (value === null || typeof value === 'string')) {
      setActiveFilters(prev => ({ ...prev, domain: value }));
    }
  }, [handleModalClose]);


  // --- Fonctions de rendu des éléments ---
  const renderChercheurItem = (item: Chercheur) => (
    <TouchableOpacity
      key={item.id}
      style={styles.resultCard}
      onPress={() => navigation.navigate('Profile', { chercheurId: item.id })}
    >
      <Image
        source={{ uri: item.photo || 'https://img.freepik.com/vecteurs-libre/cercle-bleu-utilisateur-blanc_78370-4707.jpg' }}
        style={styles.chercheurImage}
      />
      <View style={styles.chercheurInfo}>
        <Text style={styles.chercheurName}>{item.nom}</Text>
        <Text style={styles.chercheurSpecialite}>{item.specialite}</Text>
        {item.id_institution && (
          <Text style={styles.chercheurInstitution}>
            {allInstitutions.find(inst => inst.idPrimaire === item.id_institution)?.nom || 'Institution inconnue'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderArticleItem = (item: Article) => (
    // ✅ NAVIGATION VERS LE NOUVEL ÉCRAN ARTICLE
    <TouchableOpacity
      key={item.id}
      style={[styles.resultCard, styles.articleCard]}
      onPress={() => navigation.navigate('ArticleDetail', { articleId: item.id })}
    >
      <Icon name="file-document-outline" size={30} color="#E0E0E0" style={styles.articleIcon} />
      <View style={styles.articleInfo}>
        <Text style={styles.articleTitle}>{item.titre}</Text>
        <Text style={styles.articleMeta}>Type: {item.type_article} ({item.annee})</Text>
      </View>
    </TouchableOpacity>
  );

  const renderActiviteItem = (item: Activite) => (
    // ✅ NAVIGATION VERS LE NOUVEL ÉCRAN ACTIVITÉ
    <TouchableOpacity
      key={item.ID}
      style={[styles.resultCard, styles.activiteCard]}
      onPress={() => navigation.navigate('ActiviteDetail', { activiteId: item.ID })}
    >
      <Icon name="flask-outline" size={30} color="#E0E0E0" style={styles.activiteIcon} />
      <View style={styles.activiteInfo}>
        <Text style={styles.activiteTitle}>{item.intitule}</Text>
        <Text style={styles.activiteMeta}>Thématique: {item.thematique} ({item.annee})</Text>
      </View>
    </TouchableOpacity>
  );


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Chargement des données...</Text>
      </View>
    );
  }

  const domainsForModal = uniqueDomainsList;


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#E0E0E0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recherche</Text>
      </View>

      {/* Barre de Recherche et Bouton Filtre */}
      <View style={styles.mainSearchRow}>
        <View style={styles.searchInputWrapper}>
          <Icon name="magnify" size={20} color="#A0A0A0" style={styles.searchIcon} />
          <TextInput
            style={styles.unifiedSearchInput}
            placeholder="Rechercher un chercheur, un projet, article..."
            placeholderTextColor="#A0A0A0"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={Keyboard.dismiss}
          />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => console.log("Ouvrir panneau de filtres avancés")}>
          <Text style={styles.filterButtonText}>Filter +</Text>
        </TouchableOpacity>
      </View>

      {/* Filtres Rapides (Utilisation du composant QuickFilters stabilisé) */}
      <QuickFilters
        activeFilters={activeFilters}
        handleTypeFilter={handleTypeFilter}
        openFilterModal={openFilterModal}
      />

      <ScrollView contentContainerStyle={styles.resultsScrollView}>
        {error && <Text style={styles.errorMessage}>{error}</Text>}

        {filteredResults && (
          <View>
            {(searchText.trim() !== '' || activeFilters.type !== 'all' || activeFilters.yearRange || activeFilters.domain) && (
              <Text style={styles.filterCountText}>
                {
                  (filteredResults.chercheurs.length + filteredResults.articles.length + filteredResults.activites.length)
                } résultats
              </Text>
            )}

            {filteredResults.chercheurs.length > 0 && (
              <View>
                <Text style={styles.sectionResultsTitle}>Chercheurs ({filteredResults.chercheurs.length})</Text>
                {filteredResults.chercheurs.map(renderChercheurItem)}
              </View>
            )}
            {filteredResults.articles.length > 0 && (
              <View>
                <Text style={styles.sectionResultsTitle}>Articles ({filteredResults.articles.length})</Text>
                {filteredResults.articles.map(renderArticleItem)}
              </View>
            )}
            {filteredResults.activites.length > 0 && (
              <View>
                <Text style={styles.sectionResultsTitle}>Activités ({filteredResults.activites.length})</Text>
                {filteredResults.activites.map(renderActiviteItem)}
              </View>
            )}

            {filteredResults.chercheurs.length === 0 &&
              filteredResults.articles.length === 0 &&
              filteredResults.activites.length === 0 &&
              !loading && !error && (searchText.trim() !== '' || activeFilters.type !== 'all' || activeFilters.yearRange || activeFilters.domain) && (
                <Text style={styles.noResultsText}>Aucun résultat trouvé pour vos critères de recherche.</Text>
              )}
          </View>
        )}

        {!filteredResults && !loading && !error && searchText.trim() === '' && activeFilters.type === 'all' && !activeFilters.yearRange && !activeFilters.domain && (
          <View style={styles.initialMessageContainer}>
            <Icon name="information-outline" size={50} color="#A0A0A0" />
            <Text style={styles.initialMessageText}>Commencez à taper ou utilisez les filtres ci-dessus.</Text>
          </View>
        )}
      </ScrollView>

      {/* Modale de Filtre */}
      <FilterModal
        visible={modalState.visible}
        type={modalState.type}
        onClose={handleModalClose}
        onSelect={handleValueSelect}
        availableYears={Array.from({ length: new Date().getFullYear() - 1990 + 1 }, (_, i) => 1990 + i).reverse()}
        availableDomains={domainsForModal}
        currentYearRange={activeFilters.yearRange}
        currentDomain={activeFilters.domain}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  loadingText: { color: '#E0E0E0', marginTop: 10, fontSize: 16 },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 10,
    backgroundColor: '#1E1E1E', borderBottomWidth: 1, borderBottomColor: '#282828',
  },
  backButton: { marginRight: 10 },
  headerTitle: { color: '#E0E0E0', fontSize: 20, fontWeight: 'bold' },

  mainSearchRow: {
    flexDirection: 'row', alignItems: 'center', padding: 10,
    backgroundColor: '#1E1E1E', borderBottomWidth: 1, borderBottomColor: '#282828',
  },
  searchInputWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#333333', borderRadius: 8, paddingHorizontal: 10, marginRight: 10,
  },
  searchIcon: { marginRight: 5 },
  unifiedSearchInput: { flex: 1, paddingVertical: 10, color: '#E0E0E0', fontSize: 16 },
  filterButton: {
    backgroundColor: '#2196F3', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  filterButtonText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },

  filterCountText: {
    color: '#A0A0A0', fontSize: 14, textAlign: 'center', marginTop: 10, marginBottom: 10,
  },

  resultsScrollView: { padding: 10 },
  sectionResultsTitle: { color: '#E0E0E0', fontSize: 18, fontWeight: 'bold', marginTop: 15, marginBottom: 10 },

  resultCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E',
    borderRadius: 10, padding: 15, marginBottom: 10,
  },
  chercheurImage: { width: 40, height: 40, borderRadius: 20, marginRight: 15, backgroundColor: '#333' },
  chercheurInfo: { flex: 1 },
  chercheurName: { color: '#E0E0E0', fontSize: 16, fontWeight: 'bold' },
  chercheurSpecialite: { color: '#A0A0A0', fontSize: 13 },
  chercheurInstitution: { color: '#A0A0A0', fontSize: 12, marginTop: 2 },

  articleCard: { borderLeftWidth: 4, borderLeftColor: '#FFC107' },
  articleIcon: { marginRight: 15 },
  articleInfo: { flex: 1 },
  articleTitle: { color: '#E0E0E0', fontSize: 16, fontWeight: 'bold' },
  articleMeta: { color: '#A0A0A0', fontSize: 13, marginTop: 3 },

  activiteCard: { borderLeftWidth: 4, borderLeftColor: '#9C27B0' },
  activiteIcon: { marginRight: 15 },
  activiteInfo: { flex: 1 },
  activiteTitle: { color: '#E0E0E0', fontSize: 16, fontWeight: 'bold' },
  activiteMeta: { color: '#A0A0A0', fontSize: 13, marginTop: 3 },

  errorMessage: { color: '#FF6347', textAlign: 'center', marginTop: 20, fontSize: 16 },
  noResultsText: { color: '#A0A0A0', textAlign: 'center', marginTop: 30, fontSize: 16 },
  initialMessageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  initialMessageText: { color: '#A0A0A0', fontSize: 16, marginTop: 10 },
});

export default RechercheScreen;