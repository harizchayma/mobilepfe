import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useAuth } from "../Login/AuthContext";
const VehiculeDetails = ({ route, navigation }) => {
  const vehicle = route.params?.vehicle;
  const rentalDetails = route.params?.rentalDetails;

  const cin_client = rentalDetails?.cin_client;

  console.log("Rental Details Received:", rentalDetails);

  if (!cin_client) {
    console.error("cin_client is missing in rentalDetails:", rentalDetails);
    Alert.alert(
      "Erreur",
      "Identifiant client manquant. Retournez à la connexion."
    );
    navigation.goBack();
    return null;
  }

  const rentalDuration = rentalDetails.dureeLocation || 0;
  const vehiclePrice = vehicle.prix_jour;
  const totalPrice = rentalDuration * vehiclePrice * 1.19;

  const handleConfirmReservation = async () => {
    Alert.alert(
        "Confirmer la Réservation",
        "Êtes-vous sûr de vouloir confirmer cette réservation ?",
        [
            { text: "Annuler", style: "destructive" },
            {
                text: "Confirmer",
                onPress: async () => {
                    const reservationData = {
                        num_immatriculation: vehicle.num_immatriculation,
                        cin_client: String(cin_client),
                        Prix_total: parseFloat(totalPrice.toFixed(2)),
                        Duree_location: parseInt(rentalDuration, 10),
                        Date_debut: rentalDetails.dateDebut, // Send the original ISO string
                        Date_retour: rentalDetails.dateRetour, // Send the original ISO string
                        Heure_debut: rentalDetails.heureDebut,
                        Heure_retour: rentalDetails.heureRetour,
                        action: "en attent",
                        login_id: null,
                    };

                    console.log("Données de réservation envoyées :", reservationData);

                    try {
                        const response = await fetch(
                            "http://192.168.1.10:7001/reservation",
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify(reservationData),
                            }
                        );
                        if (!response.ok) {
                          let errorMessage = "Erreur lors de la réservation.";
                          try {
                              const errorData = await response.json();
                              console.log("Server Error Response:", errorData); // Log the entire error object
                              if (errorData && errorData.message) {
                                  errorMessage = errorData.message;
                              }
                          } catch (parseError) {
                              console.error("Error parsing response:", parseError);
                          }
                          console.error("Response Error:", response.status, errorMessage);
                          throw new Error(errorMessage);
                      }

                        Alert.alert(
                            "Succès",
                            "Réservation effectuée avec succès!",
                            [
                                {
                                    text: "OK",
                                    onPress: () => navigation.navigate("Home"),
                                    style: "default",
                                },
                            ],
                            { cancelable: false }
                        );
                    } catch (error) {
                        console.error("Reservation Error:", error);
                        Alert.alert(
                            "Erreur",
                            error.message || "Une erreur est survenue lors de la réservation.",
                            [{ text: "OK", style: "destructive" }],
                            { cancelable: false }
                        );
                    }
                },
            },
        ],
        { cancelable: false }
    );
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Détails de la Réservation</Text>

      <View style={styles.detailsContainer}>
        <Text style={styles.label}>Véhicule:</Text>
        <Text style={styles.info}>
          {vehicle.marque} {vehicle.modele}
        </Text>

        <Text style={styles.label}>Durée de location:</Text>
        <Text style={styles.info}>{rentalDuration} jours</Text>

        <Text style={styles.label}>Date de début:</Text>
        <Text style={styles.info}>
          {new Date(rentalDetails.dateDebut).toLocaleDateString("fr-FR")} à{" "}
          {rentalDetails.heureDebut}
        </Text>

        <Text style={styles.label}>Date de retour:</Text>
        <Text style={styles.info}>
          {new Date(rentalDetails.dateRetour).toLocaleDateString("fr-FR")} à{" "}
          {rentalDetails.heureRetour}
        </Text>

        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Prix total TTC:</Text>
          <Text style={styles.price}>{totalPrice.toFixed(2)} dt</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleConfirmReservation}
      >
        <Text style={styles.buttonText}>Confirmer la Réservation</Text>
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
  },
  priceLabel: {
    fontSize: 18,
    color: "#4b5563",
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

export default VehiculeDetails;
