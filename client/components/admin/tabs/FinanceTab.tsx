import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { NemyColors } from "../../../constants/theme";
import { AdminStats } from "../types/admin.types";

interface FinanceTabProps {
  stats: AdminStats | null;
}

export const FinanceTab: React.FC<FinanceTabProps> = ({ stats }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💰 Resumen Financiero</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Ingresos Totales:</Text>
          <Text style={styles.statValue}>
            ${((stats?.totalRevenue || 0) / 100).toFixed(2)}
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Comisión Plataforma (15%):</Text>
          <Text style={styles.statValue}>
            ${(((stats?.totalRevenue || 0) * 0.15) / 100).toFixed(2)}
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Pedidos Completados:</Text>
          <Text style={styles.statValue}>{stats?.completedOrders || 0}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 16,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  statLabel: {
    fontSize: 14,
    color: "#666666",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },
});
