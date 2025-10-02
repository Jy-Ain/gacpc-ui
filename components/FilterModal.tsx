import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface FilterModalProps {
    visible: boolean;
    type: 'year' | 'domain' | null;
    onClose: () => void;
    onSelect: (type: 'year' | 'domain', value: string | [number, number] | null) => void;
    
    // Données de référence et valeurs courantes
    availableYears?: number[];
    availableDomains?: string[];
    // Correction: On force le type à 'null' si la prop est absente (undefined)
    currentYearRange?: [number, number] | null; 
    currentDomain?: string | null;
}

const FilterModal: React.FC<FilterModalProps> = ({
    visible,
    type,
    onClose,
    onSelect,
    availableYears = [],
    availableDomains = [],
    // Utilisation de l'opérateur de coalescence nulle (??) pour garantir que la valeur est null si elle est undefined
    currentYearRange = null, 
    currentDomain = null,
}) => {
    // Les états locaux sont initialisés avec la valeur garantie (null si non fournie)
    const [selectedYearRange, setSelectedYearRange] = useState<[number, number] | null>(currentYearRange);
    const [selectedDomain, setSelectedDomain] = useState<string | null>(currentDomain);

    // Synchroniser les états locaux avec les props parentes lors de l'ouverture
    useEffect(() => {
        if (visible) {
            // Utiliser les props qui sont maintenant garanties d'être [number, number] | null
            setSelectedYearRange(currentYearRange);
            setSelectedDomain(currentDomain);
        }
    }, [visible, currentYearRange, currentDomain]);

    // --- Rendu du sélecteur d'année ---
    const renderYearSelector = () => {
        // Tranches d'années proposées
        const yearOptions = [
            { label: 'Toutes les années', value: null },
            { label: '2020 - 2024', value: [2020, 2024] as [number, number] },
            { label: '2015 - 2019', value: [2015, 2019] as [number, number] },
            { label: '2010 - 2014', value: [2010, 2014] as [number, number] },
            { label: 'Avant 2010', value: [1900, 2009] as [number, number] },
        ];
        
        // Fonction pour vérifier si une plage d'années est sélectionnée (gestion des objets vs null)
        const isYearRangeSelected = (optionValue: [number, number] | null) => {
            if (optionValue === null) {
                return selectedYearRange === null;
            }
            return (
                selectedYearRange !== null && 
                selectedYearRange[0] === optionValue[0] && 
                selectedYearRange[1] === optionValue[1]
            );
        };

        return (
            <View style={styles.selectorContainer}>
                <Text style={styles.modalTitle}>Sélectionner une **Plage d'Années**</Text>
                {yearOptions.map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.optionButton,
                            isYearRangeSelected(option.value) && styles.selectedOptionButton
                        ]}
                        onPress={() => setSelectedYearRange(option.value)}
                    >
                        <Text style={[
                            styles.optionText,
                            isYearRangeSelected(option.value) && styles.selectedOptionText
                        ]}>{option.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    // --- Rendu du sélecteur de domaine ---
    const renderDomainSelector = () => {
        
        return (
            <View style={styles.selectorContainer}>
                <Text style={styles.modalTitle}>Sélectionner un **Domaine**</Text>
                <ScrollView style={styles.domainOptionsScrollView}>
                    <TouchableOpacity
                        style={[
                            styles.optionButton,
                            !selectedDomain && styles.selectedOptionButton
                        ]}
                        onPress={() => setSelectedDomain(null)}
                    >
                        <Text style={[styles.optionText, !selectedDomain && styles.selectedOptionText]}>Tous les domaines</Text>
                    </TouchableOpacity>
                    {availableDomains.map((domain, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.optionButton,
                                selectedDomain === domain && styles.selectedOptionButton
                            ]}
                            onPress={() => setSelectedDomain(domain)}
                        >
                            <Text style={[styles.optionText, selectedDomain === domain && styles.selectedOptionText]}>{domain}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const handleApply = () => {
        if (type === 'year') {
            onSelect('year', selectedYearRange);
        } else if (type === 'domain') {
            onSelect('domain', selectedDomain);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Icon name="close" size={24} color="#E0E0E0" />
                    </TouchableOpacity>

                    {type === 'year' && renderYearSelector()}
                    {type === 'domain' && renderDomainSelector()}

                    <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                        <Text style={styles.applyButtonText}>Appliquer les filtres</Text>
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalView: {
        width: '90%',
        backgroundColor: '#1E1E1E',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        zIndex: 1,
    },
    selectorContainer: {
        width: '100%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#E0E0E0',
        marginBottom: 15,
        textAlign: 'center',
    },
    optionButton: {
        width: '100%',
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginVertical: 4,
        backgroundColor: '#333333',
        borderRadius: 10,
        alignItems: 'center',
    },
    selectedOptionButton: {
        backgroundColor: '#2196F3',
    },
    optionText: {
        color: '#E0E0E0',
        fontSize: 16,
    },
    selectedOptionText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    domainOptionsScrollView: {
        maxHeight: 250, 
        width: '100%',
        paddingHorizontal: 5,
    },
    applyButton: {
        marginTop: 20,
        backgroundColor: '#4CAF50', 
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 30,
        width: '100%',
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default FilterModal;