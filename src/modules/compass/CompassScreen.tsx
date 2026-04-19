import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg';
import { Theme } from '../../constants/theme';

const getDirection = (deg: number): string => {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
};

export const CompassScreen = () => {
  const [heading, setHeading] = useState(0);
  const [available, setAvailable] = useState<boolean | null>(null);
  const subscription = useRef<{ remove: () => void } | null>(null);
  const smoothRef = useRef(0);

  useEffect(() => {
    let mounted = true;

    Magnetometer.isAvailableAsync().then(isAvail => {
      if (!mounted) return;
      setAvailable(isAvail);
      if (!isAvail) return;

      Magnetometer.setUpdateInterval(60);
      subscription.current = Magnetometer.addListener(({ x, y }) => {
        let raw = Math.atan2(y, x) * (180 / Math.PI);
        if (raw < 0) raw += 360;

        // Low-pass filter for smoothing
        smoothRef.current = smoothRef.current * 0.8 + raw * 0.2;

        // Handle wrap-around (e.g., 359 -> 1)
        let smoothed = smoothRef.current;
        const diff = raw - smoothed;
        if (diff > 180) smoothed += 360;
        else if (diff < -180) smoothed -= 360;

        if (smoothed < 0) smoothed += 360;
        if (smoothed >= 360) smoothed -= 360;

        smoothRef.current = smoothed;
        setHeading(smoothed);
      });
    });

    return () => {
      mounted = false;
      subscription.current?.remove();
      subscription.current = null;
    };
  }, []);

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
        <Text style={styles.errorText}>Magnetometer not available on this device</Text>
        <Text style={styles.infoText}>This feature requires a physical device with a compass sensor</Text>
      </View>
    );
  }

  const direction = getDirection(heading);
  const size = 280;
  const center = size / 2;
  const radius = size / 2 - 20;

  const cardinals = [
    { label: 'N', angle: 0, color: Theme.colors.error },
    { label: 'E', angle: 90, color: Theme.colors.text },
    { label: 'S', angle: 180, color: Theme.colors.text },
    { label: 'W', angle: 270, color: Theme.colors.text },
  ];

  const tickAngles = Array.from({ length: 36 }, (_, i) => i * 10);

  return (
    <View style={styles.container}>
      <View style={styles.compassContainer}>
        <View style={styles.northIndicator} />

        <Svg width={size} height={size}>
          {/* Outer circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill={Theme.colors.surface}
            stroke={Theme.colors.border}
            strokeWidth={2}
          />

          {/* Rotating group */}
          <G rotation={-heading} originX={center} originY={center}>
            {/* Tick marks */}
            {tickAngles.map((angle) => {
              const rad = (angle * Math.PI) / 180;
              const isMajor = angle % 30 === 0;
              const innerR = radius - (isMajor ? 15 : 8);
              const x1 = center + radius * Math.sin(rad);
              const y1 = center - radius * Math.cos(rad);
              const x2 = center + innerR * Math.sin(rad);
              const y2 = center - innerR * Math.cos(rad);
              return (
                <Line
                  key={angle}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={Theme.colors.textSecondary}
                  strokeWidth={isMajor ? 2 : 1}
                />
              );
            })}

            {/* Cardinal direction labels */}
            {cardinals.map(({ label, angle, color }) => {
              const rad = (angle * Math.PI) / 180;
              const labelR = radius - 30;
              const x = center + labelR * Math.sin(rad);
              const y = center - labelR * Math.cos(rad);
              return (
                <SvgText
                  key={label}
                  x={x}
                  y={y}
                  fill={color}
                  fontSize={label === 'N' ? 22 : 18}
                  fontWeight="bold"
                  textAnchor="middle"
                  alignmentBaseline="central"
                >
                  {label}
                </SvgText>
              );
            })}

            {/* North pointer (triangle pointing up) */}
            <Line
              x1={center}
              y1={center - 20}
              x2={center}
              y2={center - (radius - 45)}
              stroke={Theme.colors.error}
              strokeWidth={3}
            />
            {/* South pointer */}
            <Line
              x1={center}
              y1={center + 20}
              x2={center}
              y2={center + (radius - 45)}
              stroke={Theme.colors.textSecondary}
              strokeWidth={3}
            />
          </G>

          {/* Center dot */}
          <Circle cx={center} cy={center} r={6} fill={Theme.colors.primary} />
        </Svg>
      </View>

      <View style={styles.readingCard}>
        <Text style={styles.degreeText}>{Math.round(heading)}°</Text>
        <Text style={styles.directionText}>{direction}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
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
  compassContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.xl,
  },
  northIndicator: {
    position: 'absolute',
    top: -4,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Theme.colors.primary,
    zIndex: 10,
  },
  readingCard: {
    backgroundColor: Theme.colors.surface,
    paddingVertical: Theme.spacing.l,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: Theme.radii.l,
    borderColor: Theme.colors.border,
    borderWidth: 1,
    alignItems: 'center',
  },
  degreeText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: Theme.colors.primary,
  },
  directionText: {
    ...Theme.typography.h2,
    color: Theme.colors.text,
    fontWeight: 'bold',
    marginTop: Theme.spacing.xs,
  },
});
