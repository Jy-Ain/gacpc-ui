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
  Platform,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary, launchCamera, ImagePickerResponse } from 'react-native-image-picker';

import { createChercheur } from '../api/chercheurs';
import { RootStackParamList } from '../types/navigation';
import { getInstitutions, Institution } from '../api/institutions';

type CreateChercheurScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CreateChercheur'
>;

const CreateChercheurScreen: React.FC = () => {
  const navigation = useNavigation<CreateChercheurScreenNavigationProp>();

  const [nom, setNom] = useState('');
  const [sexe, setSexe] = useState('');
  const [annee_de_naissance, setAnneeDeNaissance] = useState<Date | undefined>(undefined);
  const [showDatePickerNaissance, setShowDatePickerNaissance] = useState(false);
  const [lieu_de_naissance, setLieuDeNaissance] = useState('');
  const [diplome, setDiplome] = useState('');
  const [specialite, setSpecialite] = useState('');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<number | undefined>(undefined);
  const [date_entre_administration, setDateEntreAdministration] = useState<Date | undefined>(undefined);
  const [showDatePickerAdmin, setShowDatePickerAdmin] = useState(false);
  const [matricule, setMatricule] = useState('');
  const [adresse_mail, setAdresseMail] = useState('');
  const [loading, setLoading] = useState(false);
  const [institutionsLoading, setInstitutionsLoading] = useState(true);

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const data = await getInstitutions();
        console.log('Institutions chargées:', data);
        setInstitutions(data);
        if (data.length > 0) {
          setSelectedInstitutionId(data[0].idPrimaire);
          console.log('ID de la première institution sélectionné par défaut:', data[0].idPrimaire);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des institutions:', error);
        Alert.alert('Erreur', 'Impossible de charger la liste des institutions.');
      } finally {
        setInstitutionsLoading(false);
      }
    };
    fetchInstitutions();
  }, []);

  const onDateChangeNaissance = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || annee_de_naissance;
    setShowDatePickerNaissance(Platform.OS === 'ios');
    setAnneeDeNaissance(currentDate);
    console.log('Date de naissance sélectionnée:', currentDate);
  };

  const onDateChangeAdmin = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date_entre_administration;
    setShowDatePickerAdmin(Platform.OS === 'ios');
    setDateEntreAdministration(currentDate);
    console.log("Date d'entrée administration sélectionnée:", currentDate);
  };

  const handleChoosePhoto = () => {
    Alert.alert(
      "Sélectionner une photo",
      "Choisissez d'où vous voulez importer votre photo.",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Galerie",
          onPress: () => launchImageLibrary({ mediaType: 'photo' }, handleImagePickerResponse)
        },
        {
          text: "Appareil Photo",
          onPress: () => launchCamera({ mediaType: 'photo', cameraType: 'front' }, handleImagePickerResponse)
        }
      ]
    );
  };

  const handleImagePickerResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.errorMessage) {
      console.log('ImagePicker Error: ', response.errorMessage);
      Alert.alert('Erreur', 'Impossible de sélectionner la photo. Veuillez réessayer.');
    } else if (response.assets && response.assets.length > 0) {
      const asset = response.assets[0];
      setPhotoUri(asset.uri || null);

      // UPLOAD photoFile à faire 
      // if (asset.uri && asset.fileName && asset.type) {
      //   setPhotoFile({
      //     uri: asset.uri,
      //     name: asset.fileName,
      //     type: asset.type,
      //   });
      // }
      console.log('URI photo sélectionné:', asset.uri);
    }
  };


  const handleSubmit = async () => {
    console.log('--- Démarrage de la validation ---');
    console.log('Nom:', nom);
    console.log('Sexe:', sexe);
    console.log('Année de Naissance:', annee_de_naissance ? annee_de_naissance.toISOString().split('T')[0] : undefined);
    console.log('Lieu de Naissance:', lieu_de_naissance);
    console.log('Diplôme:', diplome);
    console.log('Spécialité:', specialite);
    console.log('ID Institution Sélectionnée:', selectedInstitutionId);
    console.log('Date Entrée Administration:', date_entre_administration ? date_entre_administration.toISOString().split('T')[0] : undefined);
    console.log('Matricule:', matricule);
    console.log('Adresse Mail:', adresse_mail);
    console.log('Photo URI (pour envoi):', photoUri);
    console.log('-----------------------------------');


    if (
      !nom ||
      !sexe ||
      !annee_de_naissance ||
      !lieu_de_naissance ||
      !diplome ||
      !specialite ||
      selectedInstitutionId === undefined ||
      selectedInstitutionId === null ||
      !date_entre_administration ||
      !matricule ||
      !adresse_mail
    ) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);

    const chercheurDataToSend = {
      nom: nom,
      sexe: sexe,
      annee_de_naissance: annee_de_naissance.toISOString().split('T')[0],
      lieu_de_naissance: lieu_de_naissance,
      diplome: diplome,
      specialite: specialite,
      id_institution: selectedInstitutionId,
      date_entre_administration: date_entre_administration.toISOString().split('T')[0],
      matricule: matricule,
      adresse_mail: adresse_mail,
      photo: photoUri || 'public/images/chercheurs/default_chercheur.jpg',
    };

    try {
      await createChercheur(chercheurDataToSend);
      Alert.alert('Succès', 'Chercheur ajouté avec succès !');
      navigation.goBack();
    } catch (error) {
      console.error('Erreur lors de la création du chercheur:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le chercheur. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (institutionsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Chargement des institutions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.fullScreenContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#E0E0E0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouveau Chercheur</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Photo de profil</Text>
        <TouchableOpacity style={styles.photoPickerButton} onPress={handleChoosePhoto}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.profileImage} />
          ) : (
            <Icon name="camera-plus" size={50} color="#A0A0A0" />
          )}
          <Text style={styles.photoPickerButtonText}>
            {photoUri ? 'Changer la photo' : 'Ajouter une photo'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Nom Complet *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: John Doe"
          placeholderTextColor="#A0A0A0"
          value={nom}
          onChangeText={setNom}
        />

        <Text style={styles.label}>Sexe *</Text>
        <Picker
          selectedValue={sexe}
          onValueChange={(itemValue) => {
            setSexe(itemValue);
            console.log('Sexe sélectionné:', itemValue);
          }}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          <Picker.Item label="Sélectionner le sexe" value="" enabled={false} style={styles.pickerPlaceholder} />
          <Picker.Item label="Masculin" value="Masculin" />
          <Picker.Item label="Féminin" value="Féminin" />
        </Picker>

        <Text style={styles.label}>Date de Naissance *</Text>
        <TouchableOpacity onPress={() => setShowDatePickerNaissance(true)} style={styles.datePickerButton}>
          <Text style={styles.datePickerButtonText}>
            {annee_de_naissance ? annee_de_naissance.toLocaleDateString() : 'Sélectionner une date'}
          </Text>
          <Icon name="calendar" size={20} color="#E0E0E0" />
        </TouchableOpacity>
        {showDatePickerNaissance && (
          <DateTimePicker
            testID="datePickerNaissance"
            value={annee_de_naissance || new Date()}
            mode="date"
            display="default"
            onChange={onDateChangeNaissance}
          />
        )}

        <Text style={styles.label}>Lieu de Naissance *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Antananarivo"
          placeholderTextColor="#A0A0A0"
          value={lieu_de_naissance}
          onChangeText={setLieuDeNaissance}
        />

        <Text style={styles.label}>Diplôme *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Doctorat"
          placeholderTextColor="#A0A0A0"
          value={diplome}
          onChangeText={setDiplome}
        />

        <Text style={styles.label}>Spécialité *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Sciences Biologiques"
          placeholderTextColor="#A0A0A0"
          value={specialite}
          onChangeText={setSpecialite}
        />

        <Text style={styles.label}>Institution *</Text>
        <Picker
          selectedValue={selectedInstitutionId}
          onValueChange={(itemValue) => {
            setSelectedInstitutionId(itemValue);
            console.log('ID Institution sélectionné:', itemValue);
          }}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          {institutions.length === 0 && !institutionsLoading && (
            <Picker.Item label="Aucune institution disponible" value={undefined} enabled={false} style={styles.pickerPlaceholder} />
          )}
          {institutions.map((inst) => (
            <Picker.Item key={inst.idPrimaire} label={inst.nom} value={inst.idPrimaire} />
          ))}
        </Picker>

        <Text style={styles.label}>Date d'entrée dans l'administration *</Text>
        <TouchableOpacity onPress={() => setShowDatePickerAdmin(true)} style={styles.datePickerButton}>
          <Text style={styles.datePickerButtonText}>
            {date_entre_administration ? date_entre_administration.toLocaleDateString() : 'Sélectionner une date'}
          </Text>
          <Icon name="calendar" size={20} color="#E0E0E0" />
        </TouchableOpacity>
        {showDatePickerAdmin && (
          <DateTimePicker
            testID="datePickerAdmin"
            value={date_entre_administration || new Date()}
            mode="date"
            display="default"
            onChange={onDateChangeAdmin}
          />
        )}

        <Text style={styles.label}>Matricule *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 123456"
          placeholderTextColor="#A0A0A0"
          value={matricule}
          onChangeText={setMatricule}
        />

        <Text style={styles.label}>Adresse Email *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: chercheur@example.com"
          placeholderTextColor="#A0A0A0"
          keyboardType="email-address"
          autoCapitalize="none"
          value={adresse_mail}
          onChangeText={setAdresseMail}
        />

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Ajouter Chercheur</Text>
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
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  datePickerButtonText: {
    color: '#E0E0E0',
    fontSize: 16,
  },
  photoPickerButton: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
    marginTop: 10,
    height: 150,
  },
  photoPickerButtonText: {
    color: '#E0E0E0',
    fontSize: 16,
    marginTop: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: 'cover',
    marginBottom: 10,
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

export default CreateChercheurScreen;