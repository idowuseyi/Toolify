import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Theme } from '../../constants/theme';

type Category = 'Length' | 'Weight' | 'Temperature';

const CONVERSIONS = {
  Length: {
    Meter: 1,
    Kilometer: 1000,
    Centimeter: 0.01,
    Millimeter: 0.001,
    Mile: 1609.34,
    Yard: 0.9144,
    Foot: 0.3048,
    Inch: 0.0254,
  },
  Weight: {
    Gram: 1,
    Kilogram: 1000,
    Milligram: 0.001,
    Pound: 453.592,
    Ounce: 28.3495,
  },
  Temperature: {
    Celsius: 'C',
    Fahrenheit: 'F',
    Kelvin: 'K',
  }
};

export const UnitConverterScreen = () => {
  const [category, setCategory] = useState<Category>('Length');
  const [fromUnit, setFromUnit] = useState<string>('Meter');
  const [toUnit, setToUnit] = useState<string>('Kilometer');
  const [value, setValue] = useState<string>('');

  const switchCategory = (cat: Category) => {
    setCategory(cat);
    const units = Object.keys(CONVERSIONS[cat]);
    setFromUnit(units[0]);
    setToUnit(units[1] || units[0]);
    setValue('');
  };

  const convertValue = (): string => {
    if (!value || isNaN(Number(value))) return '';
    const num = Number(value);

    if (category === 'Temperature') {
      let c = 0;
      if (fromUnit === 'Celsius') c = num;
      else if (fromUnit === 'Fahrenheit') c = (num - 32) * 5/9;
      else if (fromUnit === 'Kelvin') c = num - 273.15;

      let res = 0;
      if (toUnit === 'Celsius') res = c;
      else if (toUnit === 'Fahrenheit') res = (c * 9/5) + 32;
      else if (toUnit === 'Kelvin') res = c + 273.15;

      return res.toFixed(2);
    } else {
      const factors = CONVERSIONS[category as 'Length' | 'Weight'];
      const baseValue = num * (factors[fromUnit as keyof typeof factors] as number);
      const res = baseValue / (factors[toUnit as keyof typeof factors] as number);
      return res.toFixed(4).replace(/\.?0+$/, '');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Categories */}
        <View style={styles.categoryContainer}>
          {(['Length', 'Weight', 'Temperature'] as Category[]).map(cat => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.catBtn, category === cat && styles.catBtnActive]}
              onPress={() => switchCategory(cat)}
            >
              <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input */}
        <View style={styles.card}>
          <Text style={styles.label}>From ({fromUnit}):</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={value}
            onChangeText={setValue}
            placeholder="Enter value"
            placeholderTextColor={Theme.colors.textSecondary}
          />
          <View style={styles.unitRow}>
            {Object.keys(CONVERSIONS[category]).map(unit => (
              <TouchableOpacity 
                key={unit} 
                style={[styles.unitBtn, fromUnit === unit && styles.unitBtnActive]}
                onPress={() => setFromUnit(unit)}
              >
                <Text style={styles.unitText}>{unit}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Result */}
        <View style={styles.card}>
          <Text style={styles.label}>To ({toUnit}):</Text>
          <Text style={styles.resultValue}>{value ? convertValue() : '0'}</Text>
          
          <View style={styles.unitRow}>
            {Object.keys(CONVERSIONS[category]).map(unit => (
              <TouchableOpacity 
                key={unit} 
                style={[styles.unitBtn, toUnit === unit && styles.unitBtnActive]}
                onPress={() => setToUnit(unit)}
              >
                <Text style={styles.unitText}>{unit}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    padding: Theme.spacing.m,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.l,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radii.l,
    padding: Theme.spacing.xs,
  },
  catBtn: {
    flex: 1,
    padding: Theme.spacing.s,
    alignItems: 'center',
    borderRadius: Theme.radii.m,
  },
  catBtnActive: {
    backgroundColor: Theme.colors.primary,
  },
  catText: {
    ...Theme.typography.body,
    color: Theme.colors.text,
    fontWeight: '600',
  },
  catTextActive: {
    color: '#000',
  },
  card: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.m,
    borderRadius: Theme.radii.l,
    marginBottom: Theme.spacing.m,
    borderColor: Theme.colors.border,
    borderWidth: 1,
  },
  label: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.s,
  },
  input: {
    backgroundColor: Theme.colors.surfaceLight,
    color: Theme.colors.text,
    padding: Theme.spacing.m,
    borderRadius: Theme.radii.m,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: Theme.spacing.m,
  },
  resultValue: {
    color: Theme.colors.primary,
    fontSize: 32,
    fontWeight: 'bold',
    padding: Theme.spacing.s,
    marginBottom: Theme.spacing.m,
  },
  unitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.s,
  },
  unitBtn: {
    paddingVertical: Theme.spacing.s,
    paddingHorizontal: Theme.spacing.m,
    backgroundColor: Theme.colors.surfaceLight,
    borderRadius: Theme.radii.s,
  },
  unitBtnActive: {
    backgroundColor: Theme.colors.border,
    borderColor: Theme.colors.primary,
    borderWidth: 1,
  },
  unitText: {
    color: Theme.colors.text,
    fontSize: 14,
  }
});
