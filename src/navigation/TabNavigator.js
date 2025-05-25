import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Text } from 'react-native';
import Home from '../screens/Home'; // Your main home screen (the one with the reservation form)
import ModifierDonner from '../Details/PersonDetails'; // Importing PersonDetails
import ContratListe from '../contrat/ContratListe'; // Importing ContratListe
import ReservationListe from '../Reservation/ReservationListe'; // Importing ReservationListe
import Icon from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen'; // Import HomeScreen (the one showing total contracts)

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Contrats') {
            iconName = focused ? 'document' : 'document-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Réserver') {
            iconName = focused ? 'calendar' : 'calendar-outline'; // Changed icon here
          } else if (route.name === 'Mes Réservations') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Accueil') {
            iconName = focused ? 'home' : 'home-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3D90D7',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen
        name="Accueil"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Accueil',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Mes Réservations"
        component={ReservationListe}
        options={{
          tabBarLabel: 'Réservations',
          headerShown: false,
        }}
      />
<Tab.Screen
  name="Réserver"
  component={Home}
  options={{
    tabBarLabel: '', // Explicitly set an empty string
    tabBarIcon: ({ focused, color, size }) => (
      <View style={styles.centerTabIcon}>
        <Icon name="calendar" size={size} color="white" />
        <Text style={styles.centerTabText}>Réserver</Text>
      </View>
    ),
    headerShown: false,
  }}
/>
      <Tab.Screen
        name="Contrats"
        component={ContratListe}
        options={{
          tabBarLabel: 'Contrats',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ModifierDonner}
        options={{
          tabBarLabel: 'Profil',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  centerTabIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#074799',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  centerTabText: {
    color: 'white',
    fontSize: 10,
    marginTop: 5,
  },
});

export default TabNavigator;
