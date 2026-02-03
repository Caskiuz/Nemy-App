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

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isOnline: boolean;
  isApproved: boolean;
  strikes: number;
  totalDeliveries: number;
  rating: number | null;
  createdAt: string;
}

interface Wallet {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  balance: number;
  pendingBalance: number;
}

interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  status: string;
  bankName: string | null;
  accountNumber: string | null;
  createdAt: string;
}

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
}

interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  lastMessageAt: string | null;
}

interface DeliveryZone {
  id: string;
  name: string;
  baseFee: number;
  pricePerKm: number;
  minOrderAmount: number;
  isActive: boolean;
}

interface SystemSetting {
  key: string;
  value: string;
  description: string;
}

interface TabProps {
  theme: any;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

function DriversTab({ theme, showToast }: TabProps) {
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
      <View style={tabStyles.centered}>
        <ActivityIndicator size="large" color={NemyColors.primary} />
      </View>
    );
  }

  return (
    <View style={tabStyles.container}>
      <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
        Repartidores ({drivers.length})
      </ThemedText>
      {drivers.length === 0 ? (
        <View style={[tabStyles.emptyState, { backgroundColor: theme.card }]}>
          <Feather name="truck" size={48} color={theme.textSecondary} />
          <ThemedText style={{ marginTop: Spacing.md, color: theme.textSecondary }}>
            No hay repartidores registrados
          </ThemedText>
        </View>
      ) : (
        drivers.map((driver) => (
          <View key={driver.id} style={[tabStyles.card, { backgroundColor: theme.card }]}>
            <View style={tabStyles.cardHeader}>
              <View style={{ flex: 1 }}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {driver.name}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {driver.email}
                </ThemedText>
              </View>
              <View style={[tabStyles.statusBadge, { backgroundColor: driver.isOnline ? NemyColors.success + "20" : theme.backgroundSecondary }]}>
                <View style={[tabStyles.statusDot, { backgroundColor: driver.isOnline ? NemyColors.success : theme.textSecondary }]} />
                <ThemedText type="small" style={{ marginLeft: 4, color: driver.isOnline ? NemyColors.success : theme.textSecondary }}>
                  {driver.isOnline ? "En línea" : "Desconectado"}
                </ThemedText>
              </View>
            </View>
            <View style={tabStyles.statsRow}>
              <View style={tabStyles.stat}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>Entregas</ThemedText>
                <ThemedText type="body" style={{ fontWeight: "600" }}>{driver.totalDeliveries}</ThemedText>
              </View>
              <View style={tabStyles.stat}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>Rating</ThemedText>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {driver.rating ? driver.rating.toFixed(1) : "N/A"}
                </ThemedText>
              </View>
              <View style={tabStyles.stat}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>Strikes</ThemedText>
                <ThemedText type="body" style={{ fontWeight: "600", color: driver.strikes > 0 ? NemyColors.error : theme.text }}>
                  {driver.strikes}
                </ThemedText>
              </View>
            </View>
            <View style={tabStyles.cardActions}>
              <Pressable
                onPress={() => toggleApproval(driver.id, driver.isApproved)}
                style={[tabStyles.actionBtn, { backgroundColor: driver.isApproved ? NemyColors.error + "20" : NemyColors.success + "20" }]}
              >
                <Feather name={driver.isApproved ? "user-x" : "user-check"} size={16} color={driver.isApproved ? NemyColors.error : NemyColors.success} />
                <ThemedText type="small" style={{ marginLeft: 4, color: driver.isApproved ? NemyColors.error : NemyColors.success }}>
                  {driver.isApproved ? "Suspender" : "Aprobar"}
                </ThemedText>
              </Pressable>
              {driver.strikes > 0 ? (
                <Pressable
                  onPress={() => clearStrikes(driver.id)}
                  style={[tabStyles.actionBtn, { backgroundColor: NemyColors.primary + "20" }]}
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

function FinanceTab({ theme, showToast }: TabProps) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"wallets" | "withdrawals">("wallets");

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      const [walletsRes, withdrawalsRes] = await Promise.all([
        apiRequest("GET", "/api/admin/wallets"),
        apiRequest("GET", "/api/admin/withdrawals"),
      ]);
      const walletsData = await walletsRes.json();
      const withdrawalsData = await withdrawalsRes.json();
      setWallets(walletsData.wallets || []);
      setWithdrawals(withdrawalsData.withdrawals || []);
    } catch (error) {
      console.error("Error fetching finance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async (id: string, status: "approved" | "rejected") => {
    try {
      await apiRequest("PUT", `/api/admin/withdrawals/${id}`, { status });
      showToast(status === "approved" ? "Retiro aprobado" : "Retiro rechazado", "success");
      fetchFinanceData();
    } catch (error) {
      showToast("Error al procesar retiro", "error");
    }
  };

  if (loading) {
    return (
      <View style={tabStyles.centered}>
        <ActivityIndicator size="large" color={NemyColors.primary} />
      </View>
    );
  }

  return (
    <View style={tabStyles.container}>
      <View style={tabStyles.sectionTabs}>
        <Pressable
          onPress={() => setActiveSection("wallets")}
          style={[tabStyles.sectionTab, activeSection === "wallets" && { backgroundColor: NemyColors.primary }]}
        >
          <ThemedText type="small" style={{ color: activeSection === "wallets" ? "#fff" : theme.text }}>
            Wallets
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => setActiveSection("withdrawals")}
          style={[tabStyles.sectionTab, activeSection === "withdrawals" && { backgroundColor: NemyColors.primary }]}
        >
          <ThemedText type="small" style={{ color: activeSection === "withdrawals" ? "#fff" : theme.text }}>
            Retiros
          </ThemedText>
        </Pressable>
      </View>

      {activeSection === "wallets" ? (
        <>
          <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
            Wallets ({wallets.length})
          </ThemedText>
          {wallets.length === 0 ? (
            <View style={[tabStyles.emptyState, { backgroundColor: theme.card }]}>
              <Feather name="credit-card" size={48} color={theme.textSecondary} />
              <ThemedText style={{ marginTop: Spacing.md, color: theme.textSecondary }}>
                No hay wallets
              </ThemedText>
            </View>
          ) : (
            wallets.map((wallet) => (
              <View key={wallet.id} style={[tabStyles.card, { backgroundColor: theme.card }]}>
                <View style={tabStyles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="body" style={{ fontWeight: "600" }}>
                      {wallet.userName}
                    </ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>
                      {wallet.userRole === "business_owner" ? "Negocio" : "Repartidor"}
                    </ThemedText>
                  </View>
                </View>
                <View style={tabStyles.statsRow}>
                  <View style={tabStyles.stat}>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>Disponible</ThemedText>
                    <ThemedText type="body" style={{ fontWeight: "600", color: NemyColors.success }}>
                      ${(wallet.balance / 100).toFixed(2)}
                    </ThemedText>
                  </View>
                  <View style={tabStyles.stat}>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>Pendiente</ThemedText>
                    <ThemedText type="body" style={{ fontWeight: "600", color: NemyColors.warning }}>
                      ${(wallet.pendingBalance / 100).toFixed(2)}
                    </ThemedText>
                  </View>
                </View>
              </View>
            ))
          )}
        </>
      ) : (
        <>
          <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
            Solicitudes de Retiro ({withdrawals.filter((w) => w.status === "pending").length} pendientes)
          </ThemedText>
          {withdrawals.length === 0 ? (
            <View style={[tabStyles.emptyState, { backgroundColor: theme.card }]}>
              <Feather name="inbox" size={48} color={theme.textSecondary} />
              <ThemedText style={{ marginTop: Spacing.md, color: theme.textSecondary }}>
                No hay solicitudes de retiro
              </ThemedText>
            </View>
          ) : (
            withdrawals.map((w) => (
              <View key={w.id} style={[tabStyles.card, { backgroundColor: theme.card }]}>
                <View style={tabStyles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="body" style={{ fontWeight: "600" }}>
                      {w.userName}
                    </ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>
                      {new Date(w.createdAt).toLocaleDateString("es-MX")}
                    </ThemedText>
                  </View>
                  <ThemedText type="h4" style={{ color: NemyColors.primary }}>
                    ${(w.amount / 100).toFixed(2)}
                  </ThemedText>
                </View>
                {w.bankName ? (
                  <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                    {w.bankName} - ****{w.accountNumber?.slice(-4)}
                  </ThemedText>
                ) : null}
                {w.status === "pending" ? (
                  <View style={tabStyles.cardActions}>
                    <Pressable
                      onPress={() => handleWithdrawal(w.id, "approved")}
                      style={[tabStyles.actionBtn, { backgroundColor: NemyColors.success + "20" }]}
                    >
                      <Feather name="check" size={16} color={NemyColors.success} />
                      <ThemedText type="small" style={{ marginLeft: 4, color: NemyColors.success }}>
                        Aprobar
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      onPress={() => handleWithdrawal(w.id, "rejected")}
                      style={[tabStyles.actionBtn, { backgroundColor: NemyColors.error + "20" }]}
                    >
                      <Feather name="x" size={16} color={NemyColors.error} />
                      <ThemedText type="small" style={{ marginLeft: 4, color: NemyColors.error }}>
                        Rechazar
                      </ThemedText>
                    </Pressable>
                  </View>
                ) : (
                  <View style={[tabStyles.statusBadge, { backgroundColor: w.status === "approved" ? NemyColors.success + "20" : NemyColors.error + "20", marginTop: Spacing.sm }]}>
                    <ThemedText type="small" style={{ color: w.status === "approved" ? NemyColors.success : NemyColors.error }}>
                      {w.status === "approved" ? "Aprobado" : "Rechazado"}
                    </ThemedText>
                  </View>
                )}
              </View>
            ))
          )}
        </>
      )}
    </View>
  );
}

function CouponsTab({ theme, showToast }: TabProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "",
    maxUses: "",
    expiresAt: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await apiRequest("GET", "/api/admin/coupons");
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const createCoupon = async () => {
    try {
      await apiRequest("POST", "/api/admin/coupons", {
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue) * (form.discountType === "percentage" ? 1 : 100),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) * 100 : null,
        maxUses: form.maxUses ? parseInt(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
      });
      showToast("Cupón creado", "success");
      setShowModal(false);
      setForm({ code: "", discountType: "percentage", discountValue: "", minOrderAmount: "", maxUses: "", expiresAt: "" });
      fetchCoupons();
    } catch (error) {
      showToast("Error al crear cupón", "error");
    }
  };

  const toggleCoupon = async (id: string, isActive: boolean) => {
    try {
      await apiRequest("PUT", `/api/admin/coupons/${id}`, { isActive: !isActive });
      showToast(isActive ? "Cupón desactivado" : "Cupón activado", "success");
      fetchCoupons();
    } catch (error) {
      showToast("Error al actualizar cupón", "error");
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      await apiRequest("DELETE", `/api/admin/coupons/${id}`);
      showToast("Cupón eliminado", "success");
      fetchCoupons();
    } catch (error) {
      showToast("Error al eliminar cupón", "error");
    }
  };

  if (loading) {
    return (
      <View style={tabStyles.centered}>
        <ActivityIndicator size="large" color={NemyColors.primary} />
      </View>
    );
  }

  return (
    <View style={tabStyles.container}>
      <Pressable
        onPress={() => setShowModal(true)}
        style={[tabStyles.addButton, { backgroundColor: NemyColors.primary }]}
      >
        <Feather name="plus" size={20} color="#fff" />
        <ThemedText type="body" style={{ color: "#fff", marginLeft: Spacing.xs }}>
          Nuevo Cupón
        </ThemedText>
      </Pressable>

      <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
        Cupones ({coupons.length})
      </ThemedText>

      {coupons.length === 0 ? (
        <View style={[tabStyles.emptyState, { backgroundColor: theme.card }]}>
          <Feather name="tag" size={48} color={theme.textSecondary} />
          <ThemedText style={{ marginTop: Spacing.md, color: theme.textSecondary }}>
            No hay cupones
          </ThemedText>
        </View>
      ) : (
        coupons.map((coupon) => (
          <View key={coupon.id} style={[tabStyles.card, { backgroundColor: theme.card }]}>
            <View style={tabStyles.cardHeader}>
              <View style={{ flex: 1 }}>
                <ThemedText type="h4" style={{ color: NemyColors.primary }}>
                  {coupon.code}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {coupon.discountType === "percentage"
                    ? `${coupon.discountValue}% descuento`
                    : `$${(coupon.discountValue / 100).toFixed(0)} descuento`}
                </ThemedText>
              </View>
              <View style={[tabStyles.statusBadge, { backgroundColor: coupon.isActive ? NemyColors.success + "20" : NemyColors.error + "20" }]}>
                <ThemedText type="small" style={{ color: coupon.isActive ? NemyColors.success : NemyColors.error }}>
                  {coupon.isActive ? "Activo" : "Inactivo"}
                </ThemedText>
              </View>
            </View>
            <View style={tabStyles.statsRow}>
              <View style={tabStyles.stat}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>Usos</ThemedText>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {coupon.usedCount}/{coupon.maxUses || "∞"}
                </ThemedText>
              </View>
              {coupon.minOrderAmount ? (
                <View style={tabStyles.stat}>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>Min</ThemedText>
                  <ThemedText type="body" style={{ fontWeight: "600" }}>
                    ${(coupon.minOrderAmount / 100).toFixed(0)}
                  </ThemedText>
                </View>
              ) : null}
              {coupon.expiresAt ? (
                <View style={tabStyles.stat}>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>Expira</ThemedText>
                  <ThemedText type="body" style={{ fontWeight: "600" }}>
                    {new Date(coupon.expiresAt).toLocaleDateString("es-MX")}
                  </ThemedText>
                </View>
              ) : null}
            </View>
            <View style={tabStyles.cardActions}>
              <Pressable
                onPress={() => toggleCoupon(coupon.id, coupon.isActive)}
                style={[tabStyles.actionBtn, { backgroundColor: coupon.isActive ? NemyColors.error + "20" : NemyColors.success + "20" }]}
              >
                <Feather name={coupon.isActive ? "pause" : "play"} size={16} color={coupon.isActive ? NemyColors.error : NemyColors.success} />
              </Pressable>
              <Pressable
                onPress={() => deleteCoupon(coupon.id)}
                style={[tabStyles.actionBtn, { backgroundColor: NemyColors.error + "20" }]}
              >
                <Feather name="trash-2" size={16} color={NemyColors.error} />
              </Pressable>
            </View>
          </View>
        ))
      )}

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={tabStyles.modalOverlay}>
          <View style={[tabStyles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={tabStyles.modalHeader}>
              <ThemedText type="h3">Nuevo Cupón</ThemedText>
              <Pressable onPress={() => setShowModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <ThemedText type="small" style={{ marginBottom: 4 }}>Código</ThemedText>
              <TextInput
                style={[tabStyles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                value={form.code}
                onChangeText={(v) => setForm({ ...form, code: v })}
                placeholder="NEMY20"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="characters"
              />
              <ThemedText type="small" style={{ marginTop: Spacing.md, marginBottom: 4 }}>Tipo de descuento</ThemedText>
              <View style={{ flexDirection: "row", gap: Spacing.sm }}>
                <Pressable
                  onPress={() => setForm({ ...form, discountType: "percentage" })}
                  style={[tabStyles.sectionTab, form.discountType === "percentage" && { backgroundColor: NemyColors.primary }]}
                >
                  <ThemedText type="small" style={{ color: form.discountType === "percentage" ? "#fff" : theme.text }}>
                    Porcentaje
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => setForm({ ...form, discountType: "fixed" })}
                  style={[tabStyles.sectionTab, form.discountType === "fixed" && { backgroundColor: NemyColors.primary }]}
                >
                  <ThemedText type="small" style={{ color: form.discountType === "fixed" ? "#fff" : theme.text }}>
                    Fijo
                  </ThemedText>
                </Pressable>
              </View>
              <ThemedText type="small" style={{ marginTop: Spacing.md, marginBottom: 4 }}>
                Valor ({form.discountType === "percentage" ? "%" : "$"})
              </ThemedText>
              <TextInput
                style={[tabStyles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                value={form.discountValue}
                onChangeText={(v) => setForm({ ...form, discountValue: v })}
                keyboardType="numeric"
                placeholder={form.discountType === "percentage" ? "20" : "50"}
                placeholderTextColor={theme.textSecondary}
              />
              <ThemedText type="small" style={{ marginTop: Spacing.md, marginBottom: 4 }}>Monto mínimo (opcional)</ThemedText>
              <TextInput
                style={[tabStyles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                value={form.minOrderAmount}
                onChangeText={(v) => setForm({ ...form, minOrderAmount: v })}
                keyboardType="numeric"
                placeholder="100"
                placeholderTextColor={theme.textSecondary}
              />
              <ThemedText type="small" style={{ marginTop: Spacing.md, marginBottom: 4 }}>Usos máximos (opcional)</ThemedText>
              <TextInput
                style={[tabStyles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                value={form.maxUses}
                onChangeText={(v) => setForm({ ...form, maxUses: v })}
                keyboardType="numeric"
                placeholder="100"
                placeholderTextColor={theme.textSecondary}
              />
              <Pressable
                onPress={createCoupon}
                style={[tabStyles.saveButton, { backgroundColor: NemyColors.primary }]}
              >
                <ThemedText type="body" style={{ color: "#fff", fontWeight: "600" }}>
                  Crear Cupón
                </ThemedText>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SupportTab({ theme, showToast }: TabProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await apiRequest("GET", "/api/admin/support-tickets");
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (id: string, status: string) => {
    try {
      await apiRequest("PUT", `/api/admin/support-tickets/${id}`, { status });
      showToast("Estado actualizado", "success");
      fetchTickets();
    } catch (error) {
      showToast("Error al actualizar ticket", "error");
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filter === "all") return true;
    if (filter === "open") return t.status !== "closed";
    return t.status === "closed";
  });

  if (loading) {
    return (
      <View style={tabStyles.centered}>
        <ActivityIndicator size="large" color={NemyColors.primary} />
      </View>
    );
  }

  return (
    <View style={tabStyles.container}>
      <View style={tabStyles.sectionTabs}>
        {(["all", "open", "closed"] as const).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[tabStyles.sectionTab, filter === f && { backgroundColor: NemyColors.primary }]}
          >
            <ThemedText type="small" style={{ color: filter === f ? "#fff" : theme.text }}>
              {f === "all" ? "Todos" : f === "open" ? "Abiertos" : "Cerrados"}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
        Tickets ({filteredTickets.length})
      </ThemedText>

      {filteredTickets.length === 0 ? (
        <View style={[tabStyles.emptyState, { backgroundColor: theme.card }]}>
          <Feather name="message-circle" size={48} color={theme.textSecondary} />
          <ThemedText style={{ marginTop: Spacing.md, color: theme.textSecondary }}>
            No hay tickets
          </ThemedText>
        </View>
      ) : (
        filteredTickets.map((ticket) => (
          <View key={ticket.id} style={[tabStyles.card, { backgroundColor: theme.card }]}>
            <View style={tabStyles.cardHeader}>
              <View style={{ flex: 1 }}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {ticket.subject}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {ticket.userName} - {new Date(ticket.createdAt).toLocaleDateString("es-MX")}
                </ThemedText>
              </View>
              <View style={[tabStyles.priorityBadge, {
                backgroundColor:
                  ticket.priority === "high" ? NemyColors.error + "20" :
                  ticket.priority === "medium" ? NemyColors.warning + "20" :
                  NemyColors.success + "20"
              }]}>
                <ThemedText type="small" style={{
                  color:
                    ticket.priority === "high" ? NemyColors.error :
                    ticket.priority === "medium" ? NemyColors.warning :
                    NemyColors.success
                }}>
                  {ticket.priority === "high" ? "Alta" : ticket.priority === "medium" ? "Media" : "Baja"}
                </ThemedText>
              </View>
            </View>
            <View style={tabStyles.cardActions}>
              {ticket.status !== "closed" ? (
                <>
                  <Pressable
                    onPress={() => updateTicketStatus(ticket.id, "in_progress")}
                    style={[tabStyles.actionBtn, { backgroundColor: NemyColors.warning + "20" }]}
                  >
                    <ThemedText type="small" style={{ color: NemyColors.warning }}>
                      En Proceso
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={() => updateTicketStatus(ticket.id, "closed")}
                    style={[tabStyles.actionBtn, { backgroundColor: NemyColors.success + "20" }]}
                  >
                    <ThemedText type="small" style={{ color: NemyColors.success }}>
                      Cerrar
                    </ThemedText>
                  </Pressable>
                </>
              ) : (
                <View style={[tabStyles.statusBadge, { backgroundColor: NemyColors.success + "20" }]}>
                  <ThemedText type="small" style={{ color: NemyColors.success }}>
                    Cerrado
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        ))
      )}
    </View>
  );
}

function ZonesTab({ theme, showToast }: TabProps) {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    baseFee: "",
    pricePerKm: "",
    minOrderAmount: "",
  });

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const res = await apiRequest("GET", "/api/admin/delivery-zones");
      const data = await res.json();
      setZones(data.zones || []);
    } catch (error) {
      console.error("Error fetching zones:", error);
    } finally {
      setLoading(false);
    }
  };

  const createZone = async () => {
    try {
      await apiRequest("POST", "/api/admin/delivery-zones", {
        name: form.name,
        baseFee: parseFloat(form.baseFee) * 100,
        pricePerKm: parseFloat(form.pricePerKm) * 100,
        minOrderAmount: parseFloat(form.minOrderAmount) * 100,
      });
      showToast("Zona creada", "success");
      setShowModal(false);
      setForm({ name: "", baseFee: "", pricePerKm: "", minOrderAmount: "" });
      fetchZones();
    } catch (error) {
      showToast("Error al crear zona", "error");
    }
  };

  const toggleZone = async (id: string, isActive: boolean) => {
    try {
      await apiRequest("PUT", `/api/admin/delivery-zones/${id}`, { isActive: !isActive });
      showToast(isActive ? "Zona desactivada" : "Zona activada", "success");
      fetchZones();
    } catch (error) {
      showToast("Error al actualizar zona", "error");
    }
  };

  if (loading) {
    return (
      <View style={tabStyles.centered}>
        <ActivityIndicator size="large" color={NemyColors.primary} />
      </View>
    );
  }

  return (
    <View style={tabStyles.container}>
      <Pressable
        onPress={() => setShowModal(true)}
        style={[tabStyles.addButton, { backgroundColor: NemyColors.primary }]}
      >
        <Feather name="plus" size={20} color="#fff" />
        <ThemedText type="body" style={{ color: "#fff", marginLeft: Spacing.xs }}>
          Nueva Zona
        </ThemedText>
      </Pressable>

      <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
        Zonas de Entrega ({zones.length})
      </ThemedText>

      {zones.length === 0 ? (
        <View style={[tabStyles.emptyState, { backgroundColor: theme.card }]}>
          <Feather name="map-pin" size={48} color={theme.textSecondary} />
          <ThemedText style={{ marginTop: Spacing.md, color: theme.textSecondary }}>
            No hay zonas configuradas
          </ThemedText>
        </View>
      ) : (
        zones.map((zone) => (
          <View key={zone.id} style={[tabStyles.card, { backgroundColor: theme.card }]}>
            <View style={tabStyles.cardHeader}>
              <View style={{ flex: 1 }}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {zone.name}
                </ThemedText>
              </View>
              <View style={[tabStyles.statusBadge, { backgroundColor: zone.isActive ? NemyColors.success + "20" : NemyColors.error + "20" }]}>
                <ThemedText type="small" style={{ color: zone.isActive ? NemyColors.success : NemyColors.error }}>
                  {zone.isActive ? "Activa" : "Inactiva"}
                </ThemedText>
              </View>
            </View>
            <View style={tabStyles.statsRow}>
              <View style={tabStyles.stat}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>Base</ThemedText>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  ${(zone.baseFee / 100).toFixed(0)}
                </ThemedText>
              </View>
              <View style={tabStyles.stat}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>Por Km</ThemedText>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  ${(zone.pricePerKm / 100).toFixed(0)}
                </ThemedText>
              </View>
              <View style={tabStyles.stat}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>Min</ThemedText>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  ${(zone.minOrderAmount / 100).toFixed(0)}
                </ThemedText>
              </View>
            </View>
            <View style={tabStyles.cardActions}>
              <Pressable
                onPress={() => toggleZone(zone.id, zone.isActive)}
                style={[tabStyles.actionBtn, { backgroundColor: zone.isActive ? NemyColors.error + "20" : NemyColors.success + "20" }]}
              >
                <Feather name={zone.isActive ? "pause" : "play"} size={16} color={zone.isActive ? NemyColors.error : NemyColors.success} />
              </Pressable>
            </View>
          </View>
        ))
      )}

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={tabStyles.modalOverlay}>
          <View style={[tabStyles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={tabStyles.modalHeader}>
              <ThemedText type="h3">Nueva Zona</ThemedText>
              <Pressable onPress={() => setShowModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <ThemedText type="small" style={{ marginBottom: 4 }}>Nombre</ThemedText>
              <TextInput
                style={[tabStyles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                value={form.name}
                onChangeText={(v) => setForm({ ...form, name: v })}
                placeholder="Centro de Autlán"
                placeholderTextColor={theme.textSecondary}
              />
              <ThemedText type="small" style={{ marginTop: Spacing.md, marginBottom: 4 }}>Tarifa base ($)</ThemedText>
              <TextInput
                style={[tabStyles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                value={form.baseFee}
                onChangeText={(v) => setForm({ ...form, baseFee: v })}
                keyboardType="numeric"
                placeholder="25"
                placeholderTextColor={theme.textSecondary}
              />
              <ThemedText type="small" style={{ marginTop: Spacing.md, marginBottom: 4 }}>Precio por Km ($)</ThemedText>
              <TextInput
                style={[tabStyles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                value={form.pricePerKm}
                onChangeText={(v) => setForm({ ...form, pricePerKm: v })}
                keyboardType="numeric"
                placeholder="5"
                placeholderTextColor={theme.textSecondary}
              />
              <ThemedText type="small" style={{ marginTop: Spacing.md, marginBottom: 4 }}>Monto mínimo ($)</ThemedText>
              <TextInput
                style={[tabStyles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                value={form.minOrderAmount}
                onChangeText={(v) => setForm({ ...form, minOrderAmount: v })}
                keyboardType="numeric"
                placeholder="50"
                placeholderTextColor={theme.textSecondary}
              />
              <Pressable
                onPress={createZone}
                style={[tabStyles.saveButton, { backgroundColor: NemyColors.primary }]}
              >
                <ThemedText type="body" style={{ color: "#fff", fontWeight: "600" }}>
                  Crear Zona
                </ThemedText>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SettingsTab({ theme, showToast }: TabProps) {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await apiRequest("GET", "/api/admin/settings");
      const data = await res.json();
      setSettings(data.settings || []);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      await apiRequest("PUT", "/api/admin/settings", { key, value });
      showToast("Configuración actualizada", "success");
      setEditingKey(null);
      fetchSettings();
    } catch (error) {
      showToast("Error al actualizar", "error");
    }
  };

  const defaultSettings: SystemSetting[] = [
    { key: "platform_commission", value: "15", description: "Comisión de plataforma (%)" },
    { key: "business_commission", value: "70", description: "Comisión de negocio (%)" },
    { key: "delivery_commission", value: "15", description: "Comisión de repartidor (%)" },
    { key: "anti_fraud_hold_hours", value: "24", description: "Horas de retención anti-fraude" },
    { key: "max_strikes", value: "3", description: "Strikes máximos antes de suspensión" },
  ];

  const displaySettings = settings.length > 0 ? settings : defaultSettings;

  if (loading) {
    return (
      <View style={tabStyles.centered}>
        <ActivityIndicator size="large" color={NemyColors.primary} />
      </View>
    );
  }

  return (
    <View style={tabStyles.container}>
      <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
        Configuración del Sistema
      </ThemedText>

      {displaySettings.map((setting) => (
        <View key={setting.key} style={[tabStyles.card, { backgroundColor: theme.card }]}>
          <View style={tabStyles.cardHeader}>
            <View style={{ flex: 1 }}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {setting.description}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {setting.key}
              </ThemedText>
            </View>
            {editingKey === setting.key ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm }}>
                <TextInput
                  style={[tabStyles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, width: 80 }]}
                  value={editValue}
                  onChangeText={setEditValue}
                  keyboardType="numeric"
                />
                <Pressable onPress={() => updateSetting(setting.key, editValue)}>
                  <Feather name="check" size={20} color={NemyColors.success} />
                </Pressable>
                <Pressable onPress={() => setEditingKey(null)}>
                  <Feather name="x" size={20} color={NemyColors.error} />
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => {
                  setEditingKey(setting.key);
                  setEditValue(setting.value);
                }}
                style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm }}
              >
                <ThemedText type="h4" style={{ color: NemyColors.primary }}>
                  {setting.value}
                </ThemedText>
                <Feather name="edit-2" size={16} color={NemyColors.primary} />
              </Pressable>
            )}
          </View>
        </View>
      ))}

      <View style={[tabStyles.card, { backgroundColor: theme.card, marginTop: Spacing.lg }]}>
        <ThemedText type="body" style={{ fontWeight: "600", marginBottom: Spacing.sm }}>
          Acciones del Sistema
        </ThemedText>
        <Pressable
          onPress={async () => {
            try {
              await apiRequest("POST", "/api/admin/clear-cache");
              showToast("Caché limpiada", "success");
            } catch (error) {
              showToast("Error al limpiar caché", "error");
            }
          }}
          style={[tabStyles.actionBtn, { backgroundColor: NemyColors.warning + "20", marginBottom: Spacing.sm }]}
        >
          <Feather name="refresh-cw" size={16} color={NemyColors.warning} />
          <ThemedText type="small" style={{ marginLeft: 4, color: NemyColors.warning }}>
            Limpiar Caché
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing["3xl"],
  },
  emptyState: {
    padding: Spacing["3xl"],
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginTop: Spacing.md,
  },
  stat: {
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
  priorityBadge: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  sectionTabs: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sectionTab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: NemyColors.primary,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "70%",
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
    marginTop: Spacing.xl,
  },
});

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
    | "drivers"
    | "finance"
    | "coupons"
    | "support"
    | "zones"
    | "settings"
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
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [userRoleEdit, setUserRoleEdit] = useState("");

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
      setProducts(data.business?.products || []);
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

  const openUserModal = (user: AdminUser) => {
    console.log("Opening user modal for:", user.name);
    setSelectedUser(user);
    setUserRoleEdit(user.role);
    setShowUserModal(true);
  };

  const handleUpdateUserRole = async () => {
    if (!selectedUser) return;
    try {
      await apiRequest("PUT", `/api/admin/users/${selectedUser.id}/role`, {
        role: userRoleEdit,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast("Rol actualizado correctamente", "success");
      setShowUserModal(false);
      fetchData();
    } catch (error) {
      showToast("Error al actualizar el rol", "error");
    }
  };

  const openOrderModal = (order: AdminOrder) => {
    console.log("Opening order modal for:", order.id);
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleUpdateOrderStatus = async (status: string) => {
    if (!selectedOrder) return;
    try {
      await apiRequest("PUT", `/api/admin/orders/${selectedOrder.id}/status`, {
        status,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast("Estado del pedido actualizado", "success");
      setShowOrderModal(false);
      fetchData();
    } catch (error) {
      showToast("Error al actualizar el estado", "error");
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
        showsHorizontalScrollIndicator={true}
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
            "drivers",
            "finance",
            "coupons",
            "support",
            "zones",
            "settings",
            "logs",
          ] as const
        ).map((tab) => {
          const tabConfig: Record<string, { icon: string; label: string }> = {
            dashboard: { icon: "activity", label: "Dashboard" },
            stats: { icon: "bar-chart-2", label: "Resumen" },
            users: { icon: "users", label: "Usuarios" },
            orders: { icon: "package", label: "Pedidos" },
            businesses: { icon: "briefcase", label: "Negocios" },
            products: { icon: "box", label: "Productos" },
            drivers: { icon: "truck", label: "Repartidores" },
            finance: { icon: "dollar-sign", label: "Finanzas" },
            coupons: { icon: "tag", label: "Cupones" },
            support: { icon: "message-circle", label: "Soporte" },
            zones: { icon: "map-pin", label: "Zonas" },
            settings: { icon: "sliders", label: "Config" },
            logs: { icon: "file-text", label: "Logs" },
          };
          const config = tabConfig[tab] || { icon: "box", label: tab };
          return (
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
                name={config.icon as any}
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
                {config.label}
              </ThemedText>
            </Pressable>
          );
        })}
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
              <Pressable
                key={u.id}
                onPress={() => openUserModal(u)}
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
                  <Feather name="chevron-right" size={20} color={theme.textSecondary} />
                </View>
              </Pressable>
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
                <Pressable
                  key={order.id}
                  onPress={() => openOrderModal(order)}
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
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <ThemedText
                        type="caption"
                        style={{ color: theme.textSecondary }}
                      >
                        {order.paymentMethod === "card" ? "Tarjeta" : "Efectivo"}
                      </ThemedText>
                      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
                    </View>
                  </View>
                </Pressable>
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

        {activeTab === "drivers" && (
          <DriversTab theme={theme} showToast={showToast} />
        )}

        {activeTab === "finance" && (
          <FinanceTab theme={theme} showToast={showToast} />
        )}

        {activeTab === "coupons" && (
          <CouponsTab theme={theme} showToast={showToast} />
        )}

        {activeTab === "support" && (
          <SupportTab theme={theme} showToast={showToast} />
        )}

        {activeTab === "zones" && (
          <ZonesTab theme={theme} showToast={showToast} />
        )}

        {activeTab === "settings" && (
          <SettingsTab theme={theme} showToast={showToast} />
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

      <Modal visible={showUserModal} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <ThemedText type="h3">Detalles del Usuario</ThemedText>
              <Pressable onPress={() => setShowUserModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalBody}>
              {selectedUser ? (
                <>
                  <View style={[styles.userDetailCard, { backgroundColor: theme.backgroundSecondary }]}>
                    <View style={[styles.avatar, { backgroundColor: NemyColors.primaryLight, width: 60, height: 60 }]}>
                      <ThemedText type="h2" style={{ color: NemyColors.primaryDark }}>
                        {selectedUser.name.charAt(0).toUpperCase()}
                      </ThemedText>
                    </View>
                    <ThemedText type="h3" style={{ marginTop: Spacing.md }}>{selectedUser.name}</ThemedText>
                    <ThemedText type="body" style={{ color: theme.textSecondary }}>{selectedUser.email}</ThemedText>
                    {selectedUser.phone ? (
                      <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 4 }}>
                        {selectedUser.phone}
                      </ThemedText>
                    ) : null}
                  </View>
                  <View style={{ marginTop: Spacing.lg }}>
                    <ThemedText type="body" style={{ fontWeight: "600", marginBottom: Spacing.sm }}>
                      Estado de verificación
                    </ThemedText>
                    <View style={{ flexDirection: "row", gap: Spacing.md }}>
                      <View style={styles.infoChip}>
                        <Feather
                          name={selectedUser.emailVerified ? "check-circle" : "x-circle"}
                          size={14}
                          color={selectedUser.emailVerified ? NemyColors.success : NemyColors.error}
                        />
                        <ThemedText type="caption" style={{ marginLeft: 4 }}>
                          Email {selectedUser.emailVerified ? "verificado" : "sin verificar"}
                        </ThemedText>
                      </View>
                      <View style={styles.infoChip}>
                        <Feather
                          name={(selectedUser as any).phoneVerified ? "check-circle" : "x-circle"}
                          size={14}
                          color={(selectedUser as any).phoneVerified ? NemyColors.success : NemyColors.error}
                        />
                        <ThemedText type="caption" style={{ marginLeft: 4 }}>
                          Tel {(selectedUser as any).phoneVerified ? "verificado" : "sin verificar"}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                  <View style={{ marginTop: Spacing.lg }}>
                    <ThemedText type="body" style={{ fontWeight: "600", marginBottom: Spacing.sm }}>
                      Cambiar Rol
                    </ThemedText>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm }}>
                      {["customer", "business", "driver", "admin"].map((role) => (
                        <Pressable
                          key={role}
                          onPress={() => setUserRoleEdit(role)}
                          style={[
                            styles.tab,
                            {
                              backgroundColor: userRoleEdit === role ? NemyColors.primary : "transparent",
                              borderColor: NemyColors.primary,
                            },
                          ]}
                        >
                          <ThemedText
                            type="small"
                            style={{ color: userRoleEdit === role ? "#FFFFFF" : NemyColors.primary }}
                          >
                            {getRoleLabel(role)}
                          </ThemedText>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                  <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.lg }}>
                    Registrado: {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </ThemedText>
                </>
              ) : null}
            </ScrollView>
            <Pressable
              onPress={handleUpdateUserRole}
              style={[styles.saveButton, { backgroundColor: NemyColors.primary }]}
            >
              <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                Guardar Cambios
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showOrderModal} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <ThemedText type="h3">Detalles del Pedido</ThemedText>
              <Pressable onPress={() => setShowOrderModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalBody}>
              {selectedOrder ? (
                <>
                  <View style={[styles.userDetailCard, { backgroundColor: theme.backgroundSecondary }]}>
                    <View style={[styles.orderIcon, { backgroundColor: NemyColors.primaryLight, width: 50, height: 50 }]}>
                      <Feather name="package" size={24} color={NemyColors.primary} />
                    </View>
                    <ThemedText type="h3" style={{ marginTop: Spacing.md }}>
                      #{selectedOrder.id.slice(0, 8)}
                    </ThemedText>
                    <ThemedText type="body" style={{ color: theme.textSecondary }}>
                      {selectedOrder.businessName}
                    </ThemedText>
                  </View>
                  <View style={{ marginTop: Spacing.lg }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: Spacing.sm }}>
                      <ThemedText type="body" style={{ color: theme.textSecondary }}>Total</ThemedText>
                      <ThemedText type="h4" style={{ color: NemyColors.primary }}>
                        ${(selectedOrder.total / 100).toFixed(2)}
                      </ThemedText>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: Spacing.sm }}>
                      <ThemedText type="body" style={{ color: theme.textSecondary }}>Método de Pago</ThemedText>
                      <ThemedText type="body">
                        {selectedOrder.paymentMethod === "card" ? "Tarjeta" : "Efectivo"}
                      </ThemedText>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: Spacing.sm }}>
                      <ThemedText type="body" style={{ color: theme.textSecondary }}>Estado actual</ThemedText>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status) + "20" }]}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(selectedOrder.status) }]} />
                        <ThemedText type="caption" style={{ color: getStatusColor(selectedOrder.status), marginLeft: 6 }}>
                          {getStatusLabel(selectedOrder.status)}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                  <View style={{ marginTop: Spacing.lg }}>
                    <ThemedText type="body" style={{ fontWeight: "600", marginBottom: Spacing.sm }}>
                      Cambiar Estado
                    </ThemedText>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm }}>
                      {["pending", "confirmed", "preparing", "ready", "picked_up", "delivered", "cancelled"].map((status) => (
                        <Pressable
                          key={status}
                          onPress={() => handleUpdateOrderStatus(status)}
                          style={[
                            styles.tab,
                            {
                              backgroundColor: selectedOrder.status === status ? getStatusColor(status) : "transparent",
                              borderColor: getStatusColor(status),
                            },
                          ]}
                        >
                          <ThemedText
                            type="small"
                            style={{ color: selectedOrder.status === status ? "#FFFFFF" : getStatusColor(status) }}
                          >
                            {getStatusLabel(status)}
                          </ThemedText>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                  <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.lg }}>
                    Creado: {new Date(selectedOrder.createdAt).toLocaleString()}
                  </ThemedText>
                </>
              ) : null}
            </ScrollView>
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
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    minWidth: 70,
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
  userDetailCard: {
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
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
  modalBody: {
    flex: 1,
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
