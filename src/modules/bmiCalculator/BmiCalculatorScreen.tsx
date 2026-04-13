import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Theme } from '../../constants/theme';

export const BmiCalculatorScreen = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);

  const calculateBMI = () => {
    Keyboard.dismiss();
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // cm to m
    if (w > 0 && h > 0) {
      setBmi(w / (h * h));
    }
  };

  const getBmiCategory = () => {
    if (!bmi) return { text: '', color: Theme.colors.text };
    if (bmi < 18.5) return { text: 'Underweight', color: '#FFA726' };
    if (bmi < 24.9) return { text: 'Normal', color: Theme.colors.success };
    if (bmi < 29.9) return { text: 'Overweight', color: '#FFA726' };
    return { text: 'Obese', color: Theme.colors.error };
  };

  const category = getBmiCategory();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
            placeholder="e.g. 70"
            placeholderTextColor={Theme.colors.textSecondary}
          />

          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={height}
            onChangeText={setHeight}
            placeholder="e.g. 175"
            placeholderTextColor={Theme.colors.textSecondary}
          />

          <TouchableOpacity style={styles.button} onPress={calculateBMI}>
            <Text style={styles.buttonText}>Calculate BMI</Text>
          </TouchableOpacity>
        </View>

        {bmi !== null && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Your BMI</Text>
            <Text style={styles.resultValue}>{bmi.toFixed(1)}</Text>
            <Text style={[styles.resultCategory, { color: category.color }]}>
              {category.text}
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.m,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.l,
    borderRadius: Theme.radii.l,
    borderColor: Theme.colors.border,
    borderWidth: 1,
  },
  label: {
    ...Theme.typography.body,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.s,
    fontWeight: '500',
  },
  input: {
    backgroundColor: Theme.colors.surfaceLight,
    color: Theme.colors.text,
    padding: Theme.spacing.m,
    borderRadius: Theme.radii.m,
    fontSize: 18,
    marginBottom: Theme.spacing.l,
  },
  button: {
    backgroundColor: Theme.colors.primary,
    padding: Theme.spacing.m,
    borderRadius: Theme.radii.m,
    alignItems: 'center',
    marginTop: Theme.spacing.s,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultCard: {
    marginTop: Theme.spacing.l,
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.xl,
    borderRadius: Theme.radii.l,
    alignItems: 'center',
    borderColor: Theme.colors.border,
    borderWidth: 1,
  },
  resultTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.s,
  },
  resultValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.m,
  },
  resultCategory: {
    ...Theme.typography.h2,
  }
});
