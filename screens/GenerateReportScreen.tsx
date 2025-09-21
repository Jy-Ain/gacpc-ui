import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootStackParamList } from '../types/navigation';

type GenerateReportScreenNavigationProp = NavigationProp<RootStackParamList, 'GenerateReport'>;

const GenerateReportScreen: React.FC = () => {
  const navigation = useNavigation<GenerateReportScreenNavigationProp>();
  const [generating, setGenerating] = useState(false);

  const handleGenerateReport = () => {
    setGenerating(true);
    // Simuler un appel API ou un traitement long
    setTimeout(() => {
      setGenerating(false);
      Alert.alert('Rapport Généré', 'Votre rapport a été généré avec succès !');
      // Vous pourriez ici naviguer vers un écran de visualisation du rapport ou offrir un téléchargement
    }, 2000); // 2 secondes de simulation
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#E0E0E0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Générer Rapport</Text>
      </View>

      <View style={styles.content}>
        <Icon name="file-chart-outline" size={100} color="#A0A0A0" style={styles.mainIcon} />
        <Text style={styles.descriptionText}>
          Sélectionnez les options ci-dessous pour générer un rapport personnalisé sur les activités, publications ou chercheurs.
        </Text>

        {/* Placeholder pour les options de rapport */}
        <View style={styles.optionsContainer}>
            <Text style={styles.optionsText}>-- Options de filtrage (à implémenter) --</Text>
            <Text style={styles.optionsText}>Période: Année / Mois</Text>
            <Text style={styles.optionsText}>Type de données: Publications / Activités / Chercheurs</Text>
            <Text style={styles.optionsText}>Format: PDF / CSV</Text>
        </View>

        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerateReport}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.generateButtonText}>Générer le Rapport</Text>
          )}
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mainIcon: {
    marginBottom: 20,
  },
  descriptionText: {
    color: '#E0E0E0',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  optionsContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    marginBottom: 30,
    borderLeftWidth: 3,
    borderColor: '#4CAF50',
    alignItems: 'center',
  },
  optionsText: {
    color: '#A0A0A0',
    fontSize: 14,
    marginBottom: 5,
  },
  generateButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GenerateReportScreen;