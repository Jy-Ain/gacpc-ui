import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  iconName?: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, iconName, color = '#2196F3' }) => {
  return (
    <View style={[styles.card, { borderColor: color }]}>
      <View style={styles.cardHeader}>
        {iconName && <Icon name={iconName} size={20} color={color} style={styles.icon} />}
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={[styles.cardValue, { color }]}>{value}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
    width: 150,
    borderLeftWidth: 3,
    justifyContent: 'space-between',
    height: 120,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  icon: {
    marginRight: 5,
  },
  cardTitle: {
    color: '#E0E0E0',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDescription: {
    color: '#B0B0B0',
    fontSize: 12,
  },
});

export default StatCard;