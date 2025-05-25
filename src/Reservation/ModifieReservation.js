import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

const ModifieReservation = ({ route, navigation }) => {
    const { reservation } = route.params;

    // Initialize state for dates and times
    const initialDateDebut = reservation.Date_debut
        ? new Date(reservation.Date_debut)
        : new Date();
    const initialDateRetour = reservation.Date_retour
        ? new Date(reservation.Date_retour)
        : new Date();
    const initialHeureDebut = reservation.Heure_debut || "00:00";
    const initialHeureRetour = reservation.Heure_retour || "00:00";

    const [dateDebut, setDateDebut] = useState(initialDateDebut);
    const [dateRetour, setDateRetour] = useState(initialDateRetour);
    const [heureDebut, setHeureDebut] = useState(initialHeureDebut);
    const [heureRetour, setHeureRetour] = useState(initialHeureRetour);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [isStartDate, setIsStartDate] = useState(true);
    const [isStartTime, setIsStartTime] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errors, setErrors] = useState({});
    const [dureeLocation, setDureeLocation] = useState(0);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        try {
            const startDateTime = new Date(dateDebut);
            const [startHour, startMinute] = heureDebut.split(":").map(Number);
            startDateTime.setHours(startHour, startMinute, 0, 0);

            const endDateTime = new Date(dateRetour);
            const [endHour, endMinute] = heureRetour.split(":").map(Number);
            endDateTime.setHours(endHour, endMinute, 0, 0);

            const duration = calculateRentalDuration(startDateTime, endDateTime);
            setDureeLocation(duration);
        } catch (error) {
            console.error("Error calculating duration:", error);
            setDureeLocation(0);
        }
    }, [dateDebut, dateRetour, heureDebut, heureRetour]);

    const fetchAvailableVehicles = async (startDate, endDate) => {
        try {
            const formatDate = (date) => {
                if (!(date instanceof Date) || isNaN(date.getTime())) return null;
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                return `<span class="math-inline">\{year\}\-</span>{month}-${day}`;
            };

            const formattedStartDate = formatDate(new Date(startDate));
            const formattedEndDate = formatDate(new Date(endDate));

            if (!formattedStartDate || !formattedEndDate)
                throw new Error("Dates de début ou de fin invalides.");

            const vehiclesResponse = await fetch(
                `http://192.168.1.10:7001/vehicules`
            );
            const contractsResponse = await fetch(
                `http://192.168.1.10:7001/contrat?startDate=<span class="math-inline">\{formattedStartDate\}&endDate\=</span>{formattedEndDate}`
            );
            const reservationResponse = await fetch(
                `http://192.168.1.10:7001/reservation?startDate=<span class="math-inline">\{formattedStartDate\}&endDate\=</span>{formattedEndDate}`
            );

            if (
                !vehiclesResponse.ok ||
                !contractsResponse.ok ||
                !reservationResponse.ok
            ) {
                console.error(
                    "Error fetching data, status:",
                    vehiclesResponse.status,
                    contractsResponse.status,
                    reservationResponse.status
                );
                throw new Error("Erreur lors de la récupération des données");
            }

            const vehiclesData = await vehiclesResponse.json();
            const contractsData = await contractsResponse.json();
            const reservationsData = await reservationResponse.json();

            const bookedVehicleNumbers =
                contractsData?.data
                    ?.filter(
                        (contract) =>
                            new Date(contract.Date_debut) < new Date(endDate) &&
                            new Date(contract.Date_retour) > new Date(startDate)
                    )
                    .map((contract) => contract.num_immatriculation)
                    .filter((num) => num !== null) || [];
            const reservedVehicleNumbers =
                reservationsData?.data
                    ?.filter(
                        (res) =>
                            new Date(res.Date_debut) < new Date(endDate) &&
                            new Date(res.Date_retour) > new Date(startDate) &&
                            (["accepte", "rejecte"].includes(res.action?.toLowerCase()) ||
                                (res.id_reservation !== reservation.id_reservation &&
                                    res.action?.toLowerCase() === "en attent"))
                    )
                    .map((res) => res.num_immatriculation)
                    .filter((num) => num !== null) || [];
            const allBookedNumbers = [
                ...bookedVehicleNumbers,
                ...reservedVehicleNumbers,
            ];
            const availableVehicles = (vehiclesData?.data || []).filter(
                (vehicle) => !allBookedNumbers.includes(vehicle.num_immatriculation)
            );

            return availableVehicles;
        } catch (error) {
            console.error("Network error fetching available vehicles:", error);
            throw error;
        }
    };

    const calculateRentalDuration = (start, end) => {
        if (
            !(start instanceof Date) ||
            isNaN(start.getTime()) ||
            !(end instanceof Date) ||
            isNaN(end.getTime())
        )
            return 0;
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const handleSearchVehicles = async () => {
        const startDateTime = new Date(dateDebut);
        const [startHour, startMinute] = heureDebut.split(":").map(Number);
        startDateTime.setHours(startHour, startMinute, 0, 0);

        const endDateTime = new Date(dateRetour);
        const [endHour, endMinute] = heureRetour.split(":").map(Number);
        endDateTime.setHours(endHour, endMinute, 0, 0);

        const duration = calculateRentalDuration(startDateTime, endDateTime);

        if (duration < 1) {
            Alert.alert(
                "Erreur",
                "La date de retour doit être postérieure à la date de début."
            );
            return;
        }

        const timeRegex = /^\d{2}:\d{2}$/;
        if (!timeRegex.test(heureDebut) || !timeRegex.test(heureRetour)) {
            Alert.alert(
                "Erreur",
                "Veuillez saisir les heures au format HH:MM (ex: 09:00)."
            );
            return;
        }

        setIsSearching(true);

        try {
            const vehicles = await fetchAvailableVehicles(startDateTime, endDateTime);
            if (vehicles && vehicles.length > 0) {
                navigation.navigate("VehiculesDisponibles", {
                    availableVehicles: vehicles,
                    duree: duration,
                    dateDebut: dateDebut.toISOString(),
                    dateRetour: dateRetour.toISOString(),
                    heureDebut: heureDebut,
                    heureRetour: heureRetour,
                    reservationId: reservation.id_reservation,
                    cin_client: reservation.cin_client,
                });
            } else {
                Alert.alert(
                    "Information",
                    "Aucun véhicule disponible pour cette période."
                );
            }
        } catch (error) {
            console.error("Error searching vehicles:", error);
            Alert.alert(
                "Erreur",
                `Une erreur est survenue lors de la recherche de véhicules: ${error.message}`
            );
        } finally {
            setIsSearching(false);
        }
    };

    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || (isStartDate ? dateDebut : dateRetour);
        setShowDatePicker(false);
        if (event.type === "set") {
            if (isStartDate) setDateDebut(currentDate);
            else setDateRetour(currentDate);
        }
    };

    const onChangeTime = (event, selectedTime) => {
        setShowTimePicker(false);
        if (event.type === "set" && selectedTime) {
            const hours = selectedTime.getHours().toString().padStart(2, "0");
            const minutes = selectedTime.getMinutes().toString().padStart(2, "0");
            const timeString = `<span class="math-inline">\{hours\}\:</span>{minutes}`;
            if (isStartTime) setHeureDebut(timeString);
            else setHeureRetour(timeString);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        setRefreshing(false);
    };

    return (
        <View style={styles.fullScreenContainer}>
            <View style={styles.header}>
                <Text style={styles.title}>Modifier la Réservation</Text>
            </View>
            <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.dateTimeContainer}>
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
                            <TouchableOpacity
                                onPress={() => {
                                    setShowDatePicker(true);
                                    setIsStartDate(true);
                                }}
                            >
                                <TextInput
                                    style={styles.input}
                                    placeholder="jj/mm/aaaa"
                                    editable={false}
                                    value={
                                        dateDebut instanceof Date && !isNaN(dateDebut.getTime())
                                            ? dateDebut.toLocaleDateString("fr-FR")
                                            : ""
                                    }
                                />
                            </TouchableOpacity>
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
                                    editable={false}
                                    value={heureDebut}
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
                            <TouchableOpacity
                                onPress={() => {
                                    setShowDatePicker(true);
                                    setIsStartDate(false);
                                }}
                            >
                                <TextInput
                                    style={styles.input}
                                    placeholder="jj/mm/aaaa"
                                    editable={false}
                                    value={
                                        dateRetour instanceof Date && !isNaN(dateRetour.getTime())
                                            ? dateRetour.toLocaleDateString("fr-FR")
                                            : ""
                                    }
                                />
                            </TouchableOpacity>
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
                                    editable={false}
                                    value={heureRetour}
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
                            {dureeLocation > 0 ? `${dureeLocation} jours` : "0 jours"}
                        </Text>
                    </View>
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={isStartDate ? dateDebut : dateRetour}
                        mode="date"
                        display="spinner"
                        onChange={onChangeDate}
                        minimumDate={
                            isStartDate
                                ? new Date()
                                : dateDebut instanceof Date && !isNaN(dateDebut.getTime())
                                    ? dateDebut
                                    : new Date()
                        }
                    />
                )}
                {showTimePicker && (
                    <DateTimePicker
                        value={
                            isStartTime
                                ? new Date(`1970-01-01T${heureDebut}:00`)
                                : new Date(`1970-01-01T${heureRetour}:00`)
                        }
                        mode="time"
                        display="spinner"
                        onChange={onChangeTime}
                        minuteInterval={5}
                    />
                )}

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSearchVehicles}
                    disabled={isSearching}
                >
                    {isSearching ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.buttonText}>Rechercher des Véhicules</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        backgroundColor: "#f7f7f7",
    },
    header: {
        backgroundColor: "#ffffff",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomColor: "#e0e0e0",
        borderBottomWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1a237e",
    },
    scrollViewContent: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: "#f7f7f7",
    },
    dateTimeContainer: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 15,
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
    marginBottom: 20,
  },
  fieldContainer: {
    flex: 1,
    marginRight: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: "#4a5568",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#edf2f7",
    color: "#2d3748",
  },
  timeInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#edf2f7",
    color: "#2d3748",
  },
  button: {
    backgroundColor: "#3f51b5",
    paddingVertical: 16,
    marginTop: 30,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  iconTextRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  icon: {
    marginRight: 8,
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    padding: 18,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  labelInline: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
    color: "#4a5568",
  },
  durationText: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "bold",
  },
  error: {
    color: "#e53e3e",
    fontSize: 12,
    marginTop: 5,
  },
});

export default ModifieReservation;
