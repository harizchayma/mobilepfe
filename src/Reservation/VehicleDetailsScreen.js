import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const VehicleDetailsScreen = ({ route, navigation }) => {
    // Receive the data passed from the previous screen
    const { vehicle, dateDebut, dateRetour, duree, heureDebut, heureRetour, reservationId, cin_client } = route.params;

    // Debugging: Check if route.params and reservationId are defined
    console.log("route.params in VehicleDetailsScreen:", route.params);
    console.log("reservationId:", reservationId);

    // Calculate the total price (assuming prix_jour is available)
    const prixTotal = vehicle.prix_jour
        ? (vehicle.prix_jour * duree * 1.19).toFixed(2) // Assuming 19% tax
        : "N/A";

    // Format the dates for display
    const startDateString = new Date(dateDebut).toLocaleDateString("fr-FR");
    const endDateString = new Date(dateRetour).toLocaleDateString("fr-FR");

    // Function to handle the confirmation
    const handleConfirmReservation = () => {
        console.log("route.params in VehicleDetailsScreen:", route.params);

        Alert.alert(
            "Confirmation",
            "Êtes-vous sûr de vouloir modifier la réservation avec ce véhicule ?",
            [
                {
                    text: "Annuler",
                    style: "cancel",
                    onPress: () => console.log("Modification cancelled")
                },
                {
                    text: "Confirmer",
                    onPress: async () => {
                        console.log("Reservation confirmed and updating...");
                        if (reservationId !== undefined) { // Check if reservationId is defined
                            await updateReservation(reservationId); // Pass reservationId to updateReservation
                        } else {
                            console.error("Error: reservationId is undefined. Cannot update.");
                            Alert.alert("Erreur", "Impossible de modifier la réservation. ID de réservation manquant.");
                        }
                    }
                }
            ]
        );
    };

    const updateReservation = async (id) => { // Receive reservationId as a parameter
        if (typeof id !== 'number') {
            console.error("Error: reservationId is not a number:", id);
            Alert.alert("Erreur", "ID de réservation invalide.");
            return; // Stop the update if the ID is not a number
        }

        // Prepare the data to be sent in the update request
        const updatedReservationData = {
            num_immatriculation: vehicle.num_immatriculation, // Use num_immatriculation from vehicle object
            cin_client: String(cin_client), // Ensure cin_client is passed and converted to string if needed
            Prix_total: parseFloat(prixTotal), // Use the calculated prixTotal
            Duree_location: parseInt(duree, 10), // Use the passed duree
            Date_debut: dateDebut, // Use the passed dateDebut
            Date_retour: dateRetour, // Use the passed dateRetour
            Heure_debut: heureDebut, // Use the passed heureDebut
            Heure_retour: heureRetour, // Use the passed heureRetour
            action: "en attent", // Set the action
            login_id: null, // Set login_id
        };

        // Log the data being sent for debugging
        console.log("Sending updatedReservationData:", updatedReservationData);

        try {
            const response = await fetch(
                `http://192.168.1.10:7001/reservation/${id}`, // Use PUT method and include reservation ID in the URL
                {
                    method: "PUT", // Use PUT method for updates
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updatedReservationData),
                }
            );

            if (!response.ok) {
                let errorMessage = "Erreur lors de la modification de la réservation.";
                try {
                    const errorData = await response.json();
                    console.log("Server Error Response:", errorData); // Log the entire error object
                    if (errorData && errorData.error && Array.isArray(errorData.error)) {
                        errorMessage = errorData.error.join(", ");
                    } else if (errorData && errorData.message) {
                        errorMessage = errorData.message;
                    }
                } catch (parseError) {
                    console.error("Error parsing response:", parseError);
                }
                console.error("Response Error:", response.status, errorMessage);
                throw new Error(errorMessage);
            }

            // If the update was successful
            const successData = await response.json(); // Optionally parse the success response
            console.log("Update successful:", successData);
            Alert.alert("Succès", "Réservation modifiée avec succès !");
            // Potentially navigate back to the main reservation list after success
            navigation.popToTop(); // Example: Go back to the very first screen (or adjust as needed)

        } catch (error) {
            console.error("Error updating reservation:", error.message);
            Alert.alert("Erreur", `Échec de la modification de la réservation: ${error.message}`);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Détails de la Réservation Modifiée</Text>

            <View style={styles.detailsContainer}>
                <Text style={styles.label}>Véhicule:</Text>
                <Text style={styles.info}>
                    {vehicle.marque || 'N/A'} {vehicle.modele || 'N/A'}
                </Text>

                <Text style={styles.label}>Durée de location:</Text>
                <Text style={styles.info}>{duree} jours</Text>

                <Text style={styles.label}>Date de début:</Text>
                <Text style={styles.info}>
                    {startDateString} à{" "}
                    {heureDebut || 'N/A'}
                </Text>

                <Text style={styles.label}>Date de retour:</Text>
                <Text style={styles.info}>
                    {endDateString} à{" "}
                    {heureRetour || 'N/A'}
                </Text>

                <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Prix total TTC:</Text>
                    <Text style={styles.price}>
                        {prixTotal !== "N/A" ? `${prixTotal} dt` : "Non disponible"}
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={handleConfirmReservation}
            >
                <Text style={styles.buttonText}>Confirmer la Modification</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#f3f4f6",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1e3a8a",
        marginBottom: 20,
        textAlign: 'center', // Center the title
    },
    detailsContainer: {
        width: "100%",
        backgroundColor: "#ffffff",
        padding: 15,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: "#4b5563",
        marginVertical: 5,
    },
    info: {
        fontSize: 17,
        color: "#1f2937",
        marginBottom: 10,
        fontWeight: "bold",
    },
    priceContainer: {
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        paddingTop: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center', // Vertically align price elements
    },
    priceLabel: {
        fontSize: 18,
        color: "#4b5563",
        fontWeight: 'bold', // Make label bold
    },
    price: {
        fontSize: 19,
        fontWeight: "bold",
        color: "#dc2626",
    },
    button: {
        backgroundColor: "#1e3a8a",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
    buttonText: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
});

export default VehicleDetailsScreen;
