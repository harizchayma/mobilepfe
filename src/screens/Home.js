import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
  Image,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import Joi from "joi";
import { useAuth } from "../Login/AuthContext";

const Home = ({ navigation, route }) => {
  const { user, logout } = useAuth();
  const cin_client = user?.data?.cin_client || null;

  // Extract user details
  const firstName = user?.data?.firstName || ""; // Assume firstName is in user data
  const lastName = user?.data?.lastName || ""; // Assume lastName is in user data

  const avatarText = `<span class="math-inline">\{firstName\.charAt\(0\)\.toUpperCase\(\)\}</span>{
    lastName.charAt(1) ? lastName.charAt(1).toUpperCase() : ""
  }`;

  const [refreshing, setRefreshing] = useState(false);
  const [dateDebut, setDateDebut] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 3);
    return today;
  });
  const [dateRetour, setDateRetour] = useState(
    new Date(new Date().setDate(new Date().getDate() + 4)) // Initialize retour to 1 day after debut
  );
  const [dureeLocation, setDureeLocation] = useState("1"); // Initialize duration to 1 day
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isStartDate, setIsStartDate] = useState(true);
  const [isStartTime, setIsStartTime] = useState(true);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [heureDebut, setHeureDebut] = useState("09:00"); // Default start time
  const [heureRetour, setHeureRetour] = useState("17:00"); // Default return time
  const [timeIntervals, setTimeIntervals] = useState([]);

  const schema = Joi.object({
    Date_debut: Joi.date().required(),
    Heure_debut: Joi.string()
      .pattern(/^\d{2}:\d{2}$/)
      .required(),
    Date_retour: Joi.date().greater(Joi.ref("Date_debut")).required(),
    Heure_retour: Joi.string()
      .pattern(/^\d{2}:\d{2}$/)
      .required(),
    Duree_location: Joi.number().integer().positive().required(),
  });

  const fetchAvailableVehicles = async (startDate, endDate) => {
    try {
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `<span class="math-inline">\{year\}\-</span>{month}-${day}`;
      };

      const formattedStartDate = formatDate(new Date(startDate));
      const formattedEndDate = formatDate(new Date(endDate));

      const vehiclesResponse = await fetch(`http://192.168.1.10:7001/vehicules`);
      const vehiclesData = await vehiclesResponse.json();
      console.log("Fetched Vehicles:", vehiclesData);

      const contractsResponse = await fetch(`http://192.168.1.10:7001/contrat?startDate=<span class="math-inline">\{formattedStartDate\}&endDate\=</span>{formattedEndDate}`);
      const contractsData = await contractsResponse.json();
      console.log("Fetched Contracts:", contractsData);

      if (vehiclesResponse.ok && contractsResponse.ok) {
        // Get booked vehicle numbers from contracts (which overlap with the requested dates)
        const bookedVehicleNumbers = contractsData.data
          ? contractsData.data
              .filter((contract) => {
                const contractStartDate = new Date(contract.Date_debut);
                const contractEndDate = new Date(contract.Date_retour);
                const searchStartDate = new Date(startDate);
                const searchEndDate = new Date(endDate);

                // Check for overlap
                const isOverlapping = contractStartDate < searchEndDate && contractEndDate > searchStartDate;
                console.log(`Checking Contract: ${contract.num_immatriculation} - Overlap: ${isOverlapping}`);
                return isOverlapping; // Include booked vehicles overlapping with requested dates
              })
              .map((contract) => contract.num_immatriculation)
              .filter((num) => num !== null)
          : [];

        console.log("Booked Vehicle Numbers from Contracts:", bookedVehicleNumbers);

        // Fetch reservations that overlap and are not "en attent"
        const reservationResponse = await fetch(`http://192.168.1.10:7001/reservation?startDate=<span class="math-inline">\{formattedStartDate\}&endDate\=</span>{formattedEndDate}`);
        const reservationsData = await reservationResponse.json();
        console.log("Fetched Reservations:", reservationsData);

        const reservedVehicleNumbers = reservationsData.data
          ? reservationsData.data
              .filter((reservation) => {
                const reservationStartDate = new Date(reservation.Date_debut);
                const reservationEndDate = new Date(reservation.Date_retour);
                const searchStartDate = new Date(startDate);
                const searchEndDate = new Date(endDate);

                // Check for overlap
                const isOverlapping = reservationStartDate < searchEndDate && reservationEndDate > searchStartDate;

                // Log reservation checking
                console.log(`Checking Reservation: ${reservation.num_immatriculation} - Overlap: ${isOverlapping}, Status: ${reservation.action}`);

                // Include only if overlaps and is "en attent"
                return isOverlapping && reservation.action === "en attent";
              })
              .map((reservation) => reservation.num_immatriculation)
              .filter((num) => num !== null)
          : [];

        console.log("Reserved Vehicle Numbers (including 'en attent'):", reservedVehicleNumbers);

        // Combine booked and reserved vehicle numbers
        const allBookedNumbers = [...bookedVehicleNumbers, ...reservedVehicleNumbers];
        console.log("All Booked Vehicle Numbers:", allBookedNumbers);

        // Filter available vehicles
        const availableVehicles = vehiclesData.data.filter(
          (vehicle) => !allBookedNumbers.includes(vehicle.num_immatriculation)
        );

        console.log("Available Vehicles:", availableVehicles);

        return availableVehicles;
      } else {
        console.error("Error fetching data, status:", vehiclesResponse.status, contractsResponse.status);
        throw new Error("Erreur lors de la récupération des données");
      }
    } catch (error) {
      console.error("Network error:", error);
      throw error;
    }
  };
  useEffect(() => {
    if (!cin_client) {
      Alert.alert("Erreur", "Session invalide. Veuillez vous reconnecter.");
      navigation.navigate("Login");
    }
  }, [cin_client]);

  useEffect(() => {
    console.log("Home - Updated user context:", user);
    if (!cin_client) {
      Alert.alert("Erreur", "Identifiant client manquant.");
    }
  }, [user]);

  useEffect(() => {
    // Calculate duration whenever dateDebut or dateRetour changes
    if (dateDebut && dateRetour) {
      const diffTime = Math.abs(dateRetour - dateDebut);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDureeLocation(diffDays.toString());
    }
  }, [dateDebut, dateRetour]);

  const handleSubmit = async () => {
    if (!cin_client) {
      Alert.alert(
        "Erreur",
        "Identifiant client manquant. Veuillez vous reconnecter."
      );
      return;
    }

    // Check if the reservation is at least 3 days in advance - This is already handled by default date
    // const currentDate = new Date();
    // const threeDaysFromNow = new Date(currentDate);
    // threeDaysFromNow.setDate(currentDate.getDate() + 3);

    // if (dateDebut < threeDaysFromNow) {
    //   Alert.alert("Erreur", "Vous devez réserver au moins après 3 jours .");
    //   return;
    // }

    setIsLoading(true);
    try {
      const startDate = new Date(dateDebut);
      const [startHour, startMinute] = heureDebut.split(':').map(Number);
      startDate.setHours(startHour, startMinute, 0, 0);

      const endDate = new Date(dateRetour);
      const [endHour, endMinute] = heureRetour.split(':').map(Number);
      endDate.setHours(endHour, endMinute, 0, 0);

      const formData = {
        Date_debut: startDate, // Use the combined Date object
        Heure_debut: heureDebut,
        Date_retour: endDate, // Use the combined Date object
        Heure_retour: heureRetour,
        Duree_location: parseInt(dureeLocation, 10), // Use the state value
      };

      const { error } = schema.validate(formData, { abortEarly: false });
      if (error) {
        setErrors(
          error.details.reduce((acc, err) => {
            acc[err.path[0]] = err.message;
            return acc;
          }, {})
        );
      } else {
        setErrors({});
        const availableVehicles = await fetchAvailableVehicles(
          startDate.toISOString(),
          endDate.toISOString()
        );

        console.log(
          "Home - Navigating with available vehicles:",
          availableVehicles
        );
        navigation.navigate("VehiculeSelection", {
          availableVehicles,
          rentalDetails: {
            dateDebut: startDate.toISOString(),
            dateRetour: endDate.toISOString(),
            heureDebut,
            heureRetour,
            dureeLocation: parseInt(dureeLocation, 10),
            cin_client: cin_client,
          },
        });
      }
    } catch (error) {
      console.error("Home - Error during submission:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || (isStartDate ? dateDebut : dateRetour);
    setShowDatePicker(false);
    if (currentDate) {
      if (isStartDate) {
        setDateDebut(currentDate);
        // Automatically update dateRetour to be at least the next day
        if (currentDate >= dateRetour) {
          const nextDay = new Date(currentDate);
          nextDay.setDate(currentDate.getDate() + 1);
          setDateRetour(nextDay);
        }
      } else {
        setDateRetour(currentDate);
        // Automatically update dateDebut to be no later than the previous day
        if (currentDate <= dateDebut) {
          const previousDay = new Date(currentDate);
          previousDay.setDate(currentDate.getDate() - 1);
          setDateDebut(previousDay);
        }
      }
    }
  };

  const onChangeTime = (event, selectedTime) => {
    const currentTime = selectedTime || new Date();
    setShowTimePicker(false);
    const timeString = currentTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // Assurez-vous d'utiliser le format 24 heures
    });
    if (isStartTime) {
      setHeureDebut(timeString);
    } else {
      setHeureRetour(timeString);
    }
  };

  const generateTimeIntervals = () => {
    const intervals = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourString = hour < 10 ? `0${hour}` : `${hour}`;
      intervals.push(`${hourString}:00`);
      intervals.push(`${hourString}:30`);
    }
    return intervals;
  };
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
  useEffect(() => {
    const intervals = generateTimeIntervals();
    setTimeIntervals(intervals.map((time) => ({ label: time, value: time })));
  }, []);
  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshing(false);
  };
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/nom.png")} // Remplacez par le chemin de votre image
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.headerIcons}>

          <Ionicons
            name="person-circle-outline"
            size={24}
            color="#000"
            style={styles.headerIcon}
          />
           <TouchableOpacity onPress={handleLogout}>
            <Ionicons
              name="log-out-outline"
              size={24}
              color="#bf2c24"
              style={styles.headerIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Réservation de Véhicule</Text>
          {/* Date and Time Pickers */}
          {showDatePicker && (
            <DateTimePicker
              mode="date"
              display="spinner"
              value={isStartDate ? dateDebut : dateRetour}
              onChange={onChangeDate}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              mode="time"
              display="spinner"
              value={
                isStartTime
                  ? new Date(`1970-01-01T${heureDebut}:00`)
                  : new Date(`1970-01-01T${heureRetour}:00`)
              }
              onChange={onChangeTime}
            />
          )}

          <View style={styles.rowContainer}>
            <View style={styles.fieldContainer}>
              <View style={styles.iconTextRow}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#439ce0"
                  style={styles.icon}
                />
                <Text style={styles.label}>Date de début</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="jj/mm/aaaa"
                value={dateDebut.toLocaleDateString("fr-FR")}
                onFocus={() => {
                  setShowDatePicker(true);
                  setIsStartDate(true);
                }}
              />
              {errors.Date_debut && (
                <Text style={styles.error}>{errors.Date_debut}</Text>
              )}
            </View>
            <View style={styles.fieldContainer}>
              <View style={styles.iconTextRow}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color="#439ce0"
                  style={styles.icon}
                />
                <Text style={styles.label}>Heure de début</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowTimePicker(true);
                  setIsStartTime(true);
                }}
              >
                <TextInput
                  style={styles.timeInput}
                  placeholder="hh:mm"
                  value={heureDebut}
                  editable={false}
                />
              </TouchableOpacity>
              {errors.Heure_debut && (
                <Text style={styles.error}>{errors.Heure_debut}</Text>
              )}
            </View>
          </View>

          <View style={styles.rowContainer}>
            <View style={styles.fieldContainer}>
              <View style={styles.iconTextRow}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#439ce0"
                  style={styles.icon}
                />
                <Text style={styles.label}>Date de retour</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="jj/mm/aaaa"
                value={dateRetour.toLocaleDateString("fr-FR")}
                onFocus={() => {
                  setShowDatePicker(true);
                  setIsStartDate(false);
                }}
              />
              {errors.Date_retour && (
                <Text style={styles.error}>{errors.Date_retour}</Text>
              )}
            </View>
            <View style={styles.fieldContainer}>
              <View style={styles.iconTextRow}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color="#439ce0"
                  style={styles.icon}
                />
                <Text style={styles.label}>Heure de retour</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowTimePicker(true);
                  setIsStartTime(false);
                }}
              >
                <TextInput
                  style={styles.timeInput}
                  placeholder="hh:mm"
                  value={heureRetour}
                  editable={false}
                />
              </TouchableOpacity>
              {errors.Heure_retour && (
                <Text style={styles.error}>{errors.Heure_retour}</Text>
              )}
            </View>
          </View>

          <View style={styles.durationContainer}>
            <Ionicons
              name="timer-outline"
              size={22}
              color="#bf2c24"
              style={styles.icon}
            />
            <Text style={styles.labelInline}>Durée de location :</Text>
            <Text style={styles.durationText}>
              {dureeLocation ? `${dureeLocation} jours` : "0 jours"}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Rechercher</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#f7f7f7", // Couleur de fond du header

    borderBottomColor: "#ccc", // Couleur de séparation
  },
  logoContainer: {
    width: 100,
    height: 100,
    padding: 1,
    borderRadius: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  headerIcons: {
    flexDirection: "row",
  },
  headerIcon: {
    marginLeft: 15,
    
  },
  container: {
    flexGrow: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f7", // Couleur de fond du corps
    padding: 15,
    marginTop: 0,
  },
  titleContainer: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: "#ffffff", // Fond blanc pour le conteneur du titre
    borderRadius: 12, // Bordures arrondies
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1e3a8a",
    textAlign: "center",
    marginBottom: 50,
  },
  dateTimeContainer: {
    backgroundColor: "#ffffff", // Fond blanc pour le conteneur des dates et heures
    borderRadius: 12, // Bordures arrondies
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 20,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  fieldContainer: {
    flex: 1,
    marginRight: 10,
  },
  iconTextRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  icon: {
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    backgroundColor: "#ffffff", // Fond blanc pour les champs de texte
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: "#439ce0",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    backgroundColor: "#ffffff", // Fond blanc pour les champs de temps
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    color: "#439ce0",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  labelInline: {
    fontSize: 16,
    color: "#6b7280",
    marginRight: 10,
  },
  durationText: {
    fontSize: 16,
    color: "#dc2626",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#1e3a8a", // Couleur du bouton
    paddingVertical: 15,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginTop: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  error: {
    color: "#dc2626",
    fontSize: 12,
    marginTop: 4,
    textAlign: "left",
    width: "100%",
  },
});

export default Home;
