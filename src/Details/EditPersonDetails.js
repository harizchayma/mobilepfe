import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditPersonDetails = ({ navigation }) => {
    const [personData, setPersonData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        nom_fr: '',
        nom_ar: '',
        prenom_fr: '',
        prenom_ar: '',
        cin_client: '',
        date_cin: '',
        email: '',
        date_naiss: '',
        adresse_fr: '',
        adresse_ar: '',
        num_tel: '',
        Numero_Permis: '',
        date_permis: '',
        profession_fr: '',
        profession_ar: '',
        nationalite_origine: '',
    });

    useEffect(() => {
        const fetchPersonDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const storedData = await AsyncStorage.getItem('userData'); // Using 'userData' consistently
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                const clientId = parsedData.data.id_client;
                console.log("Fetching client with ID:", clientId);
                const userDetailsResponse = await fetch(
                    `http://192.168.1.10:7001/client/${clientId}`
                );
                if (!userDetailsResponse.ok) {
                    throw new Error(`Erreur HTTP ! statut : ${userDetailsResponse.status}`);
                }
                const userDetails = await userDetailsResponse.json();
                console.log("Réponse API (fetch):", userDetails);
                setPersonData(userDetails.data);
                     // Initialiser formData avec les données récupérées
                     setFormData({
                        nom_fr: userDetails.data.nom_fr || '',
                        nom_ar: userDetails.data.nom_ar || '',
                        prenom_fr: userDetails.data.prenom_fr || '',
                        prenom_ar: userDetails.data.prenom_ar || '',
                        cin_client: userDetails.data.cin_client || '',
                        date_cin: userDetails.data.date_cin || '',
                        email: userDetails.data.email || '',
                        date_naiss: userDetails.data.date_naiss || '',
                        adresse_fr: userDetails.data.adresse_fr || '',
                        adresse_ar: userDetails.data.adresse_ar || '',
                        num_tel: userDetails.data.num_tel || '',
                        Numero_Permis: userDetails.data.Numero_Permis || '',
                        date_permis: userDetails.data.date_permis || '',
                        profession_fr: userDetails.data.profession_fr || '',
                        profession_ar: userDetails.data.profession_ar || '',
                        nationalite_origine: userDetails.data.nationalite_origine || '',
                    });
                } else {
                    setError('Aucune donnée trouvée');
                }
            } catch (e) {
                console.error("Erreur lors de la récupération des détails :", e);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPersonDetails();
    }, []);

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleSubmit = async () => {
        console.log("handleSubmit appelé");

        const { nom_fr, prenom_fr, email, date_naiss, adresse_fr, num_tel, profession_fr, nationalite_origine } = formData;

        try {
            const storedData = await AsyncStorage.getItem('userData'); // Using 'userData' consistently
            const parsedData = JSON.parse(storedData);
            const clientId = parsedData.data.id_client;

            console.log("clientId récupéré (submit):", clientId);

            const response = await fetch(`http://192.168.1.10:7001/client/${clientId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nom_fr,
                    prenom_fr,
                    email,
                    date_naiss,
                    adresse_fr,
                    num_tel,
                    profession_fr,
                    nationalite_origine,
                    nom_ar: formData.nom_ar,
                    prenom_ar: formData.prenom_ar,
                    cin_client: formData.cin_client,
                    date_cin: formData.date_cin,
                    adresse_ar: formData.adresse_ar,
                    Numero_Permis: formData.Numero_Permis,
                    date_permis: formData.date_permis,
                    profession_ar: formData.profession_ar,
                }),
            });

            console.log("Réponse de l'API (submit):", response);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erreur HTTP ! statut : ${response.status}, message: ${JSON.stringify(errorData)}`);
            }

            Alert.alert('Success', 'Détails modifiés avec succès');
            navigation.goBack();
        } catch (error) {
            console.error("Erreur lors de la modification des détails :", error);
            Alert.alert('Error', `Une erreur est survenue : ${error.message}`);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Erreur : {error}</Text>
            </View>
        );
    }
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Modifier les Détails</Text>

            <View style={styles.formContainer}>
                <Text style={styles.label}>Nom (Français):</Text>
                <TextInput style={styles.input} placeholder="Nom" value={formData.nom_fr} onChangeText={(value) => handleChange('nom_fr', value)} />

                <Text style={styles.label}>Nom (Arabe):</Text>
                <TextInput style={styles.input} placeholder="Nom en Arabe" value={formData.nom_ar} onChangeText={(value) => handleChange('nom_ar', value)} />

                <Text style={styles.label}>Prénom (Français):</Text>
                <TextInput style={styles.input} placeholder="Prénom" value={formData.prenom_fr} onChangeText={(value) => handleChange('prenom_fr', value)} />

                <Text style={styles.label}>Prénom (Arabe):</Text>
                <TextInput style={styles.input} placeholder="Prénom en Arabe" value={formData.prenom_ar} onChangeText={(value) => handleChange('prenom_ar', value)} />

                <Text style={styles.label}>CIN Client:</Text>
                <TextInput style={styles.input} placeholder="CIN Client" value={formData.cin_client} onChangeText={(value) => handleChange('cin_client', value)} />

                <Text style={styles.label}>Date CIN:</Text>
                <TextInput style={styles.input} placeholder="Date CIN" value={formData.date_cin} onChangeText={(value) => handleChange('date_cin', value)} />

                <Text style={styles.label}>Email:</Text>
                <TextInput style={styles.input} placeholder="Email" value={formData.email} onChangeText={(value) => handleChange('email', value)} />

                <Text style={styles.label}>Date de Naissance:</Text>
                <TextInput style={styles.input} placeholder="Date de Naissance" value={formData.date_naiss} onChangeText={(value) => handleChange('date_naiss', value)} />

                <Text style={styles.label}>Adresse (Français):</Text>
                <TextInput style={styles.input} placeholder="Adresse" value={formData.adresse_fr} onChangeText={(value) => handleChange('adresse_fr', value)} />

                <Text style={styles.label}>Adresse (Arabe):</Text>
                <TextInput style={styles.input} placeholder="Adresse en Arabe" value={formData.adresse_ar} onChangeText={(value) => handleChange('adresse_ar', value)} />

                <Text style={styles.label}>Numéro de Téléphone:</Text>
                <TextInput style={styles.input} placeholder="Numéro de Téléphone" value={formData.num_tel} onChangeText={(value) => handleChange('num_tel', value)} />

                <Text style={styles.label}>Numéro de Permis:</Text>
                <TextInput style={styles.input} placeholder="Numéro de Permis" value={formData.Numero_Permis} onChangeText={(value) => handleChange('Numero_Permis', value)} />

                <Text style={styles.label}>Date de Permis:</Text>
                <TextInput style={styles.input} placeholder="Date de Permis" value={formData.date_permis} onChangeText={(value) => handleChange('date_permis', value)} />

                <Text style={styles.label}>Profession (Français):</Text>
                <TextInput style={styles.input} placeholder="Profession" value={formData.profession_fr} onChangeText={(value) => handleChange('profession_fr', value)} />

                <Text style={styles.label}>Profession (Arabe):</Text>
                <TextInput style={styles.input} placeholder="Profession en Arabe" value={formData.profession_ar} onChangeText={(value) => handleChange('profession_ar', value)} />

                <Text style={styles.label}>Nationalité:</Text>
                <TextInput style={styles.input} placeholder="Nationalité" value={formData.nationalite_origine} onChangeText={(value) => handleChange('nationalite_origine', value)} />

                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Sauvegarder les modifications</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f4', // Fond plus clair
        padding: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#1e3a8a',
        textAlign: 'center',
    },
    formContainer: {
        backgroundColor: '#fff',
        padding: 25,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
    },
    label: {
        fontSize: 17,
        fontWeight: '500',
        color: '#444',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        backgroundColor: '#f8f8f8',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#1e3a8a', // Bleu plus moderne
        padding: 18,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '500',
        fontSize: 15,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#dc3545', // Rouge plus moderne
    },
});

export default EditPersonDetails;