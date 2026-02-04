import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, NemyColors } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import { tabStyles } from "./styles";

interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
}

interface TabProps {
  theme: any;
  showToast: (message: string, type: "success" | "error") => void;
}

export function SupportTab({ theme, showToast }: TabProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await apiRequest("GET", "/api/admin/support/tickets");
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (id: string, status: string) => {
    try {
      await apiRequest("PUT", `/api/admin/support/tickets/${id}`, { status });
      showToast("Estado actualizado", "success");
      fetchTickets();
    } catch (error) {
      showToast("Error al actualizar ticket", "error");
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filter === "all") return true;
    if (filter === "open") return t.status !== "closed";
    return t.status === "closed";
  });

  if (loading) {
    return (
      <View style={tabStyles.centered}>
        <ActivityIndicator size="large" color={NemyColors.primary} />
      </View>
    );
  }

  return (
    <View style={tabStyles.container}>
      <View style={tabStyles.sectionTabs}>
        {(["all", "open", "closed"] as const).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[tabStyles.sectionTab, filter === f && { backgroundColor: NemyColors.primary }]}
          >
            <ThemedText type="small" style={{ color: filter === f ? "#fff" : theme.text }}>
              {f === "all" ? "Todos" : f === "open" ? "Abiertos" : "Cerrados"}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
        Tickets ({filteredTickets.length})
      </ThemedText>

      {filteredTickets.length === 0 ? (
        <View style={[tabStyles.emptyState, { backgroundColor: theme.card }]}>
          <Feather name="message-circle" size={48} color={theme.textSecondary} />
          <ThemedText style={{ marginTop: Spacing.md, color: theme.textSecondary }}>
            No hay tickets
          </ThemedText>
        </View>
      ) : (
        filteredTickets.map((ticket) => (
          <View key={ticket.id} style={[tabStyles.card, { backgroundColor: theme.card }]}>
            <View style={tabStyles.cardHeader}>
              <View style={{ flex: 1 }}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {ticket.subject}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {ticket.userName} - {new Date(ticket.createdAt).toLocaleDateString("es-MX")}
                </ThemedText>
              </View>
              <View style={[tabStyles.priorityBadge, {
                backgroundColor:
                  ticket.priority === "high" ? NemyColors.error + "20" :
                  ticket.priority === "medium" ? NemyColors.warning + "20" :
                  NemyColors.success + "20"
              }]}>
                <ThemedText type="small" style={{
                  color:
                    ticket.priority === "high" ? NemyColors.error :
                    ticket.priority === "medium" ? NemyColors.warning :
                    NemyColors.success
                }}>
                  {ticket.priority === "high" ? "Alta" : ticket.priority === "medium" ? "Media" : "Baja"}
                </ThemedText>
              </View>
            </View>
            <View style={tabStyles.cardActions}>
              {ticket.status !== "closed" ? (
                <>
                  <Pressable
                    onPress={() => updateTicketStatus(ticket.id, "in_progress")}
                    style={[tabStyles.actionBtn, { backgroundColor: NemyColors.warning + "20" }]}
                  >
                    <ThemedText type="small" style={{ color: NemyColors.warning }}>
                      En Proceso
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={() => updateTicketStatus(ticket.id, "closed")}
                    style={[tabStyles.actionBtn, { backgroundColor: NemyColors.success + "20" }]}
                  >
                    <ThemedText type="small" style={{ color: NemyColors.success }}>
                      Cerrar
                    </ThemedText>
                  </Pressable>
                </>
              ) : (
                <View style={[tabStyles.statusBadge, { backgroundColor: NemyColors.success + "20" }]}>
                  <ThemedText type="small" style={{ color: NemyColors.success }}>
                    Cerrado
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        ))
      )}
    </View>
  );
}
