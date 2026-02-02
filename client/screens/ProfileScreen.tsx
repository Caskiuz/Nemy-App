import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Share,
  Linking,
  Modal,
  Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";

import { ThemedText } from "@/components/ThemedText";
import { Badge } from "@/components/Badge";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useApp, ThemeMode } from "@/contexts/AppContext";
import { Spacing, BorderRadius, NemyColors, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type ProfileScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

interface SettingsItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
}

function SettingsItem({
  icon,
  label,
  value,
  onPress,
  danger,
}: SettingsItemProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingsItem,
        {
          backgroundColor: pressed ? theme.backgroundSecondary : "transparent",
        },
      ]}
    >
      <View
        style={[
          styles.settingsIcon,
          { backgroundColor: danger ? "#FFEBEE" : theme.backgroundSecondary },
        ]}
      >
        <Feather
          name={icon}
          size={20}
          color={danger ? NemyColors.error : NemyColors.primary}
        />
      </View>
      <View style={styles.settingsContent}>
        <ThemedText
          type="body"
          style={{ color: danger ? NemyColors.error : theme.text }}
        >
          {label}
        </ThemedText>
        {value ? (
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {value}
          </ThemedText>
        ) : null}
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </Pressable>
  );
}

const themeOptions: { value: ThemeMode; label: string }[] = [
  { value: "system", label: "Sistema" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { theme, themeMode, setThemeMode } = useTheme();
  const { settings, updateSettings } = useApp();
  const { user, logout } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showAddressesModal, setShowAddressesModal] = useState(false);

  const getThemeLabel = (mode: ThemeMode) => {
    switch (mode) {
      case "system":
        return "Sistema";
      case "light":
        return "Claro";
      case "dark":
        return "Oscuro";
      default:
        return "Sistema";
    }
  };

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      console.log("Permisos de galería denegados");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message:
          "Descubre NEMY - Tu delivery local de confianza en Autlan. Pide comida y productos del mercado con un toque. https://nemy.replit.app",
        title: "NEMY - Delivery Local",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const shareToSocialMedia = (platform: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const message = encodeURIComponent(
      "Descubre NEMY - Tu delivery local de confianza en Autlan. Pide comida y productos del mercado con un toque.",
    );
    const url = encodeURIComponent("https://nemy.replit.app");

    let shareUrl = "";
    switch (platform) {
      case "whatsapp":
        shareUrl = `whatsapp://send?text=${message}%20${url}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${message}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${message}&url=${url}`;
        break;
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${url}&text=${message}`;
        break;
    }

    Linking.openURL(shareUrl).catch(() => {
      console.log("No se pudo abrir la aplicación");
    });
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowLogoutModal(false);
    await logout();
  };

  const handleThemeSelect = async (mode: ThemeMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setThemeMode(mode);
    setShowThemeModal(false);
  };

  const handleNotificationsToggle = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateSettings({ notificationsEnabled: value });
  };

  const getRoleLabel = () => {
    console.log('User role:', user?.role);
    switch (user?.role) {
      case "customer":
        return "Cliente";
      case "business":
        return "Negocio";
      case "delivery":
        return "Repartidor";
      case "admin":
        return "Administrador";
      default:
        return user?.role || "Usuario";
    }
  };

  return (
    <LinearGradient
      colors={[theme.gradientStart, theme.gradientEnd]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: headerHeight + Spacing.md,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.profileCard,
            { backgroundColor: theme.card },
            Shadows.md,
          ]}
        >
          <Pressable style={styles.avatarContainer} onPress={pickImage}>
            <Image
              source={
                profileImage
                  ? { uri: profileImage }
                  : require("../../assets/images/avatar-placeholder.png")
              }
              style={styles.avatar}
              contentFit="cover"
            />
            <View
              style={[
                styles.editBadge,
                { backgroundColor: NemyColors.primary },
              ]}
            >
              <Feather name="camera" size={14} color="#FFFFFF" />
            </View>
          </Pressable>
          <ThemedText type="h2" style={styles.userName}>
            {user?.name || "Usuario"}
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {user?.phone || "Sin teléfono"}
          </ThemedText>
          <Badge
            text={getRoleLabel()}
            variant="primary"
            style={{ marginTop: Spacing.sm }}
          />
        </View>

        <View
          style={[styles.section, { backgroundColor: theme.card }, Shadows.sm]}
        >
          <ThemedText type="h4" style={styles.sectionTitle}>
            Cuenta
          </ThemedText>
          <SettingsItem
            icon="user"
            label="Editar perfil"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("EditProfile");
            }}
          />
          <SettingsItem
            icon="map-pin"
            label="Direcciones guardadas"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("SavedAddresses");
            }}
          />
          <SettingsItem
            icon="credit-card"
            label="Métodos de pago"
            onPress={() => navigation.navigate("PaymentMethods")}
          />
          {user?.role === "customer" && (
            <SettingsItem
              icon="truck"
              label="Ser repartidor"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate("BecomeDriver");
              }}
            />
          )}
          {(user?.role === "delivery" || user?.role === "business") && (
            <SettingsItem
              icon="dollar-sign"
              label="Mi Billetera"
              onPress={() => navigation.navigate("Wallet")}
            />
          )}
        </View>

        <View
          style={[styles.section, { backgroundColor: theme.card }, Shadows.sm]}
        >
          <ThemedText type="h4" style={styles.sectionTitle}>
            Preferencias
          </ThemedText>
          <SettingsItem
            icon="moon"
            label="Tema"
            value={getThemeLabel(themeMode)}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowThemeModal(true);
            }}
          />
          <SettingsItem
            icon="bell"
            label="Notificaciones"
            value={settings.notificationsEnabled ? "Activadas" : "Desactivadas"}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowNotificationsModal(true);
            }}
          />
          <SettingsItem
            icon="globe"
            label="Idioma"
            value="Español"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowLanguageModal(true);
            }}
          />
        </View>

        <View
          style={[styles.section, { backgroundColor: theme.card }, Shadows.sm]}
        >
          <ThemedText type="h4" style={styles.sectionTitle}>
            Más
          </ThemedText>
          <SettingsItem
            icon="share-2"
            label="Compartir NEMY"
            onPress={handleShare}
          />
          <View style={styles.socialButtons}>
            <Pressable
              style={[styles.socialButton, { backgroundColor: "#25D366" }]}
              onPress={() => shareToSocialMedia("whatsapp")}
            >
              <Feather name="message-circle" size={20} color="#FFFFFF" />
            </Pressable>
            <Pressable
              style={[styles.socialButton, { backgroundColor: "#1877F2" }]}
              onPress={() => shareToSocialMedia("facebook")}
            >
              <Feather name="facebook" size={20} color="#FFFFFF" />
            </Pressable>
            <Pressable
              style={[styles.socialButton, { backgroundColor: "#1DA1F2" }]}
              onPress={() => shareToSocialMedia("twitter")}
            >
              <Feather name="twitter" size={20} color="#FFFFFF" />
            </Pressable>
            <Pressable
              style={[styles.socialButton, { backgroundColor: "#0088CC" }]}
              onPress={() => shareToSocialMedia("telegram")}
            >
              <Feather name="send" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
          <SettingsItem
            icon="help-circle"
            label="Ayuda y soporte"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("Support");
            }}
          />
          <SettingsItem
            icon="file-text"
            label="Términos y condiciones"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowTermsModal(true);
            }}
          />
          <SettingsItem
            icon="shield"
            label="Política de privacidad"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowPrivacyModal(true);
            }}
          />
        </View>

        <View
          style={[styles.section, { backgroundColor: theme.card }, Shadows.sm]}
        >
          <SettingsItem
            icon="log-out"
            label="Cerrar sesión"
            onPress={handleLogout}
            danger
          />
        </View>

        <ThemedText
          type="caption"
          style={[styles.version, { color: theme.textSecondary }]}
        >
          NEMY v1.0.0
        </ThemedText>
      </ScrollView>

      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowLogoutModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={[styles.modalIcon, { backgroundColor: "#FFEBEE" }]}>
              <Feather name="log-out" size={28} color={NemyColors.error} />
            </View>
            <ThemedText type="h3" style={styles.modalTitle}>
              Cerrar sesión
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.modalMessage, { color: theme.textSecondary }]}
            >
              ¿Estás seguro que deseas cerrar sesión?
            </ThemedText>
            <View style={styles.modalButtons}>
              <Pressable
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  { borderColor: theme.border },
                ]}
                onPress={() => setShowLogoutModal(false)}
              >
                <ThemedText type="body" style={{ color: theme.text }}>
                  Cancelar
                </ThemedText>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.logoutButton]}
                onPress={confirmLogout}
              >
                <ThemedText
                  type="body"
                  style={{ color: "#FFFFFF", fontWeight: "600" }}
                >
                  Cerrar sesión
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={showThemeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowThemeModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View
              style={[
                styles.modalIcon,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <Feather name="moon" size={28} color={NemyColors.primary} />
            </View>
            <ThemedText type="h3" style={styles.modalTitle}>
              Seleccionar tema
            </ThemedText>
            <View style={styles.themeOptions}>
              {themeOptions.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor:
                        themeMode === option.value
                          ? NemyColors.primaryLight
                          : theme.backgroundSecondary,
                      borderColor:
                        themeMode === option.value
                          ? NemyColors.primary
                          : "transparent",
                    },
                  ]}
                  onPress={() => handleThemeSelect(option.value)}
                >
                  <Feather
                    name={
                      option.value === "system"
                        ? "smartphone"
                        : option.value === "light"
                          ? "sun"
                          : "moon"
                    }
                    size={20}
                    color={
                      themeMode === option.value
                        ? NemyColors.primary
                        : theme.textSecondary
                    }
                  />
                  <ThemedText
                    type="body"
                    style={{
                      color:
                        themeMode === option.value
                          ? NemyColors.primary
                          : theme.text,
                      marginLeft: Spacing.sm,
                      fontWeight: themeMode === option.value ? "600" : "400",
                    }}
                  >
                    {option.label}
                  </ThemedText>
                  {themeMode === option.value ? (
                    <Feather
                      name="check"
                      size={20}
                      color={NemyColors.primary}
                      style={{ marginLeft: "auto" }}
                    />
                  ) : null}
                </Pressable>
              ))}
            </View>
            <Pressable
              style={[
                styles.modalButtonFull,
                { backgroundColor: theme.backgroundSecondary },
              ]}
              onPress={() => setShowThemeModal(false)}
            >
              <ThemedText type="body" style={{ color: theme.text }}>
                Cerrar
              </ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={showNotificationsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowNotificationsModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View
              style={[
                styles.modalIcon,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <Feather name="bell" size={28} color={NemyColors.primary} />
            </View>
            <ThemedText type="h3" style={styles.modalTitle}>
              Notificaciones
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.modalMessage, { color: theme.textSecondary }]}
            >
              Recibe alertas sobre tus pedidos y promociones especiales
            </ThemedText>
            <View style={styles.switchRow}>
              <ThemedText type="body" style={{ color: theme.text }}>
                Activar notificaciones
              </ThemedText>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                trackColor={{
                  false: theme.border,
                  true: NemyColors.primaryLight,
                }}
                thumbColor={
                  settings.notificationsEnabled ? NemyColors.primary : "#f4f3f4"
                }
              />
            </View>
            <Pressable
              style={[
                styles.modalButtonFull,
                { backgroundColor: NemyColors.primary },
              ]}
              onPress={() => setShowNotificationsModal(false)}
            >
              <ThemedText
                type="body"
                style={{ color: "#FFFFFF", fontWeight: "600" }}
              >
                Listo
              </ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowLanguageModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View
              style={[
                styles.modalIcon,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <Feather name="globe" size={28} color={NemyColors.primary} />
            </View>
            <ThemedText type="h3" style={styles.modalTitle}>
              Idioma
            </ThemedText>
            <View style={styles.themeOptions}>
              <View
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: NemyColors.primaryLight,
                    borderColor: NemyColors.primary,
                  },
                ]}
              >
                <ThemedText
                  type="body"
                  style={{ color: NemyColors.primary, fontWeight: "600" }}
                >
                  Español
                </ThemedText>
                <Feather
                  name="check"
                  size={20}
                  color={NemyColors.primary}
                  style={{ marginLeft: "auto" }}
                />
              </View>
            </View>
            <ThemedText
              type="small"
              style={[styles.comingSoon, { color: theme.textSecondary }]}
            >
              Más idiomas próximamente...
            </ThemedText>
            <Pressable
              style={[
                styles.modalButtonFull,
                { backgroundColor: theme.backgroundSecondary },
              ]}
              onPress={() => setShowLanguageModal(false)}
            >
              <ThemedText type="body" style={{ color: theme.text }}>
                Cerrar
              </ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={showTermsModal}
        animationType="slide"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View
          style={[
            styles.fullScreenModal,
            { backgroundColor: theme.backgroundRoot, paddingTop: insets.top },
          ]}
        >
          <View
            style={[
              styles.fullScreenHeader,
              { borderBottomColor: theme.border },
            ]}
          >
            <ThemedText type="h3">Términos y condiciones</ThemedText>
            <Pressable
              style={[
                styles.closeButton,
                { backgroundColor: theme.backgroundSecondary },
              ]}
              onPress={() => setShowTermsModal(false)}
            >
              <Feather name="x" size={24} color={theme.text} />
            </Pressable>
          </View>
          <ScrollView
            style={styles.fullScreenContent}
            contentContainerStyle={{
              padding: Spacing.lg,
              paddingBottom: insets.bottom + Spacing.xl,
            }}
          >
            <View
              style={[styles.placeholderCard, { backgroundColor: theme.card }]}
            >
              <Feather name="file-text" size={48} color={theme.textSecondary} />
              <ThemedText
                type="h4"
                style={{ marginTop: Spacing.lg, textAlign: "center" }}
              >
                Contenido de términos y condiciones próximamente...
              </ThemedText>
              <ThemedText
                type="small"
                style={{
                  color: theme.textSecondary,
                  marginTop: Spacing.sm,
                  textAlign: "center",
                }}
              >
                Estamos preparando los términos y condiciones de uso de NEMY.
                Por favor, vuelve a consultar pronto.
              </ThemedText>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View
          style={[
            styles.fullScreenModal,
            { backgroundColor: theme.backgroundRoot, paddingTop: insets.top },
          ]}
        >
          <View
            style={[
              styles.fullScreenHeader,
              { borderBottomColor: theme.border },
            ]}
          >
            <ThemedText type="h3">Política de privacidad</ThemedText>
            <Pressable
              style={[
                styles.closeButton,
                { backgroundColor: theme.backgroundSecondary },
              ]}
              onPress={() => setShowPrivacyModal(false)}
            >
              <Feather name="x" size={24} color={theme.text} />
            </Pressable>
          </View>
          <ScrollView
            style={styles.fullScreenContent}
            contentContainerStyle={{
              padding: Spacing.lg,
              paddingBottom: insets.bottom + Spacing.xl,
            }}
          >
            <View
              style={[styles.placeholderCard, { backgroundColor: theme.card }]}
            >
              <Feather name="shield" size={48} color={theme.textSecondary} />
              <ThemedText
                type="h4"
                style={{ marginTop: Spacing.lg, textAlign: "center" }}
              >
                Política de privacidad próximamente...
              </ThemedText>
              <ThemedText
                type="small"
                style={{
                  color: theme.textSecondary,
                  marginTop: Spacing.sm,
                  textAlign: "center",
                }}
              >
                Estamos preparando nuestra política de privacidad. Tu
                información está protegida.
              </ThemedText>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={showEditProfileModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditProfileModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowEditProfileModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View
              style={[
                styles.modalIcon,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <Feather name="user" size={28} color={NemyColors.primary} />
            </View>
            <ThemedText type="h3" style={styles.modalTitle}>
              Editar perfil
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.modalMessage, { color: theme.textSecondary }]}
            >
              Esta función estará disponible próximamente. Podrás editar tu
              nombre, foto y datos personales.
            </ThemedText>
            <Pressable
              style={[
                styles.modalButtonFull,
                { backgroundColor: NemyColors.primary },
              ]}
              onPress={() => setShowEditProfileModal(false)}
            >
              <ThemedText
                type="body"
                style={{ color: "#FFFFFF", fontWeight: "600" }}
              >
                Entendido
              </ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={showAddressesModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddressesModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAddressesModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View
              style={[
                styles.modalIcon,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <Feather name="map-pin" size={28} color={NemyColors.primary} />
            </View>
            <ThemedText type="h3" style={styles.modalTitle}>
              Direcciones guardadas
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.modalMessage, { color: theme.textSecondary }]}
            >
              Esta función estará disponible próximamente. Podrás gestionar tus
              direcciones de entrega favoritas.
            </ThemedText>
            <Pressable
              style={[
                styles.modalButtonFull,
                { backgroundColor: NemyColors.primary },
              ]}
              onPress={() => setShowAddressesModal(false)}
            >
              <ThemedText
                type="body"
                style={{ color: "#FFFFFF", fontWeight: "600" }}
              >
                Entendido
              </ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </LinearGradient>
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
    paddingHorizontal: Spacing.lg,
  },
  profileCard: {
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  userName: {
    marginBottom: Spacing.xs,
  },
  section: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  sectionTitle: {
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  settingsContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  version: {
    textAlign: "center",
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
  },
  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  modalMessage: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonFull: {
    width: "100%",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
  },
  cancelButton: {
    borderWidth: 1,
  },
  logoutButton: {
    backgroundColor: NemyColors.error,
  },
  themeOptions: {
    width: "100%",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  comingSoon: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  fullScreenModal: {
    flex: 1,
  },
  fullScreenHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenContent: {
    flex: 1,
  },
  placeholderCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
});
