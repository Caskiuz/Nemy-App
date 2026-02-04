import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { NemyColors, Spacing, BorderRadius } from "../../../constants/theme";
import { DashboardMetrics, ActiveOrder, OnlineDriver } from "../types/admin.types";

interface DashboardTabProps {
  metrics: DashboardMetrics | null;
  activeOrders: ActiveOrder[];
  onlineDrivers: OnlineDriver[];
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  metrics,
  activeOrders,
  onlineDrivers,
}) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{metrics?.activeOrders || 0}</Text>
          <Text style={styles.metricLabel}>Pedidos Activos</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{metrics?.onlineDrivers || 0}</Text>
          <Text style={styles.metricLabel}>Repartidores Online</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{metrics?.todayOrders || 0}</Text>
          <Text style={styles.metricLabel}>Pedidos Hoy</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>
            ${((metrics?.todayRevenue || 0) / 100).toFixed(0)}
          </Text>
          <Text style={styles.metricLabel}>Ingresos Hoy</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📦 Pedidos Activos</Text>
        {activeOrders.length === 0 ? (
          <Text style={styles.emptyText}>No hay pedidos activos</Text>
        ) : (
          activeOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <Text style={styles.orderBusiness}>{order.businessName}</Text>
              <Text style={styles.orderCustomer}>{order.customerName}</Text>
              <Text style={styles.orderStatus}>{order.status}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚗 Repartidores Online</Text>
        {onlineDrivers.length === 0 ? (
          <Text style={styles.emptyText}>No hay repartidores online</Text>
        ) : (
          onlineDrivers.map((driver) => (
            <View key={driver.id} style={styles.driverCard}>
              <Text style={styles.driverName}>{driver.name}</Text>
              <Text style={styles.driverStatus}>
                {driver.isAvailable ? "Disponible" : "Ocupado"}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  metricValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: NemyColors.primary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    padding: 16,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  orderBusiness: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  orderCustomer: {
    fontSize: 12,
    color: "#666",
  },
  orderStatus: {
    fontSize: 12,
    color: NemyColors.primary,
    marginTop: 4,
  },
  driverCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  driverName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  driverStatus: {
    fontSize: 12,
    color: NemyColors.primary,
  },
});
