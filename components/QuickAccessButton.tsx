import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface QuickAccessButtonProps {
  iconName: string;
  label: string;
  onPress: () => void;
}

const QuickAccessButton: React.FC<QuickAccessButtonProps> = ({ iconName, label, onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Icon name={iconName} size={30} color="#E0E0E0" />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    margin: 5,
  },
  label: {
    color: '#E0E0E0',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default QuickAccessButton;