import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import { useAuth } from "../Login/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
const cin_client = user?.data?.cin_client || null;
const userPrenom = user?.data?.prenom || "";
const userNom = user?.data?.nom || "";
  const [totalPrixTotal, setTotalPrixTotal] = useState(0);
  const [totalPaiements, setTotalPaiements] = useState(0);
  const [totalAvances, setTotalAvances] = useState(0);
  const [remainingTotal, setRemainingTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [contratError, setContratError] = useState("");
  const [paiementError, setPaiementError] = useState("");
  const [avanceError, setAvanceError] = useState("");

  const calculateRemainingTotal = useCallback(() => {
    const remaining = totalAvances + totalPaiements - totalPrixTotal;
    setRemainingTotal(remaining);
  }, [totalAvances, totalPaiements, totalPrixTotal]);

  const fetchTotalPrixTotal = useCallback(async () => {
    setRefreshing(true);
    setContratError("");
    setTotalPrixTotal(0);

    if (!cin_client) {
      setContratError("Authentification requise. Veuillez vous reconnecter.");
      setRefreshing(false);
      return;
    }

    try {
      const response = await fetch(
        `http://192.168.1.10:7001/contrat/cin/${cin_client}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        setContratError(
          errorData.message || `Erreur de réseau (Statut: ${response.status}).`
        );
      } else {
        const responseData = await response.json();
        const contrats = Array.isArray(responseData)
          ? responseData
          : responseData && responseData.data
          ? responseData.data
          : [];
        if (contrats && contrats.length > 0) {
          const total = contrats.reduce(
            (sum, contrat) => sum + parseFloat(contrat.Prix_total),
            0
          );
          setTotalPrixTotal(total);
        } else {
          setContratError("Aucun contrat trouvé pour ce client.");
        }
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des contrats:", err);
      setContratError("Une erreur inattendue s'est produite.");
    } finally {
      setRefreshing(false);
    }
  }, [cin_client]);

  const fetchTotalPaiements = useCallback(async () => {
    setPaiementError("");
    setTotalPaiements(0);

    if (!cin_client) {
      setPaiementError("Authentification requise. Veuillez vous reconnecter.");
      return;
    }

    try {
      const response = await fetch(
        `http://192.168.1.10:7001/paiement/client/${cin_client}`
      );
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          console.error(
            "Erreur lors de la lecture de la réponse JSON:",
            await response.text()
          );
          setPaiementError(`Erreur serveur (Statut: ${response.status}).`);
          return;
        }
        setPaiementError(
          errorData.message || `Erreur de réseau (Statut: ${response.status}).`
        );
        return;
      }

      const responseData = await response.json();
      const paiements = Array.isArray(responseData)
        ? responseData
        : responseData && responseData.data
        ? responseData.data
        : [];

      if (paiements && paiements.length > 0) {
        const total = paiements.reduce(
          (sum, paiement) =>
            sum +
            parseFloat(paiement.montant_cheque1 || 0) +
            parseFloat(paiement.montant_cheque2 || 0) +
            parseFloat(paiement.montant_espace || 0) +
            parseFloat(paiement.montant_virement || 0),
          0
        );
        setTotalPaiements(total);
      } else {
        setPaiementError("Aucun paiement enregistré pour ce client.");
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des paiements:", err);
      setPaiementError("Une erreur inattendue s'est produite.");
    }
  }, [cin_client]);

  const fetchTotalAvances = useCallback(async () => {
    setAvanceError("");
    setTotalAvances(0);

    if (!cin_client) {
      setAvanceError("Authentification requise. Veuillez vous reconnecter.");
      return;
    }

    try {
      const response = await fetch(
        `http://192.168.1.10:7001/avance/client/${cin_client}`
      );
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          console.error(
            "Erreur lors de la lecture de la réponse JSON:",
            await response.text()
          );
          setAvanceError(`Erreur serveur (Statut: ${response.status}).`);
          return;
        }
        setAvanceError(
          errorData.message || `Erreur de réseau (Statut: ${response.status}).`
        );
        return;
      }

      const responseData = await response.json();
      const avances = Array.isArray(responseData)
        ? responseData
        : responseData && responseData.data
        ? responseData.data
        : [];

      if (avances && avances.length > 0) {
        const total = avances.reduce(
          (sum, avance) =>
            sum +
            parseFloat(avance.montant_cheque1 || 0) +
            parseFloat(avance.montant_cheque2 || 0) +
            parseFloat(avance.montant_espace || 0) +
            parseFloat(avance.montant_virement || 0),
          0
        );
        setTotalAvances(total);
      } else {
        setAvanceError("Aucune avance enregistrée pour ce client.");
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des avances:", err);
      setAvanceError("Une erreur inattendue s'est produite.");
    }
  }, [cin_client]);

  useEffect(() => {
    if (cin_client) {
      fetchTotalPrixTotal();
      fetchTotalPaiements();
      fetchTotalAvances();
    }
  }, [cin_client, fetchTotalPrixTotal, fetchTotalPaiements, fetchTotalAvances]);

  useEffect(() => {
    calculateRemainingTotal();
  }, [totalPrixTotal, totalPaiements, totalAvances, calculateRemainingTotal]);

  const onRefresh = useCallback(() => {
    fetchTotalPrixTotal();
    fetchTotalPaiements();
    fetchTotalAvances();
  }, [fetchTotalPrixTotal, fetchTotalPaiements, fetchTotalAvances]);

  const handleLogout = async () => {
    console.log("User object before logout:", user);
    try {
      await logout();
      navigation.replace("AuthTabs");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
      Alert.alert("Erreur", "La déconnexion a échoué.");
    }
  };

  const chartData = [
    { name: "Contrats", value: totalPrixTotal, color: "#9EC6F3" },
    { name: "Paiements", value: totalPaiements, color: "#CEDF9F" },
    { name: "Avances", value: totalAvances, color: "#FBF3B9" },
    {
      name: "Restant",
      value: remainingTotal > 0 ? remainingTotal : 0,
      color: "#e74c3c",
    },
  ].filter((item) => item.value > 0);

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadow: false,
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/nom.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => navigation.navigate("PersonDetails")} style={styles.headerIcon}>
            <Ionicons name="person-circle-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.headerIcon}>
            <Ionicons name="log-out-outline" size={25} color="#bf2c24" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Bienvenue, {`${userPrenom} ${userNom}`}!</Text>
      </View>
      <View style={[styles.fullWidthCard, styles.remainingCard]}>
        <Text style={styles.remainingTitle}>Montant Restant</Text>
        <Text style={[styles.remainingValue, remainingTotal < 0 && { color: "#e74c3c" }]}>
          {remainingTotal.toFixed(2)} DT
        </Text>
      </View>

      <View style={styles.cardContainer}>
        <View style={[styles.card, styles.contractCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={20} color="#3498db" />
            <Text style={styles.cardTitle}>Total Contrats</Text>
          </View>
          {contratError ? (
            <Text style={styles.error}>{contratError}</Text>
          ) : (
            <Text style={styles.cardValue}>{totalPrixTotal.toFixed(2)} DT</Text>
          )}
        </View>
        <View style={[styles.card, styles.AvanceCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="arrow-up-circle-outline" size={20} color="#f39c12" />
            <Text style={styles.cardTitle}>Total Avances</Text>
          </View>
          {avanceError ? (
            <Text style={styles.error}>{avanceError}</Text>
          ) : (
            <Text style={styles.cardValue}>{totalAvances.toFixed(2)} DT</Text>
          )}
        </View>
        <View style={[styles.card, styles.paymentCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="cash-outline" size={20} color="#2ecc71" />
            <Text style={styles.cardTitle}>Total Paiements</Text>
          </View>
          {paiementError ? (
            <Text style={styles.error}>{paiementError}</Text>
          ) : (
            <Text style={styles.cardValue}>{totalPaiements.toFixed(2)} DT</Text>
          )}
        </View>
      </View>

      {chartData.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Répartition des Transactions</Text>
          <PieChart
            data={chartData}
            width={Dimensions.get("window").width - 40}
            height={200}
            chartConfig={chartConfig}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 0]}
            absolute
          />
          <View style={styles.legendContainer}>
            {chartData.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 0,
    borderBottomColor: "#eee",
  },
  logoContainer: {
    width: 120,
    height: 100,
  },
  logoImage: {
    flex: 1,
    width: undefined,
    height: undefined,
  },
  headerIcons: {
    flexDirection: "row",
  },
  headerIcon: {
    marginLeft: 20,
  },
  fullWidthCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e74c3c", // Red border for "Montant Restant"
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  remainingCard: {
    borderColor: "#e74c3c", // Red border color for remaining card
  },
  remainingTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  remainingValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
  },
  cardContainer: {
    paddingHorizontal: 15,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: "48%",
  },
  contractCard: {
    borderColor: "#3498db", // Blue border for Total Contrats
  },
  paymentCard: {
    borderColor: "#2ecc71", // Green border for Total Paiements
  },
  AvanceCard: {
    borderColor: "#f39c12", // Green border for Total Paiements
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardIcon: {
    marginRight: 5,
  },
  welcomeContainer: {
    marginVertical: 15,
    alignItems: "left",
    marginLeft:"20",
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  error: {
    color: "#e74c3c",
    textAlign: "center",
    marginTop: 5,
  },
  chartContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    margin: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#fff", // Custom border color for chart container
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
    marginBottom: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 14,
    color: "#555",
  },
});

export default HomeScreen;