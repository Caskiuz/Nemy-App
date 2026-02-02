import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, NemyColors, Shadows } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";

interface BusinessHour {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export default function BusinessHoursScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHours();
  }, []);

  const loadHours = async () => {
    try {
      const response = await apiRequest("GET", "/api/business/hours");
      const data = await response.json();
      if (data.success) {
        setHours(data.hours);
      }
    } catch (error) {
      console.error("Error loading hours:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (index: number) => {
    const newHours = [...hours];
    newHours[index].isOpen = !newHours[index].isOpen;
    setHours(newHours);
  };

  const updateTime = (index: number, field: "openTime" | "closeTime", value: string) => {
    const newHours = [...hours];
    newHours[index][field] = value;
    setHours(newHours);
  };

  const saveHours = async () => {
    try {
      await apiRequest("PUT", "/api/business/hours", { hours });
      alert("Horarios guardados");
    } catch (error) {
      console.error("Error saving hours:", error);
      alert("Error al guardar horarios");
    }
  };

  return (
    <LinearGradient
      colors={[theme.gradientStart, theme.gradientEnd]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <ThemedText type="h2">Horarios</ThemedText>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {hours.map((hour, index) => (
          <View
            key={hour.day}
            style={[styles.dayCard, { backgroundColor: theme.card }, Shadows.sm]}
          >
            <View style={styles.dayHeader}>
              <ThemedText type="h4">{hour.day}</ThemedText>
              <Switch
                value={hour.isOpen}
                onValueChange={() => toggleDay(index)}
                trackColor={{ false: "#767577", true: NemyColors.primary }}
                thumbColor="#fff"
              />
            </View>

            {hour.isOpen && (
              <View style={styles.timeRow}>
                <View style={styles.timeInput}>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    Apertura
                  </ThemedText>
                  <Pressable
                    style={[styles.timeButton, { backgroundColor: theme.background }]}
                  >
                    <Feather name="clock" size={16} color={NemyColors.primary} />
                    <ThemedText type="body" style={{ marginLeft: Spacing.xs }}>
                      {hour.openTime}
                    </ThemedText>
                  </Pressable>
                </View>

                <View style={styles.timeInput}>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    Cierre
                  </ThemedText>
                  <Pressable
                    style={[styles.timeButton, { backgroundColor: theme.background }]}
                  >
                    <Feather name="clock" size={16} color={NemyColors.primary} />
                    <ThemedText type="body" style={{ marginLeft: Spacing.xs }}>
                      {hour.closeTime}
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        ))}

        <Pressable
          onPress={saveHours}
          style={[styles.saveButton, { backgroundColor: NemyColors.primary }]}
        >
          <ThemedText type="body" style={{ color: "#FFF", fontWeight: "600" }}>
            Guardar Horarios
          </ThemedText>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing["4xl"],
  },
  dayCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  timeInput: {
    flex: 1,
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  saveButton: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.lg,
  },
});
