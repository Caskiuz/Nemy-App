import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius, NemyColors } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import type { Driver, TabProps } from "../types/admin.types";

export function DriversTab({ theme, showToast }: TabProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const res = await apiRequest("GET", "/api/admin/drivers");
      const data = await res.json();
      setDrivers(data.drivers || []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (driverId: string, isApproved: boolean) => {
    try {
      await apiRequest("PUT", `/api/admin/drivers/${driverId}/approval`, {
        isApproved: !isApproved,
      });
      showToast(isApproved ? "Repartidor suspendido" : "Repartidor aprobado", "success");
      fetchDrivers();
    } catch (error) {
      showToast("Error al actualizar repartidor", "error");
    }
  };

  const clearStrikes = async (driverId: string) => {
    try {
      await apiRequest("PUT", `/api/admin/drivers/${driverId}/strikes`, {
        strikes: 0,
      });
      showToast("Strikes eliminados", "success");
      fetchDrivers();
    } catch (error) {
      showToast("Error al eliminar strikes", "error");
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={NemyColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
        Repartidores ({drivers.length})
      </ThemedText>
      {drivers.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
          <Feather name="truck" size={48} color={theme.textSecondary} />
          <ThemedText style={{ marginTop: Spacing.md, color: theme.textSecondary }}>
            No hay repartidores registrados
          </ThemedText>
        </View>
      ) : (
        drivers.map((driver) => (
          <View key={driver.id} style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {driver.name}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {driver.email}
                </ThemedText>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: driver.isOnline ? NemyColors.success + "20" : theme.backgroundSecondary }]}>
                <View style={[styles.statusDot, { backgroundColor: driver.isOnline ? NemyColors.success : theme.textSecondary }]} />
                <ThemedText type="small" style={{ marginLeft: 4, color: driver.isOnline ? NemyColors.success : theme.textSecondary }}>
                  {driver.isOnline ? "En línea" : "Desconectado"}
                </ThemedText>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>Entregas</ThemedText>
                <ThemedText type="body" style={{ fontWeight: "600" }}>{driver.totalDeliveries}</ThemedText>
              </View>
              <View style={styles.stat}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>Rating</ThemedText>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {driver.rating ? driver.rating.toFixed(1) : "N/A"}
                </ThemedText>
              </View>
              <View style={styles.stat}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>Strikes</ThemedText>
                <ThemedText type="body" style={{ fontWeight: "600", color: driver.strikes > 0 ? NemyColors.error : theme.text }}>
                  {driver.strikes}
                </ThemedText>
              </View>
            </View>
            <View style={styles.cardActions}>
              <Pressable
                onPress={() => toggleApproval(driver.id, driver.isApproved)}
                style={[styles.actionBtn, { backgroundColor: driver.isApproved ? NemyColors.error + "20" : NemyColors.success + "20" }]}
              >
                <Feather name={driver.isApproved ? "user-x" : "user-check"} size={16} color={driver.isApproved ? NemyColors.error : NemyColors.success} />
                <ThemedText type="small" style={{ marginLeft: 4, color: driver.isApproved ? NemyColors.error : NemyColors.success }}>
                  {driver.isApproved ? "Suspender" : "Aprobar"}
                </ThemedText>
              </Pressable>
              {driver.strikes > 0 ? (
                <Pressable
                  onPress={() => clearStrikes(driver.id)}
                  style={[styles.actionBtn, { backgroundColor: NemyColors.primary + "20" }]}
                >
                  <Feather name="refresh-cw" size={16} color={NemyColors.primary} />
                  <ThemedText type="small" style={{ marginLeft: 4, color: NemyColors.primary }}>
                    Limpiar Strikes
                  </ThemedText>
                </Pressable>
              ) : null}
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing["3xl"] },
  emptyState: { padding: Spacing["3xl"], borderRadius: BorderRadius.lg, alignItems: "center" },
  card: { padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.md },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  cardActions: { flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.05)" },
  statsRow: { flexDirection: "row", gap: Spacing.lg, marginTop: Spacing.md },
  stat: { alignItems: "center" },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm, borderRadius: BorderRadius.sm },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  actionBtn: { flexDirection: "row", alignItems: "center", paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md },
});
