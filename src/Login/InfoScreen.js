import React from 'react';
import { StyleSheet, View, Text, Image, ScrollView } from 'react-native';

const InfoScreen = () => {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image
                source={require('../assets/nom.png')} // Remplacez par le chemin de votre logo
                style={styles.logo}
            />
            <Text style={styles.description}>
                Render Car est une société de location des véhicules qui offre une large gamme de voitures pour répondre à tous vos besoins de transport. Que vous ayez besoin d'une voiture pour un voyage d'affaires, des vacances en famille ou une occasion spéciale, nous avons le véhicule parfait pour vous.
            </Text>
            <Text style={styles.subtitle}>Nos Services :</Text>
            <Text style={styles.serviceItem}>- Location de voitures à court et long terme</Text>
            <Text style={styles.serviceItem}>- Livraison et récupération de véhicules</Text>
            <Text style={styles.serviceItem}>- Assistance routière 24/7</Text>
            <Text style={styles.serviceItem}>- Options de location flexibles</Text>
            <Text style={styles.subtitle}>Contactez-nous :</Text>
            <Text style={styles.contactInfo}>Téléphone : +216 23 456 789</Text>
            <Text style={styles.contactInfo}>Email : contact@rendercar.com</Text>
            <Text style={styles.contactInfo}>Adresse : route Ain km 1 Sfax</Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f7f7f7',
    },
    logo: {
        width: 200,
        height: 200,
        marginBottom: 20,
        resizeMode: 'contain',
    },
    description: {
        fontSize: 18,
        color: '#333',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 24,
    },
    subtitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1e3a8a',
        marginBottom: 10,
    },
    serviceItem: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
        paddingLeft: 10,
        
        borderLeftColor: '#1e3a8a',
    },
    contactInfo: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
});

export default InfoScreen;