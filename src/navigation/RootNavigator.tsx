import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Theme } from '../constants/theme';
import { HomeScreen } from '../screens/HomeScreen';
import { UnitConverterScreen } from '../modules/unitConverter/UnitConverterScreen';
import { QrScannerScreen } from '../modules/qrScanner/QrScannerScreen';
import { BmiCalculatorScreen } from '../modules/bmiCalculator/BmiCalculatorScreen';
import { PasswordGeneratorScreen } from '../modules/passwordGenerator/PasswordGeneratorScreen';
import { TaskManagerScreen } from '../modules/taskManager/TaskManagerScreen';
import { CalculatorScreen } from '../modules/calculator/CalculatorScreen';
import { StopwatchScreen } from '../modules/stopwatch/StopwatchScreen';
import { BubbleLevelScreen } from '../modules/bubbleLevel/BubbleLevelScreen';
import { CompassScreen } from '../modules/compass/CompassScreen';
import { TextScannerScreen } from '../modules/textScanner/TextScannerScreen';
import { SpeedTestScreen } from '../modules/speedTest/SpeedTestScreen';

export type RootStackParamList = {
  Home: undefined;
  UnitConverter: undefined;
  QrScanner: undefined;
  BmiCalculator: undefined;
  PasswordGenerator: undefined;
  TaskManager: undefined;
  Calculator: undefined;
  Stopwatch: undefined;
  BubbleLevel: undefined;
  Compass: undefined;
  TextScanner: undefined;
  SpeedTest: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <NavigationContainer
      theme={{
        ...DarkTheme,
        dark: true,
        colors: {
          ...DarkTheme.colors,
          primary: Theme.colors.primary,
          background: Theme.colors.background,
          card: Theme.colors.surface,
          text: Theme.colors.text,
          border: Theme.colors.border,
          notification: Theme.colors.primary,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: Theme.colors.surface,
          },
          headerTintColor: Theme.colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: Theme.colors.background },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Toolify' }} 
        />
        <Stack.Screen 
          name="UnitConverter" 
          component={UnitConverterScreen} 
          options={{ title: 'Unit Converter' }} 
        />
        <Stack.Screen 
          name="QrScanner" 
          component={QrScannerScreen} 
          options={{ title: 'QR Scanner' }} 
        />
        <Stack.Screen 
          name="BmiCalculator" 
          component={BmiCalculatorScreen} 
          options={{ title: 'BMI Calculator' }} 
        />
        <Stack.Screen 
          name="PasswordGenerator" 
          component={PasswordGeneratorScreen} 
          options={{ title: 'Password Generator' }} 
        />
        <Stack.Screen
          name="TaskManager"
          component={TaskManagerScreen}
          options={{ title: 'Task Manager' }}
        />
        <Stack.Screen
          name="Calculator"
          component={CalculatorScreen}
          options={{ title: 'Calculator' }}
        />
        <Stack.Screen
          name="Stopwatch"
          component={StopwatchScreen}
          options={{ title: 'Timer' }}
        />
        <Stack.Screen
          name="BubbleLevel"
          component={BubbleLevelScreen}
          options={{ title: 'Bubble Level' }}
        />
        <Stack.Screen
          name="Compass"
          component={CompassScreen}
          options={{ title: 'Compass' }}
        />
        <Stack.Screen
          name="TextScanner"
          component={TextScannerScreen}
          options={{ title: 'Text Scanner' }}
        />
        <Stack.Screen
          name="SpeedTest"
          component={SpeedTestScreen}
          options={{ title: 'Speed Test' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
