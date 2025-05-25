import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';

const ContratDetail = ({ route }) => {
    const { contract } = route.params || {};
    const [vehicule, setVehicule] = useState(null); // État pour stocker les détails du véhicule
    const [loading, setLoading] = useState(true); // État pour gérer le chargement
    const [error, setError] = useState(null); // État pour gérer les erreurs

    const formatDate = (dateString) => {
        if (!dateString) {
            return ''; // Or 'N/A' if you prefer
        }
        try {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (error) {
            console.error("Error formatting date:", error);
            return ''; // Or 'N/A' if you prefer
        }
    };

    const {
        Numero_contrat,
        Date_debut,
        Heure_debut,
        Date_retour,
        Heure_retour,
        Duree_location,
        Prix_total,
        num_immatriculation,
        mode_reglement_garantie,
        echeance,
        montant,
        numero_piece,
        banque,
        frais_retour,
        frais_carburant,
        frais_chauffeur,
    } = contract?.dataValues || contract || {};

    // Fonction pour récupérer les détails du véhicule
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

    // Charger les détails du véhicule au montage du composant
    useEffect(() => {
        if (num_immatriculation) {
            fetchVehiculeDetails(num_immatriculation);
        }
    }, [num_immatriculation]);

    // Affichage du chargement
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1e3a8a" />
            </View>
        );
    }

    // Affichage des erreurs
    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Erreur : {error}</Text>
            </View>
        );
    }

    // Si aucun contrat n'est trouvé
    if (!contract) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Aucun contrat trouvé.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Détails du Contrat</Text>

                {/* Groupe : Informations générales */}
                <View style={styles.groupContainer}>
                    <Text style={styles.groupLabel}>Informations générales</Text>
                    <View style={styles.detailContainer}>
                        <Text style={styles.detailLabel}>Numéro de contrat :</Text>
                        <Text style={styles.detailValue}>{Numero_contrat || ''}</Text>
                    </View>
                    <View style={styles.detailContainer}>
                        <Text style={styles.detailLabel}>Durée :</Text>
                        <Text style={styles.detailValue}>{Duree_location || ''} jours</Text>
                    </View>
                    <View style={styles.detailContainer}>
                        <Text style={styles.detailLabel}>Prix total :</Text>
                        <Text style={styles.detailValue}>{Prix_total || ''} dt</Text>
                    </View>
                    <View style={styles.detailContainer}>
                        <Text style={styles.detailLabel}>Véhicule :</Text>
                        <Text style={styles.detailValue}>
                            {vehicule?.marque || ''} {vehicule?.modele || ''}
                        </Text>
                    </View>
                </View>

                {/* Groupe : Dates et heures */}
                <View style={styles.groupContainer}>
                    <Text style={styles.groupLabel}>Dates et heures</Text>
                    <View style={styles.detailContainer}>
                        <Text style={styles.detailLabel}>Date début :</Text>
                        <Text style={styles.detailValue}>{formatDate(Date_debut)}</Text>
                    </View>
                    <View style={styles.detailContainer}>
                        <Text style={styles.detailLabel}>Heure début :</Text>
                        <Text style={styles.detailValue}>{Heure_debut || ''}</Text>
                    </View>
                    <View style={styles.detailContainer}>
                        <Text style={styles.detailLabel}>Date retour :</Text>
                        <Text style={styles.detailValue}>{formatDate(Date_retour)}</Text>
                    </View>
                    <View style={styles.detailContainer}>
                        <Text style={styles.detailLabel}>Heure retour :</Text>
                        <Text style={styles.detailValue}>{Heure_retour || ''}</Text>
                    </View>
                </View>

                {/* Groupe : Détails financiers */}
                <View style={styles.groupContainer}>
                    <Text style={styles.groupLabel}>Détails financiers</Text>
                    <View style={styles.detailContainer}>
                        <Text style={styles.detailLabel}>Mode de règlement :</Text>
                        <Text style={styles.detailValue}>{mode_reglement_garantie || ''}</Text>
                    </View>
                    <View style={styles.detailContainer}>
                        <Text style={styles.detailLabel}>Échéance :</Text>
                        <Text style={styles.detailValue}>{echeance || ''}</Text>
                    </View>
                    <View style={styles.detailContainer}>
                        <Text style={styles.detailLabel}>Montant :</Text>
                        <Text style={styles.detailValue}>{montant || '0'} dt</Text>
                    </View>
                    <View style={styles.detailContainer}>
                        <Text style={styles.detailLabel}>Numéro de pièce :</Text>
                        <Text style={styles.detailValue}>{numero_piece || ''}</Text>
                    </View>
                    <View style={styles.detailContainer}>
                        <Text style={styles.detailLabel}>Banque :</Text>
                        <Text style={styles.detailValue}>{banque || ''}</Text>
                    </View>
                </View>

                {/* Groupe : Frais */}
                <View style={styles.groupContainer}>
                    <Text style={styles.groupLabel}>Frais</Text>
                    <View style={styles.detailContainer}>
                        <Text style={styles.detailLabel}>Frais de retour :</Text>
                        <Text style={styles.detailValue}>{frais_retour || '0'} dt</Text>
                    </View>
                    <View style={styles.detailContainer}>
                        <Text style={styles.detailLabel}>Frais de carburant :</Text>
                        <Text style={styles.detailValue}>{frais_carburant || '0'} dt</Text>
                    </View>
                    <View style={styles.detailContainer}>
                        <Text style={styles.detailLabel}>Frais de chauffeur :</Text>
                        <Text style={styles.detailValue}>{frais_chauffeur || '0'} dt</Text>
                    </View>
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
    groupContainer: {
        marginBottom: 20,
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
    detailContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
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
    errorText: {
        color: '#dc2626',
        fontSize: 18,
        textAlign: 'center',
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
});

export default ContratDetail;