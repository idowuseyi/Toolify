import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { Theme } from '../../constants/theme';
import { Camera as CameraIcon, Image as ImageIcon, Copy, RotateCcw } from 'lucide-react-native';

type ViewState = 'capture' | 'result';

export const TextScannerScreen = () => {
  const [view, setView] = useState<ViewState>('capture');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const captureWithCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        setExtractedText('');
        setView('result');
      }
    } catch {
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        setExtractedText('');
        setProcessing(true);
        // Simulate processing delay for demo
        setTimeout(() => {
          setProcessing(false);
        }, 1000);
        setView('result');
      }
    } catch {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const copyText = async () => {
    if (!extractedText.trim()) {
      Alert.alert('No Text', 'Please enter or paste text to copy');
      return;
    }
    await Clipboard.setStringAsync(extractedText);
    Alert.alert('Copied!', 'Text copied to clipboard');
  };

  const retake = () => {
    setImageUri(null);
    setExtractedText('');
    setView('capture');
  };

  if (view === 'result') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {imageUri && (
          <View style={styles.imageCard}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
          </View>
        )}

        <View style={styles.textCard}>
          <Text style={styles.label}>Extracted Text</Text>
          <Text style={styles.hint}>Edit or type the text from the image above</Text>
          <TextInput
            style={styles.textInput}
            value={extractedText}
            onChangeText={setExtractedText}
            placeholder="Type or paste the text you see in the image..."
            placeholderTextColor={Theme.colors.textSecondary}
            multiline
            textAlignVertical="top"
            autoFocus
          />
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={copyText}>
            <Copy size={18} color="#000" />
            <Text style={styles.actionBtnText}>Copy Text</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Theme.colors.surfaceLight }]} onPress={retake}>
            <RotateCcw size={18} color={Theme.colors.text} />
            <Text style={[styles.actionBtnText, { color: Theme.colors.text }]}>Retake</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.infoText}>Requesting camera permission...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {hasPermission ? (
        <View style={styles.cameraWrapper}>
          <CameraView style={styles.camera} facing="back" />
          <View style={styles.captureOverlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanHint}>Point your camera at text to capture</Text>
          </View>
        </View>
      ) : (
        <View style={styles.noCameraContainer}>
          <Text style={styles.errorText}>No access to camera</Text>
          <Text style={styles.infoText}>You can still pick an image from your gallery</Text>
        </View>
      )}

      <View style={styles.actionCard}>
        <Text style={styles.sectionTitle}>Capture Text</Text>
        <Text style={styles.sectionDesc}>Take a photo or pick an image, then type out the text you see</Text>

        <View style={styles.captureActions}>
          {hasPermission && (
            <TouchableOpacity style={styles.captureBtn} onPress={captureWithCamera}>
              <CameraIcon size={24} color="#000" />
              <Text style={styles.captureBtnText}>Camera</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.captureBtn, !hasPermission && { flex: 1 }]}
            onPress={pickFromGallery}
          >
            <ImageIcon size={24} color="#000" />
            <Text style={styles.captureBtnText}>Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
  infoText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: Theme.spacing.m,
  },
  errorText: {
    ...Theme.typography.h3,
    color: Theme.colors.error,
    textAlign: 'center',
    marginBottom: Theme.spacing.s,
  },
  cameraWrapper: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  captureOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scanFrame: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    borderRadius: Theme.radii.l,
    backgroundColor: 'transparent',
  },
  scanHint: {
    ...Theme.typography.body,
    color: Theme.colors.text,
    marginTop: Theme.spacing.m,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.s,
    borderRadius: Theme.radii.m,
  },
  noCameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.l,
  },
  actionCard: {
    backgroundColor: Theme.colors.surface,
    margin: Theme.spacing.m,
    padding: Theme.spacing.l,
    borderRadius: Theme.radii.l,
    borderColor: Theme.colors.border,
    borderWidth: 1,
  },
  sectionTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.s,
  },
  sectionDesc: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.l,
  },
  captureActions: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
  },
  captureBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.l,
    borderRadius: Theme.radii.m,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.s,
  },
  captureBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  imageCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radii.l,
    borderColor: Theme.colors.border,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Theme.spacing.m,
  },
  image: {
    width: '100%',
    height: 250,
  },
  textCard: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.l,
    borderRadius: Theme.radii.l,
    borderColor: Theme.colors.border,
    borderWidth: 1,
    marginBottom: Theme.spacing.m,
  },
  label: {
    ...Theme.typography.h3,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  hint: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.m,
  },
  textInput: {
    backgroundColor: Theme.colors.surfaceLight,
    color: Theme.colors.text,
    padding: Theme.spacing.m,
    borderRadius: Theme.radii.m,
    minHeight: 150,
    fontSize: 16,
    lineHeight: 24,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
    marginBottom: Theme.spacing.xl,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.l,
    borderRadius: Theme.radii.m,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.s,
  },
  actionBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
