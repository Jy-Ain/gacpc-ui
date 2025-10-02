import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

type FilterType = 'all' | 'chercheurs' | 'articles' | 'activites';

interface QuickFiltersProps {
    activeFilters: {
        type: FilterType;
        yearRange: [number, number] | null;
        domain: string | null;
    };
    handleTypeFilter: (type: FilterType) => void;
    openFilterModal: (type: 'year' | 'domain') => void;
}

const QuickFilters: React.FC<QuickFiltersProps> = ({
    activeFilters,
    handleTypeFilter,
    openFilterModal,
}) => {
    return (
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.quickFiltersContainer}
        >
            {/* Type (Tous) */}
            <TouchableOpacity 
                style={[styles.quickFilterButton, activeFilters.type === 'all' && styles.activeFilterButton]}
                onPress={() => handleTypeFilter('all')}
            >
                <Text style={activeFilters.type === 'all' ? styles.activeFilterText : styles.quickFilterText}>Type (Tous)</Text>
            </TouchableOpacity>
            
            {/* Types (Chercheurs, Articles, Activités) */}
            {(['chercheurs', 'articles', 'activites'] as FilterType[]).map((type) => (
                <TouchableOpacity 
                    key={type}
                    style={[styles.quickFilterButton, activeFilters.type === type && styles.activeFilterButton]}
                    onPress={() => handleTypeFilter(type)}
                >
                    <Text style={activeFilters.type === type ? styles.activeFilterText : styles.quickFilterText}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                </TouchableOpacity>
            ))}
            
            {/* Bouton Année -> Ouvre la modale Année */}
            <TouchableOpacity 
                style={[styles.quickFilterButton, activeFilters.yearRange !== null && styles.activeFilterButton]}
                onPress={() => openFilterModal('year')}
            >
                <Text style={activeFilters.yearRange !== null ? styles.activeFilterText : styles.quickFilterText}>
                    Année ({activeFilters.yearRange ? `${activeFilters.yearRange[0]}-${activeFilters.yearRange[1]}` : 'Toutes'})
                </Text>
            </TouchableOpacity>
            
            {/* Bouton Domaine -> Ouvre la modale Domaine */}
            <TouchableOpacity 
                style={[styles.quickFilterButton, activeFilters.domain !== null && styles.activeFilterButton]}
                onPress={() => openFilterModal('domain')}
            >
                <Text style={activeFilters.domain !== null ? styles.activeFilterText : styles.quickFilterText}>
                    Domaine ({activeFilters.domain || 'Tous'})
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    quickFiltersContainer: {
        flexDirection: 'row', paddingVertical: 20, paddingHorizontal: 5, alignItems: 'center', 
        backgroundColor: '#1E1E1E', borderBottomWidth: 1, borderBottomColor: '#282828',
    },
    quickFilterButton: {
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,height: 35,
        backgroundColor: '#333333', marginHorizontal: 5, justifyContent: 'center', alignItems: 'center',
    },
    activeFilterButton: { backgroundColor: '#2196F3' },
    quickFilterText: { color: '#E0E0E0', fontSize: 13 },
    activeFilterText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
});

export default React.memo(QuickFilters);