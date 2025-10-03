import React, { useState, useMemo } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Modal, 
    Platform, 
    ScrollView 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Définition des types pour les props
interface YearRangePickerProps {
    startYear: number | null;
    endYear: number | null;
    onRangeChange: (start: number | null, end: number | null) => void;
    minYear?: number;
    maxYear?: number;
}

// Fonction utilitaire pour générer la liste des années
const generateYears = (min: number, max: number) => {
    const years: number[] = [];
    for (let i = max; i >= min; i--) {
        years.push(i);
    }
    return years;
};

const CURRENT_YEAR = new Date().getFullYear();

const YearRangePicker: React.FC<YearRangePickerProps> = ({
    startYear,
    endYear,
    onRangeChange,
    minYear = 1950, // Année par défaut
    maxYear = CURRENT_YEAR,
}) => {
    const yearsList = useMemo(() => generateYears(minYear, maxYear), [minYear, maxYear]);

    const [modalVisible, setModalVisible] = useState(false);
    const [isSelectingStart, setIsSelectingStart] = useState(true); // true pour l'année de début, false pour l'année de fin
    
    // État temporaire pour la sélection
    const [tempStartYear, setTempStartYear] = useState<number | null>(startYear);
    const [tempEndYear, setTempEndYear] = useState<number | null>(endYear);


    const handleSelectYear = (year: number) => {
        if (isSelectingStart) {
            setTempStartYear(year);
        } else {
            setTempEndYear(year);
        }
    };

    const handleConfirm = () => {
        let finalStart = tempStartYear;
        let finalEnd = tempEndYear;

        // Logique pour s'assurer que Start <= End
        if (finalStart !== null && finalEnd !== null && finalStart > finalEnd) {
            // Échange les valeurs si l'ordre est incorrect
            [finalStart, finalEnd] = [finalEnd, finalStart];
            setTempStartYear(finalStart);
            setTempEndYear(finalEnd);
        }
        
        onRangeChange(finalStart, finalEnd);
        setModalVisible(false);
    };

    const handleOpenModal = (isStart: boolean) => {
        setIsSelectingStart(isStart);
        // Synchroniser l'état temporaire avant d'ouvrir
        setTempStartYear(startYear);
        setTempEndYear(endYear);
        setModalVisible(true);
    };

    const handleClear = () => {
        onRangeChange(null, null);
    };


    const renderYearSelection = (isStartSelection: boolean) => {
        const currentSelection = isStartSelection ? tempStartYear : tempEndYear;
        const otherSelection = isStartSelection ? tempEndYear : tempStartYear;
        
        return (
            <View style={styles.yearPickerContainer}>
                <Text style={styles.pickerTitle}>
                    {isStartSelection ? 'Année de Début' : 'Année de Fin'}
                </Text>
                
                <ScrollView contentContainerStyle={styles.yearList}>
                    {yearsList.map((year) => {
                        let isDisabled = false;
                        
                        // Désactiver les années si elles violent l'ordre Start <= End
                        if (otherSelection !== null) {
                             if (isStartSelection) {
                                // En mode sélection "Start", ne peut pas être > End
                                isDisabled = year > otherSelection;
                            } else {
                                // En mode sélection "End", ne peut pas être < Start
                                isDisabled = year < otherSelection;
                            }
                        }
                        
                        return (
                            <TouchableOpacity
                                key={year}
                                style={[
                                    styles.yearButton,
                                    currentSelection === year && styles.yearButtonSelected,
                                    isDisabled && styles.yearButtonDisabled,
                                ]}
                                onPress={() => handleSelectYear(year)}
                                disabled={isDisabled}
                            >
                                <Text style={[
                                    styles.yearButtonText,
                                    currentSelection === year && styles.yearButtonTextSelected,
                                    isDisabled && styles.yearButtonTextDisabled,
                                ]}>
                                    {year}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        );
    };


    return (
        <View style={styles.container}>
            <Text style={styles.label}>Filtrer par Année</Text>
            <View style={styles.inputRow}>
                
                {/* Sélecteur Année de Début */}
                <TouchableOpacity style={styles.input} onPress={() => handleOpenModal(true)}>
                    <Icon name="calendar-start" size={18} color="#2196F3" />
                    <Text style={styles.inputText}>
                        {startYear !== null ? startYear : 'Début'}
                    </Text>
                </TouchableOpacity>

                <Text style={styles.separator}>—</Text>

                {/* Sélecteur Année de Fin */}
                <TouchableOpacity style={styles.input} onPress={() => handleOpenModal(false)}>
                    <Icon name="calendar-end" size={18} color="#2196F3" />
                    <Text style={styles.inputText}>
                        {endYear !== null ? endYear : 'Fin'}
                    </Text>
                </TouchableOpacity>
                
                {/* Bouton Effacer */}
                {(startYear !== null || endYear !== null) && (
                    <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                        <Icon name="close-circle-outline" size={24} color="#FF6347" />
                    </TouchableOpacity>
                )}
            </View>


            {/* Modal de Sélection des Années */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Sélectionnez l'Année</Text>
                            <View style={styles.tabsContainer}>
                                <TouchableOpacity 
                                    style={[styles.tabButton, isSelectingStart && styles.tabButtonActive]}
                                    onPress={() => setIsSelectingStart(true)}
                                >
                                    <Text style={[styles.tabText, isSelectingStart && styles.tabTextActive]}>Début: {tempStartYear || 'Choisir'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.tabButton, !isSelectingStart && styles.tabButtonActive]}
                                    onPress={() => setIsSelectingStart(false)}
                                >
                                    <Text style={[styles.tabText, !isSelectingStart && styles.tabTextActive]}>Fin: {tempEndYear || 'Choisir'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        
                        {renderYearSelection(isSelectingStart)}

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                                <Text style={styles.confirmButtonText}>Confirmer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 15,
        paddingHorizontal: 15,
    },
    label: {
        color: '#E0E0E0',
        fontSize: 14,
        marginBottom: 8,
        fontWeight: 'bold',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 8,
        padding: 10,
    },
    input: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: '#282828',
        borderRadius: 5,
        marginHorizontal: 4,
    },
    inputText: {
        color: '#E0E0E0',
        marginLeft: 10,
        fontSize: 16,
    },
    separator: {
        color: '#A0A0A0',
        fontSize: 18,
        marginHorizontal: 5,
    },
    clearButton: {
        marginLeft: 10,
        padding: 5,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContent: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        overflow: 'hidden',
    },
    modalHeader: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        alignItems: 'center',
    },
    modalTitle: {
        color: '#E0E0E0',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    tabsContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        backgroundColor: '#282828',
        borderRadius: 8,
        padding: 4,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 6,
        alignItems: 'center',
    },
    tabButtonActive: {
        backgroundColor: '#2196F3',
    },
    tabText: {
        color: '#A0A0A0',
        fontWeight: 'bold',
    },
    tabTextActive: {
        color: '#FFFFFF',
    },
    yearPickerContainer: {
        flex: 1,
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    pickerTitle: {
        color: '#E0E0E0',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    yearList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
    yearButton: {
        width: '28%', // 3 colonnes par ligne environ
        paddingVertical: 10,
        margin: 5,
        backgroundColor: '#282828',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    yearButtonSelected: {
        backgroundColor: '#2196F3',
        borderColor: '#2196F3',
    },
    yearButtonDisabled: {
        backgroundColor: '#121212',
        borderColor: '#121212',
        opacity: 0.5,
    },
    yearButtonText: {
        color: '#E0E0E0',
        fontSize: 16,
    },
    yearButtonTextSelected: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    yearButtonTextDisabled: {
        color: '#A0A0A0',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginRight: 10,
    },
    cancelButtonText: {
        color: '#A0A0A0',
        fontSize: 16,
    },
    confirmButton: {
        backgroundColor: '#2196F3',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default YearRangePicker;