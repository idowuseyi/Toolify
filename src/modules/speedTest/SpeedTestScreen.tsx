import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Theme } from '../../constants/theme';
import { Play, RotateCcw } from 'lucide-react-native';

type TestState = 'idle' | 'ping' | 'download' | 'upload' | 'complete';

const CLOUDFLARE_DOWN = 'https://speed.cloudflare.com/__down?bytes=';
const CLOUDFLARE_UP = 'https://speed.cloudflare.com/__up';
const TIMEOUT_MS = 30000;

const measurePing = async (): Promise<number> => {
  const times: number[] = [];
  for (let i = 0; i < 5; i++) {
    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      await fetch(`${CLOUDFLARE_DOWN}0`, { cache: 'no-store', signal: controller.signal });
      times.push(Date.now() - start);
    } finally {
      clearTimeout(timeout);
    }
  }
  times.sort((a, b) => a - b);
  return times[Math.floor(times.length / 2)];
};

const measureDownload = async (
  onProgress: (speed: number) => void,
): Promise<number> => {
  const fileSizeBytes = 10 * 1024 * 1024;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const start = Date.now();

  try {
    const response = await fetch(`${CLOUDFLARE_DOWN}${fileSizeBytes}`, {
      cache: 'no-store',
      signal: controller.signal,
    });
    const reader = response.body?.getReader();
    let receivedBytes = 0;

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        receivedBytes += value.length;
        const elapsed = (Date.now() - start) / 1000;
        if (elapsed > 0) {
          onProgress((receivedBytes * 8) / elapsed / 1000000);
        }
      }
    } else {
      const blob = await response.blob();
      receivedBytes = blob.size;
    }

    const elapsed = (Date.now() - start) / 1000;
    return (receivedBytes * 8) / elapsed / 1000000;
  } finally {
    clearTimeout(timeout);
  }
};

const measureUpload = async (): Promise<number> => {
  const dataSize = 2 * 1024 * 1024;
  const data = new Uint8Array(dataSize);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const start = Date.now();

  try {
    await fetch(CLOUDFLARE_UP, {
      method: 'POST',
      body: data,
      signal: controller.signal,
    });
    const elapsed = (Date.now() - start) / 1000;
    return (dataSize * 8) / elapsed / 1000000;
  } finally {
    clearTimeout(timeout);
  }
};

