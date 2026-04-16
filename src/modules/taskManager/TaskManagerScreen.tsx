import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard, FlatList } from 'react-native';
import { Theme } from '../../constants/theme';
import { useTaskStore, Task } from './store';
import { Square, CheckSquare, Pencil, Trash2, Plus, Check } from 'lucide-react-native';

export const TaskManagerScreen = () => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  
  const tasks = useTaskStore((state) => state.tasks);
  const addTask = useTaskStore((state) => state.addTask);
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const editTask = useTaskStore((state) => state.editTask);

  const handleAddTask = () => {
    if (newTaskTitle.trim().length > 0) {
      addTask(newTaskTitle.trim());
      setNewTaskTitle('');
      Keyboard.dismiss();
    }
  };

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
  };

  const handleSaveEdit = (id: string) => {
    if (editTaskTitle.trim().length > 0) {
      editTask(id, editTaskTitle.trim());
    }
    setEditingTaskId(null);
    setEditTaskTitle('');
    Keyboard.dismiss();
  };

  const renderItem = ({ item }: { item: Task }) => {
    const isEditing = editingTaskId === item.id;

    if (isEditing) {
      return (
        <View style={styles.taskContainer}>
          <TextInput
            style={styles.editInput}
            value={editTaskTitle}
            onChangeText={setEditTaskTitle}
            autoFocus
            onSubmitEditing={() => handleSaveEdit(item.id)}
            placeholderTextColor={Theme.colors.textSecondary}
          />
          <TouchableOpacity onPress={() => handleSaveEdit(item.id)} style={styles.iconButton}>
            <Check color={Theme.colors.success} size={24} />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.taskContainer}>
        <TouchableOpacity onPress={() => toggleTask(item.id)} style={styles.checkbox}>
          {item.completed ? (
            <CheckSquare color={Theme.colors.primary} size={24} />
          ) : (
             <Square color={Theme.colors.textSecondary} size={24} />
          )}
        </TouchableOpacity>
        
        <Text style={[styles.taskText, item.completed && styles.taskTextCompleted]}>
          {item.title}
        </Text>

        <TouchableOpacity onPress={() => handleStartEdit(item)} style={styles.iconButton}>
          <Pencil color={Theme.colors.textSecondary} size={20} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.iconButton}>
          <Trash2 color={Theme.colors.error} size={20} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
          placeholder="What needs to be done?"
          placeholderTextColor={Theme.colors.textSecondary}
          onSubmitEditing={handleAddTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Plus color="#000" size={24} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks yet. Add one above!</Text>
          </View>
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
  inputContainer: {
    flexDirection: 'row',
    padding: Theme.spacing.m,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: Theme.colors.surfaceLight,
    color: Theme.colors.text,
    padding: Theme.spacing.m,
    borderRadius: Theme.radii.m,
    fontSize: 16,
    marginRight: Theme.spacing.s,
  },
  editInput: {
    flex: 1,
    backgroundColor: Theme.colors.surfaceLight,
    color: Theme.colors.text,
    padding: Theme.spacing.s,
    borderRadius: Theme.radii.m,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: Theme.colors.primary,
    padding: Theme.spacing.m,
    borderRadius: Theme.radii.m,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Theme.spacing.m,
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.m,
    marginBottom: Theme.spacing.s,
    borderRadius: Theme.radii.m,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  checkbox: {
    marginRight: Theme.spacing.m,
  },
  taskText: {
    flex: 1,
    ...Theme.typography.body,
    color: Theme.colors.text,
  },
  taskTextCompleted: {
    color: Theme.colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  iconButton: {
    padding: Theme.spacing.s,
    marginLeft: Theme.spacing.xs,
  },
  emptyContainer: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: Theme.colors.textSecondary,
    ...Theme.typography.body,
  },
});
