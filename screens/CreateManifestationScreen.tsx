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
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // ✅ correction
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { createManifestation } from '../api/manifestations';
import { getPartenaires, Partenaire } from '../api/partenaires';
import { RootStackParamList } from '../types/navigation';

type CreateManifestationScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'CreateManifestation'
>;

const CreateManifestationScreen: React.FC = () => {
    const navigation = useNavigation<CreateManifestationScreenNavigationProp>();

    const [theme, setTheme] = useState('');
    const [type_manifestations, setTypeManifestations] = useState('');
    const [intitule, setIntitule] = useState('');
    const [lieu, setLieu] = useState('');
    const [organisateur, setOrganisateur] = useState('');

    const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
    const [selectedPartenaireId, setSelectedPartenaireId] = useState<string | undefined>(undefined);

    const [loading, setLoading] = useState(false);
    const [partenairesLoading, setPartenairesLoading] = useState(true);

    useEffect(() => {
        const fetchPartenaires = async () => {
            try {
                const data = await getPartenaires();
                console.log('Partenaires chargés pour Manifestation:', data);
                setPartenaires(data);
                if (data.length > 0) {
                    setSelectedPartenaireId(data[0].id.toString());
                    console.log('ID du premier partenaire sélectionné par défaut pour Manifestation:', data[0].id);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des partenaires pour Manifestation:', error);
                Alert.alert('Erreur', 'Impossible de charger la liste des partenaires.');
            } finally {
                setPartenairesLoading(false);
            }
        };
        fetchPartenaires();
    }, []);

    const handleSubmit = async () => {
        console.log('--- Démarrage de la validation Manifestation ---');
        console.log('Thème:', theme);
        console.log('Type Manifestation:', type_manifestations);
        console.log('Intitulé:', intitule);
        console.log('Lieu:', lieu);
        console.log('Organisateur:', organisateur);
        console.log('ID Partenaire Sélectionné:', selectedPartenaireId);
        console.log('-----------------------------------');

        if (
            !theme ||
            !type_manifestations ||
            !intitule ||
            !lieu ||
            !organisateur ||
            !selectedPartenaireId
        ) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }

        setLoading(true);

        const manifestationData = {
            theme,
            type_manifestations,
            intitule,
            lieu,
            organisateur,
            id_partenaires: selectedPartenaireId,
        };

        try {
            await createManifestation(manifestationData);
            Alert.alert('Succès', 'Manifestation ajoutée avec succès !');
            navigation.goBack();
        } catch (error) {
            console.error('Erreur lors de la création de la manifestation:', error);
            Alert.alert('Erreur', 'Impossible d\'ajouter la manifestation. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    if (partenairesLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Chargement des partenaires...</Text>
            </View>
        );
    }

    return (
        <View style={styles.fullScreenContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#E0E0E0" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nouvel Événement</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.label}>Thème *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: Transfert de technologie, Recherche"
                    placeholderTextColor="#A0A0A0"
                    value={theme}
                    onChangeText={setTheme}
                />

                <Text style={styles.label}>Type de Manifestation *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: Séminaire, Forum, Conférence"
                    placeholderTextColor="#A0A0A0"
                    value={type_manifestations}
                    onChangeText={setTypeManifestations}
                />

                <Text style={styles.label}>Intitulé *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Intitulé complet de l'événement"
                    placeholderTextColor="#A0A0A0"
                    value={intitule}
                    onChangeText={setIntitule}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                />

                <Text style={styles.label}>Lieu *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: Antananarivo, Centre de Conférence"
                    placeholderTextColor="#A0A0A0"
                    value={lieu}
                    onChangeText={setLieu}
                />

                <Text style={styles.label}>Organisateur *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: MRSTD, Ministère de la Recherche Scientifique"
                    placeholderTextColor="#A0A0A0"
                    value={organisateur}
                    onChangeText={setOrganisateur}
                />

                <Text style={styles.label}>Partenaire Associé *</Text>
                <Picker
                    selectedValue={selectedPartenaireId}
                    onValueChange={(itemValue) => {
                        setSelectedPartenaireId(itemValue);
                        console.log('ID Partenaire sélectionné:', itemValue);
                    }}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                >
                    {partenaires.length === 0 && !partenairesLoading ? (
                        <Picker.Item label="Aucun partenaire disponible" value={undefined} enabled={false} style={styles.pickerPlaceholder} />
                    ) : (
                        partenaires.map((partenaire) => (
                            <Picker.Item key={partenaire.id} label={partenaire.nom} value={partenaire.id.toString()} />
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
                        <Text style={styles.submitButtonText}>Ajouter Événement</Text>
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

export default CreateManifestationScreen;
