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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { createActivite } from '../api/activites';
import { getChercheurs, Chercheur } from '../api/chercheurs';
import { getInstitutions, Institution } from '../api/institutions';
import { getPartenaires, Partenaire } from '../api/partenaires';
import { RootStackParamList } from '../types/navigation';

type CreateActiviteScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'CreateActivite'
>;

const CreateActiviteScreen: React.FC = () => {
    const navigation = useNavigation<CreateActiviteScreenNavigationProp>();

    const [type_activites, setTypeActivites] = useState('');
    const [annee, setAnnee] = useState('');
    const [duree, setDuree] = useState('');
    const [intitule, setIntitule] = useState('');
    const [departement, setDepartement] = useState('');
    const [thematique, setThematique] = useState('');
    const [objectifs_global, setObjectifsGlobal] = useState('');

    // Pour les listes déroulantes
    const [chercheurs, setChercheurs] = useState<Chercheur[]>([]);
    const [selectedChercheurId, setSelectedChercheurId] = useState<number | undefined>(undefined);
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [selectedInstitutionId, setSelectedInstitutionId] = useState<number | undefined>(undefined);
    const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
    const [selectedPartenaireId, setSelectedPartenaireId] = useState<number | undefined>(undefined);

    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [chercheursData, institutionsData, partenairesData] = await Promise.all([
                    getChercheurs(),
                    getInstitutions(),
                    getPartenaires(),
                ]);

                setChercheurs(chercheursData);
                if (chercheursData.length > 0) {
                    setSelectedChercheurId(chercheursData[0].id);
                }

                setInstitutions(institutionsData);
                if (institutionsData.length > 0) {
                    setSelectedInstitutionId(institutionsData[0].idPrimaire);
                }

                // Partenaires
                setPartenaires(partenairesData);
                if (partenairesData.length > 0) {
                    setSelectedPartenaireId(partenairesData[0].id);
                }

            } catch (error) {
                console.error('Erreur lors du chargement des données:', error);
                Alert.alert('Erreur', 'Impossible de charger les listes nécessaires (chercheurs, institutions, partenaires).');
            } finally {
                setDataLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async () => {
        if (
            !type_activites ||
            !annee ||
            !duree ||
            !intitule ||
            !departement ||
            !thematique ||
            !objectifs_global ||
            selectedChercheurId === undefined ||
            selectedInstitutionId === undefined ||
            selectedPartenaireId === undefined
        ) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }

        setLoading(true);

        const activiteData = {
            type_activites: type_activites,
            annee: parseInt(annee, 10),
            duree: duree,
            intitule: intitule,
            id_institution: selectedInstitutionId,
            departement: departement,
            id_chercheur: selectedChercheurId,
            thematique: thematique,
            objectifs_global: objectifs_global,
            id_partenaires: selectedPartenaireId,
        };

        try {
            await createActivite(activiteData);
            Alert.alert('Succès', 'Activité ajoutée avec succès !');
            navigation.goBack();
        } catch (error) {
            console.error('Erreur lors de la création de l\'activité:', error);
            Alert.alert('Erreur', 'Impossible d\'ajouter l\'activité. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    if (dataLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Chargement des données...</Text>
            </View>
        );
    }

    return (
        <View style={styles.fullScreenContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#E0E0E0" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nouvelle Activité</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.label}>Type d'activité *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: PR (Projet de Recherche), Conférence"
                    placeholderTextColor="#A0A0A0"
                    value={type_activites}
                    onChangeText={setTypeActivites}
                />

                <Text style={styles.label}>Intitulé *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Intitulé complet de l'activité"
                    placeholderTextColor="#A0A0A0"
                    value={intitule}
                    onChangeText={setIntitule}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                />

                <Text style={styles.label}>Année *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: 2023"
                    placeholderTextColor="#A0A0A0"
                    keyboardType="numeric"
                    maxLength={4}
                    value={annee}
                    onChangeText={setAnnee}
                />

                <Text style={styles.label}>Durée *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: 6 mois, 2 ans, ?"
                    placeholderTextColor="#A0A0A0"
                    value={duree}
                    onChangeText={setDuree}
                />

                <Text style={styles.label}>Département *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: Département Chimie"
                    placeholderTextColor="#A0A0A0"
                    value={departement}
                    onChangeText={setDepartement}
                />

                <Text style={styles.label}>Thématique *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: Environnement, Biotechnologie"
                    placeholderTextColor="#A0A0A0"
                    value={thematique}
                    onChangeText={setThematique}
                />

                <Text style={styles.label}>Objectifs Global *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Objectif général de l'activité"
                    placeholderTextColor="#A0A0A0"
                    value={objectifs_global}
                    onChangeText={setObjectifsGlobal}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                />

                <Text style={styles.label}>Institution *</Text>
                <Picker
                    selectedValue={selectedInstitutionId}
                    onValueChange={(itemValue: number) => setSelectedInstitutionId(itemValue)}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                >
                    {institutions.length === 0 ? (
                        <Picker.Item label="Aucune institution disponible" value={undefined} enabled={false} style={styles.pickerPlaceholder} />
                    ) : (
                        institutions.map((institution) => (
                            <Picker.Item key={institution.idPrimaire} label={institution.nom} value={institution.idPrimaire} />
                        ))
                    )}
                </Picker>

                <Text style={styles.label}>Chercheur Responsable *</Text>
                <Picker
                    selectedValue={selectedChercheurId}
                    onValueChange={(itemValue: number) => setSelectedChercheurId(itemValue)}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                >
                    {chercheurs.length === 0 ? (
                        <Picker.Item label="Aucun chercheur disponible" value={undefined} enabled={false} style={styles.pickerPlaceholder} />
                    ) : (
                        chercheurs.map((chercheur) => (
                            <Picker.Item key={chercheur.id} label={chercheur.nom} value={chercheur.id} />
                        ))
                    )}
                </Picker>

                <Text style={styles.label}>Partenaire *</Text>
                <Picker
                    selectedValue={selectedPartenaireId}
                    onValueChange={(itemValue: number) => setSelectedPartenaireId(itemValue)}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                >
                    {partenaires.length === 0 ? (
                        <Picker.Item label="Aucun partenaire disponible" value={undefined} enabled={false} style={styles.pickerPlaceholder} />
                    ) : (
                        partenaires.map((partenaire) => (
                            <Picker.Item key={partenaire.id} label={partenaire.nom} value={partenaire.id} />
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
                        <Text style={styles.submitButtonText}>Ajouter Activité</Text>
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

export default CreateActiviteScreen;
