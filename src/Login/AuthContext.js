// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const storedData = await AsyncStorage.getItem('userData');
                if (storedData) {
                    const parsedData = JSON.parse(storedData);
                    setUser({
                        data: {
                            id_client: parsedData.data.id_client,
                            cin_client: parsedData.data.cin_client,
                            nom: parsedData.data.nom,
                            prenom: parsedData.data.prenom,
                        }
                    });
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            } finally {
                setIsLoading(false);
            }
        };
    
        loadUserData();
    }, []);

const login = async (userData) => {
    try {
        const userInfo = {
            data: {
                id_client: userData.data.id_client, // Assurez-vous que c'est le bon ID
                cin_client: userData.data.cin_client,
                nom: userData.data.nom,
                prenom: userData.data.prenom,
            }
        };

        setUser (userInfo);
        await AsyncStorage.setItem('userData', JSON.stringify(userInfo)); // Assurez-vous que c'est la bonne clé
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};


    const logout = async () => {
        try {
            setUser(null);
            await AsyncStorage.removeItem('userData');
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};