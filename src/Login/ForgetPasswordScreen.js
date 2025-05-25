import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSendPasswordEmail = async () => {
    setLoading(true);
    setErrorMessage('');
    console.log('Email à envoyer:', email);
  
    try {
      const response = await fetch('http://192.168.1.10:7001/client/send-password-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        Alert.alert('Succès', data.message);
        setEmail(''); // Réinitialiser le champ e-mail après le succès
      } else {
        setErrorMessage(data.message || 'Erreur lors de l\'envoi de l\'e-mail.');
      }
    } catch (error) {
      setLoading(false);
      console.error('Erreur lors de l\'envoi de l\'e-mail :', error);
      setErrorMessage('Une erreur s\'est produite lors de l\'envoi de l\'e-mail.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Récupérer le mot de passe</Text>
      <Text style={styles.label}>Entrez votre e-mail :</Text>
      <TextInput
        style={styles.input}
        placeholder="Votre e-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <Button
        title={loading ? 'Envoi en cours...' : 'Envoyer le mot de passe par e-mail'}
        onPress={handleSendPasswordEmail}
        disabled={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});

export default ForgotPasswordScreen;