import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { Theme } from '../../constants/theme';
import * as Clipboard from 'expo-clipboard';
import { Copy, RefreshCw } from 'lucide-react-native';

export const PasswordGeneratorScreen = () => {
  const [password, setPassword] = useState('Press Generate');
  const [length, setLength] = useState(16);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [useUppercase, setUseUppercase] = useState(true);
  
  const generatePassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    
    let chars = lowercase;
    if (useUppercase) chars += uppercase;
    if (useNumbers) chars += numbers;
    if (useSymbols) chars += symbols;

    let generated = '';
    for (let i = 0; i < length; i++) {
        generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
  };

  const copyToClipboard = async () => {
    if (password && password !== 'Press Generate') {
      await Clipboard.setStringAsync(password);
      // Optional: show a toast here
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.passwordText}>{password}</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.iconBtn} onPress={copyToClipboard}>
            <Copy color={Theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.settingsCard}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Length: {length}</Text>
          <View style={styles.lengthControls}>
            <TouchableOpacity onPress={() => setLength(Math.max(8, length - 1))} style={styles.lenBtn}>
              <Text style={styles.lenBtnText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setLength(Math.min(32, length + 1))} style={styles.lenBtn}>
              <Text style={styles.lenBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Include Uppercase</Text>
          <Switch value={useUppercase} onValueChange={setUseUppercase} trackColor={{ true: Theme.colors.primary }} />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Include Numbers</Text>
          <Switch value={useNumbers} onValueChange={setUseNumbers} trackColor={{ true: Theme.colors.primary }} />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Include Symbols</Text>
          <Switch value={useSymbols} onValueChange={setUseSymbols} trackColor={{ true: Theme.colors.primary }} />
        </View>

      </View>

      <TouchableOpacity style={styles.generateBtn} onPress={generatePassword}>
        <RefreshCw color="#000" style={{ marginRight: Theme.spacing.s }} />
        <Text style={styles.generateBtnText}>Generate Password</Text>
      </TouchableOpacity>
    </ScrollView>
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
    marginBottom: Theme.spacing.m,
    alignItems: 'center',
  },
  passwordText: {
    ...Theme.typography.h2,
    color: Theme.colors.text,
    textAlign: 'center',
    marginVertical: Theme.spacing.m,
    letterSpacing: 2,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: Theme.spacing.s,
  },
  iconBtn: {
    padding: Theme.spacing.s,
    backgroundColor: Theme.colors.surfaceLight,
    borderRadius: Theme.radii.round,
  },
  settingsCard: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.l,
    borderRadius: Theme.radii.l,
    borderColor: Theme.colors.border,
    borderWidth: 1,
    marginBottom: Theme.spacing.l,
  },
  sectionTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.m,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  settingLabel: {
    ...Theme.typography.body,
    color: Theme.colors.text,
  },
  lengthControls: {
    flexDirection: 'row',
    gap: Theme.spacing.s,
  },
  lenBtn: {
    backgroundColor: Theme.colors.surfaceLight,
    width: 40,
    height: 40,
    borderRadius: Theme.radii.s,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lenBtnText: {
    color: Theme.colors.text,
    fontSize: 20,
  },
  generateBtn: {
    backgroundColor: Theme.colors.primary,
    padding: Theme.spacing.m,
    borderRadius: Theme.radii.m,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: Theme.spacing.xxl,
  },
  generateBtnText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
