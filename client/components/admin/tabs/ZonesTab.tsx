import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, TextInput, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NemyColors, Spacing, BorderRadius } from "../../../constants/theme";
import { apiRequest } from "@/lib/query-client";

interface ZonesTabProps {
  theme: any;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

interface DeliveryZone {
  id: string;
  name: string;
  baseFee: number;
  pricePerKm: number;
  minOrderAmount: number;
  isActive: boolean;
}

export const ZonesTab: React.FC<ZonesTabProps> = ({ theme, showToast }) => {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [form, setForm] = useState({
    name: "",
    baseFee: "",
    pricePerKm: "",
    minOrderAmount: "",
  });

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      const res = await apiRequest("GET", "/api/admin/delivery-zones");
      const data = await res.json();
      setZones(data.zones || []);
    } catch (error) {
      showToast("Error al cargar zonas", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const body = {
        name: form.name,
        baseFee: parseFloat(form.baseFee) * 100,
        pricePerKm: parseFloat(form.pricePerKm) * 100,
        minOrderAmount: parseFloat(form.minOrderAmount) * 100,
      };

      if (editingZone) {
        await apiRequest("PUT", `/api/admin/delivery-zones/${editingZone.id}`, body);
      } else {
        await apiRequest("POST", "/api/admin/delivery-zones", body);
      }

      showToast("Zona guardada", "success");
      setShowModal(false);
      setEditingZone(null);
      setForm({ name: "", baseFee: "", pricePerKm: "", minOrderAmount: "" });
      loadZones();
    } catch (error) {
      showToast("Error al guardar", "error");
    }
  };

  const openEdit = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setForm({
      name: zone.name,
      baseFee: (zone.baseFee / 100).toString(),
      pricePerKm: (zone.pricePerKm / 100).toString(),
      minOrderAmount: (zone.minOrderAmount / 100).toString(),
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={NemyColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Zonas de Entrega</Text>
        <Pressable
          onPress={() => {
            setEditingZone(null);
            setForm({ name: "", baseFee: "", pricePerKm: "", minOrderAmount: "" });
            setShowModal(true);
          }}
          style={[styles.addBtn, { backgroundColor: NemyColors.primary }]}
        >
          <Feather name="plus" size={16} color="#FFF" />
          <Text style={styles.addBtnText}>Agregar</Text>
        </Pressable>
      </View>

      <ScrollView>
        {zones.map((zone) => (
          <View key={zone.id} style={[styles.zoneCard, { backgroundColor: theme.card }]}>
            <View style={styles.zoneHeader}>
              <Text style={[styles.zoneName, { color: theme.text }]}>{zone.name}</Text>
              <View style={[styles.badge, { backgroundColor: zone.isActive ? NemyColors.success + "20" : "#ccc" }]}>
                <Text style={{ color: zone.isActive ? NemyColors.success : "#666", fontSize: 12 }}>
                  {zone.isActive ? "Activa" : "Inactiva"}
                </Text>
              </View>
            </View>
            <View style={styles.zoneDetails}>
              <Text style={{ color: theme.textSecondary, fontSize: 14 }}>Tarifa base: ${(zone.baseFee / 100).toFixed(2)}</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 14 }}>Por km: ${(zone.pricePerKm / 100).toFixed(2)}</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 14 }}>Pedido mínimo: ${(zone.minOrderAmount / 100).toFixed(2)}</Text>
            </View>
            <Pressable onPress={() => openEdit(zone)} style={styles.editBtn}>
              <Feather name="edit-2" size={16} color={NemyColors.primary} />
              <Text style={{ color: NemyColors.primary, marginLeft: 4 }}>Editar</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {editingZone ? "Editar Zona" : "Nueva Zona"}
              </Text>
              <Pressable onPress={() => setShowModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={[styles.label, { color: theme.text }]}>Nombre</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
                placeholder="Ej: Centro, Norte, Sur"
                placeholderTextColor={theme.textSecondary}
              />

              <Text style={[styles.label, { color: theme.text }]}>Tarifa Base ($)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                value={form.baseFee}
                onChangeText={(text) => setForm({ ...form, baseFee: text })}
                placeholder="25.00"
                keyboardType="numeric"
                placeholderTextColor={theme.textSecondary}
              />

              <Text style={[styles.label, { color: theme.text }]}>Precio por Km ($)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                value={form.pricePerKm}
                onChangeText={(text) => setForm({ ...form, pricePerKm: text })}
                placeholder="5.00"
                keyboardType="numeric"
                placeholderTextColor={theme.textSecondary}
              />

              <Text style={[styles.label, { color: theme.text }]}>Pedido Mínimo ($)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                value={form.minOrderAmount}
                onChangeText={(text) => setForm({ ...form, minOrderAmount: text })}
                placeholder="50.00"
                keyboardType="numeric"
                placeholderTextColor={theme.textSecondary}
              />
            </ScrollView>

            <Pressable onPress={handleSave} style={[styles.saveBtn, { backgroundColor: NemyColors.primary }]}>
              <Text style={styles.saveBtnText}>Guardar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  zoneCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  zoneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: "600",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  zoneDetails: {
    gap: 4,
    marginBottom: 12,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "70%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalBody: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
  },
  saveBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  saveBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
