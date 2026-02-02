import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  TextInput,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Spacing, BorderRadius, NemyColors, Shadows } from "@/constants/theme";
import { apiRequest, getApiUrl } from "@/lib/query-client";

interface Wallet {
  id: string;
  userId: string;
  balance: number;
  pendingBalance: number;
  totalEarnings: number;
  currency: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
}

interface WalletData {
  wallet: Wallet;
  transactions: Transaction[];
}

function TransactionItem({
  transaction,
  theme,
}: {
  transaction: Transaction;
  theme: any;
}) {
  const isPositive = transaction.amount > 0;
  const iconMap: Record<string, string> = {
    income: "arrow-down-circle",
    withdrawal: "arrow-up-circle",
    refund: "refresh-cw",
    commission: "percent",
  };

  return (
    <View style={[styles.transactionItem, { backgroundColor: theme.card }]}>
      <View
        style={[
          styles.transactionIcon,
          {
            backgroundColor: isPositive
              ? NemyColors.success + "20"
              : NemyColors.error + "20",
          },
        ]}
      >
        <Feather
          name={(iconMap[transaction.type] || "credit-card") as any}
          size={20}
          color={isPositive ? NemyColors.success : NemyColors.error}
        />
      </View>
      <View style={styles.transactionContent}>
        <ThemedText type="body" style={{ fontWeight: "600" }}>
          {transaction.description}
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          {new Date(transaction.createdAt).toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </ThemedText>
      </View>
      <ThemedText
        type="body"
        style={{
          fontWeight: "700",
          color: isPositive ? NemyColors.success : NemyColors.error,
        }}
      >
        {isPositive ? "+" : ""}
        {(transaction.amount / 100).toFixed(2)} MXN
      </ThemedText>
    </View>
  );
}

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [clabe, setClabe] = useState("");

  const { data, isLoading, refetch, isRefetching } = useQuery<WalletData>({
    queryKey: ["/api/wallet", user?.id],
    enabled: !!user?.id,
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: {
      userId: string;
      amount: number;
      bankName: string;
      clabe: string;
    }) => {
      return apiRequest(
        "POST",
        new URL("/api/wallet/withdraw", getApiUrl()).toString(),
        data,
      );
    },
    onSuccess: () => {
      showToast("Retiro solicitado exitosamente", "success");
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      setBankName("");
      setClabe("");
      queryClient.invalidateQueries({ queryKey: ["/api/wallet", user?.id] });
    },
    onError: (error: any) => {
      showToast(error.message || "Error al solicitar retiro", "error");
    },
  });

  const wallet = data?.wallet || {
    balance: 0,
    pendingBalance: 0,
    totalEarnings: 0,
    currency: "MXN",
  };

  const transactions = data?.transactions || [];

  const handleWithdraw = () => {
    if (!user?.id) return;

    const amount = parseFloat(withdrawAmount) * 100;
    if (isNaN(amount) || amount <= 0) {
      showToast("Ingresa un monto válido", "warning");
      return;
    }
    if (amount > wallet.balance) {
      showToast("Saldo insuficiente", "error");
      return;
    }
    if (!bankName.trim()) {
      showToast("Ingresa el nombre del banco", "warning");
      return;
    }
    if (clabe.length !== 18) {
      showToast("CLABE debe tener 18 dígitos", "warning");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    withdrawMutation.mutate({
      userId: user.id,
      amount,
      bankName: bankName.trim(),
      clabe: clabe.trim(),
    });
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h2">Mi Billetera</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={NemyColors.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
      >
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={[styles.balanceCard, { backgroundColor: NemyColors.primary }]}
        >
          <ThemedText type="caption" style={{ color: "#fff", opacity: 0.8 }}>
            Saldo Disponible
          </ThemedText>
          <ThemedText type="h1" style={{ color: "#fff", fontSize: 40 }}>
            ${(wallet.balance / 100).toFixed(2)}
          </ThemedText>
          <ThemedText type="caption" style={{ color: "#fff", opacity: 0.7 }}>
            MXN
          </ThemedText>

          <View style={styles.balanceDetails}>
            <View style={styles.balanceItem}>
              <ThemedText
                type="caption"
                style={{ color: "#fff", opacity: 0.8 }}
              >
                Pendiente
              </ThemedText>
              <ThemedText
                type="body"
                style={{ color: "#fff", fontWeight: "600" }}
              >
                ${(wallet.pendingBalance / 100).toFixed(2)}
              </ThemedText>
            </View>
            <View style={styles.balanceItem}>
              <ThemedText
                type="caption"
                style={{ color: "#fff", opacity: 0.8 }}
              >
                Total Ganado
              </ThemedText>
              <ThemedText
                type="body"
                style={{ color: "#fff", fontWeight: "600" }}
              >
                ${(wallet.totalEarnings / 100).toFixed(2)}
              </ThemedText>
            </View>
          </View>

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowWithdrawModal(true);
            }}
            style={styles.withdrawButton}
            disabled={wallet.balance <= 0}
          >
            <Feather
              name="arrow-up-circle"
              size={20}
              color={NemyColors.primary}
            />
            <ThemedText
              type="body"
              style={{
                color: NemyColors.primary,
                fontWeight: "600",
                marginLeft: Spacing.sm,
              }}
            >
              Retirar
            </ThemedText>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <ThemedText type="h3" style={{ marginVertical: Spacing.md }}>
            Historial de Transacciones
          </ThemedText>

          {transactions.length > 0 ? (
            transactions.map((transaction, index) => (
              <Animated.View
                key={transaction.id}
                entering={FadeInRight.delay(300 + index * 50)}
              >
                <TransactionItem transaction={transaction} theme={theme} />
              </Animated.View>
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
              <Feather name="inbox" size={48} color={theme.textSecondary} />
              <ThemedText
                type="body"
                style={{ color: theme.textSecondary, marginTop: Spacing.md }}
              >
                No hay transacciones aún
              </ThemedText>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <Modal
        visible={showWithdrawModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWithdrawModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="h3">Solicitar Retiro</ThemedText>
              <Pressable onPress={() => setShowWithdrawModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ThemedText
              type="caption"
              style={{ marginBottom: Spacing.md, color: theme.textSecondary }}
            >
              Saldo disponible: ${(wallet.balance / 100).toFixed(2)} MXN
            </ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText type="caption" style={{ fontWeight: "600" }}>
                Monto a retirar
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.card, color: theme.text },
                ]}
                placeholder="0.00"
                placeholderTextColor={theme.textSecondary}
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="caption" style={{ fontWeight: "600" }}>
                Banco
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.card, color: theme.text },
                ]}
                placeholder="Ej: BBVA, Santander, Banorte"
                placeholderTextColor={theme.textSecondary}
                value={bankName}
                onChangeText={setBankName}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="caption" style={{ fontWeight: "600" }}>
                CLABE Interbancaria (18 dígitos)
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.card, color: theme.text },
                ]}
                placeholder="000000000000000000"
                placeholderTextColor={theme.textSecondary}
                value={clabe}
                onChangeText={(text) =>
                  setClabe(text.replace(/\D/g, "").slice(0, 18))
                }
                keyboardType="numeric"
                maxLength={18}
              />
            </View>

            <Pressable
              onPress={handleWithdraw}
              style={[
                styles.submitButton,
                { opacity: withdrawMutation.isPending ? 0.7 : 1 },
              ]}
              disabled={withdrawMutation.isPending}
            >
              <ThemedText
                type="body"
                style={{ color: "#fff", fontWeight: "600" }}
              >
                {withdrawMutation.isPending
                  ? "Procesando..."
                  : "Solicitar Retiro"}
              </ThemedText>
            </Pressable>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  balanceCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: "center",
    boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
  },
  balanceDetails: {
    flexDirection: "row",
    marginTop: Spacing.lg,
    gap: Spacing.xl,
  },
  balanceItem: {
    alignItems: "center",
  },
  withdrawButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    boxShadow: "0px 2px 4px rgba(0,0,0,0.08)",
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  transactionContent: {
    flex: 1,
  },
  emptyState: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  input: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.xs,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: NemyColors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: "center",
    marginTop: Spacing.md,
  },
});
