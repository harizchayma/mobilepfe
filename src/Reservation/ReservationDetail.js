import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';

const ReservationDetail = ({ route }) => {
    const { reservation } = route.params;
    const [vehicule, setVehicule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchVehiculeDetails = async (num_immatriculation) => {
        try {
            const response = await fetch(`http://192.168.1.10:7001/vehicules/immatriculation/${num_immatriculation}`);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des détails du véhicule');
            }
            const data = await response.json();
            setVehicule(data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (reservation.num_immatriculation) {
            fetchVehiculeDetails(reservation.num_immatriculation);
        }
    }, [reservation.num_immatriculation]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1e3a8a" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Erreur : {error}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Détails de la Réservation</Text>
                <View style={styles.detailContainer}>
                    <Text style={styles.detailLabel}>Numéro de réservation :</Text>
                    <Text style={styles.detailValue}>{reservation.id_reservation}</Text>
                </View>
                <View style={styles.detailContainer}>
                    <Text style={styles.detailLabel}>Véhicule :</Text>
                    <Text style={styles.detailValue}>
                        {vehicule?.marque || 'N/A'} {vehicule?.modele ? `${vehicule.modele}` : ''}
                    </Text>
                </View>

                <View style={styles.groupContainer}>
                    <Text style={styles.groupLabel}>Début</Text>
                    <View style={styles.groupDetailContainer}>
                        <Text style={styles.detailLabel}>Date :</Text>
                        <Text style={styles.detailValue}>{reservation.Date_debut}</Text>
                    </View>
                    <View style={styles.groupDetailContainer}>
                        <Text style={styles.detailLabel}>Heure :</Text>
                        <Text style={styles.detailValue}>{reservation.Heure_debut}</Text>
                    </View>
                </View>

                <View style={styles.groupContainer}>
                    <Text style={styles.groupLabel}>Retour</Text>
                    <View style={styles.groupDetailContainer}>
                        <Text style={styles.detailLabel}>Date :</Text>
                        <Text style={styles.detailValue}>{reservation.Date_retour}</Text>
                    </View>
                    <View style={styles.groupDetailContainer}>
                        <Text style={styles.detailLabel}>Heure :</Text>
                        <Text style={styles.detailValue}>{reservation.Heure_retour}</Text>
                    </View>
                </View>

                <View style={styles.detailContainer}>
                    <Text style={styles.detailLabel}>Durée location :</Text>
                    <Text style={styles.detailValue}>{reservation.Duree_location} jours</Text>
                </View>
                <View style={styles.detailContainer}>
                    <Text style={styles.detailLabel}>Prix total :</Text>
                    <Text style={styles.redText}>{reservation.Prix_total} dt</Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: "#dc2626",
        marginBottom: 20,
        textAlign: 'center',
    },
    detailContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#f1f5f9',
        borderRadius: 10,
    },
    groupContainer: {
        marginBottom: 15,
        padding: 15,
        backgroundColor: '#e5e7eb',
        borderRadius: 10,
    },
    groupLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e3a8a',
        marginBottom: 10,
    },
    groupDetailContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    detailLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4b5563',
    },
    detailValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e3a8a',
    },
    redText: {
        color: "#dc2626",
        fontWeight: 'bold',
        fontSize: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    errorText: {
        color: '#dc2626',
        fontSize: 18,
        textAlign: 'center',
    },
});

export default ReservationDetail;