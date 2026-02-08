import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../constants/api';

const MINIMUM_WITHDRAWAL = 50; // $50 MXN

interface ConnectStatus {
  hasAccount: boolean;
  onboardingComplete: boolean;
  canReceivePayments: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
}

export default function WithdrawalScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'stripe' | 'bank_transfer'>('stripe');
  const [bankData, setBankData] = useState({
    clabe: '',
    bankName: '',
    accountHolder: '',
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [connectStatus, setConnectStatus] = useState<ConnectStatus | null>(null);
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  useEffect(() => {
    loadWalletData();
    loadTransactions();
    loadConnectStatus();
  }, []);

  const loadConnectStatus = async () => {
    try {
      const token = user?.token;
      if (!token) return;
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/connect/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setConnectStatus(data);
      }
    } catch (error) {
      console.error('Error loading Connect status:', error);
    }
  };

  const startOnboarding = async () => {
    if (!user) return;

    setOnboardingLoading(true);
    try {
      const accountType = user.role === 'business' ? 'business' : 'driver';
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/connect/onboard`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
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

  const refreshOnboarding = async () => {
    setOnboardingLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/connect/refresh-onboarding`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        const supported = await Linking.canOpenURL(data.onboardingUrl);
        if (supported) {
          await Linking.openURL(data.onboardingUrl);
        }
      } else {
        Alert.alert('Error', 'Error al actualizar configuración');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setOnboardingLoading(false);
    }
  };

  const loadWalletData = async () => {
    try {
      const token = user?.token;
      console.log('🔑 Token:', token ? 'exists' : 'missing');
      console.log('👤 User ID:', user?.id);
      console.log('👤 User Name:', user?.name);
      console.log('👤 User Role:', user?.role);
      console.log('👤 User Email:', user?.email);
      if (!token) {
        console.log('❌ No token, skipping wallet load');
        return;
      }
      
      console.log('📡 Fetching wallet from:', `${API_CONFIG.BASE_URL}/api/wallet/balance`);
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/wallet/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      console.log('💰 Wallet response:', data);
      
      if (data.success) {
        setWallet(data);
        console.log('✅ Wallet loaded:', data);
      } else {
        console.log('⚠️ Wallet load failed:', data);
      }
    } catch (error) {
      console.error('❌ Error loading wallet:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const token = user?.token;
      if (!token) return;
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/wallet/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleWithdraw = async () => {
    const amountNum = parseFloat(amount);

    if (!amountNum || amountNum < MINIMUM_WITHDRAWAL) {
      Alert.alert('Error', `El monto mínimo es $${MINIMUM_WITHDRAWAL} MXN`);
      return;
    }

    const availableBalance = (wallet?.balance || 0) - (wallet?.cashOwed || 0);
    if (amountNum * 100 > availableBalance) {
      Alert.alert('Error', 'Saldo insuficiente');
      return;
    }

    if (wallet?.cashOwed > 0) {
      Alert.alert('Error', 'Debes liquidar tu efectivo pendiente antes de retirar');
      return;
    }

    if (method === 'stripe' && !connectStatus?.canReceivePayments) {
      Alert.alert('Error', 'Debes configurar tu cuenta bancaria primero');
      return;
    }

    if (method === 'bank_transfer') {
      if (!bankData.clabe || bankData.clabe.length !== 18) {
        Alert.alert('Error', 'CLABE debe tener 18 dígitos');
        return;
      }
      if (!bankData.bankName || !bankData.accountHolder) {
        Alert.alert('Error', 'Completa todos los datos bancarios');
        return;
      }
    }

    setLoading(true);
    try {
      const token = user?.token;
      if (!token) {
        Alert.alert('Error', 'Sesión expirada');
        return;
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/wallet/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: amountNum * 100,
          method,
          bankAccount: method === 'bank_transfer' ? bankData : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Éxito',
          method === 'stripe'
            ? 'Retiro procesado automáticamente. Recibirás el dinero en 1-2 días hábiles.'
            : 'Solicitud enviada. El admin procesará tu retiro pronto.'
        );
        setAmount('');
        setBankData({ clabe: '', bankName: '', accountHolder: '' });
        loadWalletData();
        loadTransactions();
        loadConnectStatus();
      } else {
        Alert.alert('Error', data.error || 'No se pudo procesar el retiro');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const availableBalance = ((wallet?.balance || 0) - (wallet?.cashOwed || 0)) / 100;

  return (
    <ScrollView style={styles.container}>
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo Disponible</Text>
        <Text style={styles.balanceAmount}>${availableBalance.toFixed(2)} MXN</Text>
        {wallet?.cashOwed > 0 && (
          <Text style={styles.cashOwed}>
            Efectivo pendiente: ${(wallet.cashOwed / 100).toFixed(2)}
          </Text>
        )}
      </View>

      {/* Connect Status Card */}
      {connectStatus && (
        <View style={styles.connectCard}>
          <View style={styles.connectHeader}>
            <Ionicons 
              name={connectStatus.canReceivePayments ? "checkmark-circle" : "time-outline"} 
              size={24} 
              color={connectStatus.canReceivePayments ? "#4CAF50" : "#FF9800"} 
            />
            <Text style={styles.connectTitle}>Cuenta Bancaria</Text>
          </View>
          
          {!connectStatus.hasAccount ? (
            <View>
              <Text style={styles.connectDescription}>
                Conecta tu cuenta bancaria para recibir retiros automáticos
              </Text>
              <TouchableOpacity 
                style={styles.connectButton}
                onPress={startOnboarding}
                disabled={onboardingLoading}
              >
                {onboardingLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="add-circle-outline" size={20} color="white" />
                    <Text style={styles.connectButtonText}>Configurar Cuenta</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : connectStatus.canReceivePayments ? (
            <Text style={styles.connectSuccess}>
              ✅ Tu cuenta está lista para retiros automáticos
            </Text>
          ) : (
            <View>
              <Text style={styles.connectWarning}>
                ⚠️ Completa la configuración de tu cuenta
              </Text>
              <TouchableOpacity 
                style={styles.connectButton}
                onPress={refreshOnboarding}
                disabled={onboardingLoading}
              >
                {onboardingLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="refresh-outline" size={18} color="white" />
                    <Text style={styles.connectButtonText}>Completar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Withdrawal Form */}
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Solicitar Retiro</Text>

        <Text style={styles.label}>Monto</Text>
        <TextInput
          style={styles.input}
          placeholder={`Mínimo $${MINIMUM_WITHDRAWAL}`}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <Text style={styles.hint}>
          Máximo: ${availableBalance.toFixed(2)} MXN
        </Text>

        <Text style={styles.label}>Método de Retiro</Text>
        <View style={styles.methodButtons}>
          <TouchableOpacity
            style={[
              styles.methodButton, 
              method === 'stripe' && styles.methodButtonActive,
              !connectStatus?.canReceivePayments && styles.methodButtonDisabled
            ]}
            onPress={() => connectStatus?.canReceivePayments && setMethod('stripe')}
            disabled={!connectStatus?.canReceivePayments}
          >
            <Ionicons 
              name="flash-outline" 
              size={16} 
              color={connectStatus?.canReceivePayments ? (method === 'stripe' ? '#4CAF50' : '#666') : '#ccc'} 
            />
            <Text style={[
              styles.methodText, 
              method === 'stripe' && styles.methodTextActive,
              !connectStatus?.canReceivePayments && styles.methodTextDisabled
            ]}>
              Automático (1-2 días)
            </Text>
            {!connectStatus?.canReceivePayments && (
              <Text style={styles.methodSubtext}>Requiere configuración</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.methodButton, method === 'bank_transfer' && styles.methodButtonActive]}
            onPress={() => setMethod('bank_transfer')}
          >
            <Ionicons 
              name="card-outline" 
              size={16} 
              color={method === 'bank_transfer' ? '#4CAF50' : '#666'} 
            />
            <Text style={[styles.methodText, method === 'bank_transfer' && styles.methodTextActive]}>
              Manual (3-5 días)
            </Text>
          </TouchableOpacity>
        </View>

        {method === 'bank_transfer' && (
          <View style={styles.bankForm}>
            <Text style={styles.label}>CLABE Interbancaria</Text>
            <TextInput
              style={styles.input}
              placeholder="18 dígitos"
              keyboardType="numeric"
              maxLength={18}
              value={bankData.clabe}
              onChangeText={(text) => setBankData({ ...bankData, clabe: text })}
            />

            <Text style={styles.label}>Banco</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: BBVA, Santander"
              value={bankData.bankName}
              onChangeText={(text) => setBankData({ ...bankData, bankName: text })}
            />

            <Text style={styles.label}>Titular de la Cuenta</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              value={bankData.accountHolder}
              onChangeText={(text) => setBankData({ ...bankData, accountHolder: text })}
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.withdrawButton, loading && styles.withdrawButtonDisabled]}
          onPress={handleWithdraw}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.withdrawButtonText}>Solicitar Retiro</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* History */}
      <View style={styles.history}>
        <Text style={styles.sectionTitle}>Historial de Transacciones</Text>
        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>No hay transacciones aún</Text>
        ) : (
          transactions.map((tx) => (
            <View key={tx.id} style={styles.historyItem}>
              <View style={styles.historyLeft}>
                <Text style={styles.historyAmount}>
                  {tx.amount > 0 ? '+' : ''}${(tx.amount / 100).toFixed(2)} MXN
                </Text>
                <Text style={styles.historyMethod}>
                  {tx.type === 'income' ? 'Ingreso' : 
                   tx.type === 'delivery_payment' ? 'Pago Entrega' :
                   tx.type === 'withdrawal' ? 'Retiro' : tx.type}
                </Text>
              </View>
              <View style={styles.historyRight}>
                <Text
                  style={[
                    styles.historyStatus,
                    tx.status === 'completed' && styles.statusCompleted,
                    tx.status === 'pending' && styles.statusPending,
                    tx.status === 'failed' && styles.statusFailed,
                  ]}
                >
                  {tx.status === 'completed' ? 'Completado' : 
                   tx.status === 'pending' ? 'Pendiente' : 'Fallido'}
                </Text>
                <Text style={styles.historyDate}>
                  {new Date(tx.createdAt).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  })}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  balanceCard: {
    backgroundColor: '#4CAF50',
    padding: 24,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  cashOwed: {
    color: '#ffeb3b',
    fontSize: 14,
    marginTop: 8,
  },
  form: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  methodButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  methodButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  methodButtonActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#e8f5e9',
  },
  methodText: {
    fontSize: 14,
    color: '#666',
  },
  methodTextActive: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  methodTextDisabled: {
    color: '#ccc',
  },
  methodButtonDisabled: {
    borderColor: '#eee',
    backgroundColor: '#f9f9f9',
  },
  methodSubtext: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  connectCard: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  connectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  connectTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  connectDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  connectSuccess: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  connectWarning: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '500',
    marginBottom: 12,
  },
  connectButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  bankForm: {
    marginTop: 16,
  },
  withdrawButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  withdrawButtonDisabled: {
    backgroundColor: '#ccc',
  },
  withdrawButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  history: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 24,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyLeft: {
    flex: 1,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyMethod: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusCompleted: {
    color: '#4CAF50',
  },
  statusPending: {
    color: '#FF9800',
  },
  statusFailed: {
    color: '#f44336',
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  errorMessage: {
    fontSize: 11,
    color: '#f44336',
    marginTop: 2,
    fontStyle: 'italic',
    maxWidth: 150,
  },
});
