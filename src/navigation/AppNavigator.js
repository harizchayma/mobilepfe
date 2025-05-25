import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PersonDetails from '../Details/PersonDetails';
import TabNavigator from './TabNavigator'; // Import your main TabNavigator (après connexion)
import TabNavigatorLogin from './TabNavigatorLogin'; // Import the TabNavigator containing Login, Map, Info
import EditPersonDetails from '../Details/EditPersonDetails';
import VehiculeDetails from '../screens/VehiculeDetails';
import VehiculeSelection from '../screens/VehiculeSelection'; // Adjust the path if necessary
import ReservationListe from '../Reservation/ReservationListe';
import ReservationDetail from '../Reservation/ReservationDetail';
import ContratDetail from '../contrat/ContratDetail';
import ModifieReservation from '../Reservation/ModifieReservation';
import ForgetPasswordScreen from "../Login/ForgetPasswordScreen";
import HomeScreen from '../screens/HomeScreen';
import VehiculesDisponibles from '../Reservation/VehiculesDisponibles';
import VehicleDetailsScreen from '../Reservation/VehicleDetailsScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AuthTabs"
        component={TabNavigatorLogin}
        options={{ headerShown: false }} // Masquer l'en-tête pour le TabNavigator
      />
      <Stack.Screen name="ForgetPassword" component={ForgetPasswordScreen} />
      <Stack.Screen name="Home" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="PersonDetails" component={PersonDetails} />
      <Stack.Screen name="EditPersonDetails" component={EditPersonDetails} />
      <Stack.Screen name="VehiculeSelection" component={VehiculeSelection} />
      <Stack.Screen name="VehiculeDetails" component={VehiculeDetails} />
      <Stack.Screen name="ReservationListe" component={ReservationListe} />
      <Stack.Screen name="ReservationDetail" component={ReservationDetail} />
      <Stack.Screen name="ContratDetail" component={ContratDetail} />
      <Stack.Screen name="ModifieReservation" component={ModifieReservation} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="VehiculesDisponibles" component={VehiculesDisponibles} options={{ title: 'Véhicules Disponibles' }} />
      <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} options={{ title: 'Détails du Véhicule' }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;