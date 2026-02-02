import React from "react";
import { View, StyleSheet, Modal, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, NemyColors } from "@/constants/theme";

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  icon?: keyof typeof Feather.glyphMap;
  iconColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmColor = NemyColors.primary,
  icon = "alert-circle",
  iconColor = NemyColors.primary,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <View style={[styles.content, { backgroundColor: theme.card }]}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: iconColor + "15" },
            ]}
          >
            <Feather name={icon} size={28} color={iconColor} />
          </View>
          <ThemedText type="h3" style={styles.title}>
            {title}
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.message, { color: theme.textSecondary }]}
          >
            {message}
          </ThemedText>
          <View style={styles.buttons}>
            <Pressable
              style={[
                styles.button,
                styles.cancelButton,
                { borderColor: theme.border },
              ]}
              onPress={onCancel}
            >
              <ThemedText type="body" style={{ color: theme.text }}>
                {cancelText}
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.button, { backgroundColor: confirmColor }]}
              onPress={onConfirm}
            >
              <ThemedText
                type="body"
                style={{ color: "#FFFFFF", fontWeight: "600" }}
              >
                {confirmText}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  content: {
    width: "100%",
    maxWidth: 340,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  message: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  buttons: {
    flexDirection: "row",
    gap: Spacing.md,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    borderWidth: 1,
  },
});
