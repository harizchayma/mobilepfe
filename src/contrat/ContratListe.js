import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useAuth } from "../Login/AuthContext";
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

const ContratListe = () => {
    const { user } = useAuth();
    const cin_client = user?.data?.cin_client || null;
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation(); // Initialize navigation

    const formatDate = (dateString) => {
        if (!dateString) {
            return 'N/A';
        }
        try {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (error) {
            console.error("Error formatting date:", error);
            return 'N/A';
        }
    };

    const fetchContracts = async () => {
        if (!cin_client) {
            Alert.alert("Erreur", "Identifiant client manquant.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`http://192.168.1.10:7001/contrat/cin/${cin_client}`);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des contrats');
            }
            const data = await response.json();
            console.log("API Response Data:", data); // Log the response data
            setContracts(data?.data || []); // Safe access to data property
            setError(null); // Clear any previous errors
        } catch (err) {
            console.error("API Fetch Error:", err); // Log the error
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false); // Stop refreshing indicator
        }
    };

    // Fetch contracts when component mounts or cin_client changes
    useEffect(() => {
        setLoading(true);
        fetchContracts();
    }, [cin_client]);

    // Handle refresh control
    const onRefresh = () => {
        setRefreshing(true); // Enable refreshing indicator
        fetchContracts();
    };

    // Loading state
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1e3a8a" />
            </View>
        );
    }

    // Error state
    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Erreur : {error}</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <Text style={styles.title}>Mes Contrats</Text>
            {contracts.length === 0 ? (
                <Text style={styles.noContractsText}>Aucun contrat trouvé.</Text>
            ) : (
                contracts.map((contract, index) => (
                    <TouchableOpacity
                        key={`${contract?.dataValues?.ID_contrat}-${index}`}
                        onPress={() => navigation.navigate('ContratDetail', { contract })}
                    >
                        <View style={styles.contractBox}>
                            <Text style={styles.contractNumber}>Numéro de contrat : {contract?.dataValues?.Numero_contrat || contract?.Numero_contrat || 'N/A'}</Text>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Date début:</Text>
                                <Text style={styles.detailValue}>
                                    {formatDate(contract?.dataValues?.Date_debut || contract?.Date_debut)}
                                </Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Date retour:</Text>
                                <Text style={styles.detailValue}>
                                    {formatDate(contract?.dataValues?.Date_retour || contract?.Date_retour)}
                                </Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Durée:</Text>
                                <Text style={styles.detailValue}>{contract?.dataValues?.Duree_location || contract?.Duree_location || 'N/A'} jours</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Prix total:</Text>
                                <Text style={styles.detailValue}>{contract?.dataValues?.Prix_total || contract?.Prix_total || 'N/A'} dt</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#e5e7eb', // Light gray background
    },
    title: {
        fontSize: 30, // Increased font size
        fontWeight: 'bold',
        marginBottom: 30,
        color: "#dc2626",
        textAlign: 'center', // Centered title
        marginTop: 30
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb', // Light background for loading
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb', // Light background for error
    },
    errorText: {
        color: '#dc2626', // Red color for error messages
        fontSize: 18, // Increased font size
        textAlign: 'center', // Centered error message
    },
    noContractsText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 18, // Increased font size
        color: '#6b7280', // Gray color
    },
    contractBox: {
        backgroundColor: '#ffffff',
        borderRadius: 30, // More rounded corners
        padding: 20, // Increased padding
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 }, // Deeper shadow
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5, // Increased elevation for Android
    },
    contractNumber: {
        fontSize: 20, // Increased font size
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#1e3a8a', // Dark blue color
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10, // Increased margin for better spacing
    },
    detailLabel: {
        fontSize: 16,
        fontWeight: '600', // Semi-bold for labels
        color: '#4b5563', // Dark gray color
    },
    detailValue: {
        fontWeight: 'bold',
        fontSize: 17,
        color: '#374151', // Darker gray for values
    },
});

export default ContratListe;