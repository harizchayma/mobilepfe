import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/Login/AuthContext'; // Adjust the path accordingly
import AppNavigator from './src/navigation/AppNavigator'; // Adjust the path to your navigator

const App = () => {
    return (
        <AuthProvider>
            <NavigationContainer>
                <AppNavigator />
            </NavigationContainer>
        </AuthProvider>
    );
};

export default App;