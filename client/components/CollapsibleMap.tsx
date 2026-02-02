import React, { useState } from "react";
import { View, StyleSheet, Pressable, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, NemyColors, Shadows } from "@/constants/theme";

interface Location {
  latitude: number;
  longitude: number;
  title?: string;
}

interface CollapsibleMapProps {
  businessLocation?: Location;
  deliveryPersonLocation?: Location;
  customerLocation?: Location;
  isLoading?: boolean;
}

const { width } = Dimensions.get("window");
const COLLAPSED_HEIGHT = 60;
const EXPANDED_HEIGHT = 300;

export function CollapsibleMap({
  businessLocation,
  deliveryPersonLocation,
  customerLocation,
  isLoading = false,
}: CollapsibleMapProps) {
  const { theme, isDark } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const height = useSharedValue(COLLAPSED_HEIGHT);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  const toggleExpand = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded(!isExpanded);
    height.value = withSpring(isExpanded ? COLLAPSED_HEIGHT : EXPANDED_HEIGHT, {
      damping: 15,
      stiffness: 100,
    });
  };

  const getInitialRegion = () => {
    const locations = [
      businessLocation,
      deliveryPersonLocation,
      customerLocation,
    ].filter(Boolean) as Location[];
    if (locations.length === 0) {
      return {
        latitude: 19.7708,
        longitude: -104.3636,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    const lats = locations.map((l) => l.latitude);
    const lngs = locations.map((l) => l.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(0.01, (maxLat - minLat) * 1.5),
      longitudeDelta: Math.max(0.01, (maxLng - minLng) * 1.5),
    };
  };

  const getRouteCoordinates = () => {
    const coords: Location[] = [];
    if (businessLocation) coords.push(businessLocation);
    if (deliveryPersonLocation) coords.push(deliveryPersonLocation);
    if (customerLocation) coords.push(customerLocation);
    return coords;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: theme.card },
        Shadows.md,
        animatedStyle,
      ]}
    >
      <Pressable onPress={toggleExpand} style={styles.header}>
        <View style={styles.headerContent}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: NemyColors.primary + "20" },
            ]}
          >
            <Feather name="map" size={20} color={NemyColors.primary} />
          </View>
          <View style={styles.headerText}>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              Seguimiento en tiempo real
            </ThemedText>
            {deliveryPersonLocation ? (
              <ThemedText type="caption" style={{ color: NemyColors.success }}>
                Repartidor en movimiento
              </ThemedText>
            ) : (
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Esperando repartidor
              </ThemedText>
            )}
          </View>
        </View>
        <View
          style={[
            styles.expandButton,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <Feather
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={theme.text}
          />
        </View>
      </Pressable>

      {isExpanded ? (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={getInitialRegion()}
            showsUserLocation={false}
            showsMyLocationButton={false}
            showsCompass={false}
            mapType="standard"
          >
            {businessLocation ? (
              <Marker
                coordinate={businessLocation}
                title="Negocio"
                pinColor={NemyColors.primary}
              >
                <View
                  style={[
                    styles.markerContainer,
                    { backgroundColor: NemyColors.primary },
                  ]}
                >
                  <Feather name="shopping-bag" size={16} color="#FFFFFF" />
                </View>
              </Marker>
            ) : null}

            {deliveryPersonLocation ? (
              <Marker
                coordinate={deliveryPersonLocation}
                title="Repartidor"
                pinColor={NemyColors.success}
              >
                <View
                  style={[
                    styles.markerContainer,
                    { backgroundColor: NemyColors.success },
                  ]}
                >
                  <Feather name="navigation" size={16} color="#FFFFFF" />
                </View>
              </Marker>
            ) : null}

            {customerLocation ? (
              <Marker
                coordinate={customerLocation}
                title="Tu ubicacion"
                pinColor="#2196F3"
              >
                <View
                  style={[
                    styles.markerContainer,
                    { backgroundColor: "#2196F3" },
                  ]}
                >
                  <Feather name="home" size={16} color="#FFFFFF" />
                </View>
              </Marker>
            ) : null}

            {getRouteCoordinates().length >= 2 ? (
              <Polyline
                coordinates={getRouteCoordinates()}
                strokeColor={NemyColors.primary}
                strokeWidth={3}
                lineDashPattern={[5, 5]}
              />
            ) : null}
          </MapView>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: NemyColors.primary },
                ]}
              />
              <ThemedText type="caption">Negocio</ThemedText>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: NemyColors.success },
                ]}
              />
              <ThemedText type="caption">Repartidor</ThemedText>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#2196F3" }]}
              />
              <ThemedText type="caption">Tu casa</ThemedText>
            </View>
          </View>
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    height: COLLAPSED_HEIGHT,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  expandButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
    minHeight: 200,
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  legend: {
    position: "absolute",
    bottom: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.xs,
  },
});
