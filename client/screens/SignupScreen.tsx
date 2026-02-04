import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  ImageBackground,
  Share,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, NemyColors, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { UserRole } from "@/types";
import { useToast } from "@/contexts/ToastContext";

const foodBgImage = require("../../assets/images/food-ingredients-bg.png");

type SignupScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Signup">;
  route: RouteProp<RootStackParamList, "Signup">;
};

const ROLES: {
  value: UserRole;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  description: string;
}[] = [
  {
    value: "customer",
    label: "Cliente",
    icon: "user",
    description: "Pide comida y productos",
  },
  {
    value: "business",
    label: "Negocio",
    icon: "shopping-bag",
    description: "Vende tus productos",
  },
  {
    value: "delivery",
    label: "Repartidor",
    icon: "truck",
    description: "Entrega pedidos",
  },
];

export default function SignupScreen({ navigation, route }: SignupScreenProps) {
  const { theme } = useTheme();
  const { signup } = useAuth();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const initialPhone = route.params?.phone || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState(initialPhone);
  const [role, setRole] = useState<UserRole>("customer");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatPhoneDisplay = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6)
      return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 10)}`;
  };

  const handlePhoneChange = (text: string) => {
    const numbers = text.replace(/\D/g, "").slice(0, 10);
    setPhone(numbers);
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  const validateEmail = (emailValue: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!email.trim()) {
      newErrors.email = "El correo es requerido";
    } else if (!validateEmail(email)) {
      newErrors.email = "Ingresa un correo válido";
    }

    if (!password) {
      newErrors.password = "La contraseña es requerida";
    } else if (password.length < 8) {
      newErrors.password = "Mínimo 8 caracteres";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (!phone) {
      newErrors.phone = "El teléfono es requerido";
    } else if (phone.length < 10) {
      newErrors.phone = "Ingresa 10 dígitos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const formattedPhone = `+52${phone}`;
      const result = await signup(name, role, formattedPhone, email, password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (result?.requiresVerification) {
        navigation.navigate("VerifyPhone", { phone: formattedPhone });
      }
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (error.message?.includes("already") || error.message?.includes("existe")) {
        showToast("Este correo o teléfono ya está registrado. Inicia sesión.", "error");
      } else {
        setErrors({ email: error.message || "Error al crear la cuenta" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message:
          "Descubre NEMY - Tu delivery local de confianza en Autlán. Pide comida y productos del mercado con un toque. Descarga ahora: https://nemy.replit.app",
        title: "NEMY - Delivery Local",
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  return (
    <ImageBackground
      source={foodBgImage}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + Spacing.lg,
              paddingBottom: insets.bottom + Spacing.xl,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <View style={styles.backButtonCircle}>
                <Feather name="arrow-left" size={24} color="#FFFFFF" />
              </View>
            </Pressable>
            <ThemedText type="hero" style={styles.title}>
              Crear cuenta
            </ThemedText>
            <ThemedText type="body" style={styles.subtitle}>
              Crea tu cuenta con correo y teléfono
            </ThemedText>
          </View>

          <View style={[styles.formCard, Shadows.lg]}>
            <Input
              label="Nombre completo"
              placeholder="Tu nombre"
              leftIcon="user"
              value={name}
              onChangeText={setName}
              error={errors.name}
              autoCapitalize="words"
              testID="input-name"
            />

            <Input
              label="Correo electrónico"
              placeholder="tu@email.com"
              leftIcon="mail"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              error={errors.email}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              testID="input-email"
            />

            <View style={styles.inputWrapper}>
              <ThemedText type="small" style={styles.inputLabel}>
                Contraseña
              </ThemedText>
              <View
                style={[
                  styles.inputBox,
                  errors.password ? styles.inputBoxError : null,
                ]}
              >
                <Feather
                  name="lock"
                  size={20}
                  color="#666666"
                  style={styles.inputBoxIcon}
                />
                <TextInput
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#999999"
                  style={styles.textInput}
                  selectionColor={NemyColors.primary}
                  testID="input-password"
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Feather
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#666666"
                  />
                </Pressable>
              </View>
              {errors.password ? (
                <ThemedText type="caption" style={styles.inputError}>
                  {errors.password}
                </ThemedText>
              ) : null}
            </View>

            <View style={styles.inputWrapper}>
              <ThemedText type="small" style={styles.inputLabel}>
                Confirmar contraseña
              </ThemedText>
              <View
                style={[
                  styles.inputBox,
                  errors.confirmPassword ? styles.inputBoxError : null,
                ]}
              >
                <Feather
                  name="lock"
                  size={20}
                  color="#666666"
                  style={styles.inputBoxIcon}
                />
                <TextInput
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                  }}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#999999"
                  style={styles.textInput}
                  selectionColor={NemyColors.primary}
                  testID="input-confirm-password"
                />
              </View>
              {errors.confirmPassword ? (
                <ThemedText type="caption" style={styles.inputError}>
                  {errors.confirmPassword}
                </ThemedText>
              ) : null}
            </View>

            <View style={styles.inputWrapper}>
              <ThemedText type="small" style={styles.inputLabel}>
                Número de teléfono
              </ThemedText>
              <View style={styles.phoneInputContainer}>
                <View style={styles.countryCode}>
                  <ThemedText type="body" style={styles.countryCodeText}>
                    +52
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.inputBox,
                    errors.phone ? styles.inputBoxError : null,
                  ]}
                >
                  <Feather
                    name="phone"
                    size={20}
                    color="#666666"
                    style={styles.inputBoxIcon}
                  />
                  <TextInput
                    placeholder="317 123 4567"
                    value={formatPhoneDisplay(phone)}
                    onChangeText={handlePhoneChange}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    placeholderTextColor="#999999"
                    style={styles.textInput}
                    selectionColor={NemyColors.primary}
                    maxLength={12}
                    testID="input-phone"
                  />
                </View>
              </View>
              {errors.phone ? (
                <ThemedText type="caption" style={styles.inputError}>
                  {errors.phone}
                </ThemedText>
              ) : null}
              <ThemedText type="caption" style={styles.phoneHint}>
                Te enviaremos un SMS para verificar tu número
              </ThemedText>
            </View>

            <ThemedText type="small" style={styles.roleLabel}>
              ¿Cómo quieres usar NEMY?
            </ThemedText>
            <View style={styles.rolesContainer}>
              {ROLES.map((r) => (
                <Pressable
                  key={r.value}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setRole(r.value);
                  }}
                  style={[
                    styles.roleCard,
                    {
                      backgroundColor:
                        role === r.value ? NemyColors.primaryLight : "#F5F5F5",
                      borderColor:
                        role === r.value ? NemyColors.primary : "#E0E0E0",
                      borderWidth: role === r.value ? 2 : 1,
                    },
                  ]}
                  testID={`role-${r.value}`}
                >
                  <View
                    style={[
                      styles.roleIcon,
                      {
                        backgroundColor:
                          role === r.value ? NemyColors.primary : "#E0E0E0",
                      },
                    ]}
                  >
                    <Feather
                      name={r.icon}
                      size={22}
                      color={role === r.value ? "#FFFFFF" : "#666666"}
                    />
                  </View>
                  <ThemedText
                    type="small"
                    style={{
                      fontWeight: "600",
                      textAlign: "center",
                      color: "#333333",
                    }}
                  >
                    {r.label}
                  </ThemedText>
                  <ThemedText
                    type="caption"
                    style={{
                      color: "#666666",
                      textAlign: "center",
                      fontSize: 10,
                    }}
                  >
                    {r.description}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            <Button
              onPress={handleSignup}
              disabled={isLoading}
              style={styles.signupButton}
              testID="button-signup"
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                "Crear cuenta"
              )}
            </Button>

            <ThemedText type="caption" style={styles.termsText}>
              Al registrarte aceptas nuestros términos y condiciones
            </ThemedText>
          </View>

          <Pressable onPress={handleShare} style={styles.shareButton}>
            <Feather name="share-2" size={18} color="#FFFFFF" />
            <ThemedText type="small" style={styles.shareText}>
              Compartir NEMY
            </ThemedText>
          </Pressable>

          <View style={styles.loginLink}>
            <ThemedText type="body" style={styles.loginText}>
              ¿Ya tienes cuenta?{" "}
            </ThemedText>
            <Pressable onPress={() => navigation.goBack()}>
              <ThemedText type="body" style={styles.loginLinkText}>
                Inicia sesión
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  backButton: {
    marginBottom: Spacing.md,
  },
  backButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#FFFFFF",
    textShadow: "1px 1px 3px rgba(0,0,0,0.5)",
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    marginTop: Spacing.xs,
  },
  formCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  inputWrapper: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    color: "#333333",
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  phoneInputContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  countryCode: {
    backgroundColor: "#F5F5F5",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    height: 52,
  },
  countryCodeText: {
    color: "#333333",
    fontWeight: "600",
  },
  inputBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    paddingHorizontal: Spacing.md,
    height: 52,
  },
  inputBoxError: {
    borderColor: NemyColors.error,
  },
  inputBoxIcon: {
    marginRight: Spacing.sm,
  },
  textInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#333333",
    letterSpacing: 1,
  },
  inputError: {
    color: NemyColors.error,
    marginTop: Spacing.xs,
  },
  phoneHint: {
    color: "#888888",
    marginTop: Spacing.xs,
  },
  roleLabel: {
    fontWeight: "600",
    marginBottom: Spacing.sm,
    color: "#333333",
  },
  rolesContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  roleCard: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  roleIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  signupButton: {
    marginTop: Spacing.xs,
  },
  termsText: {
    textAlign: "center",
    color: "#888888",
    marginTop: Spacing.md,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  shareText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  loginLink: {
    flexDirection: "row",
    justifyContent: "center",
  },
  loginText: {
    color: "rgba(255,255,255,0.8)",
  },
  loginLinkText: {
    color: NemyColors.primary,
    fontWeight: "600",
  },
});
