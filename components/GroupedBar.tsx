import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AnnualBreakdown } from '../services/dashboardService';

interface GroupedBarProps {
    data: AnnualBreakdown;
    maxCount: number;
    chartHeight: number;
}

const GroupedBar: React.FC<GroupedBarProps> = ({ data, maxCount, chartHeight }) => {
    
    // Normalise la hauteur de la barre par rapport au maxCount
    const getBarHeight = (value: number) => (value / maxCount) * chartHeight;

    // Hauteur minimale pour les barres avec une valeur > 0 (pour la visibilité)
    const minHeight = 2; 

    return (
        <View style={styles.groupContainer}>
            {/* Barre 1 : Publications (Bleu) */}
            <View 
                style={[
                    styles.singleBar, 
                    { 
                        height: Math.max(minHeight, getBarHeight(data.articles)),
                        backgroundColor: '#2196F3', // Couleur Publication
                        marginRight: 2,
                    }
                ]} 
            />

            {/* Barre 2 : Activités (Vert) */}
            <View 
                style={[
                    styles.singleBar, 
                    { 
                        height: Math.max(minHeight, getBarHeight(data.activites)),
                        backgroundColor: '#4CAF50', // Couleur Activité
                    }
                ]} 
            />
        </View>
    );
};

const styles = StyleSheet.create({
    groupContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: '100%', // Le conteneur du groupe prend toute la hauteur disponible
    },
    singleBar: {
        width: 15,
        borderRadius: 3,
    },
});

export default GroupedBar;