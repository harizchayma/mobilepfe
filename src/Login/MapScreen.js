import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Linking, Platform } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location"; // Or your preferred location library
import { FontAwesome } from "@expo/vector-icons"; // Import for car icon

// Coordinates for Route Ain km 1, Sfax, Tunisia (Correction du nom de la constante)
const RUE_AIN_COORDS = {
  latitude: 34.7440668,
  longitude: 10.7460747,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

const MapScreenWithLogo = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [initialRegion, setInitialRegion] = useState(RUE_AIN_COORDS);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      console.log("Current Location:", currentLocation); // Pour votre information
    })();
  }, []);

  const openGoogleMaps = (lat, lng) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${lng}`;
    const label = 'Rander Car';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    Linking.openURL(url);
  }

  let text = "En attente de la localisation...";

  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = `Latitude: ${location.coords.latitude}, Longitude: ${location.coords.longitude}`;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
      >
        {/* Marker for the fixed location with the car icon */}
        <Marker
          coordinate={RUE_AIN_COORDS}
          title="Rander Car"
          description="Route Ain km 1"
          pinColor="blue" // Set the marker color to blue
          showsLabel={true} // Ajout de cette prop pour afficher le titre toujours
        >
          {/* Use a custom marker view with the car icon */}
          <View style={styles.carIconContainer}>
            <FontAwesome name="car" size={21} color="blue" />
          </View>
        </Marker>

        {/* SUPPRESSION OU COMMENTAIRE DU MARQUEUR DE LA POSITION ACTUELLE */}
        {/* {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Votre Position Actuelle"
            pinColor="red" // Set the user's location marker to red
          />
        )} */}
      </MapView>

      {/* Button to open Google Maps */}
      <TouchableOpacity
        style={styles.openMapButton}
        onPress={() => openGoogleMaps(RUE_AIN_COORDS.latitude, RUE_AIN_COORDS.longitude)}
      >
        <Text style={styles.openMapButtonText}>Ouvrir Google Maps</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  carIconContainer: {
    backgroundColor: "white", // Optional background for the icon
    borderRadius: 15, // Optional rounded background
    padding: 5,
  },
  openMapButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  openMapButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'blue',
  },
});

export default MapScreenWithLogo;