import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import { Theme } from '../../constants/theme';
import { Camera as CameraIcon, Edit, Copy } from 'lucide-react-native';

export const QrScannerScreen = () => {
  const [mode, setMode] = useState<'scan' | 'generate'>('scan');
  
  // Scanner state
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState<string>('');

  // Generator state
  const [inputText, setInputText] = useState('https://example.com');

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    setScannedData(data);
  };

  const copyToClipboard = async () => {
    if (scannedData) {
      await Clipboard.setStringAsync(scannedData);
      Alert.alert('Copied!', 'QR Data copied to clipboard');
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text style={styles.infoText}>Requesting camera permission...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, mode === 'scan' && styles.tabActive]}
          onPress={() => setMode('scan')}
        >
          <CameraIcon color={mode === 'scan' ? '#000' : Theme.colors.text} size={20} />
          <Text style={[styles.tabText, mode === 'scan' && styles.tabTextActive]}>Scanner</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, mode === 'generate' && styles.tabActive]}
          onPress={() => setMode('generate')}
        >
          <Edit color={mode === 'generate' ? '#000' : Theme.colors.text} size={20} />
          <Text style={[styles.tabText, mode === 'generate' && styles.tabTextActive]}>Generator</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {mode === 'scan' ? (
          <>
            {hasPermission === false ? (
              <Text style={styles.errorText}>No access to camera</Text>
            ) : (
              <View style={styles.cameraWrapper}>
                <CameraView
                  style={styles.camera}
                  facing={'back'}
                  barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                  }}
                  onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                />
                {scanned && (
                  <View style={styles.scanResultOverlay}>
                    <Text style={styles.scanResultText}>{scannedData}</Text>
                    <View style={styles.scanResultActions}>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => setScanned(false)}>
                        <Text style={styles.actionBtnText}>Scan Again</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Theme.colors.surfaceLight }]} onPress={copyToClipboard}>
                        <Copy color={Theme.colors.text} size={20} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}
          </>
        ) : (
          <ScrollView contentContainerStyle={styles.genContainer}>
            <View style={styles.qrWrapper}>
              <QRCode
                value={inputText || ' '}
                size={200}
                color={Theme.colors.primary}
                backgroundColor={Theme.colors.background}
              />
            </View>
            <View style={styles.card}>
              <Text style={styles.label}>Data to encode:</Text>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Enter text or URL"
                placeholderTextColor={Theme.colors.textSecondary}
              />
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  infoText: {
    color: Theme.colors.text,
    textAlign: 'center',
    marginTop: Theme.spacing.xl,
  },
  errorText: {
    color: Theme.colors.error,
    textAlign: 'center',
    marginTop: Theme.spacing.xl,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: Theme.spacing.s,
    backgroundColor: Theme.colors.surface,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    padding: Theme.spacing.m,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Theme.radii.m,
    gap: Theme.spacing.s,
  },
  tabActive: {
    backgroundColor: Theme.colors.primary,
  },
  tabText: {
    ...Theme.typography.body,
    color: Theme.colors.text,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#000',
  },
  content: {
    flex: 1,
  },
  cameraWrapper: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  scanResultOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.l,
    borderTopLeftRadius: Theme.radii.xl,
    borderTopRightRadius: Theme.radii.xl,
    gap: Theme.spacing.m,
  },
  scanResultText: {
    color: Theme.colors.text,
    fontSize: 16,
    textAlign: 'center',
  },
  scanResultActions: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
    justifyContent: 'center',
  },
  actionBtn: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.l,
    paddingVertical: Theme.spacing.m,
    borderRadius: Theme.radii.m,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.s,
  },
  actionBtnText: {
    color: '#000',
    fontWeight: 'bold',
  },
  genContainer: {
    padding: Theme.spacing.m,
    alignItems: 'center',
  },
  qrWrapper: {
    padding: Theme.spacing.xl,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.radii.l,
    marginVertical: Theme.spacing.xl,
    borderColor: Theme.colors.border,
    borderWidth: 1,
  },
  card: {
    width: '100%',
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.l,
    borderRadius: Theme.radii.l,
  },
  label: {
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.s,
  },
  input: {
    backgroundColor: Theme.colors.surfaceLight,
    color: Theme.colors.text,
    padding: Theme.spacing.m,
    borderRadius: Theme.radii.m,
    fontSize: 16,
  }
});