export const SpeedTestScreen = () => {
  const [testState, setTestState] = useState<TestState>('idle');
  const [ping, setPing] = useState<number | null>(null);
  const [download, setDownload] = useState<number | null>(null);
  const [upload, setUpload] = useState<number | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const runTest = useCallback(async () => {
    setError(null);
    setPing(null);
    setDownload(null);
    setUpload(null);
    setCurrentSpeed(0);

    try {
      setTestState('ping');
      const pingResult = await measurePing();
      setPing(pingResult);

      setTestState('download');
      setCurrentSpeed(0);
      const dlResult = await measureDownload((speed) => setCurrentSpeed(speed));
      setDownload(dlResult);
      setCurrentSpeed(dlResult);

      setTestState('upload');
      setCurrentSpeed(0);
      const ulResult = await measureUpload();
      setUpload(ulResult);
      setCurrentSpeed(ulResult);

      setTestState('complete');
    } catch {
      setError('Test failed. Check your internet connection and try again.');
      setTestState('idle');
    }
  }, []);

  const isRunning = testState !== 'idle' && testState !== 'complete';

  const getPhaseLabel = () => {
    switch (testState) {
      case 'ping': return 'Testing Ping...';
      case 'download': return 'Testing Download...';
      case 'upload': return 'Testing Upload...';
      case 'complete': return 'Test Complete';
      default: return 'Ready';
    }
  };

  const gaugeValue = isRunning ? currentSpeed : (download || 0);
  const maxGauge = 100;
  const gaugePercent = Math.min(gaugeValue / maxGauge, 1);

  const size = 240;
  const strokeWidth = 14;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = Math.PI * radius;
  const dashOffset = circumference * (1 - gaugePercent);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.gaugeCard}>
        <Svg width={size} height={size / 2 + 20} style={styles.gauge}>
          {/* Background arc */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={Theme.colors.surfaceLight}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={0}
            rotation="-90"
            originX={center}
            originY={center}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          {(isRunning || testState === 'complete') && (
            <Circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={Theme.colors.primary}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={dashOffset}
              rotation="-90"
              originX={center}
              originY={center}
              strokeLinecap="round"
            />
          )}
        </Svg>

        <View style={styles.gaugeLabel}>
          {isRunning ? (
            <ActivityIndicator size="small" color={Theme.colors.primary} />
          ) : null}
          <Text style={styles.gaugeSpeed}>
            {testState === 'idle' ? '--' : gaugeValue.toFixed(1)}
          </Text>
          <Text style={styles.gaugeUnit}>Mbps</Text>
        </View>
      </View>

      <Text style={styles.phaseLabel}>{getPhaseLabel()}</Text>

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {(testState === 'complete' || ping !== null) && (
        <View style={styles.resultsCard}>
          <Text style={styles.resultsTitle}>Results</Text>

          {ping !== null && (
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Ping</Text>
              <Text style={styles.resultValue}>{Math.round(ping)} <Text style={styles.resultUnit}>ms</Text></Text>
            </View>
          )}

          {download !== null && (
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Download</Text>
              <Text style={[styles.resultValue, { color: Theme.colors.success }]}>
                {download.toFixed(1)} <Text style={styles.resultUnit}>Mbps</Text>
              </Text>
            </View>
          )}

          {upload !== null && (
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Upload</Text>
              <Text style={[styles.resultValue, { color: Theme.colors.secondary }]}>
                {upload.toFixed(1)} <Text style={styles.resultUnit}>Mbps</Text>
              </Text>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity
        style={[styles.startBtn, isRunning && styles.startBtnDisabled]}
        onPress={runTest}
        disabled={isRunning}
      >
        {isRunning ? (
          <ActivityIndicator size="small" color="#000" />
        ) : testState === 'complete' ? (
          <RotateCcw size={20} color="#000" />
        ) : (
          <Play size={20} color="#000" />
        )}
        <Text style={styles.startBtnText}>
          {isRunning ? 'Testing...' : testState === 'complete' ? 'Test Again' : 'Start Test'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    padding: Theme.spacing.m,
    alignItems: 'center',
  },
  gaugeCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radii.l,
    borderColor: Theme.colors.border,
    borderWidth: 1,
    padding: Theme.spacing.l,
    alignItems: 'center',
    width: '100%',
    marginBottom: Theme.spacing.m,
  },
  gauge: {
    marginBottom: Theme.spacing.m,
  },
  gaugeLabel: {
    position: 'absolute',
    bottom: Theme.spacing.xl + 10,
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  gaugeSpeed: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  gaugeUnit: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
  },
  phaseLabel: {
    ...Theme.typography.h3,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.l,
  },
  errorCard: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.l,
    borderRadius: Theme.radii.l,
    borderColor: Theme.colors.error,
    borderWidth: 1,
    width: '100%',
    marginBottom: Theme.spacing.m,
  },
  errorText: {
    ...Theme.typography.body,
    color: Theme.colors.error,
    textAlign: 'center',
  },
  resultsCard: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.l,
    borderRadius: Theme.radii.l,
    borderColor: Theme.colors.border,
    borderWidth: 1,
    width: '100%',
    marginBottom: Theme.spacing.l,
  },
  resultsTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.m,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  resultLabel: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
  },
  resultValue: {
    ...Theme.typography.h3,
    color: Theme.colors.text,
    fontWeight: 'bold',
  },
  resultUnit: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    fontWeight: 'normal',
  },
  startBtn: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.l,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: Theme.radii.m,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.s,
    width: '100%',
  },
  startBtnDisabled: {
    opacity: 0.6,
  },
  startBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
