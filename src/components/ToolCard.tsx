import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Theme } from '../constants/theme';
import { LucideIcon } from 'lucide-react-native';

interface ToolCardProps {
  title: string;
  icon: LucideIcon;
  onPress: () => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ title, icon: Icon, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Icon size={32} color={Theme.colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radii.l,
    padding: Theme.spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    margin: Theme.spacing.s,
    aspectRatio: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  iconContainer: {
    marginBottom: Theme.spacing.m,
  },
  title: {
    ...Theme.typography.body,
    color: Theme.colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
});
