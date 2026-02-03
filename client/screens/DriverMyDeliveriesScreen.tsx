import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
  Linking,
  Platform,
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

  const parseDeliveryAddress = (address: string | null): string => {
    if (!address) return "Dirección no disponible";
    try {
      const parsed = JSON.parse(address);
      if (typeof parsed === "object") {
        const parts = [parsed.street, parsed.city, parsed.state, parsed.zipCode].filter(Boolean);
        return parts.join(", ") || address;
      }
      return address;
    } catch {
      return address;
    }
  };

  const openGoogleMaps = (lat: number, lng: number, address: string) => {
    const url = Platform.select({
      ios: `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`,
      android: `google.navigation:q=${lat},${lng}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    });
    
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`);
      }
    });
  };

  const openWaze = (lat: number, lng: number) => {
    const url = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
    Linking.openURL(url);
  };

  const openAppleMaps = (lat: number, lng: number, address: string) => {
    const url = Platform.OS === "ios"
      ? `maps:?daddr=${lat},${lng}&dirflg=d`
      : `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`;
    
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`https://maps.apple.com/?daddr=${encodeURIComponent(address)}&dirflg=d`);
      }
    });
  };

  const showNavigationOptions = (order: any) => {
    const lat = order.deliveryLat || order.latitude;
    const lng = order.deliveryLng || order.longitude;
    const address = parseDeliveryAddress(order.deliveryAddress);

    if (!lat || !lng) {
      Alert.alert("Error", "No hay coordenadas disponibles para este pedido");
      return;
    }

    Alert.alert(
      "Iniciar Navegación",
      "Selecciona la aplicación de navegación",
      [
        {
          text: "Google Maps",
          onPress: () => openGoogleMaps(parseFloat(lat), parseFloat(lng), address),
        },
        {
          text: "Waze",
          onPress: () => openWaze(parseFloat(lat), parseFloat(lng)),
        },
        ...(Platform.OS === "ios" ? [{
          text: "Apple Maps",
          onPress: () => openAppleMaps(parseFloat(lat), parseFloat(lng), address),
        }] : []),
        { text: "Cancelar", style: "cancel" as const },
      ]
    );
  };

  const renderOrder = ({ item }: { item: any }) => {
    const items = typeof item.items === "string" ? JSON.parse(item.items) : item.items;
    const displayAddress = parseDeliveryAddress(item.deliveryAddress);

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
            {displayAddress}
          </ThemedText>
        </View>

        <View style={styles.orderFooter}>
          <ThemedText type="h4" style={{ color: NemyColors.success }}>
            +${((item.total * 0.15) / 100).toFixed(2)}
          </ThemedText>
          <View style={styles.mapButtons}>
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
                Ver
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => showNavigationOptions(item)}
              style={[
                styles.trackButton,
                { backgroundColor: NemyColors.primary, marginLeft: Spacing.sm },
              ]}
            >
              <Feather name="navigation" size={16} color="#FFF" />
              <ThemedText
                type="small"
                style={{ color: "#FFF", marginLeft: Spacing.xs }}
              >
                Navegar
              </ThemedText>
            </Pressable>
          </View>
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

          {(item.status === "on_the_way" || item.status === "in_transit") && (
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
                Marcar Entregado
              </ThemedText>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  const activeOrders = orders.filter((o: any) =>
    ["ready", "picked_up", "on_the_way", "in_transit"].includes(o.status)
  );
  const completedOrders = orders.filter((o: any) => o.status === "delivered");

  const renderCompletedOrder = ({ item }: { item: any }) => {
    const displayAddress = parseDeliveryAddress(item.deliveryAddress);

    return (
      <View
        style={[styles.orderCard, { backgroundColor: theme.card, opacity: 0.8 }, Shadows.sm]}
      >
        <View style={styles.orderHeader}>
          <View>
            <ThemedText type="h4">{item.businessName}</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Pedido #{item.id.slice(-6)}
            </ThemedText>
          </View>
          <Badge text="Entregado" variant="success" />
        </View>

        <View style={styles.locationInfo}>
          <Feather name="map-pin" size={16} color={theme.textSecondary} />
          <ThemedText
            type="small"
            style={{ color: theme.textSecondary, marginLeft: Spacing.xs, flex: 1 }}
            numberOfLines={2}
          >
            {displayAddress}
          </ThemedText>
        </View>

        <View style={styles.orderFooter}>
          <ThemedText type="h4" style={{ color: NemyColors.success }}>
            +${((item.total * 0.15) / 100).toFixed(2)}
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            Completado
          </ThemedText>
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
        <ThemedText type="h2">Mis Entregas</ThemedText>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={NemyColors.primary}
          />
        }
      >
        {activeOrders.length > 0 ? (
          <>
            <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
              Activas ({activeOrders.length})
            </ThemedText>
            {activeOrders.map((item: any) => (
              <View key={item.id}>{renderOrder({ item })}</View>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Feather name="truck" size={64} color={theme.textSecondary} />
            <ThemedText
              type="h4"
              style={{ color: theme.textSecondary, marginTop: Spacing.lg }}
            >
              No tienes entregas activas
            </ThemedText>
          </View>
        )}

        {completedOrders.length > 0 && (
          <>
            <ThemedText type="h4" style={{ marginTop: Spacing.xl, marginBottom: Spacing.md }}>
              Completadas ({completedOrders.length})
            </ThemedText>
            {completedOrders.map((item: any) => (
              <View key={item.id}>{renderCompletedOrder({ item })}</View>
            ))}
          </>
        )}
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
  mapButtons: {
    flexDirection: "row",
    alignItems: "center",
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
