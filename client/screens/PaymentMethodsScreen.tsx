import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Constants from "expo-constants";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, NemyColors, Shadows } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { useToast } from "@/contexts/ToastContext";
import { ConfirmModal } from "@/components/ConfirmModal";

const isExpoGo = Constants.appOwnership === "expo";

interface CardInfo {
  last4: string;
  brand: string;
}

export default function PaymentMethodsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [savedCard, setSavedCard] = useState<CardInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [StripeComponents, setStripeComponents] = useState<any>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stripeNotAvailable, setStripeNotAvailable] = useState(false);

  useEffect(() => {
    fetchSavedCard();
    loadStripeIfNeeded();
  }, []);

  const loadStripeIfNeeded = async () => {
    if (Platform.OS !== "web" && !isExpoGo) {
      try {
        const stripe = await import("@stripe/stripe-react-native");
        setStripeComponents(stripe);
      } catch (error) {
        console.log("Stripe native not available in this environment");
        setStripeNotAvailable(true);
      }
    } else {
      setStripeNotAvailable(true);
    }
  };

  const fetchSavedCard = async () => {
    if (!user?.id) return;

    try {
      const { getAuthToken } = await import("@/lib/query-client");
      const token = await getAuthToken();
      
      const response = await fetch(
        new URL(
          `/api/stripe/payment-method/${user.id}`,
          getApiUrl(),
        ).toString(),
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();

      if (data.hasCard) {
        setSavedCard(data.card);
      }
    } catch (error) {
      console.error("Error fetching saved card:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCard = async () => {
    if (!user?.id) return;

    if (Platform.OS === "web") {
      showToast(
        "Para registrar tu tarjeta, usa la app movil NEMY escaneando el codigo QR.",
        "info",
      );
      return;
    }

    if (!cardComplete || !StripeComponents) {
      showToast("Por favor completa los datos de la tarjeta", "warning");
      return;
    }

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const setupResponse = await fetch(
        new URL("/api/stripe/create-setup-intent", getApiUrl()).toString(),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        },
      );
      const { clientSecret, error: setupError } = await setupResponse.json();

      if (setupError) {
        throw new Error(setupError);
      }

      const { confirmSetupIntent } = StripeComponents;
      const { setupIntent, error } = await confirmSetupIntent(clientSecret, {
        paymentMethodType: "Card",
      });

      if (error) {
        throw new Error(error.message);
      }

      if (setupIntent?.paymentMethodId) {
        const saveResponse = await fetch(
          new URL("/api/stripe/save-payment-method", getApiUrl()).toString(),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              paymentMethodId: setupIntent.paymentMethodId,
            }),
          },
        );
        const saveData = await saveResponse.json();

        if (saveData.success) {
          setSavedCard(saveData.card);
          setShowAddCard(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          showToast("Tu tarjeta ha sido registrada correctamente", "success");
        }
      }
    } catch (error: any) {
      console.error("Error saving card:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(error.message || "No se pudo guardar la tarjeta", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCard = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteCard = async () => {
    if (!user?.id) return;
    setShowDeleteModal(false);

    try {
      const { getAuthToken } = await import("@/lib/query-client");
      const token = await getAuthToken();
      
      const response = await fetch(
        new URL(
          `/api/stripe/payment-method/${user.id}`,
          getApiUrl(),
        ).toString(),
        { 
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();

      if (data.success) {
        setSavedCard(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast("Tarjeta eliminada", "success");
      }
    } catch (error) {
      console.error("Error deleting card:", error);
      showToast("No se pudo eliminar la tarjeta", "error");
    }
  };

  const getCardBrandName = (brand: string) => {
    switch (brand.toLowerCase()) {
      case "visa":
        return "Visa";
      case "mastercard":
        return "Mastercard";
      case "amex":
        return "American Express";
      default:
        return brand.charAt(0).toUpperCase() + brand.slice(1);
    }
  };

  const renderCardField = () => {
    if (stripeNotAvailable) {
      return (
        <View
          style={[
            styles.stripeNotAvailable,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <Feather name="smartphone" size={48} color={NemyColors.primary} />
          <ThemedText
            type="body"
            style={{
              textAlign: "center",
              marginTop: Spacing.md,
              fontWeight: "600",
            }}
          >
            Usa la app NEMY en tu celular
          </ThemedText>
          <ThemedText
            type="small"
            style={{
              textAlign: "center",
              color: theme.textSecondary,
              marginTop: Spacing.xs,
            }}
          >
            Para mayor seguridad, el registro de tarjetas solo esta disponible
            en la app nativa de NEMY.
          </ThemedText>
          <ThemedText
            type="caption"
            style={{
              textAlign: "center",
              color: theme.textSecondary,
              marginTop: Spacing.md,
            }}
          >
            Escanea el codigo QR desde la barra superior para abrir la app en tu
            celular.
          </ThemedText>
        </View>
      );
    }

    if (!StripeComponents) {
      return (
        <View style={styles.loadingCard}>
          <ActivityIndicator size="small" color={NemyColors.primary} />
          <ThemedText type="small" style={{ marginTop: Spacing.sm }}>
            Cargando formulario de tarjeta...
          </ThemedText>
        </View>
      );
    }

    const { CardField } = StripeComponents;

    return (
      <CardField
        postalCodeEnabled={false}
        placeholders={{
          number: "4242 4242 4242 4242",
        }}
        cardStyle={{
          backgroundColor: theme.backgroundSecondary,
          textColor: theme.text,
          borderRadius: BorderRadius.md,
          fontSize: 16,
          placeholderColor: theme.textSecondary,
        }}
        style={styles.cardField}
        onCardChange={(cardDetails: any) => {
          setCardComplete(cardDetails.complete);
        }}
      />
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={NemyColors.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: headerHeight + Spacing.md }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h3">Métodos de pago</ThemedText>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText
          type="body"
          style={[styles.description, { color: theme.textSecondary }]}
        >
          Registra una tarjeta para pagos automáticos al recibir tus pedidos
        </ThemedText>

        {savedCard ? (
          <View
            style={[
              styles.cardContainer,
              { backgroundColor: theme.card },
              Shadows.md,
            ]}
          >
            <View style={styles.cardInfo}>
              <View
                style={[
                  styles.cardIconContainer,
                  { backgroundColor: NemyColors.primary + "20" },
                ]}
              >
                <Feather
                  name="credit-card"
                  size={24}
                  color={NemyColors.primary}
                />
              </View>
              <View style={styles.cardDetails}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {getCardBrandName(savedCard.brand)}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Termina en {savedCard.last4}
                </ThemedText>
              </View>
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
                  Activa
                </ThemedText>
              </View>
            </View>
            <Pressable
              onPress={handleDeleteCard}
              style={[
                styles.deleteButton,
                { backgroundColor: NemyColors.error + "10" },
              ]}
            >
              <Feather name="trash-2" size={18} color={NemyColors.error} />
              <ThemedText
                type="small"
                style={{ color: NemyColors.error, marginLeft: Spacing.xs }}
              >
                Eliminar
              </ThemedText>
            </Pressable>
          </View>
        ) : showAddCard ? (
          <View
            style={[
              styles.addCardForm,
              { backgroundColor: theme.card },
              Shadows.md,
            ]}
          >
            <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
              Agregar tarjeta
            </ThemedText>
            {renderCardField()}
            {stripeNotAvailable ? (
              <Pressable
                onPress={() => setShowAddCard(false)}
                style={[styles.cancelButtonFull, { borderColor: theme.border }]}
              >
                <ThemedText type="body">Cerrar</ThemedText>
              </Pressable>
            ) : (
              <View style={styles.formButtons}>
                <Pressable
                  onPress={() => setShowAddCard(false)}
                  style={[styles.cancelButton, { borderColor: theme.border }]}
                >
                  <ThemedText type="body">Cancelar</ThemedText>
                </Pressable>
                <Button
                  onPress={handleAddCard}
                  disabled={!cardComplete || isSaving}
                  style={styles.saveButton}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    "Guardar"
                  )}
                </Button>
              </View>
            )}
          </View>
        ) : (
          <Pressable
            onPress={() => setShowAddCard(true)}
            style={[
              styles.addCardButton,
              { backgroundColor: theme.card, borderColor: theme.border },
              Shadows.sm,
            ]}
          >
            <View
              style={[
                styles.addCardIcon,
                { backgroundColor: NemyColors.primary + "20" },
              ]}
            >
              <Feather name="plus" size={24} color={NemyColors.primary} />
            </View>
            <ThemedText type="body" style={{ flex: 1, fontWeight: "500" }}>
              Agregar tarjeta
            </ThemedText>
            <Feather
              name="chevron-right"
              size={20}
              color={theme.textSecondary}
            />
          </Pressable>
        )}

        <View
          style={[
            styles.infoBox,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <Feather name="shield" size={20} color={NemyColors.primary} />
          <View style={styles.infoContent}>
            <ThemedText
              type="small"
              style={{ fontWeight: "600", marginBottom: 4 }}
            >
              Pagos seguros
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Tus datos de tarjeta están protegidos con encriptación de grado
              bancario por Stripe
            </ThemedText>
          </View>
        </View>

        <View
          style={[
            styles.benefitsBox,
            { backgroundColor: theme.card },
            Shadows.sm,
          ]}
        >
          <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
            Beneficios de registrar tu tarjeta
          </ThemedText>
          <View style={styles.benefitItem}>
            <View
              style={[
                styles.benefitIcon,
                { backgroundColor: NemyColors.success + "20" },
              ]}
            >
              <Feather name="zap" size={16} color={NemyColors.success} />
            </View>
            <ThemedText type="small" style={{ flex: 1 }}>
              Pagos automáticos al recibir tu pedido
            </ThemedText>
          </View>
          <View style={styles.benefitItem}>
            <View
              style={[
                styles.benefitIcon,
                { backgroundColor: NemyColors.success + "20" },
              ]}
            >
              <Feather name="clock" size={16} color={NemyColors.success} />
            </View>
            <ThemedText type="small" style={{ flex: 1 }}>
              Checkout más rápido sin ingresar datos
            </ThemedText>
          </View>
          <View style={styles.benefitItem}>
            <View
              style={[
                styles.benefitIcon,
                { backgroundColor: NemyColors.success + "20" },
              ]}
            >
              <Feather name="star" size={16} color={NemyColors.success} />
            </View>
            <ThemedText type="small" style={{ flex: 1 }}>
              Acceso a promociones exclusivas
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      <ConfirmModal
        visible={showDeleteModal}
        title="Eliminar tarjeta"
        message="Estas seguro que deseas eliminar tu tarjeta guardada?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDeleteCard}
        onCancel={() => setShowDeleteModal(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  description: {
    marginBottom: Spacing.xl,
  },
  cardContainer: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  cardInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  cardDetails: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  defaultBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  addCardButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    marginBottom: Spacing.lg,
  },
  addCardIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  addCardForm: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  cardField: {
    width: "100%",
    height: 50,
    marginBottom: Spacing.lg,
  },
  webCardInfo: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  loadingCard: {
    padding: Spacing.lg,
    alignItems: "center",
  },
  stripeNotAvailable: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  cancelButtonFull: {
    width: "100%",
    height: Spacing.buttonHeight,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  formButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    height: Spacing.buttonHeight,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  saveButton: {
    flex: 1,
  },
  infoBox: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  benefitsBox: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  manualCardForm: {
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    marginBottom: Spacing.xs,
    fontSize: 12,
  },
  textInput: {
    height: 48,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    borderWidth: 1,
  },
  rowInputs: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
});
