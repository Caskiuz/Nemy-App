import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  Image,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Share,
  Platform,
  Dimensions,
  FlatList,
  TextInput,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, NemyColors, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { LinearGradient } from "expo-linear-gradient";
import { useToast } from "@/contexts/ToastContext";
import { apiRequest } from "@/lib/query-client";

const { width: screenWidth } = Dimensions.get("window");

interface FeaturedBusiness {
  id: string;
  name: string;
  image?: string;
  type: string;
  rating: number;
  deliveryTime?: string;
}

const autlanBgImage = require("../../assets/images/autlan-background.jpg");

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Login">;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { theme } = useTheme();
  const {
    requestPhoneLogin,
    loginWithBiometric,
    biometricAvailable,
    biometricType,
  } = useAuth();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string }>({});
  const [featuredBusinesses, setFeaturedBusinesses] = useState<
    FeaturedBusiness[]
  >([]);
  const [showBiometricOption, setShowBiometricOption] = useState(false);

  useEffect(() => {
    fetchFeaturedBusinesses();
    checkBiometricLogin();
  }, []);

  const fetchFeaturedBusinesses = async () => {
    try {
      const res = await apiRequest("GET", "/api/businesses/featured");
      const data = await res.json();
      setFeaturedBusinesses(data.businesses || []);
    } catch (error) {
      console.log("Could not fetch featured businesses");
    }
  };

  const checkBiometricLogin = async () => {
    if (biometricAvailable) {
      const storedPhone = await import(
        "@react-native-async-storage/async-storage"
      ).then((m) => m.default.getItem("@nemy_biometric_phone"));
      setShowBiometricOption(!!storedPhone);
    }
  };

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
    if (errors.phone) setErrors({});
  };

  const validate = () => {
    const newErrors: { phone?: string } = {};

    if (!phone) {
      newErrors.phone = "El teléfono es requerido";
    } else if (phone.length < 10) {
      newErrors.phone = "Ingresa 10 dígitos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneLogin = async () => {
    if (!validate()) return;

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Format phone with +52 prefix for Mexico
      const formattedPhone = `+52 ${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
      const result = await requestPhoneLogin(formattedPhone);

      if (result?.userNotFound) {
        showToast("No encontramos tu cuenta. Regístrate primero.", "info");
        navigation.navigate("Signup", { phone: formattedPhone });
        return;
      }

      if (result?.requiresVerification) {
        navigation.navigate("VerifyPhone", { phone: formattedPhone });
      }
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(error.message || "Error al enviar código", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setIsBiometricLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const success = await loginWithBiometric();
      if (!success) {
        showToast("No se pudo verificar tu identidad", "error");
      }
    } catch (error) {
      showToast("Error con autenticación biométrica", "error");
    } finally {
      setIsBiometricLoading(false);
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

  const getBiometricIcon = () => {
    if (biometricType === "face") return "smile";
    return "lock";
  };

  const getBiometricLabel = () => {
    if (biometricType === "face") return "Face ID";
    return "Huella digital";
  };

  return (
    <ImageBackground
      source={autlanBgImage}
      style={styles.container}
      resizeMode="cover"
    >
      <View
        style={[styles.themeToggleContainer, { top: insets.top + Spacing.md }]}
      >
        <ThemeToggleButton />
      </View>
      <KeyboardAvoidingView style={styles.overlay} behavior="padding">
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + Spacing.xl,
              paddingBottom: insets.bottom + Spacing.xl,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText type="hero" style={styles.appName}>
              NEMY
            </ThemedText>
            <ThemedText type="body" style={styles.slogan}>
              vivir es conectar
            </ThemedText>
          </View>

          <BlurView
            intensity={80}
            tint="light"
            style={[styles.formCard, Shadows.lg]}
          >
            <ThemedText type="h3" style={styles.formTitle}>
              Inicia sesión
            </ThemedText>
            <ThemedText type="body" style={styles.formSubtitle}>
              Te enviaremos un código SMS para verificar
            </ThemedText>

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
                <View style={styles.inputBox}>
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
            </View>

            <Button
              onPress={handlePhoneLogin}
              disabled={isLoading}
              style={styles.loginButton}
              testID="button-login"
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                "Enviar código SMS"
              )}
            </Button>

            {showBiometricOption && biometricAvailable ? (
              <>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <ThemedText type="caption" style={styles.dividerText}>
                    o usa
                  </ThemedText>
                  <View style={styles.dividerLine} />
                </View>

                <Pressable
                  onPress={handleBiometricLogin}
                  disabled={isBiometricLoading}
                  style={[styles.biometricButton, Shadows.sm]}
                  testID="button-biometric"
                >
                  {isBiometricLoading ? (
                    <ActivityIndicator
                      color={NemyColors.primary}
                      size="small"
                    />
                  ) : (
                    <>
                      <View style={styles.biometricIcon}>
                        <Feather
                          name={getBiometricIcon()}
                          size={22}
                          color={NemyColors.primary}
                        />
                      </View>
                      <ThemedText type="body" style={styles.biometricText}>
                        Entrar con {getBiometricLabel()}
                      </ThemedText>
                    </>
                  )}
                </Pressable>
              </>
            ) : null}
          </BlurView>

          {featuredBusinesses.length > 0 ? (
            <View style={styles.featuredSection}>
              <ThemedText type="body" style={styles.featuredTitle}>
                Negocios destacados
              </ThemedText>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={featuredBusinesses}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.featuredList}
                renderItem={({ item }) => (
                  <Pressable style={styles.featuredCard}>
                    {item.image ? (
                      <Image
                        source={{ uri: item.image }}
                        style={styles.featuredImage}
                        resizeMode="cover"
                        onError={() => {
                          // Handle image load error silently
                        }}
                      />
                    ) : (
                      <PlaceholderImage
                        width={140}
                        height={100}
                        icon="store"
                        style={styles.featuredImage}
                      />
                    )}
                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.8)"]}
                      style={styles.featuredGradient}
                    >
                      <ThemedText
                        type="small"
                        style={styles.featuredName}
                        numberOfLines={1}
                      >
                        {item.name}
                      </ThemedText>
                      <View style={styles.featuredMeta}>
                        <Feather
                          name="star"
                          size={12}
                          color={NemyColors.primary}
                        />
                        <ThemedText
                          type="caption"
                          style={styles.featuredRating}
                        >
                          {((item.rating || 0) / 10).toFixed(1)}
                        </ThemedText>
                        {item.deliveryTime ? (
                          <ThemedText
                            type="caption"
                            style={styles.featuredTime}
                          >
                            {item.deliveryTime}
                          </ThemedText>
                        ) : null}
                      </View>
                    </LinearGradient>
                  </Pressable>
                )}
              />
            </View>
          ) : null}

          <Pressable
            onPress={() => navigation.navigate("Carnival")}
            style={styles.carnivalButton}
          >
            <LinearGradient
              colors={[NemyColors.carnival.pink, "#9C27B0"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.carnivalGradient}
            >
              <Feather name="calendar" size={20} color="#FFFFFF" />
              <ThemedText type="body" style={styles.carnivalText}>
                Programa Carnaval 2026
              </ThemedText>
              <Feather name="chevron-right" size={20} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>

          <Pressable onPress={handleShare} style={styles.shareButton}>
            <Feather name="share-2" size={18} color="#FFFFFF" />
            <ThemedText type="small" style={styles.shareText}>
              Compartir NEMY
            </ThemedText>
          </Pressable>

          <View style={styles.footer}>
            <ThemedText type="body" style={styles.footerText}>
              ¿No tienes cuenta?{" "}
            </ThemedText>
            <Pressable onPress={() => navigation.navigate("Signup")}>
              <ThemedText type="body" style={styles.signupLink}>
                Regístrate
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.contactInfo}>
            <ThemedText type="caption" style={styles.contactText}>
              ¿Problemas para entrar? Llámanos o escríbenos:
            </ThemedText>
            <View style={styles.contactButtons}>
              <Pressable style={styles.contactButton}>
                <Feather name="phone" size={16} color="#FFFFFF" />
                <ThemedText type="caption" style={styles.contactButtonText}>
                  Llamar
                </ThemedText>
              </Pressable>
              <Pressable style={styles.contactButton}>
                <Feather name="message-circle" size={16} color="#FFFFFF" />
                <ThemedText type="caption" style={styles.contactButtonText}>
                  WhatsApp
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  themeToggleContainer: {
    position: "absolute",
    right: Spacing.lg,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: Spacing.sm,
  },
  appName: {
    color: "#FFFFFF",
    marginBottom: Spacing.xs,
    textShadow: "1px 1px 3px rgba(0,0,0,0.5)",
  },
  slogan: {
    color: NemyColors.primary,
    fontStyle: "italic",
    fontWeight: "500",
    textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
  },
  formCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  formTitle: {
    textAlign: "center",
    color: "#333333",
    marginBottom: Spacing.xs,
  },
  formSubtitle: {
    textAlign: "center",
    color: "#666666",
    marginBottom: Spacing.lg,
    fontSize: 14,
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
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    paddingHorizontal: Spacing.md,
    height: 52,
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
  loginButton: {
    marginTop: Spacing.sm,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    color: "#888888",
    marginHorizontal: Spacing.md,
  },
  biometricButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: NemyColors.primary,
    gap: Spacing.sm,
  },
  biometricIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: NemyColors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  biometricText: {
    fontWeight: "600",
    color: NemyColors.primary,
  },
  carnivalButton: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  carnivalGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  carnivalText: {
    color: "#FFFFFF",
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  shareText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  footerText: {
    color: "rgba(255,255,255,0.8)",
  },
  signupLink: {
    color: NemyColors.primary,
    fontWeight: "600",
  },
  contactInfo: {
    alignItems: "center",
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  contactText: {
    color: "rgba(255,255,255,0.7)",
    marginBottom: Spacing.sm,
  },
  contactButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  contactButtonText: {
    color: "#FFFFFF",
  },
  featuredSection: {
    marginBottom: Spacing.lg,
  },
  featuredTitle: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: Spacing.sm,
    textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
  },
  featuredList: {
    paddingRight: Spacing.md,
    gap: Spacing.md,
  },
  featuredCard: {
    width: 140,
    height: 100,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    backgroundColor: "#333",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  featuredGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.sm,
  },
  featuredName: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 12,
  },
  featuredMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  featuredRating: {
    color: "#FFFFFF",
    fontSize: 10,
  },
  featuredTime: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    marginLeft: 4,
  },
});
