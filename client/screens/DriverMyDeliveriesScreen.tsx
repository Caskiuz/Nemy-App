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
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Badge } from "@/components/Badge";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, NemyColors, Shadows } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const statusLabels: Record<string, string> = {
  ready: "Listo para recoger",
  picked_up: "Recogido",
  on_the_way: "En camino",
  in_transit: "En camino",
  delivered: "Entregado",
};

export default function DriverMyDeliveriesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async () => {
    try {
      const response = await apiRequest("GET", "/api/delivery/my-orders");
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

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await apiRequest("PUT", `/api/delivery/orders/${orderId}/status`, {
        status,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      loadOrders();
    } catch (error) {
      console.error("Error updating status:", error);
      Alert.alert("Error", "No se pudo actualizar el estado");
    }
  };

  const handlePickedUp = (orderId: string) => {
    Alert.alert("Confirmar Recogida", "¿Ya recogiste el pedido?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Confirmar",
        onPress: () => updateStatus(orderId, "picked_up"),
      },
    ]);
  };

  const handleOnTheWay = (orderId: string) => {
    updateStatus(orderId, "on_the_way");
  };

  const handleDelivered = async (orderId: string) => {
    Alert.alert("Confirmar Entrega", "¿El pedido fue entregado?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Confirmar",
        onPress: async () => {
          try {
            const response = await apiRequest("POST", `/api/orders/${orderId}/complete-delivery`);
            const data = await response.json();
            
            if (data.success) {
              Alert.alert(
                "¡Entrega Completada!",
                `Ganaste $${(data.distribution.driver / 100).toFixed(2)}`,
                [{ text: "OK" }]
              );
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              loadOrders();
            }
          } catch (error) {
            console.error("Error completing delivery:", error);
            Alert.alert("Error", "No se pudo completar la entrega");
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
          <Badge
            text={statusLabels[item.status] || item.status}
            variant={
              item.status === "picked_up"
                ? "primary"
                : item.status === "on_the_way" || item.status === "in_transit"
                ? "warning"
                : item.status === "delivered"
                ? "success"
                : "secondary"
            }
          />
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

        <View style={styles.orderFooter}>
          <ThemedText type="h4" style={{ color: NemyColors.success }}>
            +${((item.total * 0.15) / 100).toFixed(2)}
          </ThemedText>
          <Pressable
            onPress={() => navigation.navigate("OrderTracking", { orderId: item.id })}
            style={[
              styles.trackButton,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <Feather name="map" size={16} color={NemyColors.primary} />
            <ThemedText
              type="small"
              style={{ color: NemyColors.primary, marginLeft: Spacing.xs }}
            >
              Ver Mapa
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.actions}>
          {item.status === "ready" && (
            <Pressable
              onPress={() => handlePickedUp(item.id)}
              style={[
                styles.actionButton,
                { backgroundColor: NemyColors.primary },
              ]}
            >
              <Feather name="package" size={18} color="#FFF" />
              <ThemedText
                type="body"
                style={{ color: "#FFF", marginLeft: Spacing.xs, fontWeight: "600" }}
              >
                Recogí el Pedido
              </ThemedText>
            </Pressable>
          )}

          {item.status === "picked_up" && (
            <Pressable
              onPress={() => handleOnTheWay(item.id)}
              style={[
                styles.actionButton,
                { backgroundColor: NemyColors.warning },
              ]}
            >
              <Feather name="navigation" size={18} color="#FFF" />
              <ThemedText
                type="body"
                style={{ color: "#FFF", marginLeft: Spacing.xs, fontWeight: "600" }}
              >
                En Camino
              </ThemedText>
            </Pressable>
          )}

          {item.status === "on_the_way" && (
            <Pressable
              onPress={() => handleDelivered(item.id)}
              style={[
                styles.actionButton,
                { backgroundColor: NemyColors.success },
              ]}
            >
              <Feather name="check-circle" size={18} color="#FFF" />
              <ThemedText
                type="body"
                style={{ color: "#FFF", marginLeft: Spacing.xs, fontWeight: "600" }}
              >
                Entregado
              </ThemedText>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  const activeOrders = orders.filter((o: any) =>
    ["ready", "picked_up", "on_the_way"].includes(o.status)
  );

  return (
    <LinearGradient
      colors={[theme.gradientStart, theme.gradientEnd]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <ThemedText type="h2">Mis Entregas</ThemedText>
      </View>

      <FlatList
        data={activeOrders}
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
            <Feather name="truck" size={64} color={theme.textSecondary} />
            <ThemedText
              type="h4"
              style={{ color: theme.textSecondary, marginTop: Spacing.lg }}
            >
              No tienes entregas activas
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
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  actions: {
    marginTop: Spacing.sm,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
  },
});
