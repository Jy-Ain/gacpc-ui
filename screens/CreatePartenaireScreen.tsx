import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { createPartenaire, CreatePartenaireData } from '../api/partenaires';
import { RootStackParamList } from '../types/navigation';

type CreatePartenaireScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CreatePartenaire'
>;

const CreatePartenaireScreen: React.FC = () => {
  const navigation = useNavigation<CreatePartenaireScreenNavigationProp>();

  const [nom, setNom] = useState('');
  const [type_partenaires, setTypePartenaires] = useState('');
  const [annee, setAnnee] = useState('');
  const [pays_origine, setPaysOrigine] = useState('');
  const [adresse, setAdresse] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [domaine, setDomaine] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation simple des champs
    if (!nom || !type_partenaires || !annee || !pays_origine || !domaine) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);
    const newPartenaire: CreatePartenaireData = {
      nom,
      type_partenaires,
      annee,
      pays_origine,
      adresse,
      telephone,
      email,
      domaine,
    };

    try {
      await createPartenaire(newPartenaire);
      Alert.alert('Succès', 'Partenaire ajouté avec succès !');
      navigation.goBack(); 
    } catch (error) {
      console.error('Erreur lors de la création du partenaire:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le partenaire. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.fullScreenContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#E0E0E0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouveau Partenaire</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Nom du Partenaire *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: CIDST"
          placeholderTextColor="#A0A0A0"
          value={nom}
          onChangeText={setNom}
        />

        <Text style={styles.label}>Type de Partenaire *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Partenaire Technique"
          placeholderTextColor="#A0A0A0"
          value={type_partenaires}
          onChangeText={setTypePartenaires}
        />

        <Text style={styles.label}>Année de Partenariat *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 2023"
          placeholderTextColor="#A0A0A0"
          keyboardType="numeric"
          value={annee}
          onChangeText={setAnnee}
        />

        <Text style={styles.label}>Pays d'Origine *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Madagascar"
          placeholderTextColor="#A0A0A0"
          value={pays_origine}
          onChangeText={setPaysOrigine}
        />

        <Text style={styles.label}>Adresse</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Antananarivo"
          placeholderTextColor="#A0A0A0"
          value={adresse}
          onChangeText={setAdresse}
        />

        <Text style={styles.label}>Téléphone</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 034 00 123 45"
          placeholderTextColor="#A0A0A0"
          keyboardType="phone-pad"
          value={telephone}
          onChangeText={setTelephone}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: contact@partenaire.com"
          placeholderTextColor="#A0A0A0"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Domaine *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Matériaux et Génie Civil"
          placeholderTextColor="#A0A0A0"
          value={domaine}
          onChangeText={setDomaine}
        />

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Ajouter Partenaire</Text>
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

export default CreatePartenaireScreen;