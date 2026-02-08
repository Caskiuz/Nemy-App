import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../constants/config';

const MEXICAN_BANKS = [
  { code: '002', name: 'Banamex' },
  { code: '012', name: 'BBVA México' },
  { code: '014', name: 'Santander' },
  { code: '019', name: 'Banca Mifel' },
  { code: '021', name: 'HSBC' },
  { code: '030', name: 'Bajío' },
  { code: '032', name: 'IXE' },
  { code: '036', name: 'Inbursa' },
  { code: '037', name: 'Interacciones' },
  { code: '042', name: 'Monex' },
  { code: '044', name: 'Scotiabank' },
  { code: '058', name: 'Banregio' },
  { code: '059', name: 'Invex' },
  { code: '060', name: 'Bansi' },
  { code: '062', name: 'Afirme' },
  { code: '072', name: 'Banorte' },
  { code: '103', name: 'American Express' },
  { code: '106', name: 'Bank of America' },
  { code: '108', name: 'Tokyo' },
  { code: '110', name: 'JP Morgan' },
  { code: '112', name: 'Bmonex' },
  { code: '113', name: 'Ve Por Más' },
  { code: '116', name: 'Credit Suisse' },
  { code: '124', name: 'Deutsche' },
  { code: '126', name: 'Credit Agricole' },
  { code: '127', name: 'Azteca' },
  { code: '128', name: 'Autofin' },
  { code: '129', name: 'Barclays' },
  { code: '130', name: 'Compartamos' },
  { code: '131', name: 'Banco Famsa' },
  { code: '132', name: 'Bmultiva' },
  { code: '133', name: 'Actinver' },
  { code: '134', name: 'Wal-mart' },
  { code: '135', name: 'Nafin' },
  { code: '136', name: 'Interbanco' },
  { code: '137', name: 'Bancoppel' },
  { code: '138', name: 'ABC Capital' },
  { code: '139', name: 'UBS Bank' },
  { code: '140', name: 'Consubanco' },
  { code: '141', name: 'Volkswagen' },
  { code: '143', name: 'CIBanco' },
  { code: '145', name: 'Bbase' },
  { code: '166', name: 'Bansefi' },
  { code: '168', name: 'Hipotecaria Federal' },
  { code: '600', name: 'Monexcb' },
  { code: '601', name: 'GBM' },
  { code: '602', name: 'Masari' },
  { code: '605', name: 'Value' },
  { code: '606', name: 'Estructuradores' },
  { code: '607', name: 'Tiber' },
  { code: '608', name: 'Vector' },
  { code: '610', name: 'B&B' },
  { code: '614', name: 'Accival' },
  { code: '615', name: 'Merrill Lynch' },
  { code: '616', name: 'Finamex' },
  { code: '617', name: 'Valmex' },
  { code: '618', name: 'Unica' },
  { code: '630', name: 'Intercam Banco' },
  { code: '631', name: 'Multiva Chubb' },
  { code: '632', name: 'Finamex' },
  { code: '633', name: 'Mediolanum' },
  { code: '634', name: 'Signum' },
  { code: '636', name: 'Intercam Banco' },
  { code: '637', name: 'Bankaool' },
  { code: '638', name: 'Pagatodo' },
  { code: '640', name: 'CB Intercam' },
  { code: '642', name: 'Multiva' },
  { code: '646', name: 'STP' },
  { code: '647', name: 'Telegrama' },
  { code: '648', name: 'Evercore' },
  { code: '649', name: 'Skandia' },
  { code: '651', name: 'Segmty' },
  { code: '652', name: 'Asea' },
  { code: '653', name: 'Kuspit' },
  { code: '655', name: 'Sofiexpress' },
  { code: '656', name: 'Unagra' },
  { code: '659', name: 'Opciones Empresariales del Noroeste' },
  { code: '901', name: 'CLS' },
  { code: '902', name: 'INDEVAL' },
];

export default function AddBankAccountScreen({ navigation }: any) {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bankCode: '',
    bankName: '',
    accountNumber: '',
    clabe: '',
    accountHolderName: '',
    accountType: 'checking', // checking, savings
  });

  const validateCLABE = (clabe: string): boolean => {
    if (clabe.length !== 18) return false;
    
    // CLABE validation algorithm
    const weights = [3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7];
    let sum = 0;
    
    for (let i = 0; i < 17; i++) {
      sum += parseInt(clabe[i]) * weights[i];
    }
    
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === parseInt(clabe[17]);
  };

  const handleSave = async () => {
    if (!formData.bankCode || !formData.accountNumber || !formData.accountHolderName) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    if (formData.clabe && !validateCLABE(formData.clabe)) {
      Alert.alert('Error', 'CLABE inválida');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/bank-accounts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Cuenta bancaria agregada correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Error al guardar la cuenta');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FF6B35" />
        </TouchableOpacity>
        <Text style={styles.title}>Agregar Cuenta Bancaria</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Banco *</Text>
        <View style={styles.pickerContainer}>
          <TouchableOpacity 
            style={styles.picker}
            onPress={() => {
              // TODO: Show bank picker modal
              Alert.alert('Seleccionar Banco', 'Funcionalidad en desarrollo');
            }}
          >
            <Text style={formData.bankName ? styles.pickerText : styles.pickerPlaceholder}>
              {formData.bankName || 'Seleccionar banco'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Número de Cuenta *</Text>
        <TextInput
          style={styles.input}
          value={formData.accountNumber}
          onChangeText={(text) => setFormData({...formData, accountNumber: text})}
          placeholder="Ingresa el número de cuenta"
          keyboardType="numeric"
          maxLength={20}
        />

        <Text style={styles.label}>CLABE Interbancaria</Text>
        <TextInput
          style={styles.input}
          value={formData.clabe}
          onChangeText={(text) => setFormData({...formData, clabe: text})}
          placeholder="18 dígitos (opcional)"
          keyboardType="numeric"
          maxLength={18}
        />

        <Text style={styles.label}>Nombre del Titular *</Text>
        <TextInput
          style={styles.input}
          value={formData.accountHolderName}
          onChangeText={(text) => setFormData({...formData, accountHolderName: text})}
          placeholder="Nombre completo del titular"
          autoCapitalize="words"
        />

        <Text style={styles.label}>Tipo de Cuenta</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity 
            style={styles.radioOption}
            onPress={() => setFormData({...formData, accountType: 'checking'})}
          >
            <Ionicons 
              name={formData.accountType === 'checking' ? 'radio-button-on' : 'radio-button-off'} 
              size={20} 
              color="#FF6B35" 
            />
            <Text style={styles.radioText}>Cuenta de Cheques</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.radioOption}
            onPress={() => setFormData({...formData, accountType: 'savings'})}
          >
            <Ionicons 
              name={formData.accountType === 'savings' ? 'radio-button-on' : 'radio-button-off'} 
              size={20} 
              color="#FF6B35" 
            />
            <Text style={styles.radioText}>Cuenta de Ahorros</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Guardando...' : 'Guardar Cuenta'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Ionicons name="information-circle-outline" size={24} color="#3B82F6" />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Información Importante</Text>
          <Text style={styles.infoText}>
            • Tu cuenta será verificada antes de activarse{'\n'}
            • Solo puedes recibir transferencias SPEI{'\n'}
            • Los datos deben coincidir con tu identificación{'\n'}
            • La verificación puede tomar 1-2 días hábiles
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 16,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  pickerText: {
    fontSize: 16,
    color: '#111827',
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  radioGroup: {
    marginTop: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    flexDirection: 'row',
    margin: 20,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});