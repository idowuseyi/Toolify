import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { Theme } from '../../constants/theme';
import { Clock, Hourglass } from 'lucide-react-native';

type Mode = 'stopwatch' | 'timer';

interface Lap {
  id: number;
  splitTime: number;
  totalTime: number;
}

const formatTime = (ms: number, showCs = true): string => {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);

  const pad = (n: number, w = 2) => n.toString().padStart(w, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}${showCs ? `.${pad(cs)}` : ''}`;
  }
  return `${pad(minutes)}:${pad(seconds)}${showCs ? `.${pad(cs)}` : ''}`;
};

export const StopwatchScreen = () => {
  const [mode, setMode] = useState<Mode>('stopwatch');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stopwatch state
  const [swRunning, setSwRunning] = useState(false);
  const [swElapsed, setSwElapsed] = useState(0);
  const [laps, setLaps] = useState<Lap[]>([]);
  const swStartRef = useRef(0);
  const swAccumRef = useRef(0);

  // Timer state
  const [tmRunning, setTmRunning] = useState(false);
  const [tmRemaining, setTmRemaining] = useState(0);
  const [inputH, setInputH] = useState('');
  const [inputM, setInputM] = useState('');
  const [inputS, setInputS] = useState('');
  const tmStartRef = useRef(0);
  const tmTotalRef = useRef(0);

  const clearInterval_ = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearInterval_();
  }, [clearInterval_]);

  // Stopwatch controls
  const swStart = () => {
    swStartRef.current = Date.now();
    swAccumRef.current = swElapsed;
    setSwRunning(true);
    intervalRef.current = setInterval(() => {
      setSwElapsed(swAccumRef.current + (Date.now() - swStartRef.current));
    }, 50);
  };

  const swStop = () => {
    clearInterval_();
    swAccumRef.current = swElapsed;
    setSwRunning(false);
  };

  const swReset = () => {
    clearInterval_();
    setSwRunning(false);
    setSwElapsed(0);
    setLaps([]);
    swAccumRef.current = 0;
  };

  const swLap = () => {
    if (!swRunning) return;
    const lastTotal = laps.length > 0 ? laps[0].totalTime : 0;
    setLaps(prev => [{
      id: prev.length + 1,
      splitTime: swElapsed - lastTotal,
      totalTime: swElapsed,
    }, ...prev]);
  };

  // Timer controls
  const tmStart = () => {
    const h = parseInt(inputH || '0', 10) || 0;
    const m = parseInt(inputM || '0', 10) || 0;
    const s = parseInt(inputS || '0', 10) || 0;
    const totalMs = (h * 3600 + m * 60 + s) * 1000;
    if (totalMs <= 0) return;

    tmTotalRef.current = totalMs;
    tmStartRef.current = Date.now();
    setTmRunning(true);
    setTmRemaining(totalMs);

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - tmStartRef.current;
      const remaining = tmTotalRef.current - elapsed;
      if (remaining <= 0) {
        clearInterval_();
        setTmRemaining(0);
        setTmRunning(false);
        Alert.alert('Timer Complete!', 'Your countdown has finished.');
      } else {
        setTmRemaining(remaining);
      }
    }, 100);
  };

  const tmPause = () => {
    clearInterval_();
    tmTotalRef.current = tmRemaining;
    setTmRunning(false);
  };

  const tmReset = () => {
    clearInterval_();
    setTmRunning(false);
    setTmRemaining(0);
    setInputH('');
    setInputM('');
    setInputS('');
  };

  const switchMode = (m: Mode) => {
    clearInterval_();
    if (mode === 'stopwatch') {
      swStop();
    }
    setMode(m);
    setSwRunning(false);
    setTmRunning(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, mode === 'stopwatch' && styles.tabActive]}
          onPress={() => switchMode('stopwatch')}
        >
          <Clock size={18} color={mode === 'stopwatch' ? '#000' : Theme.colors.text} />
          <Text style={[styles.tabText, mode === 'stopwatch' && styles.tabTextActive]}>Stopwatch</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, mode === 'timer' && styles.tabActive]}
          onPress={() => switchMode('timer')}
        >
          <Hourglass size={18} color={mode === 'timer' ? '#000' : Theme.colors.text} />
          <Text style={[styles.tabText, mode === 'timer' && styles.tabTextActive]}>Timer</Text>
        </TouchableOpacity>
      </View>

      {mode === 'stopwatch' ? (
        <View style={styles.modeContent}>
          <View style={styles.timeCard}>
            <Text style={styles.timeDisplay}>{formatTime(swElapsed)}</Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.controlBtn, { backgroundColor: swRunning ? Theme.colors.error : Theme.colors.success }]}
              onPress={swRunning ? swStop : swStart}
            >
              <Text style={styles.controlText}>{swRunning ? 'Stop' : 'Start'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlBtn, { backgroundColor: Theme.colors.surfaceLight }]}
              onPress={swRunning ? swLap : swReset}
            >
              <Text style={[styles.controlText, { color: Theme.colors.text }]}>
                {swRunning ? 'Lap' : 'Reset'}
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={laps}
            keyExtractor={(item) => item.id.toString()}
            style={styles.lapList}
            renderItem={({ item, index }) => {
              const isFastest = laps.length > 2 && item.splitTime === Math.min(...laps.map(l => l.splitTime));
              const isSlowest = laps.length > 2 && item.splitTime === Math.max(...laps.map(l => l.splitTime));
              return (
                <View style={[styles.lapItem, index === 0 && styles.lapItemFirst]}>
                  <Text style={styles.lapNum}>Lap {item.id}</Text>
                  <Text style={[
                    styles.lapSplit,
                    isFastest && { color: Theme.colors.success },
                    isSlowest && { color: Theme.colors.error },
                  ]}>
                    {formatTime(item.splitTime)}
                  </Text>
                  <Text style={styles.lapTotal}>{formatTime(item.totalTime)}</Text>
                </View>
              );
            }}
          />
        </View>
      ) : (
        <View style={styles.modeContent}>
          {tmRunning || tmRemaining > 0 ? (
            <View style={styles.timeCard}>
              <Text style={styles.timeDisplay}>{formatTime(tmRemaining, false)}</Text>
            </View>
          ) : (
            <View style={styles.timeCard}>
              <Text style={styles.timerLabel}>Set Timer</Text>
              <View style={styles.timerInputs}>
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.timerInput}
                    value={inputH}
                    onChangeText={setInputH}
                    placeholder="0"
                    placeholderTextColor={Theme.colors.textSecondary}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                  <Text style={styles.inputLabel}>Hrs</Text>
                </View>
                <Text style={styles.inputColon}>:</Text>
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.timerInput}
                    value={inputM}
                    onChangeText={setInputM}
                    placeholder="0"
                    placeholderTextColor={Theme.colors.textSecondary}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                  <Text style={styles.inputLabel}>Min</Text>
                </View>
                <Text style={styles.inputColon}>:</Text>
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.timerInput}
                    value={inputS}
                    onChangeText={setInputS}
                    placeholder="0"
                    placeholderTextColor={Theme.colors.textSecondary}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                  <Text style={styles.inputLabel}>Sec</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.controlBtn, { backgroundColor: tmRunning ? Theme.colors.error : Theme.colors.primary }]}
              onPress={tmRunning ? tmPause : tmStart}
            >
              <Text style={styles.controlText}>{tmRunning ? 'Pause' : 'Start'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlBtn, { backgroundColor: Theme.colors.surfaceLight }]}
              onPress={tmReset}
            >
              <Text style={[styles.controlText, { color: Theme.colors.text }]}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
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
  modeContent: {
    flex: 1,
    padding: Theme.spacing.m,
  },
  timeCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radii.l,
    borderColor: Theme.colors.border,
    borderWidth: 1,
    padding: Theme.spacing.xl,
    alignItems: 'center',
    marginVertical: Theme.spacing.l,
  },
  timeDisplay: {
    fontSize: 56,
    fontWeight: 'bold',
    color: Theme.colors.text,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    ...Theme.typography.h3,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.l,
  },
  timerInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.s,
  },
  inputGroup: {
    alignItems: 'center',
  },
  timerInput: {
    backgroundColor: Theme.colors.surfaceLight,
    color: Theme.colors.text,
    fontSize: 36,
    fontWeight: 'bold',
    width: 70,
    textAlign: 'center',
    borderRadius: Theme.radii.m,
    padding: Theme.spacing.s,
  },
  inputLabel: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  inputColon: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Theme.colors.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
    marginBottom: Theme.spacing.l,
  },
  controlBtn: {
    flex: 1,
    paddingVertical: Theme.spacing.l,
    borderRadius: Theme.radii.m,
    alignItems: 'center',
  },
  controlText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  lapList: {
    flex: 1,
  },
  lapItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.m,
    paddingHorizontal: Theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  lapItemFirst: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radii.m,
  },
  lapNum: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    flex: 1,
  },
  lapSplit: {
    ...Theme.typography.body,
    color: Theme.colors.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  lapTotal: {
    ...Theme.typography.body,
    color: Theme.colors.text,
    flex: 1,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});
