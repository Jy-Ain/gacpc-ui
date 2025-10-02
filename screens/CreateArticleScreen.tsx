import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { createArticle } from '../api/articles'; 
import { getChercheurs, Chercheur } from '../api/chercheurs'; 
import { RootStackParamList } from '../types/navigation';

type CreateArticleScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CreateArticle'
>;

const CreateArticleScreen: React.FC = () => {
  const navigation = useNavigation<CreateArticleScreenNavigationProp>();

  const [type_article, setTypeArticle] = useState('');
  const [annee, setAnnee] = useState('');
  const [titre, setTitre] = useState('');
  const [chercheurs, setChercheurs] = useState<Chercheur[]>([]);
  const [selectedChercheurId, setSelectedChercheurId] = useState<string | undefined>(undefined); 
  const [loading, setLoading] = useState(false);
  const [chercheursLoading, setChercheursLoading] = useState(true);

  useEffect(() => {
    const fetchChercheurs = async () => {
      try {
        const data = await getChercheurs();
        console.log('Chercheurs chargés:', data);
        setChercheurs(data);
        if (data.length > 0) {
          setSelectedChercheurId(data[0].id.toString());
          console.log('ID du premier chercheur sélectionné par défaut:', data[0].id);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des chercheurs:', error);
        Alert.alert('Erreur', 'Impossible de charger la liste des chercheurs.');
      } finally {
        setChercheursLoading(false);
      }
    };
    fetchChercheurs();
  }, []);

  const handleSubmit = async () => {
    console.log('--- Démarrage de la validation Article ---');
    console.log('Type Article:', type_article);
    console.log('Année:', annee);
    console.log('Titre:', titre);
    console.log('ID Chercheur Sélectionné:', selectedChercheurId);
    console.log('-----------------------------------');

    if (
      !type_article ||
      !annee ||
      !titre ||
      !selectedChercheurId
    ) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);

    const articleData = {
      type_article: type_article,
      annee: annee,
      titre: titre,
      id_chercheur: selectedChercheurId, 
      date_enregistrement: new Date().toISOString().split('T')[0], 
    };

    try {
      await createArticle(articleData); 
      Alert.alert('Succès', 'Article ajouté avec succès !');
      navigation.goBack();
    } catch (error) {
      console.error('Erreur lors de la création de l\'article:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter l\'article. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (chercheursLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Chargement des chercheurs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.fullScreenContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#E0E0E0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvel Article</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Type d'article *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Conférence, Journal, Thèse..."
          placeholderTextColor="#A0A0A0"
          value={type_article}
          onChangeText={setTypeArticle}
        />

        <Text style={styles.label}>Titre *</Text>
        <TextInput
          style={styles.input}
          placeholder="Titre complet de l'article"
          placeholderTextColor="#A0A0A0"
          value={titre}
          onChangeText={setTitre}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Année de publication *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 2023"
          placeholderTextColor="#A0A0A0"
          keyboardType="numeric" 
          maxLength={4}
          value={annee}
          onChangeText={setAnnee}
        />

        <Text style={styles.label}>Chercheur Associé *</Text>
        <Picker
          selectedValue={selectedChercheurId}
          onValueChange={(itemValue) => {
            setSelectedChercheurId(itemValue);
            console.log('ID Chercheur sélectionné:', itemValue);
          }}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          {chercheurs.length === 0 && !chercheursLoading ? (
            <Picker.Item label="Aucun chercheur disponible" value={undefined} enabled={false} style={styles.pickerPlaceholder} />
          ) : (
            chercheurs.map((chercheur) => (
              <Picker.Item key={chercheur.id} label={chercheur.nom} value={chercheur.id.toString()} />
            ))
          )}
        </Picker>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Ajouter Article</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#E0E0E0',
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
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
  label: {
    fontSize: 16,
    color: '#E0E0E0',
    marginBottom: 5,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#1E1E1E',
    color: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  picker: {
    backgroundColor: '#1E1E1E',
    color: '#E0E0E0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 0,
  },
  pickerItem: {
    color: '#E0E0E0',
    fontSize: 16,
    backgroundColor: '#1E1E1E',
  },
  pickerPlaceholder: {
    color: '#A0A0A0',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateArticleScreen;