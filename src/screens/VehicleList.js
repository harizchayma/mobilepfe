import React from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

const VehicleList = ({ vehicles = [], onSelect, duree = 1 }) => {
    console.log("Vehicles received in VehicleList:", vehicles);

    if (vehicles.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.noVehiclesText}>
                    Aucun véhicule disponible pour cette période.
                </Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            {vehicles.map((item) => {
                const prixTotal = item.prix_jour ? (item.prix_jour * duree * 1.19).toFixed(2) : "N/A";

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
                                {item.prix_jour ? `Total: ${prixTotal} dt` : "Prix non disponible"}
                            </Text>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f4f8",
        padding: 20,
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
    noVehiclesText: {
        textAlign: "center",
        fontSize: 20,
        color: "#856404",
        fontWeight: "bold",
    },
});

export default VehicleList;