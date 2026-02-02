import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Badge } from "@/components/Badge";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, NemyColors, Shadows } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";

export default function DriverAvailableOrdersScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async () => {
    try {
      const response = await apiRequest("GET", "/api/delivery/available-orders");
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleAcceptOrder = async (orderId: string) => {
    Alert.alert("Aceptar Pedido", "¿Quieres aceptar este pedido?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Aceptar",
        onPress: async () => {
          try {
            await apiRequest("POST", `/api/delivery/accept-order/${orderId}`, {});
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            loadOrders();
          } catch (error) {
            console.error("Error accepting order:", error);
            Alert.alert("Error", "No se pudo aceptar el pedido");
          }
        },
      },
    ]);
  };

  const renderOrder = ({ item }: { item: any }) => {
    const items = typeof item.items === "string" ? JSON.parse(item.items) : item.items;

    return (
      <View
        style={[styles.orderCard, { backgroundColor: theme.card }, Shadows.sm]}
      >
        <View style={styles.orderHeader}>
          <View>
            <ThemedText type="h4">{item.businessName}</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Pedido #{item.id.slice(-6)}
            </ThemedText>
          </View>
          <Badge text="Listo" variant="success" />
        </View>

        <View style={styles.locationInfo}>
          <Feather name="map-pin" size={16} color={theme.textSecondary} />
          <ThemedText
            type="small"
            style={{ color: theme.textSecondary, marginLeft: Spacing.xs, flex: 1 }}
            numberOfLines={2}
          >
            {item.deliveryAddress}
          </ThemedText>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Feather name="package" size={16} color={theme.textSecondary} />
            <ThemedText type="small" style={{ marginLeft: Spacing.xs }}>
              {items.length} productos
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <Feather
              name={item.paymentMethod === "cash" ? "dollar-sign" : "credit-card"}
              size={16}
              color={theme.textSecondary}
            />
            <ThemedText type="small" style={{ marginLeft: Spacing.xs }}>
              {item.paymentMethod === "cash" ? "Efectivo" : "Tarjeta"}
            </ThemedText>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <View>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Ganancia estimada
            </ThemedText>
            <ThemedText type="h3" style={{ color: NemyColors.success }}>
              ${((item.total * 0.15) / 100).toFixed(2)}
            </ThemedText>
          </View>
          <Pressable
            onPress={() => handleAcceptOrder(item.id)}
            style={[styles.acceptButton, { backgroundColor: NemyColors.primary }]}
          >
            <Feather name="check" size={18} color="#FFF" />
            <ThemedText
              type="body"
              style={{ color: "#FFF", marginLeft: Spacing.xs, fontWeight: "600" }}
            >
              Aceptar
            </ThemedText>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={[theme.gradientStart, theme.gradientEnd]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <ThemedText type="h2">Pedidos Disponibles</ThemedText>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item: any) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={NemyColors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="inbox" size={64} color={theme.textSecondary} />
            <ThemedText
              type="h4"
              style={{ color: theme.textSecondary, marginTop: Spacing.lg }}
            >
              No hay pedidos disponibles
            </ThemedText>
            <ThemedText
              type="body"
              style={{ color: theme.textSecondary, marginTop: Spacing.sm }}
            >
              Los pedidos listos aparecerán aquí
            </ThemedText>
          </View>
        }
      />
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
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing["4xl"],
  },
  orderCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  orderDetails: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
  },
});
