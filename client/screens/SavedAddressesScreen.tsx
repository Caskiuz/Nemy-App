import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Spacing, BorderRadius, NemyColors, Shadows } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode?: string;
  isDefault: boolean;
}

export default function SavedAddressesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const response = await apiRequest("GET", `/api/users/${user?.id}/addresses`);
      const data = await response.json();
      setAddresses(data.addresses || []);
    } catch (error) {
      console.error("Error loading addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await apiRequest("PUT", `/api/users/${user?.id}/addresses/${addressId}/default`);
      await loadAddresses();
      showToast("Dirección predeterminada actualizada", "success");
    } catch (error) {
      showToast("Error al actualizar dirección", "error");
    }
  };

  const handleDelete = async (addressId: string) => {
    Alert.alert(
      "Eliminar dirección",
      "¿Estás seguro de eliminar esta dirección?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await apiRequest("DELETE", `/api/users/${user?.id}/addresses/${addressId}`);
              await loadAddresses();
              showToast("Dirección eliminada", "success");
            } catch (error) {
              showToast("Error al eliminar dirección", "error");
            }
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        {loading ? (
          <View style={styles.emptyState}>
            <ThemedText>Cargando...</ThemedText>
          </View>
        ) : addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="map-pin" size={48} color={theme.textSecondary} />
            <ThemedText type="h4" style={{ marginTop: Spacing.lg }}>
              No tienes direcciones guardadas
            </ThemedText>
            <ThemedText
              type="body"
              style={{ color: theme.textSecondary, marginTop: Spacing.sm }}
            >
              Agrega una dirección para hacer tus pedidos más rápido
            </ThemedText>
          </View>
        ) : (
          addresses.map((address) => (
            <View
              key={address.id}
              style={[
                styles.addressCard,
                { backgroundColor: theme.card },
                Shadows.sm,
              ]}
            >
              <View style={styles.addressHeader}>
                <View style={styles.addressLabel}>
                  <Feather
                    name={
                      address.label === "Casa"
                        ? "home"
                        : address.label === "Trabajo"
                          ? "briefcase"
                          : "map-pin"
                    }
                    size={20}
                    color={NemyColors.primary}
                  />
                  <ThemedText type="h4" style={{ marginLeft: Spacing.sm }}>
                    {address.label}
                  </ThemedText>
                </View>
                {address.isDefault && (
                  <View
                    style={[
                      styles.defaultBadge,
                      { backgroundColor: NemyColors.success + "20" },
                    ]}
                  >
                    <ThemedText
                      type="caption"
                      style={{ color: NemyColors.success }}
                    >
                      Predeterminada
                    </ThemedText>
                  </View>
                )}
              </View>

              <ThemedText
                type="body"
                style={{ color: theme.textSecondary, marginTop: Spacing.sm }}
              >
                {address.street}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {address.city}, {address.state} {address.zipCode}
              </ThemedText>

              <View style={styles.addressActions}>
                {!address.isDefault && (
                  <Pressable
                    style={[
                      styles.actionButton,
                      { backgroundColor: theme.backgroundSecondary },
                    ]}
                    onPress={() => handleSetDefault(address.id)}
                  >
                    <Feather name="check" size={16} color={NemyColors.primary} />
                    <ThemedText
                      type="small"
                      style={{ color: NemyColors.primary, marginLeft: Spacing.xs }}
                    >
                      Predeterminada
                    </ThemedText>
                  </Pressable>
                )}
                <Pressable
                  style={[
                    styles.actionButton,
                    { backgroundColor: "#FFEBEE" },
                  ]}
                  onPress={() => handleDelete(address.id)}
                >
                  <Feather name="trash-2" size={16} color={NemyColors.error} />
                  <ThemedText
                    type="small"
                    style={{ color: NemyColors.error, marginLeft: Spacing.xs }}
                  >
                    Eliminar
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + Spacing.lg,
            backgroundColor: theme.backgroundDefault,
          },
        ]}
      >
        <Button
          onPress={() => navigation.navigate("AddAddress" as never)}
          style={styles.addButton}
        >
          <Feather name="plus" size={20} color="#FFFFFF" />
          <ThemedText
            type="body"
            style={{ color: "#FFFFFF", marginLeft: Spacing.sm }}
          >
            Agregar dirección
          </ThemedText>
        </Button>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["4xl"],
  },
  addressCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addressLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  defaultBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  addressActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
