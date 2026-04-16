import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { ToolCard } from '../components/ToolCard';
import { Theme } from '../constants/theme';
import { Scale, QrCode, Calculator, Key, ListTodo } from 'lucide-react-native';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const TOOLS = [
  {
    id: 'unit-converter',
    title: 'Unit Converter',
    icon: Scale,
    route: 'UnitConverter' as const,
  },
  {
    id: 'qr-scanner',
    title: 'QR Tools',
    icon: QrCode,
    route: 'QrScanner' as const,
  },
  {
    id: 'bmi-calculator',
    title: 'BMI Calculator',
    icon: Calculator,
    route: 'BmiCalculator' as const,
  },
  {
    id: 'password-generator',
    title: 'Pass Generator',
    icon: Key,
    route: 'PasswordGenerator' as const,
  },
  {
    id: 'task-manager',
    title: 'Task Manager',
    icon: ListTodo,
    route: 'TaskManager' as const,
  },
];

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={TOOLS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        renderItem={({ item }) => (
          <ToolCard
            title={item.title}
            icon={item.icon}
            onPress={() => navigation.navigate(item.route)}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  gridContainer: {
    padding: Theme.spacing.s,
  },
});
