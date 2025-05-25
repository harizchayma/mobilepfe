import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useAuth } from "../Login/AuthContext";
import Icon from 'react-native-vector-icons/MaterialIcons';

const ReservationListe = ({ navigation }) => {
    const { user } = useAuth();
    const cin_client = user?.data?.cin_client;
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [vehiculeDetails, setVehiculeDetails] = useState({});

    const fetchVehiculeDetails = async (num_immatriculation) => {
        if (!num_immatriculation) return null;
        try {
            const response = await fetch(`http://192.168.1.10:7001/vehicules/immatriculation/${num_immatriculation}`);
            if (!response.ok) return null;
            const data = await response.json();
            return data.data;
        } catch (err) {
            console.error("Vehicule Fetch Error:", err);
            return null;
        }
    };

    const fetchReservations = async () => {
        if (!cin_client) {
            Alert.alert("Erreur", "Identifiant client manquant.");
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`http://192.168.1.10:7001/reservation/cin/${cin_client}`);
            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData?.message || 'Erreur lors de la récupération des réservations';
                throw new Error(errorMessage);
            }

            const data = await response.json();
            const fetchedReservations = (data.data || []).sort((a, b) => {
                const statusOrder = ['en attent', 'en attente', 'accepte', 'rejecte', 'rejeté'];
                const aIndex = statusOrder.indexOf(a.action?.toLowerCase());
                const bIndex = statusOrder.indexOf(b.action?.toLowerCase());
                return aIndex - bIndex;
            });
            setReservations(fetchedReservations);

            // Récupération des détails des véhicules
            const vehiculePromises = fetchedReservations.map(reservation =>
                fetchVehiculeDetails(reservation.num_immatriculation)
            );
            const vehiculeResults = await Promise.all(vehiculePromises);

            // Création du mapping avec num_immatriculation comme clé
            const vehiculeMap = {};
            fetchedReservations.forEach((reservation, index) => {
                vehiculeMap[reservation.num_immatriculation] = vehiculeResults[index];
            });

            setVehiculeDetails(vehiculeMap);
            setError(null);
        } catch (err) {
            console.error("Fetch Reservations Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchReservations();
    }, [cin_client]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchReservations();
    };

    const getEtatIcon = (action) => {
        switch (action?.toLowerCase()) { // Use optional chaining for safety
            case 'en attente':
            case 'en attent':
                return { icon: <Icon name="access-time" size={20} color="#FFC107" />, color: '#FFC107' };
            case 'rejeté':
            case 'rejecte':
                return { icon: <Icon name="cancel" size={20} color="#F44336" />, color: '#F44336' };
            case 'accepté':
            case 'accepte':
                return { icon: <Icon name="check-circle" size={20} color="#4CAF50" />, color: '#4CAF50' };
            default:
                return { icon: <Icon name="help" size={20} color="#9E9E9E" />, color: '#9E9E9E' };
        }
    };

    const handleDeleteReservation = (id_reservation) => {
        Alert.alert(
            "Supprimer la réservation",
            "Êtes-vous sûr de vouloir supprimer cette réservation ?",
            [
                {
                    text: "Annuler",
                    style: "cancel"
                },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: () => {
                        // Call your API to delete the reservation
                        fetch(`http://192.168.1.10:7001/reservation/${id_reservation}`, {
                            method: 'DELETE',
                        })
                        .then(response => {
                            if (!response.ok) {
                                return response.json().then(err => { throw new Error(err.message || 'Erreur lors de la suppression de la réservation'); });
                            }
                            return response.json();
                        })
                        .then(data => {
                            Alert.alert("Succès", "La réservation a été supprimée avec succès.");
                            fetchReservations(); // Refresh the list
                        })
                        .catch(error => {
                            console.error("Erreur de suppression:", error);
                            Alert.alert("Erreur", `Impossible de supprimer la réservation: ${error.message}`);
                        });
                    }
                }
            ]
        );
    };

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
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <Text style={styles.title}>Mes Réservations</Text>
            {reservations.length === 0 ? (
                <Text style={styles.noReservationsText}>Aucune réservation trouvée.</Text>
            ) : (
                reservations.map((reservation, index) => {
                    const vehicule = vehiculeDetails[reservation.num_immatriculation];
                    const { icon, color } = getEtatIcon(reservation.action);
                    const isEnAttent = reservation.action?.toLowerCase() === 'en attent';

                    return (
                        <View key={`${reservation.id_reservation}-${index}`} style={styles.reservationBox}>
                            {/* Delete Icon (top right) - Only for 'en attent' */}
                            {isEnAttent && (
                                <TouchableOpacity
                                    style={styles.deleteIcon}
                                    onPress={() => handleDeleteReservation(reservation.id_reservation)}
                                >
                                    <Icon name="delete" size={24} color="#F44336" />
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={{ flex: 1 }} // Make the rest of the box clickable
                                onPress={() => navigation.navigate('ReservationDetail', { reservation })}
                            >
                                <View style={styles.reservationHeader}>
                                    <Text style={styles.reservationNumber}>Réservation N°: {reservation.id_reservation}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Véhicule:</Text>
                                    <Text style={styles.detailValue}>
                                        {vehicule?.marque || 'Marque inconnue'} {vehicule?.modele || 'Modèle inconnu'}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Date debut:</Text>
                                    <Text style={styles.detailValue}>
                                        {reservation.Date_debut ? new Date(reservation.Date_debut).toLocaleDateString("fr-FR") : 'N/A'}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Date Retour:</Text>
                                    <Text style={styles.detailValue}>
                                        {reservation.Date_retour ? new Date(reservation.Date_retour).toLocaleDateString("fr-FR") : 'N/A'}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Heure debut:</Text>
                                    <Text style={styles.detailValue}>
                                        {reservation.Heure_debut || 'N/A'}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Heure Retour:</Text>
                                    <Text style={styles.detailValue}>
                                        {reservation.Heure_retour || 'N/A'}
                                    </Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Prix total:</Text>
                                    <Text style={styles.detailValue}>{reservation.Prix_total} dt</Text>
                                </View>

                                {/* État de l'action */}
                                <View style={styles.actionContainer}>
                                    {icon}
                                    <Text style={[styles.actionText, { color }]}>{reservation.action || 'Inconnu'}</Text>
                                </View>

                                {/* Modify Button - Only shown for "en attent" reservations */}
                                {isEnAttent && (
                                    <TouchableOpacity
                                        style={styles.modifyButton}
                                        onPress={() => navigation.navigate('ModifieReservation', { reservation })}
                                    >
                                        <Text style={styles.modifyButtonText}>Modifier</Text>
                                    </TouchableOpacity>
                                )}
                            </TouchableOpacity>
                        </View>
                    );
                })
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#e5e7eb',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 30,
        color: "#dc2626",
        textAlign: 'center',
        marginTop: 30
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    errorText: {
        color: '#dc2626',
        fontSize: 18,
        textAlign: 'center',
    },
    noReservationsText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 18,
        color: '#6b7280',
    },
    reservationBox: {
        backgroundColor: '#ffffff',
        borderRadius: 30,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
    },
    reservationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    reservationNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e3a8a',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    detailLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4b5563',
    },
    detailValue: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#374151',
    },
    actionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    actionText: {
        marginLeft: 5,
        fontSize: 16,
        fontWeight: '600',
    },
    modifyButton: {
        backgroundColor: '#1e3a8a',
        padding: 10,
        borderRadius: 10,
        marginTop: 10,
        alignItems: 'center',
    },
    modifyButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    deleteIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1, // Ensure it's above the reservation box content
    },
});

export default ReservationListe;