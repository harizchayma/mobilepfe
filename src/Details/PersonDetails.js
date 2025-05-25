import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PersonDetails = ({ navigation }) => {
  const [personData, setPersonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

   const fetchPersonDetails = async () => {
       setLoading(true);
       setError(null);
       try {
           const storedData = await AsyncStorage.getItem('userData');
           if (storedData) {
               const parsedData = JSON.parse(storedData);
               const clientId = parsedData.data.id_client; // Utilisez cin_client ici
               const userDetailsResponse = await fetch(
                   `http://192.168.1.10:7001/client/${clientId}`
               );
               if (!userDetailsResponse.ok) {
                   throw new Error(`Erreur HTTP ! statut : ${userDetailsResponse.status}`);
               }
               const userDetails = await userDetailsResponse.json();
               console.log("Réponse API :", userDetails);
               setPersonData(userDetails.data);
           } else {
               setError('Aucune donnée trouvée');
           }
       } catch (e) {
           setError(e.message);
       } finally {
           setLoading(false);
       }
   };
   

  useEffect(() => {
    fetchPersonDetails();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPersonDetails().then(() => setRefreshing(false));
  }, []);

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

  if (!personData) {
    return (
      <View style={styles.container}>
        <Text>Détails de la personne non trouvés.</Text>
      </View>
    );
  }

  const { nom_fr, prenom_fr, email ,date_naiss, adresse_fr, num_tel, profession_fr,nationalite_origine} = personData;

  const getAvatarInitials = (nom_fr, prenom_fr) => {
    if (!nom_fr || !prenom_fr) return '';
    const nomInitial = nom_fr.charAt(0).toUpperCase();
    const prenomSecond = prenom_fr.charAt(0).toUpperCase();
    return `${nomInitial}${prenomSecond}`;
  };

  const initials = getAvatarInitials(nom_fr, prenom_fr);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.profileName}>{`${prenom_fr || ''} ${nom_fr || ''}`}</Text>
      </View>

      <ScrollView
        style={styles.cardBody}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Email :</Text>
          <Text style={styles.detailValue}>{email || 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date de Naissance :</Text>
          <Text style={styles.detailValue}>{date_naiss || 'N/A'}</Text>
          {/* <Text style={styles.detailValue}>{date_naiss ? moment(date_naiss).format('DD/MM/YYYY') : 'N/A'}</Text> */}
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Adresse :</Text>
          <Text style={styles.detailValue}>{adresse_fr || 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Numéro de téléphone :</Text>
          <Text style={styles.detailValue}>{num_tel || 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Profession :</Text>
          <Text style={styles.detailValue}>{profession_fr || 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Nationalité :</Text>
          <Text style={styles.detailValue}>{nationalite_origine || 'N/A'}</Text>
        </View>
      </ScrollView>
      <TouchableOpacity onPress={() => navigation.navigate('EditPersonDetails')}>
        <Text style={styles.editButtonText}>Modifier</Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
      borderRadius: 12,
      margin: 20,
      marginTop: 60,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 5,
  },
  cardHeader: {
      alignItems: 'center',
      padding: 25, // Plus d'espace
      borderBottomWidth: 1,
      borderBottomColor: '#1e3a8a', // Couleur de bordure plus claire
  },
  avatarContainer: {
      width: 90, // Plus grand
      height: 90,
      borderRadius: 45,
      backgroundColor: '#dee2e6', // Couleur de fond plus douce
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8, // Plus d'espace
  },
  avatarText: {
      fontSize: 25, // Plus grand
      fontWeight: '600',
      color: '#1e3a8a', // Couleur plus douce
  },
  profileName: {
      fontSize: 26,
      fontWeight: '600',
      color:"#bf2c24",
      marginTop:5,
      fontWeight: 'bold',
  },
  cardBody: {
      padding: 25, // Plus d'espace
  },
  detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 15, // Plus d'espace
      borderBottomWidth: 1,
      borderBottomColor: '#f1f3f5', // Couleur de bordure plus claire
      paddingBottom: 8,
  },
  detailLabel: {
      fontSize: 17,
      fontWeight: '500',
      color: '#495057',
  },
  detailValue: {
      fontSize: 17,
      color: '#212529',
      fontWeight: '400',
      fontWeight: 'bold',
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
  editButtonText: {
      backgroundColor: '#1e3a8a', // Bleu plus moderne
      color: '#fff',
      fontWeight: '600',
      textAlign: 'center',
      padding: 15,
      margin: 10,
      borderRadius: 30,
      fontSize: 16,
  },
});

export default PersonDetails;