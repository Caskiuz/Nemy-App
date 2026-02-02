import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Switch,
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
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, NemyColors, Shadows } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

export default function BusinessDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isOpen, setIsOpen] = useState(true);
  const [stats, setStats] = useState({
    pendingOrders: 0,
    todayOrders: 0,
    todayRevenue: 0,
  });
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const response = await apiRequest("GET", "/api/business/dashboard");
      const data = await response.json();
      if (data.success) {
        setStats({
          pendingOrders: data.dashboard.pendingOrders,
          todayOrders: data.dashboard.todayOrders,
          todayRevenue: data.dashboard.todayRevenue / 100,
        });
        setOrders(data.dashboard.recentOrders || []);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (stats.pendingOrders > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }
  }, [stats.pendingOrders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const toggleBusinessStatus = async () => {
    try {
      await apiRequest("PUT", "/api/business/settings", {
        isOpen: !isOpen,
      });
      setIsOpen(!isOpen);
    } catch (error) {
      console.error("Error toggling status:", error);
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
        <ThemedText type="h1">Mi Negocio</ThemedText>
        <View style={styles.statusToggle}>
          <ThemedText type="body" style={{ marginRight: Spacing.sm }}>
            {isOpen ? "Abierto" : "Cerrado"}
          </ThemedText>
          <Switch
            value={isOpen}
            onValueChange={toggleBusinessStatus}
            trackColor={{ false: "#767577", true: NemyColors.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={NemyColors.primary}
          />
        }
      >
        <View style={styles.statsGrid}>
          <View
            style={[styles.statCard, { backgroundColor: theme.card }, Shadows.sm]}
          >
            <Feather name="clock" size={24} color={NemyColors.warning} />
            <ThemedText type="h2" style={{ marginTop: Spacing.sm }}>
              {stats.pendingOrders}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Pendientes
            </ThemedText>
          </View>

          <View
            style={[styles.statCard, { backgroundColor: theme.card }, Shadows.sm]}
          >
            <Feather name="shopping-bag" size={24} color={NemyColors.primary} />
            <ThemedText type="h2" style={{ marginTop: Spacing.sm }}>
              {stats.todayOrders}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Hoy
            </ThemedText>
          </View>

          <View
            style={[styles.statCard, { backgroundColor: theme.card }, Shadows.sm]}
          >
            <Feather name="dollar-sign" size={24} color={NemyColors.success} />
            <ThemedText type="h2" style={{ marginTop: Spacing.sm }}>
              ${stats.todayRevenue.toFixed(0)}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Ingresos
            </ThemedText>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Pressable
            onPress={() => navigation.navigate("BusinessHours")}
            style={[styles.actionButton, { backgroundColor: theme.card }, Shadows.sm]}
          >
            <Feather name="clock" size={20} color={NemyColors.primary} />
            <ThemedText type="small" style={{ marginTop: Spacing.xs }}>Horarios</ThemedText>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate("BusinessCategories")}
            style={[styles.actionButton, { backgroundColor: theme.card }, Shadows.sm]}
          >
            <Feather name="folder" size={20} color={NemyColors.primary} />
            <ThemedText type="small" style={{ marginTop: Spacing.xs }}>Categorías</ThemedText>
          </Pressable>
        </View>

        <View
          style={[styles.section, { backgroundColor: theme.card }, Shadows.sm]}
        >
          <View style={styles.sectionHeader}>
            <ThemedText type="h3">Pedidos Recientes</ThemedText>
            {stats.pendingOrders > 0 && (
              <Badge text={`${stats.pendingOrders}`} variant="warning" />
            )}
          </View>

          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="inbox" size={48} color={theme.textSecondary} />
              <ThemedText
                type="body"
                style={{ color: theme.textSecondary, marginTop: Spacing.md }}
              >
                No hay pedidos recientes
              </ThemedText>
            </View>
          ) : (
            orders.slice(0, 5).map((order: any) => (
              <View
                key={order.id}
                style={[styles.orderItem, { borderBottomColor: theme.border }]}
              >
                <View style={styles.orderInfo}>
                  <ThemedText type="body">Pedido #{order.id.slice(-6)}</ThemedText>
                  <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                    ${(order.total / 100).toFixed(2)}
                  </ThemedText>
                </View>
                <Badge
                  text={order.status}
                  variant={
                    order.status === "pending"
                      ? "warning"
                      : order.status === "confirmed"
                      ? "primary"
                      : "success"
                  }
                />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  statusToggle: {
    flexDirection: "row",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing["4xl"],
  },
  statsGrid: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  section: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  orderInfo: {
    flex: 1,
  },
  quickActions: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
});
