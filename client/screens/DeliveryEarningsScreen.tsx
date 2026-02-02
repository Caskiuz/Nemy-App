import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, NemyColors, Shadows } from "@/constants/theme";

interface EarningsData {
  earnings: {
    today: number;
    week: number;
    month: number;
    total: number;
    tips: number;
  };
  stats: {
    totalDeliveries: number;
    averageRating: number;
    completionRate: number;
    avgDeliveryTime: number;
  };
}

type Period = "today" | "week" | "month";

function StatCard({
  icon,
  label,
  value,
  color = NemyColors.primary,
  delay = 0,
}: {
  icon: string;
  label: string;
  value: string | number;
  color?: string;
  delay?: number;
}) {
  const { theme } = useTheme();

  return (
    <Animated.View
      entering={FadeInRight.delay(delay).springify()}
      style={[styles.statCard, { backgroundColor: theme.card }, Shadows.sm]}
    >
      <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
        <Feather name={icon as any} size={20} color={color} />
      </View>
      <ThemedText type="h3">{value}</ThemedText>
      <ThemedText type="caption" style={{ color: theme.textSecondary }}>
        {label}
      </ThemedText>
    </Animated.View>
  );
}

export default function DeliveryEarningsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("week");

  const { data, isLoading, refetch, isRefetching } = useQuery<EarningsData>({
    queryKey: ["/api/delivery", user?.id, "earnings"],
    enabled: !!user?.id,
  });

  const earnings = data?.earnings || {
    today: 0,
    week: 0,
    month: 0,
    total: 0,
    tips: 0,
  };

  const stats = data?.stats || {
    totalDeliveries: 0,
    averageRating: 0,
    completionRate: 100,
    avgDeliveryTime: 0,
  };

  const periodLabels: Record<Period, string> = {
    today: "Hoy",
    week: "Esta semana",
    month: "Este mes",
  };

  const getEarningsForPeriod = () => {
    switch (selectedPeriod) {
      case "today":
        return earnings.today;
      case "week":
        return earnings.week;
      case "month":
        return earnings.month;
      default:
        return 0;
    }
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h2">Mis Ganancias</ThemedText>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={NemyColors.primary}
          />
        }
      >
        <Animated.View
          entering={FadeInDown.springify()}
          style={[
            styles.earningsCard,
            { backgroundColor: NemyColors.primary },
            Shadows.lg,
          ]}
        >
          <ThemedText type="body" style={{ color: "rgba(255,255,255,0.8)" }}>
            {periodLabels[selectedPeriod]}
          </ThemedText>
          <ThemedText
            type="h1"
            style={{
              color: "#FFFFFF",
              fontSize: 42,
              marginVertical: Spacing.sm,
            }}
          >
            ${getEarningsForPeriod().toFixed(2)}
          </ThemedText>
          <View style={styles.tipsRow}>
            <Feather name="gift" size={16} color="rgba(255,255,255,0.8)" />
            <ThemedText
              type="caption"
              style={{ color: "rgba(255,255,255,0.8)", marginLeft: 4 }}
            >
              +${earnings.tips.toFixed(2)} en propinas
            </ThemedText>
          </View>

          <View style={styles.periodSelector}>
            {(["today", "week", "month"] as Period[]).map((period) => (
              <Pressable
                key={period}
                onPress={() => {
                  setSelectedPeriod(period);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.periodButton,
                  {
                    backgroundColor:
                      selectedPeriod === period
                        ? "#FFFFFF"
                        : "rgba(255,255,255,0.2)",
                  },
                ]}
              >
                <ThemedText
                  type="caption"
                  style={{
                    color:
                      selectedPeriod === period
                        ? NemyColors.primary
                        : "#FFFFFF",
                    fontWeight: "600",
                  }}
                >
                  {periodLabels[period]}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <ThemedText
          type="h3"
          style={{ marginBottom: Spacing.md, marginTop: Spacing.lg }}
        >
          Resumen General
        </ThemedText>

        <View style={styles.statsGrid}>
          <StatCard
            icon="truck"
            label="Entregas totales"
            value={stats.totalDeliveries}
            color="#4CAF50"
            delay={100}
          />
          <StatCard
            icon="star"
            label="Calificación"
            value={stats.averageRating.toFixed(1)}
            color="#FF9800"
            delay={150}
          />
          <StatCard
            icon="check-circle"
            label="Completadas"
            value={`${stats.completionRate}%`}
            color="#2196F3"
            delay={200}
          />
          <StatCard
            icon="clock"
            label="Tiempo prom."
            value={`${stats.avgDeliveryTime}m`}
            color="#9C27B0"
            delay={250}
          />
        </View>

        <View
          style={[
            styles.totalCard,
            { backgroundColor: theme.card },
            Shadows.md,
          ]}
        >
          <View style={styles.totalRow}>
            <View>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Ganancias totales
              </ThemedText>
              <ThemedText type="h2" style={{ color: NemyColors.primary }}>
                ${earnings.total.toFixed(2)}
              </ThemedText>
            </View>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: NemyColors.primary + "20" },
              ]}
            >
              <Feather
                name="trending-up"
                size={24}
                color={NemyColors.primary}
              />
            </View>
          </View>
        </View>
      </ScrollView>
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
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  earningsCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
  },
  tipsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  periodSelector: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  periodButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  statCard: {
    width: "47%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  totalCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
});
