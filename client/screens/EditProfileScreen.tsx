import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Spacing, BorderRadius, NemyColors, Shadows } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Editar perfil",
    });
  }, [navigation]);

  const validateForm = () => {
    const newErrors: { name?: string; phone?: string } = {};

    if (!name.trim()) {
      newErrors.name = "El nombre es requerido";
    } else if (name.trim().length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres";
    }

    if (!phone.trim()) {
      newErrors.phone = "El teléfono es requerido";
    } else if (phone.trim().length < 10) {
      newErrors.phone = "Ingresa un número de teléfono válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !user?.id) return;

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await apiRequest("PUT", `/api/users/${user.id}`, {
        name: name.trim(),
        phone: phone.trim(),
      });

      const data = await response.json();

      if (data.user) {
        await updateUser({
          name: data.user.name,
          phone: data.user.phone,
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast("Perfil actualizado correctamente", "success");
        navigation.goBack();
      } else {
        throw new Error(data.error || "Error al actualizar perfil");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(error.message || "No se pudo actualizar el perfil", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.avatarSection,
            { backgroundColor: theme.card },
            Shadows.md,
          ]}
        >
          <View
            style={[
              styles.avatar,
              { backgroundColor: NemyColors.primary + "20" },
            ]}
          >
            <Feather name="user" size={40} color={NemyColors.primary} />
          </View>
          <ThemedText
            type="caption"
            style={{ color: theme.textSecondary, marginTop: Spacing.sm }}
          >
            Tu información de perfil
          </ThemedText>
        </View>

        <View
          style={[
            styles.formSection,
            { backgroundColor: theme.card },
            Shadows.sm,
          ]}
        >
          <Input
            label="Nombre completo"
            leftIcon="user"
            value={name}
            onChangeText={setName}
            error={errors.name}
            placeholder="Tu nombre"
            autoCapitalize="words"
            autoCorrect={false}
          />

          <Input
            label="Teléfono"
            leftIcon="phone"
            value={phone}
            onChangeText={setPhone}
            error={errors.phone}
            placeholder="+52 xxx xxx xxxx"
            keyboardType="phone-pad"
            autoCorrect={false}
          />

          <View
            style={[
              styles.emailRow,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <Feather name="mail" size={20} color={theme.textSecondary} />
            <View style={styles.emailContent}>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Correo electrónico
              </ThemedText>
              <ThemedText type="body">{user?.email}</ThemedText>
            </View>
            <View
              style={[
                styles.verifiedBadge,
                { backgroundColor: NemyColors.success + "20" },
              ]}
            >
              <Feather name="check" size={12} color={NemyColors.success} />
            </View>
          </View>
        </View>

        <View
          style={[
            styles.infoBox,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <Feather name="info" size={20} color={NemyColors.primary} />
          <ThemedText
            type="caption"
            style={{
              flex: 1,
              color: theme.textSecondary,
              marginLeft: Spacing.sm,
            }}
          >
            Tu correo electrónico no puede ser modificado por seguridad de tu
            cuenta.
          </ThemedText>
        </View>
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
          onPress={handleSave}
          disabled={isSaving}
          loading={isSaving}
          style={styles.saveButton}
        >
          Guardar cambios
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
    paddingHorizontal: Spacing.lg,
  },
  avatarSection: {
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  formSection: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  emailContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  saveButton: {
    width: "100%",
  },
});
