import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { NemyColors, Spacing, BorderRadius } from "../../../constants/theme";
import { apiRequest } from "../../../lib/query-client";

interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

interface CouponsTabProps {
  theme: any;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

export const CouponsTab: React.FC<CouponsTabProps> = ({ theme, showToast }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
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
      showToast("Error al cargar cupones", "error");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCoupon(null);
    setForm({
      code: "",
      discountType: "percentage",
      discountValue: "",
      minOrderAmount: "",
      maxUses: "",
      expiresAt: "",
    });
    setShowModal(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: (coupon.discountType === "percentage" ? coupon.discountValue : coupon.discountValue / 100).toString(),
      minOrderAmount: coupon.minOrderAmount ? (coupon.minOrderAmount / 100).toString() : "",
      maxUses: coupon.maxUses?.toString() || "",
      expiresAt: coupon.expiresAt || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.discountValue) {
      showToast("Completa los campos requeridos", "error");
      return;
    }

    try {
      const body = {
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue) * (form.discountType === "percentage" ? 1 : 100),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) * 100 : null,
        maxUses: form.maxUses ? parseInt(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
      };

      if (editingCoupon) {
        await apiRequest("PUT", `/api/admin/coupons/${editingCoupon.id}`, body);
        showToast("Cupón actualizado", "success");
      } else {
        await apiRequest("POST", "/api/admin/coupons", body);
        showToast("Cupón creado", "success");
      }

      setShowModal(false);
      fetchCoupons();
    } catch (error) {
      showToast("Error al guardar cupón", "error");
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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={NemyColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={openCreateModal}
        style={[styles.addButton, { backgroundColor: NemyColors.primary }]}
      >
        <Feather name="plus" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Nuevo Cupón</Text>
      </Pressable>

      <Text style={[styles.title, { color: theme.text }]}>
        Cupones ({coupons.length})
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {coupons.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
            <Feather name="tag" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No hay cupones creados
            </Text>
          </View>
        ) : (
          coupons.map((coupon) => (
            <View key={coupon.id} style={[styles.card, { backgroundColor: theme.card }]}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.couponCode, { color: NemyColors.primary }]}>
                    {coupon.code}
                  </Text>
                  <Text style={[styles.couponDiscount, { color: theme.textSecondary }]}>
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}% descuento`
                      : `$${(coupon.discountValue / 100).toFixed(0)} descuento`}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: coupon.isActive
                        ? NemyColors.success + "20"
                        : NemyColors.error + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: coupon.isActive ? NemyColors.success : NemyColors.error },
                    ]}
                  >
                    {coupon.isActive ? "Activo" : "Inactivo"}
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Usos</Text>
                  <Text style={[styles.statValue, { color: theme.text }]}>
                    {coupon.usedCount}/{coupon.maxUses || "∞"}
                  </Text>
                </View>
                {coupon.minOrderAmount ? (
                  <View style={styles.stat}>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Mínimo</Text>
                    <Text style={[styles.statValue, { color: theme.text }]}>
                      ${(coupon.minOrderAmount / 100).toFixed(0)}
                    </Text>
                  </View>
                ) : null}
                {coupon.expiresAt ? (
                  <View style={styles.stat}>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Expira</Text>
                    <Text style={[styles.statValue, { color: theme.text }]}>
                      {new Date(coupon.expiresAt).toLocaleDateString("es-MX")}
                    </Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.actions}>
                <Pressable
                  onPress={() => openEditModal(coupon)}
                  style={[styles.actionBtn, { backgroundColor: NemyColors.primary + "20" }]}
                >
                  <Feather name="edit-2" size={16} color={NemyColors.primary} />
                </Pressable>
                <Pressable
                  onPress={() => toggleCoupon(coupon.id, coupon.isActive)}
                  style={[
                    styles.actionBtn,
                    {
                      backgroundColor: coupon.isActive
                        ? NemyColors.warning + "20"
                        : NemyColors.success + "20",
                    },
                  ]}
                >
                  <Feather
                    name={coupon.isActive ? "pause" : "play"}
                    size={16}
                    color={coupon.isActive ? NemyColors.warning : NemyColors.success}
                  />
                </Pressable>
                <Pressable
                  onPress={() => deleteCoupon(coupon.id)}
                  style={[styles.actionBtn, { backgroundColor: NemyColors.error + "20" }]}
                >
                  <Feather name="trash-2" size={16} color={NemyColors.error} />
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {editingCoupon ? "Editar Cupón" : "Nuevo Cupón"}
              </Text>
              <Pressable onPress={() => setShowModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.label, { color: theme.text }]}>Código *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                value={form.code}
                onChangeText={(v) => setForm({ ...form, code: v })}
                placeholder="NEMY20"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="characters"
              />

              <Text style={[styles.label, { color: theme.text }]}>Tipo de descuento</Text>
              <View style={styles.typeButtons}>
                <Pressable
                  onPress={() => setForm({ ...form, discountType: "percentage" })}
                  style={[
                    styles.typeBtn,
                    {
                      backgroundColor:
                        form.discountType === "percentage" ? NemyColors.primary : "transparent",
                      borderColor: NemyColors.primary,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: form.discountType === "percentage" ? "#fff" : NemyColors.primary,
                    }}
                  >
                    Porcentaje
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setForm({ ...form, discountType: "fixed" })}
                  style={[
                    styles.typeBtn,
                    {
                      backgroundColor:
                        form.discountType === "fixed" ? NemyColors.primary : "transparent",
                      borderColor: NemyColors.primary,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: form.discountType === "fixed" ? "#fff" : NemyColors.primary,
                    }}
                  >
                    Fijo
                  </Text>
                </Pressable>
              </View>

              <Text style={[styles.label, { color: theme.text }]}>
                Valor ({form.discountType === "percentage" ? "%" : "$"}) *
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                value={form.discountValue}
                onChangeText={(v) => setForm({ ...form, discountValue: v })}
                keyboardType="numeric"
                placeholder={form.discountType === "percentage" ? "20" : "50"}
                placeholderTextColor={theme.textSecondary}
              />

              <Text style={[styles.label, { color: theme.text }]}>Monto mínimo ($)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                value={form.minOrderAmount}
                onChangeText={(v) => setForm({ ...form, minOrderAmount: v })}
                keyboardType="numeric"
                placeholder="100"
                placeholderTextColor={theme.textSecondary}
              />

              <Text style={[styles.label, { color: theme.text }]}>Usos máximos</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                value={form.maxUses}
                onChangeText={(v) => setForm({ ...form, maxUses: v })}
                keyboardType="numeric"
                placeholder="100"
                placeholderTextColor={theme.textSecondary}
              />

              <Pressable
                onPress={handleSave}
                style={[styles.saveButton, { backgroundColor: NemyColors.primary }]}
              >
                <Text style={styles.saveButtonText}>
                  {editingCoupon ? "Actualizar" : "Crear"} Cupón
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: BorderRadius.lg,
    marginBottom: 16,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  emptyState: {
    padding: 48,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
  },
  card: {
    padding: 16,
    borderRadius: BorderRadius.lg,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  couponCode: {
    fontSize: 18,
    fontWeight: "bold",
  },
  couponDiscount: {
    fontSize: 14,
    marginTop: 4,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  stat: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  actionBtn: {
    padding: 12,
    borderRadius: BorderRadius.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "80%",
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    padding: 12,
    borderRadius: BorderRadius.md,
    fontSize: 16,
  },
  typeButtons: {
    flexDirection: "row",
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  saveButton: {
    padding: 16,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    marginTop: 24,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
