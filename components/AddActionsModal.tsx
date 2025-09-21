// src/components/AddActionsModal.tsx
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
    <Icon name={iconName} size={24} color="#2196F3" style={styles.actionIcon} />
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const AddActionsModal: React.FC<AddActionsModalProps> = ({
  isVisible,
  onClose,
}) => {
  const navigation = useNavigation<AddActionsModalNavigationProp>();

  const handleActionPress = (screenName: keyof RootStackParamList) => {
    onClose();
    navigation.navigate(screenName);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Ajouter un élément</Text>

          <ActionCard
            iconName="file-document-plus-outline"
            label="Nouvelle Publication"
            onPress={() => handleActionPress('CreatePublication')}
          />
          <ActionCard
            iconName="account-plus-outline"
            label="Ajouter Chercheur"
            onPress={() => handleActionPress('CreateChercheur')}
          />
          <ActionCard
            iconName="flash"
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
      </View>
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
    backgroundColor: '#273c5eff',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    width: width * 0.8,
    maxHeight: height * 0.7,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
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
  },
  actionLabel: {
    color: '#E0E0E0',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#2196F3',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
});

export default AddActionsModal;