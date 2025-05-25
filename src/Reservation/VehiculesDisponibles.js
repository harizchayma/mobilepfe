// VehiculesDisponibles.js
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    // Removed Alert import
} from 'react-native';

const { width } = Dimensions.get('window');

const VehiculesDisponibles = ({ route, navigation }) => {
    const { availableVehicles, duree, dateDebut, dateRetour, heureDebut, heureRetour } = route.params; // Get times as well

    const onSelect = (vehicle) => {
        console.log('Véhicule sélectionné:', vehicle);
        navigation.navigate('VehicleDetails', {
            vehicle: vehicle,
            dateDebut: dateDebut,
            dateRetour: dateRetour,
            duree: duree,
            heureDebut: heureDebut,
            heureRetour: heureRetour,
            reservationId: route.params.reservationId, // Pass the reservationId here
            cin_client: route.params.cin_client, // Pass the cin_client if needed
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Véhicules Disponibles</Text>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {availableVehicles.map((item) => {
                    const prixTotal = item.prix_jour
                        ? (item.prix_jour * duree * 1.19).toFixed(2)
                        : "N/A";

                    return (
                        <TouchableOpacity
                            key={item.num_immatriculation}
                            style={styles.vehicleItem}
                            onPress={() => onSelect(item)}
                        >
                            {item.image && (
                                <Image
                                    source={{ uri: `data:image/png;base64,${item.image}` }}
                                    style={styles.vehicleImage}
                                    resizeMode="cover"
                                />
                            )}
                            <View style={styles.vehicleDetails}>
                                <Text style={styles.vehicleMarque}>{item.marque || ""}</Text>
                                <Text style={styles.vehicleModele}>{item.modele || ""}</Text>
                                <Text style={styles.vehicleEnergie}>{item.energie || ""}</Text>
                                <Text style={styles.vehiclePrix}>
                                    {item.prix_jour
                                        ? `Total: ${prixTotal} dt`
                                        : "Prix non disponible"}
                                </Text>
                                <Text style={styles.vehicleDuree}>
                                    Durée: {duree} jours
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
                {availableVehicles.length === 0 && (
                    <View style={styles.noVehiclesContainer}>
                        <Text style={styles.noVehiclesText}>
                            Aucun véhicule disponible pour cette période.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7',
    },
    header: {
        padding: 20,
        borderBottomColor: '#ccc',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#1e3a8a',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 10,
    },
    vehicleItem: {
        width: width * 0.9,
        maxWidth: 600,
        padding: 20,
        marginVertical: 12,
        borderRadius: 20,
        backgroundColor: "#ffffff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 3,
        overflow: "hidden",
        alignSelf: "center",
        borderWidth: 1,
        borderColor: "#d0d0d0",
    },
    vehicleImage: {
        width: "100%",
        height: width * 0.5,
        marginBottom: 12,
        borderRadius: 12,
    },
    vehicleDetails: {
        paddingVertical: 8,
    },
    vehicleMarque: {
        fontSize: 25,
        fontWeight: "bold",
        color: "#d81b2f",
    },
    vehicleModele: {
        fontSize: 20,
        color: "#555",
        marginVertical: 5,
    },
    vehicleEnergie: {
        fontSize: 18,
        color: "#777",
    },
    vehiclePrix: {
        fontSize: 16,
        color: "#6378ed",
        fontWeight: "bold",
        marginTop: 6,
    },
    vehicleDuree: {
        fontSize: 16,
        color: "#333",
    },
    noVehiclesContainer: {
        marginTop: 30,
        alignItems: 'center',
    },
    noVehiclesText: {
        textAlign: "center",
        fontSize: 20,
        color: "#856404",
        fontWeight: "bold",
    },
});

export default VehiculesDisponibles;