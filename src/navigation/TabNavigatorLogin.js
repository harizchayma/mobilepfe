import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

// Importez vos composants d'écran
import LoginScreen from '../Login/Login'; // Assurez-vous que le chemin est correct
import MapScreenWithLogo from '../Login/MapScreen'; // Créez ce composant
import InfoScreen from '../Login/InfoScreen'; // Créez ce composant

const Tab = createBottomTabNavigator();

const TabNavigatorLogin = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Login') {
            iconName = focused ? 'log-in' : 'log-in-outline';
          } else if (route.name === 'Adresse') { // Changement ici
            iconName = focused ? 'location' : 'location-outline'; // Nouvelle icône
          } else if (route.name === 'Info') {
            iconName = focused ? 'information-circle' : 'information-circle-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'gray',
        headerShown: false, // Vous pouvez changer cela si vous voulez des en-têtes différents
      })}
      initialRouteName="Login" // Force l'ouverture sur l'écran Login
    >
      <Tab.Screen name="Login" component={LoginScreen} />
      <Tab.Screen
        name="Adresse" // Changement du nom de la route
        component={MapScreenWithLogo}
        options={{
          title: 'Adresse',
          tabBarIcon: ({ focused, color, size }) => ( // Ajout de tabBarIcon ici
            <Icon name={focused ? 'location' : 'location-outline'} size={size} color={color} /> // Nouvelle icône
          ),
        }} // Changement du titre de l'onglet
      />
      <Tab.Screen name="Info" component={InfoScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigatorLogin;