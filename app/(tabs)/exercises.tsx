import { ThemedText } from '@/components/ThemedText';
import { Palette } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import {
  addExercise,
  ExerciseWithId,
  getExercises,
} from '@/data/firebase/exercises';
import { commonExerciseTags } from '@/data/firebase/types';
import { useAppColors } from '@/hooks/useAppColors';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

export default function ExercisesScreen() {
  const colors = useAppColors();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [exerciseList, setExerciseList] = useState<ExerciseWithId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseDescription, setNewExerciseDescription] = useState('');
  const [newExerciseLink, setNewExerciseLink] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const successOpacity = new Animated.Value(0);
  const checkmarkScale = new Animated.Value(0);

  useEffect(() => {
    const fetchExercises = async () => {
      const exercises = await getExercises();
      setExerciseList(exercises);
    };
    fetchExercises();
  }, []);

  const animateSuccess = () => {
    successOpacity.setValue(0);
    checkmarkScale.setValue(0);
    Animated.sequence([
      Animated.timing(successOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(checkmarkScale, { toValue: 1, duration: 500, easing: Easing.elastic(1), useNativeDriver: true }),
      Animated.delay(1000),
      Animated.timing(successOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShowSuccess(false));
  };

  useEffect(() => {
    if (showSuccess) animateSuccess();
  }, [showSuccess]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddExercise = async () => {
    if (!newExerciseName.trim()) return;

    const newExercise = {
      name: newExerciseName.trim(),
      description: newExerciseDescription.trim(),
      link: newExerciseLink.trim(),
      tags: selectedTags,
    };

    try {
      setIsLoading(true);
      const newId = await addExercise(newExercise);
      console.log('New exercise created with ID:', newId);
      setIsAddModalVisible(false);
      setIsLoading(false);
      setShowSuccess(true);
      setNewExerciseName('');
      setNewExerciseDescription('');
      setNewExerciseLink('');
      setSelectedTags([]);
    } catch (error) {
      console.error('Error adding exercise:', error);
      setIsLoading(false);
    }
  };

  const renderExerciseItem = ({ item }: { item: ExerciseWithId }) => (
    <View style={[styles.exerciseCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
      <ThemedText type="defaultSemiBold" style={styles.exerciseName}>
        {item.name}
      </ThemedText>

      <View style={styles.tagRow}>
        {item.tags.map((tag, index) => (
          <View key={index} style={[styles.tagBadge, { backgroundColor: colors.accentBackground, borderColor: colors.border }]}>
            <ThemedText style={[styles.tagBadgeText, { color: colors.accentText }]}>{tag}</ThemedText>
          </View>
        ))}
      </View>

      {item.description ? (
        <ThemedText style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </ThemedText>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <View style={styles.header}>
        <ThemedText type="title">Exercises</ThemedText>
        <Pressable
          style={[styles.addButton, { backgroundColor: colors.tint }]}
          onPress={() => setIsAddModalVisible(true)}
        >
          <IconSymbol size={22} name="plus" color={Palette.white} />
        </Pressable>
      </View>

      <FlatList
        data={exerciseList}
        keyExtractor={(item) => item.id}
        renderItem={renderExerciseItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={isAddModalVisible} transparent animationType="slide" onRequestClose={() => setIsAddModalVisible(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Add New Exercise</ThemedText>
              <Pressable onPress={() => setIsAddModalVisible(false)}>
                <IconSymbol size={22} name="xmark" color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.formField}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Exercise Name *</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                  value={newExerciseName}
                  onChangeText={setNewExerciseName}
                  placeholder="Name of the exercise"
                  placeholderTextColor={colors.textMuted}
                  selectionColor={colors.tint}
                />
              </View>

              <View style={styles.formField}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Description</ThemedText>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                  value={newExerciseDescription}
                  onChangeText={setNewExerciseDescription}
                  placeholder="Describe the exercise and technique"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  selectionColor={colors.tint}
                />
              </View>

              <View style={styles.formField}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Link (Optional)</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                  value={newExerciseLink}
                  onChangeText={setNewExerciseLink}
                  placeholder="URL to video or guide"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="url"
                  selectionColor={colors.tint}
                />
              </View>

              <View style={styles.formField}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Tags</ThemedText>
                <View style={styles.tagsContainer}>
                  {commonExerciseTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <Pressable
                        key={tag}
                        style={[
                          styles.tag,
                          {
                            backgroundColor: isSelected ? colors.accentBackgroundStrong : colors.accentBackground,
                            borderColor: isSelected ? colors.accentBorder : colors.border,
                          },
                        ]}
                        onPress={() => toggleTag(tag)}
                      >
                        <ThemedText
                          style={[
                            styles.tagText,
                            { color: isSelected ? colors.accentText : colors.textSecondary },
                            isSelected && { fontWeight: '600' },
                          ]}
                        >
                          {tag}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <Pressable
                style={[styles.saveButton, { backgroundColor: colors.tint }, (!newExerciseName.trim() || isLoading) && styles.disabledButton]}
                onPress={handleAddExercise}
                disabled={!newExerciseName.trim() || isLoading}
              >
                <ThemedText style={styles.saveButtonText}>
                  {isLoading ? 'Saving...' : 'Save Exercise'}
                </ThemedText>
                {!isLoading && <IconSymbol size={18} name="checkmark" color={Palette.white} />}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {showSuccess && (
        <Animated.View style={[styles.overlayContainer, { backgroundColor: colors.overlay, opacity: successOpacity }]}>
          <View style={styles.successContainer}>
            <Animated.View style={[styles.checkmarkCircle, { backgroundColor: colors.tint, transform: [{ scale: checkmarkScale }] }]}>
              <IconSymbol size={40} name="checkmark" color={Palette.white} />
            </Animated.View>
            <ThemedText style={styles.successText}>Exercise Added!</ThemedText>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  exerciseCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  exerciseName: { fontSize: 17, marginBottom: 8 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  tagBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  tagBadgeText: { fontSize: 12 },
  description: { fontSize: 14, marginTop: 8, lineHeight: 20 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { maxHeight: '80%', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 20 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  formContainer: { paddingHorizontal: 20 },
  formField: { marginBottom: 20 },
  inputLabel: { fontSize: 15, marginBottom: 8 },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  textArea: { height: 100, paddingTop: 12, textAlignVertical: 'top' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  tagText: { fontSize: 14 },
  saveButton: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    marginTop: 10,
    gap: 8,
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  saveButtonText: { color: Palette.white, fontSize: 18, fontWeight: '600' },
  disabledButton: { opacity: 0.4 },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  successContainer: { alignItems: 'center', justifyContent: 'center' },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successText: { fontSize: 20, fontWeight: 'bold', color: Palette.white },
});
