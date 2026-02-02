import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

export default function AddAddressScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [label, setLabel] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Autlán');
  const [state, setState] = useState('Jalisco');
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!label.trim() || !street.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user?.id}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: label.trim(),
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim(),
          latitude: 19.7667,
          longitude: -104.3667,
        }),
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Dirección guardada correctamente');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'No se pudo guardar la dirección');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Etiqueta *</Text>
        <TextInput
          style={styles.input}
          value={label}
          onChangeText={setLabel}
          placeholder="Casa, Trabajo, etc."
        />

        <Text style={styles.label}>Calle y número *</Text>
        <TextInput
          style={styles.input}
          value={street}
          onChangeText={setStreet}
          placeholder="Ej: Calle Allende #123"
        />

        <Text style={styles.label}>Ciudad</Text>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
        />

        <Text style={styles.label}>Estado</Text>
        <TextInput
          style={styles.input}
          value={state}
          onChangeText={setState}
        />

        <Text style={styles.label}>Código Postal</Text>
        <TextInput
          style={styles.input}
          value={zipCode}
          onChangeText={setZipCode}
          placeholder="48900"
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Guardando...' : 'Guardar Dirección'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
