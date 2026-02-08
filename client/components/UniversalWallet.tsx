import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../constants/config';

interface WalletData {
  balance: number;
  pendingBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  cashOwed: number;
  availableForWithdrawal: number;
}

interface ConnectStatus {
  hasAccount: boolean;
  onboardingComplete: boolean;
  canReceivePayments: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
}

interface UniversalWalletProps {
  showWithdrawals?: boolean;
  showConnectSetup?: boolean;
}

export default function UniversalWallet({ 
  showWithdrawals = true, 
  showConnectSetup = true 
}: UniversalWalletProps) {
  const { user, token } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [connectStatus, setConnectStatus] = useState<ConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch wallet balance
      const walletResponse = await fetch(`${API_CONFIG.BASE_URL}/api/wallet/balance`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (walletResponse.ok) {
        const walletData = await walletResponse.json();
        setWallet(walletData);
      }

      // Fetch Connect status for eligible roles
      if (showConnectSetup && (user?.role === 'driver' || user?.role === 'business')) {
        const connectResponse = await fetch(`${API_CONFIG.BASE_URL}/api/connect/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (connectResponse.ok) {
          const connectData = await connectResponse.json();
          setConnectStatus(connectData);
        }
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const startOnboarding = async () => {
    if (!user) return;

    setOnboardingLoading(true);
    try {
      const accountType = user.role === 'business' ? 'business' : 'driver';
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/connect/onboard`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountType,
          businessId: user.role === 'business' ? user.id : undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        const supported = await Linking.canOpenURL(data.onboardingUrl);
        if (supported) {
          await Linking.openURL(data.onboardingUrl);
        } else {
          Alert.alert('Error', 'No se pudo abrir el enlace de configuración');
        }
      } else {
        const error = await response.json();
        Alert.alert('Error', error.error || 'Error al iniciar configuración');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setOnboardingLoading(false);
    }
  };

  const getRoleText = () => {
    switch (user?.role) {
      case 'driver': return 'Repartidor';
      case 'business': return 'Negocio';
      case 'customer': return 'Cliente';
      case 'admin': return 'Administrador';
      default: return 'Usuario';
    }
  };

  const getBalanceColor = () => {
    if (!wallet) return '#6B7280';
    const available = wallet.availableForWithdrawal;
    if (available >= 10000) return '#10B981'; // Green for $100+
    if (available >= 5000) return '#F59E0B';  // Orange for $50+
    return '#6B7280'; // Gray for less
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Cargando wallet...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="wallet-outline" size={32} color="#FF6B35" />
        <Text style={styles.title}>Mi Wallet</Text>
        <Text style={styles.subtitle}>{getRoleText()}</Text>
      </View>

      {/* Balance Card */}
      {wallet && (
        <View style={[styles.balanceCard, { borderLeftColor: getBalanceColor() }]}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Saldo Disponible</Text>
            <Ionicons name="cash-outline" size={24} color={getBalanceColor()} />
          </View>
          
          <Text style={[styles.balanceAmount, { color: getBalanceColor() }]}>
            ${(wallet.availableForWithdrawal / 100).toFixed(2)} MXN
          </Text>
          
          {wallet.cashOwed > 0 && (
            <View style={styles.warningBanner}>
              <Ionicons name="warning-outline" size={16} color="#F59E0B" />
              <Text style={styles.warningText}>
                Efectivo pendiente: ${(wallet.cashOwed / 100).toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.balanceGrid}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Total Ganado</Text>
              <Text style={styles.balanceItemValue}>
                ${(wallet.totalEarned / 100).toFixed(2)}
              </Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Retirado</Text>
              <Text style={styles.balanceItemValue}>
                ${(wallet.totalWithdrawn / 100).toFixed(2)}
              </Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Pendiente</Text>
              <Text style={styles.balanceItemValue}>
                ${(wallet.pendingBalance / 100).toFixed(2)}
              </Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Balance</Text>
              <Text style={styles.balanceItemValue}>
                ${(wallet.balance / 100).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Connect Status - Only for drivers and businesses */}
      {showConnectSetup && (user?.role === 'driver' || user?.role === 'business') && (
        <View style={styles.connectCard}>
          <View style={styles.connectHeader}>
            <Ionicons 
              name={connectStatus?.canReceivePayments ? "checkmark-circle" : "time-outline"} 
              size={24} 
              color={connectStatus?.canReceivePayments ? "#10B981" : "#F59E0B"} 
            />
            <Text style={styles.connectTitle}>Cuenta Bancaria</Text>
          </View>
          
          {!connectStatus?.hasAccount ? (
            <View>
              <Text style={styles.connectDescription}>
                Conecta tu cuenta bancaria para retiros automáticos
              </Text>
              <TouchableOpacity 
                style={styles.connectButton}
                onPress={startOnboarding}
                disabled={onboardingLoading}
              >
                {onboardingLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons name="add-circle-outline" size={18} color="white" />
                    <Text style={styles.connectButtonText}>Configurar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : connectStatus.canReceivePayments ? (
            <View style={styles.connectSuccess}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.connectSuccessText}>
                Cuenta configurada para retiros automáticos
              </Text>
            </View>
          ) : (
            <View>
              <Text style={styles.connectWarning}>
                Completa la configuración de tu cuenta
              </Text>
              <TouchableOpacity 
                style={styles.connectButton}
                onPress={startOnboarding}
                disabled={onboardingLoading}
              >
                {onboardingLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons name="refresh-outline" size={16} color="white" />
                    <Text style={styles.connectButtonText}>Completar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.actionsCard}>
        <Text style={styles.actionsTitle}>Acciones Rápidas</Text>
        <View style={styles.actionsGrid}>
          {showWithdrawals && (user?.role === 'driver' || user?.role === 'business') && (
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="arrow-up-circle-outline" size={24} color="#FF6B35" />
              <Text style={styles.actionText}>Retirar</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="list-outline" size={24} color="#FF6B35" />
            <Text style={styles.actionText}>Historial</Text>
          </TouchableOpacity>
          
          {(user?.role === 'driver' || user?.role === 'business') && (
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="card-outline" size={24} color="#FF6B35" />
              <Text style={styles.actionText}>Métodos</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="help-circle-outline" size={24} color="#FF6B35" />
            <Text style={styles.actionText}>Ayuda</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Pagos Seguros</Text>
          <Text style={styles.infoText}>
            Todos los pagos son procesados de forma segura con encriptación bancaria.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  balanceCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 6,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 12,
    color: '#92400E',
    marginLeft: 6,
    fontWeight: '500',
  },
  balanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  balanceItem: {
    width: '48%',
    marginBottom: 12,
  },
  balanceItemLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  balanceItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  connectCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  connectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  connectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  connectDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  connectButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  connectSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectSuccessText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
    marginLeft: 6,
  },
  connectWarning: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '500',
    marginBottom: 12,
  },
  actionsCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#374151',
    marginTop: 4,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
});