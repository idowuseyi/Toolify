import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { Theme } from '../../constants/theme';

export const BubbleLevelScreen = () => {
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const [available, setAvailable] = useState<boolean | null>(null);
  const subscription = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    let mounted = true;

    Accelerometer.isAvailableAsync().then(isAvail => {
      if (!mounted) return;
      setAvailable(isAvail);
      if (!isAvail) return;

      Accelerometer.setUpdateInterval(80);
      subscription.current = Accelerometer.addListener(({ x, y, z }) => {
        const tX = Math.atan2(x, z) * (180 / Math.PI);
        const tY = Math.atan2(y, z) * (180 / Math.PI);
        setTiltX(tX);
        setTiltY(tY);
      });
    });

    return () => {
      mounted = false;
      subscription.current?.remove();
      subscription.current = null;
    };
  }, []);

  const getStatusColor = () => {
    const absX = Math.abs(tiltX);
    const absY = Math.abs(tiltY);
    if (absX < 2 && absY < 2) return Theme.colors.success;
    if (absX < 10 && absY < 10) return '#FFA726';
    return Theme.colors.error;
  };

  const getStatusText = () => {
    const absX = Math.abs(tiltX);
    const absY = Math.abs(tiltY);
    if (absX < 2 && absY < 2) return 'Level';
    if (absX < 10 && absY < 10) return 'Slightly Tilted';
    return 'Tilted';
  };

  if (available === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.infoText}>Checking sensor availability...</Text>
      </View>
    );
  }

  if (!available) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Accelerometer not available on this device</Text>
        <Text style={styles.infoText}>This feature requires a physical device with motion sensors</Text>
      </View>
    );
  }

  const maxOffset = 80;
  const bubbleX = Math.max(-maxOffset, Math.min(maxOffset, (tiltY / 45) * maxOffset));
  const bubbleY = Math.max(-maxOffset, Math.min(maxOffset, (tiltX / 45) * maxOffset));
  const statusColor = getStatusColor();

  return (
    <View style={styles.container}>
      <View style={styles.levelContainer}>
        <View style={styles.outerCircle}>
          <View style={styles.crosshairH} />
          <View style={styles.crosshairV} />
          <View style={styles.centerDot} />
          <View
            style={[
              styles.bubble,
              {
                transform: [{ translateX: bubbleX }, { translateY: bubbleY }],
                backgroundColor: statusColor,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.statusCard}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusText, { color: statusColor }]}>{getStatusText()}</Text>
      </View>

      <View style={styles.readingsRow}>
        <View style={styles.readingCard}>
          <Text style={styles.readingLabel}>X Axis</Text>
          <Text style={styles.readingValue}>{tiltX.toFixed(1)}°</Text>
        </View>
        <View style={styles.readingCard}>
          <Text style={styles.readingLabel}>Y Axis</Text>
          <Text style={styles.readingValue}>{tiltY.toFixed(1)}°</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
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
  levelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Theme.spacing.xl,
  },
  outerCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  crosshairH: {
    position: 'absolute',
    width: '80%',
    height: 1,
    backgroundColor: Theme.colors.border,
  },
  crosshairV: {
    position: 'absolute',
    height: '80%',
    width: 1,
    backgroundColor: Theme.colors.border,
  },
  centerDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.textSecondary,
  },
  bubble: {
    width: 50,
    height: 50,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    paddingVertical: Theme.spacing.m,
    paddingHorizontal: Theme.spacing.l,
    borderRadius: Theme.radii.l,
    borderColor: Theme.colors.border,
    borderWidth: 1,
    gap: Theme.spacing.m,
    marginVertical: Theme.spacing.m,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    ...Theme.typography.h3,
    fontWeight: 'bold',
  },
  readingsRow: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
    width: '100%',
  },
  readingCard: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.l,
    borderRadius: Theme.radii.l,
    borderColor: Theme.colors.border,
    borderWidth: 1,
    alignItems: 'center',
  },
  readingLabel: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.s,
  },
  readingValue: {
    ...Theme.typography.h2,
    color: Theme.colors.primary,
    fontWeight: 'bold',
  },
});
