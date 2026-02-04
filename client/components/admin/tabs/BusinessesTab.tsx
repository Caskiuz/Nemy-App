import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { NemyColors } from "../../../constants/theme";
import { Business } from "../types/admin.types";

interface BusinessesTabProps {
  businesses: Business[];
  onAddBusiness: () => void;
  onEditBusiness: (business: Business) => void;
  onManageProducts: (businessId: string) => void;
}

export const BusinessesTab: React.FC<BusinessesTabProps> = ({
  businesses,
  onAddBusiness,
  onEditBusiness,
  onManageProducts,
}) => {
  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onAddBusiness();
        }}
      >
        <Text style={styles.addButtonText}>+ Agregar Negocio</Text>
      </TouchableOpacity>

      {businesses.map((business) => (
        <View key={business.id} style={styles.card}>
          <Text style={styles.businessName}>{business.name}</Text>
          <Text style={styles.businessType}>{business.type}</Text>
          <Text style={styles.businessAddress}>{business.address}</Text>
          <View style={styles.businessActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onEditBusiness(business);
              }}
            >
              <Text style={styles.actionButtonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.productsButton]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onManageProducts(business.id);
              }}
            >
              <Text style={styles.actionButtonText}>Productos</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addButton: {
    backgroundColor: NemyColors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  businessName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  businessType: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  businessAddress: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 12,
  },
  businessActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: NemyColors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  productsButton: {
    backgroundColor: NemyColors.secondary,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
