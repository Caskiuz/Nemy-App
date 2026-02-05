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
  onSelectCoupon: (coupon: Coupon) => void;
}

export const CouponsTab: React.FC<CouponsTabProps> = ({ theme, showToast, onSelectCoupon }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);


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





  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={NemyColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>


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
            <Pressable 
              key={coupon.id} 
              style={[styles.card, { backgroundColor: theme.card }]}
              onPress={() => onSelectCoupon(coupon)}
            >
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

            </Pressable>
          ))
        )}
      </ScrollView>


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

});
