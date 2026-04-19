import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Theme } from '../../constants/theme';
import { FunctionSquare, Hash } from 'lucide-react-native';

type Mode = 'basic' | 'scientific';
type PressHandler = (expr: string, setExpr: (v: string) => void, setDisplay: (v: string) => void) => void;

const factorial = (n: number): number => {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n > 170) return Infinity;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
};

const prepareExpression = (expr: string): string => {
  return expr
    .replace(/π/g, `(${Math.PI})`)
    .replace(/e(?!xp)/g, `(${Math.E})`)
    .replace(/sin\(/g, 'Math.sin(')
    .replace(/cos\(/g, 'Math.cos(')
    .replace(/tan\(/g, 'Math.tan(')
    .replace(/log\(/g, 'Math.log10(')
    .replace(/ln\(/g, 'Math.log(')
    .replace(/sqrt\(/g, 'Math.sqrt(')
    .replace(/\^/g, '**');
};

const replaceFactorial = (expr: string): string => {
  return expr.replace(/(\d+)!/g, (_, n) => `(${factorial(parseInt(n, 10))})`);
};

const safeEval = (expr: string): number => {
  const withFactorials = replaceFactorial(expr);
  const prepared = prepareExpression(withFactorials);
  const fn = new Function(`"use strict"; return (${prepared});`);
  return fn();
};

const formatResult = (n: number): string => {
  if (Number.isNaN(n)) return 'Error';
  if (!Number.isFinite(n)) return n > 0 ? 'Infinity' : '-Infinity';
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return n.toString();
  const s = n.toPrecision(10);
  return parseFloat(s).toString();
};

interface ButtonDef {
  label: string;
  onPress: PressHandler;
  color?: string;
  textColor?: string;
}

const btn = (label: string, onPress: PressHandler, color?: string, textColor?: string): ButtonDef => ({
  label, onPress, color, textColor,
});

const basicButtons: ButtonDef[] = [
  btn('C', (_, __, setDisp) => { setDisp(''); }, Theme.colors.error, '#fff'),
  btn('( )', (expr, setExpr) => {
    const open = (expr.match(/\(/g) || []).length;
    const close = (expr.match(/\)/g) || []).length;
    const last = expr.slice(-1);
    if (open === close || last === '(' || '+−×÷'.includes(last)) {
      setExpr(expr + '(');
    } else {
      setExpr(expr + ')');
    }
  }, Theme.colors.surfaceLight, Theme.colors.text),
  btn('%', (expr, setExpr) => { setExpr(expr + '%'); }, Theme.colors.surfaceLight, Theme.colors.text),
  btn('÷', (expr, setExpr) => { setExpr(expr + '/'); }, Theme.colors.secondary, '#fff'),
  btn('7', (expr, setExpr) => { setExpr(expr + '7'); }),
  btn('8', (expr, setExpr) => { setExpr(expr + '8'); }),
  btn('9', (expr, setExpr) => { setExpr(expr + '9'); }),
  btn('×', (expr, setExpr) => { setExpr(expr + '*'); }, Theme.colors.secondary, '#fff'),
  btn('4', (expr, setExpr) => { setExpr(expr + '4'); }),
  btn('5', (expr, setExpr) => { setExpr(expr + '5'); }),
  btn('6', (expr, setExpr) => { setExpr(expr + '6'); }),
  btn('−', (expr, setExpr) => { setExpr(expr + '-'); }, Theme.colors.secondary, '#fff'),
  btn('1', (expr, setExpr) => { setExpr(expr + '1'); }),
  btn('2', (expr, setExpr) => { setExpr(expr + '2'); }),
  btn('3', (expr, setExpr) => { setExpr(expr + '3'); }),
  btn('+', (expr, setExpr) => { setExpr(expr + '+'); }, Theme.colors.secondary, '#fff'),
  btn('⌫', (expr, setExpr) => { setExpr(expr.slice(0, -1)); }, Theme.colors.surfaceLight, Theme.colors.text),
  btn('0', (expr, setExpr) => { setExpr(expr + '0'); }),
  btn('.', (expr, setExpr) => { setExpr(expr + '.'); }),
  btn('=', (expr, setExpr, setDisp) => {
    if (!expr) return;
    try {
      const result = safeEval(expr);
      setDisp(formatResult(result));
    } catch {
      setDisp('Error');
    }
  }, Theme.colors.primary, '#000'),
];

const sciButtons: ButtonDef[] = [
  btn('sin', (expr, setExpr) => { setExpr(expr + 'sin('); }, Theme.colors.surfaceLight, Theme.colors.primary),
  btn('cos', (expr, setExpr) => { setExpr(expr + 'cos('); }, Theme.colors.surfaceLight, Theme.colors.primary),
  btn('tan', (expr, setExpr) => { setExpr(expr + 'tan('); }, Theme.colors.surfaceLight, Theme.colors.primary),
  btn('log', (expr, setExpr) => { setExpr(expr + 'log('); }, Theme.colors.surfaceLight, Theme.colors.primary),
  btn('ln', (expr, setExpr) => { setExpr(expr + 'ln('); }, Theme.colors.surfaceLight, Theme.colors.primary),
  btn('√', (expr, setExpr) => { setExpr(expr + 'sqrt('); }, Theme.colors.surfaceLight, Theme.colors.primary),
  btn('x²', (expr, setExpr) => { setExpr(expr + '^2'); }, Theme.colors.surfaceLight, Theme.colors.primary),
  btn('xʸ', (expr, setExpr) => { setExpr(expr + '^'); }, Theme.colors.surfaceLight, Theme.colors.primary),
  btn('π', (expr, setExpr) => { setExpr(expr + 'π'); }, Theme.colors.surfaceLight, Theme.colors.primary),
  btn('e', (expr, setExpr) => { setExpr(expr + 'e'); }, Theme.colors.surfaceLight, Theme.colors.primary),
  btn('n!', (expr, setExpr) => { setExpr(expr + '!'); }, Theme.colors.surfaceLight, Theme.colors.primary),
  btn('(', (expr, setExpr) => { setExpr(expr + '('); }, Theme.colors.surfaceLight, Theme.colors.text),
];

export const CalculatorScreen = () => {
  const [mode, setMode] = useState<Mode>('basic');
  const [expression, setExpression] = useState('');
  const [display, setDisplay] = useState('');

  const handlePress = useCallback((btn: ButtonDef) => {
    btn.onPress(expression, setExpression, setDisplay);
  }, [expression]);

  const clear = () => {
    setExpression('');
    setDisplay('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, mode === 'basic' && styles.tabActive]}
          onPress={() => setMode('basic')}
        >
          <Hash size={18} color={mode === 'basic' ? '#000' : Theme.colors.text} />
          <Text style={[styles.tabText, mode === 'basic' && styles.tabTextActive]}>Basic</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, mode === 'scientific' && styles.tabActive]}
          onPress={() => setMode('scientific')}
        >
          <FunctionSquare size={18} color={mode === 'scientific' ? '#000' : Theme.colors.text} />
          <Text style={[styles.tabText, mode === 'scientific' && styles.tabTextActive]}>Scientific</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.displayCard}>
        <ScrollView horizontal style={styles.exprScroll} contentContainerStyle={styles.exprContent}>
          <Text style={styles.expression} numberOfLines={1}>{expression || ' '}</Text>
        </ScrollView>
        <Text style={styles.result} numberOfLines={1}>{display || '0'}</Text>
      </View>

      {mode === 'scientific' && (
        <View style={styles.grid}>
          {sciButtons.map((b, i) => (
            <TouchableOpacity
              key={`sci-${i}`}
              style={[styles.sciBtn, { backgroundColor: b.color || Theme.colors.surface }]}
              onPress={() => handlePress(b)}
            >
              <Text style={[styles.sciBtnText, { color: b.textColor || Theme.colors.text }]}>
                {b.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.grid}>
        {basicButtons.map((b, i) => (
          <TouchableOpacity
            key={`basic-${i}`}
            style={[styles.btn, { backgroundColor: b.color || Theme.colors.surface }]}
            onPress={() => handlePress(b)}
          >
            <Text style={[styles.btnText, { color: b.textColor || Theme.colors.text }]}>
              {b.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {display ? (
        <TouchableOpacity style={styles.clearAllBtn} onPress={clear}>
          <Text style={styles.clearAllText}>Clear All</Text>
        </TouchableOpacity>
      ) : null}
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
  displayCard: {
    backgroundColor: Theme.colors.surface,
    margin: Theme.spacing.m,
    padding: Theme.spacing.l,
    borderRadius: Theme.radii.l,
    borderColor: Theme.colors.border,
    borderWidth: 1,
    minHeight: 100,
    justifyContent: 'flex-end',
  },
  exprScroll: {
    maxHeight: 30,
  },
  exprContent: {
    justifyContent: 'flex-end',
  },
  expression: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'right',
  },
  result: {
    ...Theme.typography.h1,
    color: Theme.colors.text,
    textAlign: 'right',
    marginTop: Theme.spacing.s,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Theme.spacing.m,
    gap: Theme.spacing.s,
  },
  btn: {
    width: '23%',
    aspectRatio: 1.3,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Theme.radii.m,
  },
  btnText: {
    fontSize: 20,
    fontWeight: '600',
  },
  sciBtn: {
    width: '23%',
    aspectRatio: 1.8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Theme.radii.m,
  },
  sciBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearAllBtn: {
    backgroundColor: Theme.colors.error,
    margin: Theme.spacing.m,
    padding: Theme.spacing.m,
    borderRadius: Theme.radii.m,
    alignItems: 'center',
  },
  clearAllText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
