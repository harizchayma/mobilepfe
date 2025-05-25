import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import VehicleList from './VehicleList';

const VehiculeSelection = ({ route, navigation }) => {
    const { availableVehicles, rentalDetails } = route.params;

    if (!availableVehicles || availableVehicles.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.noVehiclesText}>Aucun véhicule disponible pour cette période.</Text>
            </View>
        );
    }

    const handleVehicleSelection = (selectedVehicle) => { // Corrected function name
        navigation.navigate("VehiculeDetails", {
            vehicle: selectedVehicle,
            rentalDetails: route.params.rentalDetails,
        });
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Choisissez un véhicule</Text>
            <VehicleList vehicles={availableVehicles} onSelect={handleVehicleSelection} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        padding: 10,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#3b82f6',
        marginVertical: 10,
    },
});

export default VehiculeSelection;