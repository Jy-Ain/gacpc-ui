import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation'; 

const { width, height } = Dimensions.get('window');

// 1. Définir un type qui regroupe UNIQUEMENT les routes SANS paramètre
// Ces sont les routes que la modale est censée gérer
type ParamLessRoutes = 
    | 'CreatePublication' 
    | 'CreateChercheur' 
    | 'CreateActivite'
    | 'CreateEvenement' 
    | 'CreatePartenaire'
    | 'CreateArticle' // Si vous voulez séparer Publication et Article
    | 'CreateManifestation';

// 2. Simplifier le type de navigation
type AddActionsModalNavigationProp = StackNavigationProp<RootStackParamList>;

interface AddActionsModalProps {
    isVisible: boolean;
    onClose: () => void;
}

const ActionCard: React.FC<{
    iconName: string;
    label: string;
    onPress: () => void;
}> = ({ iconName, label, onPress }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
        <Icon name={iconName} size={24} color="#E0E0E0" style={styles.actionIcon} /> 
        <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
);

const AddActionsModal: React.FC<AddActionsModalProps> = ({
    isVisible,
    onClose,
}) => {
    const navigation = useNavigation<AddActionsModalNavigationProp>();

    const handleActionPress = (screenName: ParamLessRoutes) => {
        onClose();
        
        navigation.navigate(screenName, undefined); 
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <TouchableOpacity 
                style={styles.centeredView} 
                activeOpacity={1} 
                onPress={onClose} // Fermer la modale si on clique en dehors
            >
                <View style={styles.modalView} onStartShouldSetResponder={() => true}> 
                    <Text style={styles.modalTitle}>Ajouter un élément</Text>

                    <ActionCard
                        iconName="file-document-plus-outline"
                        label="Nouvelle Publication"
                        onPress={() => handleActionPress('CreatePublication')} // Assurez-vous que c'est le bon nom de route
                    />
                    <ActionCard
                        iconName="account-plus-outline"
                        label="Ajouter Chercheur"
                        onPress={() => handleActionPress('CreateChercheur')}
                    />
                    <ActionCard
                        iconName="flask" // Remplacer 'flash' par 'flask' pour un thème de recherche/projet
                        label="Enregistrer Activité"
                        onPress={() => handleActionPress('CreateActivite')}
                    />
                    <ActionCard
                        iconName="calendar-plus-outline"
                        label="Créer Événement"
                        onPress={() => handleActionPress('CreateEvenement')}
                    />
                    <ActionCard
                        iconName="handshake-outline"
                        label="Ajouter Partenaire"
                        onPress={() => handleActionPress('CreatePartenaire')}
                    />

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Icon name="close" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalView: {
        backgroundColor: '#1e1e1eff', 
        borderRadius: 15,
        padding: 25,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        width: width * 0.85, 
        maxHeight: height * 0.7,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#E0E0E0',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
        paddingBottom: 10,
        width: '100%',
        textAlign: 'center',
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#282828',
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginBottom: 10,
        width: '100%',
    },
    actionIcon: {
        marginRight: 15,
        color: '#2196F3', 
    },
    actionLabel: {
        color: '#E0E0E0',
        fontSize: 16,
        fontWeight: '600',
    },
    closeButton: {
        backgroundColor: '#2196F3',
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
});

export default AddActionsModal;