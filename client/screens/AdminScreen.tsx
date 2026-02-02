import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, NemyColors, Shadows } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import { useToast } from "@/contexts/ToastContext";
import { NativeMap } from "@/components/NativeMap";

interface DashboardMetrics {
  ordersToday: number;
  cancelledToday: number;
  cancellationRate: number | string;
  avgDeliveryTime: number;
  driversOnline: number;
  totalDrivers: number;
  pausedBusinesses: number;
  totalBusinesses: number;
  timestamp: string;
}

interface ActiveOrder {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  customer: { id: string; name: string };
  business: {
    id: string;
    name: string;
    latitude: string | null;
    longitude: string | null;
  };
  deliveryAddress: {
    latitude: string | null;
    longitude: string | null;
    address: string;
  };
  driver: { id: string; name: string; isOnline: boolean } | null;
}

interface OnlineDriver {
  id: string;
  name: string;
  isOnline: boolean;
  lastActiveAt: string | null;
  location: { latitude: string; longitude: string; updatedAt: string } | null;
  activeOrder: string | null;
}

interface AdminLog {
  id: string;
  userId: string | null;
  userEmail: string | null;
  userRole: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  usersByRole: {
    customers: number;
    businesses: number;
    delivery: number;
    admins: number;
  };
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  emailVerified: boolean;
  createdAt: string;
}

interface AdminOrder {
  id: string;
  userId: string;
  businessName: string;
  status: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
}

interface Business {
  id: string;
  name: string;
  type: string;
  description: string;
  image: string;
  address: string;
  phone: string;
  isActive: boolean;
  deliveryFee: number;
  minOrderAmount: number;
}

interface Product {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  isWeightBased: boolean;
  weightUnit: string | null;
  pricePerUnit: number | null;
}

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "stats"
    | "users"
    | "orders"
    | "businesses"
    | "products"
    | "logs"
  >("dashboard");
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [businessForm, setBusinessForm] = useState({
    name: "",
    type: "restaurant",
    description: "",
    image: "",
    address: "",
    phone: "",
    deliveryFee: "25",
    minOrderAmount: "50",
    isActive: true,
  });
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    isAvailable: true,
    isWeightBased: false,
    weightUnit: "kg",
    pricePerUnit: "",
  });
  const [dashboardMetrics, setDashboardMetrics] =
    useState<DashboardMetrics | null>(null);
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [onlineDrivers, setOnlineDrivers] = useState<OnlineDriver[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);

  const fetchDashboardData = async () => {
    try {
      const [metricsRes, ordersRes, driversRes] = await Promise.all([
        apiRequest("GET", "/api/admin/dashboard/metrics"),
        apiRequest("GET", "/api/admin/dashboard/active-orders"),
        apiRequest("GET", "/api/admin/dashboard/online-drivers"),
      ]);
      const metricsData = await metricsRes.json();
      const ordersData = await ordersRes.json();
      const driversData = await driversRes.json();
      setDashboardMetrics(metricsData);
      setActiveOrders(ordersData.orders || []);
      setOnlineDrivers(driversData.drivers || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const fetchAdminLogs = async () => {
    try {
      const res = await apiRequest("GET", "/api/admin/logs?limit=50");
      const data = await res.json();
      setAdminLogs(data.logs || []);
    } catch (error) {
      console.error("Error fetching admin logs:", error);
    }
  };

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, ordersRes, businessesRes] = await Promise.all([
        apiRequest("GET", "/api/admin/stats"),
        apiRequest("GET", "/api/admin/users"),
        apiRequest("GET", "/api/admin/orders"),
        apiRequest("GET", "/api/businesses"),
      ]);

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const ordersData = await ordersRes.json();
      const businessesData = await businessesRes.json();

      setStats(statsData);
      setUsers(usersData.users || []);
      setOrders(ordersData.orders || []);
      setBusinesses(Array.isArray(businessesData) ? businessesData : businessesData.businesses || []);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const fetchProducts = async (businessId: string) => {
    try {
      const res = await apiRequest("GET", `/api/businesses/${businessId}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchDashboardData();
    fetchAdminLogs();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedBusinessId) {
      fetchProducts(selectedBusinessId);
    }
  }, [selectedBusinessId]);

  const handleSaveBusiness = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const body = {
        ...businessForm,
        deliveryFee: parseFloat(businessForm.deliveryFee) * 100,
        minOrderAmount: parseFloat(businessForm.minOrderAmount) * 100,
      };
      if (editingBusiness) {
        await apiRequest(
          "PUT",
          `/api/admin/businesses/${editingBusiness.id}`,
          body,
        );
      } else {
        await apiRequest("POST", "/api/admin/businesses", body);
      }
      setShowBusinessModal(false);
      setEditingBusiness(null);
      setBusinessForm({
        name: "",
        type: "restaurant",
        description: "",
        image: "",
        address: "",
        phone: "",
        deliveryFee: "25",
        minOrderAmount: "50",
        isActive: true,
      });
      fetchData();
    } catch (error) {
      showToast("No se pudo guardar el negocio", "error");
    }
  };

  const handleSaveProduct = async () => {
    if (!selectedBusinessId) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const body = {
        ...productForm,
        businessId: selectedBusinessId,
        price: parseFloat(productForm.price) * 100,
        pricePerUnit: productForm.isWeightBased
          ? parseFloat(productForm.pricePerUnit) * 100
          : null,
      };
      if (editingProduct) {
        await apiRequest(
          "PUT",
          `/api/admin/products/${editingProduct.id}`,
          body,
        );
      } else {
        await apiRequest("POST", "/api/admin/products", body);
      }
      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        price: "",
        image: "",
        category: "",
        isAvailable: true,
        isWeightBased: false,
        weightUnit: "kg",
        pricePerUnit: "",
      });
      fetchProducts(selectedBusinessId);
    } catch (error) {
      showToast("No se pudo guardar el producto", "error");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await apiRequest("DELETE", `/api/admin/products/${productId}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (selectedBusinessId) fetchProducts(selectedBusinessId);
    } catch (error) {
      showToast("No se pudo eliminar el producto", "error");
    }
  };

  const openEditBusiness = (b: Business) => {
    setEditingBusiness(b);
    setBusinessForm({
      name: b.name,
      type: b.type,
      description: b.description || "",
      image: b.image || "",
      address: b.address || "",
      phone: b.phone || "",
      deliveryFee: ((b.deliveryFee || 0) / 100).toString(),
      minOrderAmount: ((b.minOrderAmount || 0) / 100).toString(),
      isActive: b.isActive,
    });
    setShowBusinessModal(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      description: p.description || "",
      price: ((p.price || 0) / 100).toString(),
      image: p.image || "",
      category: p.category || "",
      isAvailable: p.isAvailable,
      isWeightBased: p.isWeightBased,
      weightUnit: p.weightUnit || "kg",
      pricePerUnit: ((p.pricePerUnit || 0) / 100).toString(),
    });
    setShowProductModal(true);
  };

  const onRefresh = () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return NemyColors.warning;
      case "confirmed":
        return "#2196F3";
      case "preparing":
        return NemyColors.primary;
      case "on_the_way":
        return "#9C27B0";
      case "delivered":
        return NemyColors.success;
      case "cancelled":
        return NemyColors.error;
      default:
        return theme.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "confirmed":
        return "Confirmado";
      case "preparing":
        return "Preparando";
      case "on_the_way":
        return "En camino";
      case "delivered":
        return "Entregado";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "customer":
        return "Cliente";
      case "business":
        return "Negocio";
      case "delivery":
        return "Repartidor";
      case "admin":
        return "Admin";
      default:
        return role;
    }
  };

  const getLogActionColor = (action: string) => {
    switch (action) {
      case "LOGIN_SUCCESS":
        return NemyColors.success;
      case "LOGIN_FAILED":
        return NemyColors.error;
      case "RATE_LIMIT_BLOCKED":
        return NemyColors.error;
      case "CREATE":
        return "#2196F3";
      case "UPDATE":
        return NemyColors.warning;
      case "DELETE":
        return NemyColors.error;
      default:
        return theme.textSecondary;
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={NemyColors.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <ThemedText type="h1">Panel Admin</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Bienvenido, {user?.name}
        </ThemedText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabs}
      >
        {(
          [
            "dashboard",
            "stats",
            "users",
            "orders",
            "businesses",
            "products",
            "logs",
          ] as const
        ).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => {
              Haptics.selectionAsync();
              setActiveTab(tab);
            }}
            style={[
              styles.tab,
              {
                backgroundColor:
                  activeTab === tab ? NemyColors.primary : "transparent",
                borderColor: NemyColors.primary,
              },
            ]}
          >
            <Feather
              name={
                tab === "dashboard"
                  ? "activity"
                  : tab === "stats"
                    ? "bar-chart-2"
                    : tab === "users"
                      ? "users"
                      : tab === "orders"
                        ? "package"
                        : tab === "businesses"
                          ? "briefcase"
                          : tab === "products"
                            ? "box"
                            : tab === "logs"
                              ? "file-text"
                              : "box"
              }
              size={18}
              color={activeTab === tab ? "#FFFFFF" : NemyColors.primary}
            />
            <ThemedText
              type="small"
              style={{
                color: activeTab === tab ? "#FFFFFF" : NemyColors.primary,
                marginLeft: Spacing.xs,
              }}
            >
              {tab === "dashboard"
                ? "Dashboard"
                : tab === "stats"
                  ? "Resumen"
                  : tab === "users"
                    ? "Usuarios"
                    : tab === "orders"
                      ? "Pedidos"
                      : tab === "businesses"
                        ? "Negocios"
                        : tab === "products"
                          ? "Productos"
                          : tab === "logs"
                            ? "Logs"
                            : tab}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={NemyColors.primary}
          />
        }
      >
        {activeTab === "dashboard" && (
          <>
            <View style={styles.metricsRow}>
              <View
                style={[
                  styles.metricCard,
                  { backgroundColor: NemyColors.primary },
                ]}
              >
                <Feather name="package" size={20} color="#fff" />
                <ThemedText type="h2" style={{ color: "#fff", marginTop: 4 }}>
                  {dashboardMetrics?.ordersToday || 0}
                </ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: "#fff", opacity: 0.9 }}
                >
                  Pedidos hoy
                </ThemedText>
              </View>
              <View
                style={[
                  styles.metricCard,
                  { backgroundColor: NemyColors.error },
                ]}
              >
                <Feather name="x-circle" size={20} color="#fff" />
                <ThemedText type="h2" style={{ color: "#fff", marginTop: 4 }}>
                  {dashboardMetrics?.cancelledToday || 0}
                </ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: "#fff", opacity: 0.9 }}
                >
                  Cancelados
                </ThemedText>
              </View>
              <View
                style={[
                  styles.metricCard,
                  { backgroundColor: NemyColors.success },
                ]}
              >
                <Feather name="clock" size={20} color="#fff" />
                <ThemedText type="h2" style={{ color: "#fff", marginTop: 4 }}>
                  {dashboardMetrics?.avgDeliveryTime || 0}m
                </ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: "#fff", opacity: 0.9 }}
                >
                  Tiempo prom.
                </ThemedText>
              </View>
            </View>
            <View style={styles.metricsRow}>
              <View style={[styles.metricCard, { backgroundColor: "#2196F3" }]}>
                <Feather name="truck" size={20} color="#fff" />
                <ThemedText type="h2" style={{ color: "#fff", marginTop: 4 }}>
                  {dashboardMetrics?.driversOnline || 0}/
                  {dashboardMetrics?.totalDrivers || 0}
                </ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: "#fff", opacity: 0.9 }}
                >
                  Repartidores
                </ThemedText>
              </View>
              <View style={[styles.metricCard, { backgroundColor: "#9C27B0" }]}>
                <Feather name="shopping-bag" size={20} color="#fff" />
                <ThemedText type="h2" style={{ color: "#fff", marginTop: 4 }}>
                  {activeOrders.length}
                </ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: "#fff", opacity: 0.9 }}
                >
                  Pedidos activos
                </ThemedText>
              </View>
              <View
                style={[
                  styles.metricCard,
                  { backgroundColor: NemyColors.warning },
                ]}
              >
                <Feather name="pause-circle" size={20} color="#fff" />
                <ThemedText type="h2" style={{ color: "#fff", marginTop: 4 }}>
                  {dashboardMetrics?.pausedBusinesses || 0}
                </ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: "#fff", opacity: 0.9 }}
                >
                  Pausados
                </ThemedText>
              </View>
            </View>
            <ThemedText
              type="h4"
              style={{ marginTop: Spacing.lg, marginBottom: Spacing.sm }}
            >
              Mapa en tiempo real
            </ThemedText>
            <View style={styles.mapContainer}>
              <NativeMap
                activeOrders={activeOrders}
                onlineDrivers={onlineDrivers}
              />
            </View>
            <ThemedText
              type="h4"
              style={{ marginTop: Spacing.lg, marginBottom: Spacing.sm }}
            >
              Pedidos activos ({activeOrders.length})
            </ThemedText>
            {activeOrders.map((order) => (
              <View
                key={order.id}
                style={[styles.orderCard, { backgroundColor: theme.card }]}
              >
                <View style={styles.orderHeader}>
                  <ThemedText style={{ fontWeight: "600" }}>
                    {order.customer.name}
                  </ThemedText>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(order.status) + "20" },
                    ]}
                  >
                    <ThemedText
                      type="small"
                      style={{ color: getStatusColor(order.status) }}
                    >
                      {getStatusLabel(order.status)}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {order.deliveryAddress.address}
                </ThemedText>
                <View style={styles.orderFooter}>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    ${(order.total / 100).toFixed(2)}
                  </ThemedText>
                  {order.driver ? (
                    <View style={styles.driverInfo}>
                      <Feather
                        name="truck"
                        size={12}
                        color={NemyColors.success}
                      />
                      <ThemedText
                        type="small"
                        style={{ marginLeft: 4, color: NemyColors.success }}
                      >
                        {order.driver.name}
                      </ThemedText>
                    </View>
                  ) : (
                    <ThemedText
                      type="small"
                      style={{ color: NemyColors.warning }}
                    >
                      Sin asignar
                    </ThemedText>
                  )}
                </View>
              </View>
            ))}
          </>
        )}
        {activeTab === "stats" && stats ? (
          <>
            <View style={styles.statsGrid}>
              <View
                style={[
                  styles.statCard,
                  { backgroundColor: theme.card },
                  Shadows.sm,
                ]}
              >
                <Feather name="users" size={24} color={NemyColors.primary} />
                <ThemedText type="h2" style={{ marginTop: Spacing.sm }}>
                  {stats.totalUsers}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Usuarios
                </ThemedText>
              </View>
              <View
                style={[
                  styles.statCard,
                  { backgroundColor: theme.card },
                  Shadows.sm,
                ]}
              >
                <Feather
                  name="shopping-bag"
                  size={24}
                  color={NemyColors.primary}
                />
                <ThemedText type="h2" style={{ marginTop: Spacing.sm }}>
                  {stats.totalOrders}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Pedidos
                </ThemedText>
              </View>
              <View
                style={[
                  styles.statCard,
                  { backgroundColor: theme.card },
                  Shadows.sm,
                ]}
              >
                <Feather
                  name="dollar-sign"
                  size={24}
                  color={NemyColors.success}
                />
                <ThemedText type="h2" style={{ marginTop: Spacing.sm }}>
                  ${stats.totalRevenue.toFixed(0)}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Ingresos
                </ThemedText>
              </View>
              <View
                style={[
                  styles.statCard,
                  { backgroundColor: theme.card },
                  Shadows.sm,
                ]}
              >
                <Feather name="clock" size={24} color={NemyColors.warning} />
                <ThemedText type="h2" style={{ marginTop: Spacing.sm }}>
                  {stats.pendingOrders}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Pendientes
                </ThemedText>
              </View>
            </View>

            <View
              style={[
                styles.section,
                { backgroundColor: theme.card },
                Shadows.sm,
              ]}
            >
              <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
                Usuarios por rol
              </ThemedText>
              <View style={styles.roleRow}>
                <ThemedText type="body">Clientes</ThemedText>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {stats.usersByRole.customers}
                </ThemedText>
              </View>
              <View style={styles.roleRow}>
                <ThemedText type="body">Negocios</ThemedText>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {stats.usersByRole.businesses}
                </ThemedText>
              </View>
              <View style={styles.roleRow}>
                <ThemedText type="body">Repartidores</ThemedText>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {stats.usersByRole.delivery}
                </ThemedText>
              </View>
              <View style={styles.roleRow}>
                <ThemedText type="body">Administradores</ThemedText>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {stats.usersByRole.admins}
                </ThemedText>
              </View>
            </View>
          </>
        ) : null}

        {activeTab === "users" ? (
          <View style={styles.listContainer}>
            {users.map((u) => (
              <View
                key={u.id}
                style={[
                  styles.listItem,
                  { backgroundColor: theme.card },
                  Shadows.sm,
                ]}
              >
                <View style={styles.listItemHeader}>
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: NemyColors.primaryLight },
                    ]}
                  >
                    <ThemedText
                      type="h4"
                      style={{ color: NemyColors.primaryDark }}
                    >
                      {u.name.charAt(0).toUpperCase()}
                    </ThemedText>
                  </View>
                  <View style={styles.listItemContent}>
                    <ThemedText type="body" style={{ fontWeight: "600" }}>
                      {u.name}
                    </ThemedText>
                    <ThemedText
                      type="small"
                      style={{ color: theme.textSecondary }}
                    >
                      {u.email}
                    </ThemedText>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor:
                          u.role === "admin"
                            ? NemyColors.primary
                            : theme.backgroundSecondary,
                      },
                    ]}
                  >
                    <ThemedText
                      type="caption"
                      style={{
                        color: u.role === "admin" ? "#FFFFFF" : theme.text,
                      }}
                    >
                      {getRoleLabel(u.role)}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.listItemFooter}>
                  <View style={styles.infoChip}>
                    <Feather
                      name={u.emailVerified ? "check-circle" : "x-circle"}
                      size={14}
                      color={
                        u.emailVerified ? NemyColors.success : NemyColors.error
                      }
                    />
                    <ThemedText type="caption" style={{ marginLeft: 4 }}>
                      {u.emailVerified ? "Verificado" : "Sin verificar"}
                    </ThemedText>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {activeTab === "orders" ? (
          <View style={styles.listContainer}>
            {orders.length === 0 ? (
              <View
                style={[styles.emptyState, { backgroundColor: theme.card }]}
              >
                <Feather name="package" size={48} color={theme.textSecondary} />
                <ThemedText
                  type="body"
                  style={{ color: theme.textSecondary, marginTop: Spacing.md }}
                >
                  No hay pedidos aún
                </ThemedText>
              </View>
            ) : (
              orders.map((order) => (
                <View
                  key={order.id}
                  style={[
                    styles.listItem,
                    { backgroundColor: theme.card },
                    Shadows.sm,
                  ]}
                >
                  <View style={styles.listItemHeader}>
                    <View
                      style={[
                        styles.orderIcon,
                        { backgroundColor: theme.backgroundSecondary },
                      ]}
                    >
                      <Feather
                        name="package"
                        size={20}
                        color={NemyColors.primary}
                      />
                    </View>
                    <View style={styles.listItemContent}>
                      <ThemedText type="body" style={{ fontWeight: "600" }}>
                        {order.businessName}
                      </ThemedText>
                      <ThemedText
                        type="caption"
                        style={{ color: theme.textSecondary }}
                      >
                        #{order.id.slice(0, 8)}
                      </ThemedText>
                    </View>
                    <ThemedText type="h4" style={{ color: NemyColors.primary }}>
                      ${(order.total / 100).toFixed(2)}
                    </ThemedText>
                  </View>
                  <View style={styles.listItemFooter}>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: getStatusColor(order.status) + "20",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: getStatusColor(order.status) },
                        ]}
                      />
                      <ThemedText
                        type="caption"
                        style={{
                          color: getStatusColor(order.status),
                          marginLeft: 6,
                        }}
                      >
                        {getStatusLabel(order.status)}
                      </ThemedText>
                    </View>
                    <ThemedText
                      type="caption"
                      style={{ color: theme.textSecondary }}
                    >
                      {order.paymentMethod === "card" ? "Tarjeta" : "Efectivo"}
                    </ThemedText>
                  </View>
                </View>
              ))
            )}
          </View>
        ) : null}

        {activeTab === "businesses" ? (
          <View style={styles.listContainer}>
            <Pressable
              onPress={() => {
                setEditingBusiness(null);
                setBusinessForm({
                  name: "",
                  type: "restaurant",
                  description: "",
                  image: "",
                  address: "",
                  phone: "",
                  deliveryFee: "25",
                  minOrderAmount: "50",
                  isActive: true,
                });
                setShowBusinessModal(true);
              }}
              style={[
                styles.addButton,
                { backgroundColor: NemyColors.primary },
              ]}
            >
              <Feather name="plus" size={20} color="#FFFFFF" />
              <ThemedText
                type="body"
                style={{ color: "#FFFFFF", marginLeft: Spacing.sm }}
              >
                Agregar Negocio
              </ThemedText>
            </Pressable>
            {businesses.length === 0 ? (
              <View
                style={[styles.emptyState, { backgroundColor: theme.card }]}
              >
                <Feather
                  name="briefcase"
                  size={48}
                  color={theme.textSecondary}
                />
                <ThemedText
                  type="body"
                  style={{ color: theme.textSecondary, marginTop: Spacing.md }}
                >
                  No hay negocios aún
                </ThemedText>
              </View>
            ) : (
              businesses.map((b) => (
                <Pressable
                  key={b.id}
                  onPress={() => openEditBusiness(b)}
                  style={[
                    styles.listItem,
                    { backgroundColor: theme.card },
                    Shadows.sm,
                  ]}
                >
                  <View style={styles.listItemHeader}>
                    <View
                      style={[
                        styles.orderIcon,
                        {
                          backgroundColor: b.isActive
                            ? NemyColors.primaryLight
                            : theme.backgroundSecondary,
                        },
                      ]}
                    >
                      <Feather
                        name="briefcase"
                        size={20}
                        color={
                          b.isActive ? NemyColors.primary : theme.textSecondary
                        }
                      />
                    </View>
                    <View style={styles.listItemContent}>
                      <ThemedText type="body" style={{ fontWeight: "600" }}>
                        {b.name}
                      </ThemedText>
                      <ThemedText
                        type="caption"
                        style={{ color: theme.textSecondary }}
                      >
                        {b.type === "restaurant" ? "Restaurante" : "Mercado"}
                      </ThemedText>
                    </View>
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: b.isActive
                            ? NemyColors.success + "20"
                            : NemyColors.error + "20",
                        },
                      ]}
                    >
                      <ThemedText
                        type="caption"
                        style={{
                          color: b.isActive
                            ? NemyColors.success
                            : NemyColors.error,
                        }}
                      >
                        {b.isActive ? "Activo" : "Inactivo"}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.listItemFooter}>
                    <ThemedText
                      type="caption"
                      style={{ color: theme.textSecondary }}
                    >
                      Envio: ${(b.deliveryFee / 100).toFixed(0)} | Min: $
                      {(b.minOrderAmount / 100).toFixed(0)}
                    </ThemedText>
                    <Feather
                      name="edit-2"
                      size={16}
                      color={NemyColors.primary}
                    />
                  </View>
                </Pressable>
              ))
            )}
          </View>
        ) : null}

        {activeTab === "products" ? (
          <View style={styles.listContainer}>
            <View
              style={[
                styles.section,
                { backgroundColor: theme.card, marginBottom: Spacing.md },
              ]}
            >
              <ThemedText type="body" style={{ marginBottom: Spacing.sm }}>
                Selecciona un negocio:
              </ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: Spacing.sm }}>
                  {businesses.map((b) => (
                    <Pressable
                      key={b.id}
                      onPress={() => setSelectedBusinessId(b.id)}
                      style={[
                        styles.tab,
                        {
                          backgroundColor:
                            selectedBusinessId === b.id
                              ? NemyColors.primary
                              : "transparent",
                          borderColor: NemyColors.primary,
                        },
                      ]}
                    >
                      <ThemedText
                        type="small"
                        style={{
                          color:
                            selectedBusinessId === b.id
                              ? "#FFFFFF"
                              : NemyColors.primary,
                        }}
                      >
                        {b.name}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
            {selectedBusinessId ? (
              <>
                <Pressable
                  onPress={() => {
                    setEditingProduct(null);
                    setProductForm({
                      name: "",
                      description: "",
                      price: "",
                      image: "",
                      category: "",
                      isAvailable: true,
                      isWeightBased: false,
                      weightUnit: "kg",
                      pricePerUnit: "",
                    });
                    setShowProductModal(true);
                  }}
                  style={[
                    styles.addButton,
                    { backgroundColor: NemyColors.primary },
                  ]}
                >
                  <Feather name="plus" size={20} color="#FFFFFF" />
                  <ThemedText
                    type="body"
                    style={{ color: "#FFFFFF", marginLeft: Spacing.sm }}
                  >
                    Agregar Producto
                  </ThemedText>
                </Pressable>
                {products.length === 0 ? (
                  <View
                    style={[styles.emptyState, { backgroundColor: theme.card }]}
                  >
                    <Feather name="box" size={48} color={theme.textSecondary} />
                    <ThemedText
                      type="body"
                      style={{
                        color: theme.textSecondary,
                        marginTop: Spacing.md,
                      }}
                    >
                      No hay productos
                    </ThemedText>
                  </View>
                ) : (
                  products.map((p) => (
                    <View
                      key={p.id}
                      style={[
                        styles.listItem,
                        { backgroundColor: theme.card },
                        Shadows.sm,
                      ]}
                    >
                      <View style={styles.listItemHeader}>
                        <View
                          style={[
                            styles.orderIcon,
                            {
                              backgroundColor: p.isAvailable
                                ? NemyColors.primaryLight
                                : theme.backgroundSecondary,
                            },
                          ]}
                        >
                          <Feather
                            name="box"
                            size={20}
                            color={
                              p.isAvailable
                                ? NemyColors.primary
                                : theme.textSecondary
                            }
                          />
                        </View>
                        <View style={styles.listItemContent}>
                          <ThemedText type="body" style={{ fontWeight: "600" }}>
                            {p.name}
                          </ThemedText>
                          <ThemedText
                            type="caption"
                            style={{ color: theme.textSecondary }}
                          >
                            {p.category}
                          </ThemedText>
                        </View>
                        <ThemedText
                          type="h4"
                          style={{ color: NemyColors.primary }}
                        >
                          ${(p.price / 100).toFixed(2)}
                        </ThemedText>
                      </View>
                      <View style={styles.listItemFooter}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: Spacing.sm,
                          }}
                        >
                          {p.isWeightBased ? (
                            <View
                              style={[
                                styles.badge,
                                { backgroundColor: NemyColors.warning + "20" },
                              ]}
                            >
                              <ThemedText
                                type="caption"
                                style={{ color: NemyColors.warning }}
                              >
                                Por peso
                              </ThemedText>
                            </View>
                          ) : null}
                          <View
                            style={[
                              styles.badge,
                              {
                                backgroundColor: p.isAvailable
                                  ? NemyColors.success + "20"
                                  : NemyColors.error + "20",
                              },
                            ]}
                          >
                            <ThemedText
                              type="caption"
                              style={{
                                color: p.isAvailable
                                  ? NemyColors.success
                                  : NemyColors.error,
                              }}
                            >
                              {p.isAvailable ? "Disponible" : "Agotado"}
                            </ThemedText>
                          </View>
                        </View>
                        <View style={{ flexDirection: "row", gap: Spacing.md }}>
                          <Pressable onPress={() => openEditProduct(p)}>
                            <Feather
                              name="edit-2"
                              size={18}
                              color={NemyColors.primary}
                            />
                          </Pressable>
                          <Pressable onPress={() => handleDeleteProduct(p.id)}>
                            <Feather
                              name="trash-2"
                              size={18}
                              color={NemyColors.error}
                            />
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </>
            ) : (
              <View
                style={[styles.emptyState, { backgroundColor: theme.card }]}
              >
                <Feather
                  name="arrow-up"
                  size={48}
                  color={theme.textSecondary}
                />
                <ThemedText
                  type="body"
                  style={{ color: theme.textSecondary, marginTop: Spacing.md }}
                >
                  Selecciona un negocio arriba
                </ThemedText>
              </View>
            )}
          </View>
        ) : null}
        {activeTab === "logs" && (
          <View style={styles.listContainer}>
            <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
              Logs de auditoría ({adminLogs.length})
            </ThemedText>
            {adminLogs.length === 0 ? (
              <View
                style={[styles.emptyState, { backgroundColor: theme.card }]}
              >
                <Feather
                  name="file-text"
                  size={48}
                  color={theme.textSecondary}
                />
                <ThemedText
                  style={{ marginTop: Spacing.md, color: theme.textSecondary }}
                >
                  No hay registros de auditoría
                </ThemedText>
              </View>
            ) : (
              adminLogs.map((log) => (
                <View
                  key={log.id}
                  style={[styles.logCard, { backgroundColor: theme.card }]}
                >
                  <View style={styles.logHeader}>
                    <View
                      style={[
                        styles.actionBadge,
                        {
                          backgroundColor: getLogActionColor(log.action) + "20",
                        },
                      ]}
                    >
                      <ThemedText
                        type="small"
                        style={{
                          color: getLogActionColor(log.action),
                          fontWeight: "600",
                        }}
                      >
                        {log.action}
                      </ThemedText>
                    </View>
                    <ThemedText
                      type="small"
                      style={{ color: theme.textSecondary }}
                    >
                      {new Date(log.createdAt).toLocaleString("es-MX")}
                    </ThemedText>
                  </View>
                  <ThemedText type="body" style={{ marginTop: Spacing.xs }}>
                    {log.resource}
                    {log.resourceId
                      ? ` (${log.resourceId.slice(0, 8)}...)`
                      : ""}
                  </ThemedText>
                  {log.userEmail ? (
                    <ThemedText
                      type="small"
                      style={{ color: theme.textSecondary }}
                    >
                      Por: {log.userEmail}
                    </ThemedText>
                  ) : null}
                  {log.ipAddress ? (
                    <ThemedText
                      type="small"
                      style={{ color: theme.textSecondary }}
                    >
                      IP: {log.ipAddress}
                    </ThemedText>
                  ) : null}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      <Modal visible={showBusinessModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="h3">
                {editingBusiness ? "Editar Negocio" : "Nuevo Negocio"}
              </ThemedText>
              <Pressable onPress={() => setShowBusinessModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
            >
              <ThemedText
                type="small"
                style={{ marginBottom: 4, marginTop: Spacing.md }}
              >
                Nombre
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                  },
                ]}
                value={businessForm.name}
                onChangeText={(t) =>
                  setBusinessForm({ ...businessForm, name: t })
                }
                placeholder="Nombre del negocio"
                placeholderTextColor={theme.textSecondary}
              />
              <ThemedText
                type="small"
                style={{ marginBottom: 4, marginTop: Spacing.md }}
              >
                Tipo
              </ThemedText>
              <View style={{ flexDirection: "row", gap: Spacing.sm }}>
                {["restaurant", "market"].map((t) => (
                  <Pressable
                    key={t}
                    onPress={() =>
                      setBusinessForm({ ...businessForm, type: t })
                    }
                    style={[
                      styles.tab,
                      {
                        backgroundColor:
                          businessForm.type === t
                            ? NemyColors.primary
                            : "transparent",
                        borderColor: NemyColors.primary,
                      },
                    ]}
                  >
                    <ThemedText
                      type="small"
                      style={{
                        color:
                          businessForm.type === t
                            ? "#FFFFFF"
                            : NemyColors.primary,
                      }}
                    >
                      {t === "restaurant" ? "Restaurante" : "Mercado"}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
              <ThemedText
                type="small"
                style={{ marginBottom: 4, marginTop: Spacing.md }}
              >
                Descripcion
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                    height: 80,
                  },
                ]}
                value={businessForm.description}
                onChangeText={(t) =>
                  setBusinessForm({ ...businessForm, description: t })
                }
                placeholder="Descripcion"
                placeholderTextColor={theme.textSecondary}
                multiline
              />
              <ThemedText
                type="small"
                style={{ marginBottom: 4, marginTop: Spacing.md }}
              >
                Imagen URL
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                  },
                ]}
                value={businessForm.image}
                onChangeText={(t) =>
                  setBusinessForm({ ...businessForm, image: t })
                }
                placeholder="URL de imagen"
                placeholderTextColor={theme.textSecondary}
              />
              <ThemedText
                type="small"
                style={{ marginBottom: 4, marginTop: Spacing.md }}
              >
                Direccion
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                  },
                ]}
                value={businessForm.address}
                onChangeText={(t) =>
                  setBusinessForm({ ...businessForm, address: t })
                }
                placeholder="Direccion"
                placeholderTextColor={theme.textSecondary}
              />
              <ThemedText
                type="small"
                style={{ marginBottom: 4, marginTop: Spacing.md }}
              >
                Telefono
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                  },
                ]}
                value={businessForm.phone}
                onChangeText={(t) =>
                  setBusinessForm({ ...businessForm, phone: t })
                }
                placeholder="Telefono"
                placeholderTextColor={theme.textSecondary}
                keyboardType="phone-pad"
              />
              <View
                style={{
                  flexDirection: "row",
                  gap: Spacing.md,
                  marginTop: Spacing.md,
                }}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText type="small" style={{ marginBottom: 4 }}>
                    Costo de envio ($)
                  </ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.backgroundSecondary,
                        color: theme.text,
                      },
                    ]}
                    value={businessForm.deliveryFee}
                    onChangeText={(t) =>
                      setBusinessForm({ ...businessForm, deliveryFee: t })
                    }
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText type="small" style={{ marginBottom: 4 }}>
                    Pedido minimo ($)
                  </ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.backgroundSecondary,
                        color: theme.text,
                      },
                    ]}
                    value={businessForm.minOrderAmount}
                    onChangeText={(t) =>
                      setBusinessForm({ ...businessForm, minOrderAmount: t })
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <Pressable
                onPress={() =>
                  setBusinessForm({
                    ...businessForm,
                    isActive: !businessForm.isActive,
                  })
                }
                style={[styles.checkRow, { marginTop: Spacing.lg }]}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: NemyColors.primary,
                      backgroundColor: businessForm.isActive
                        ? NemyColors.primary
                        : "transparent",
                    },
                  ]}
                >
                  {businessForm.isActive ? (
                    <Feather name="check" size={16} color="#FFFFFF" />
                  ) : null}
                </View>
                <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>
                  Negocio activo
                </ThemedText>
              </Pressable>
            </ScrollView>
            <Pressable
              onPress={handleSaveBusiness}
              style={[
                styles.saveButton,
                { backgroundColor: NemyColors.primary },
              ]}
            >
              <ThemedText
                type="body"
                style={{ color: "#FFFFFF", fontWeight: "600" }}
              >
                Guardar
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showProductModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="h3">
                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
              </ThemedText>
              <Pressable onPress={() => setShowProductModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
            >
              <ThemedText
                type="small"
                style={{ marginBottom: 4, marginTop: Spacing.md }}
              >
                Nombre
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                  },
                ]}
                value={productForm.name}
                onChangeText={(t) =>
                  setProductForm({ ...productForm, name: t })
                }
                placeholder="Nombre del producto"
                placeholderTextColor={theme.textSecondary}
              />
              <ThemedText
                type="small"
                style={{ marginBottom: 4, marginTop: Spacing.md }}
              >
                Descripcion
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                    height: 80,
                  },
                ]}
                value={productForm.description}
                onChangeText={(t) =>
                  setProductForm({ ...productForm, description: t })
                }
                placeholder="Descripcion"
                placeholderTextColor={theme.textSecondary}
                multiline
              />
              <ThemedText
                type="small"
                style={{ marginBottom: 4, marginTop: Spacing.md }}
              >
                Precio ($)
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                  },
                ]}
                value={productForm.price}
                onChangeText={(t) =>
                  setProductForm({ ...productForm, price: t })
                }
                placeholder="0.00"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
              />
              <ThemedText
                type="small"
                style={{ marginBottom: 4, marginTop: Spacing.md }}
              >
                Categoria
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                  },
                ]}
                value={productForm.category}
                onChangeText={(t) =>
                  setProductForm({ ...productForm, category: t })
                }
                placeholder="Ej: Tacos, Bebidas, Frutas"
                placeholderTextColor={theme.textSecondary}
              />
              <ThemedText
                type="small"
                style={{ marginBottom: 4, marginTop: Spacing.md }}
              >
                Imagen URL
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                  },
                ]}
                value={productForm.image}
                onChangeText={(t) =>
                  setProductForm({ ...productForm, image: t })
                }
                placeholder="URL de imagen"
                placeholderTextColor={theme.textSecondary}
              />
              <Pressable
                onPress={() =>
                  setProductForm({
                    ...productForm,
                    isWeightBased: !productForm.isWeightBased,
                  })
                }
                style={[styles.checkRow, { marginTop: Spacing.lg }]}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: NemyColors.primary,
                      backgroundColor: productForm.isWeightBased
                        ? NemyColors.primary
                        : "transparent",
                    },
                  ]}
                >
                  {productForm.isWeightBased ? (
                    <Feather name="check" size={16} color="#FFFFFF" />
                  ) : null}
                </View>
                <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>
                  Producto por peso (mercado)
                </ThemedText>
              </Pressable>
              {productForm.isWeightBased ? (
                <View
                  style={{
                    flexDirection: "row",
                    gap: Spacing.md,
                    marginTop: Spacing.md,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <ThemedText type="small" style={{ marginBottom: 4 }}>
                      Unidad
                    </ThemedText>
                    <View style={{ flexDirection: "row", gap: Spacing.sm }}>
                      {["kg", "lb", "pza"].map((u) => (
                        <Pressable
                          key={u}
                          onPress={() =>
                            setProductForm({ ...productForm, weightUnit: u })
                          }
                          style={[
                            styles.tab,
                            {
                              backgroundColor:
                                productForm.weightUnit === u
                                  ? NemyColors.primary
                                  : "transparent",
                              borderColor: NemyColors.primary,
                              paddingHorizontal: Spacing.sm,
                            },
                          ]}
                        >
                          <ThemedText
                            type="small"
                            style={{
                              color:
                                productForm.weightUnit === u
                                  ? "#FFFFFF"
                                  : NemyColors.primary,
                            }}
                          >
                            {u}
                          </ThemedText>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="small" style={{ marginBottom: 4 }}>
                      Precio por unidad ($)
                    </ThemedText>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.backgroundSecondary,
                          color: theme.text,
                        },
                      ]}
                      value={productForm.pricePerUnit}
                      onChangeText={(t) =>
                        setProductForm({ ...productForm, pricePerUnit: t })
                      }
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              ) : null}
              <Pressable
                onPress={() =>
                  setProductForm({
                    ...productForm,
                    isAvailable: !productForm.isAvailable,
                  })
                }
                style={[styles.checkRow, { marginTop: Spacing.lg }]}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: NemyColors.primary,
                      backgroundColor: productForm.isAvailable
                        ? NemyColors.primary
                        : "transparent",
                    },
                  ]}
                >
                  {productForm.isAvailable ? (
                    <Feather name="check" size={16} color="#FFFFFF" />
                  ) : null}
                </View>
                <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>
                  Producto disponible
                </ThemedText>
              </Pressable>
            </ScrollView>
            <Pressable
              onPress={handleSaveProduct}
              style={[
                styles.saveButton,
                { backgroundColor: NemyColors.primary },
              ]}
            >
              <ThemedText
                type="body"
                style={{ color: "#FFFFFF", fontWeight: "600" }}
              >
                Guardar
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: 0,
    paddingBottom: Spacing["4xl"],
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    width: "47%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  section: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  roleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  listContainer: {
    gap: Spacing.md,
  },
  listItem: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  listItemHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  orderIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  listItemContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  badge: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  listItemFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    padding: Spacing["3xl"],
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  tabsScroll: {
    flexGrow: 0,
    marginBottom: Spacing.lg,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  input: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    fontSize: 16,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "85%",
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  saveButton: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  metricsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  metricCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  mapContainer: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  map: {
    height: 250,
    width: "100%",
  },
  webMapPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  orderCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  logCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  actionBadge: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
});
