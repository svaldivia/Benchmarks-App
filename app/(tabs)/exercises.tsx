import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import {
  addExercise,
  ExerciseWithId,
  getExercises,
} from '@/data/firebase/exercises';
import { commonExerciseTags } from '@/data/firebase/types';
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
} from 'react-native';

export default function ExercisesScreen() {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [exerciseList, setExerciseList] = useState<ExerciseWithId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form state
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseDescription, setNewExerciseDescription] = useState('');
  const [newExerciseLink, setNewExerciseLink] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Animation values
  const successOpacity = new Animated.Value(0);
  const checkmarkScale = new Animated.Value(0);

  useEffect(() => {
    const fetchExercises = async () => {
      const exercises = await getExercises();
      setExerciseList(exercises);
    };

    fetchExercises();
  }, []);

  // Success animation sequence
  const animateSuccess = () => {
    // Reset animation values
    successOpacity.setValue(0);
    checkmarkScale.setValue(0);

    // Start animations in sequence
    Animated.sequence([
      // Fade in the overlay
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Scale up the checkmark
      Animated.timing(checkmarkScale, {
        toValue: 1,
        duration: 500,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
      // Wait for a moment
      Animated.delay(1000),
      // Fade out everything
      Animated.timing(successOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // After animation completes
      setShowSuccess(false);
    });
  };

  // Effect to start animation when success state changes
  useEffect(() => {
    if (showSuccess) {
      animateSuccess();
    }
  }, [showSuccess]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddExercise = async () => {
    // Validate input
    if (!newExerciseName.trim()) {
      return; // Could add error state here
    }

    const newExercise = {
      name: newExerciseName.trim(),
      description: newExerciseDescription.trim(),
      link: newExerciseLink.trim(),
      tags: selectedTags,
    };

    try {
      setIsLoading(true);

      // Add the exercise
      const newId = await addExercise(newExercise);
      console.log('New exercise created with ID:', newId);

      // Close modal and show success
      setIsAddModalVisible(false);
      setIsLoading(false);
      setShowSuccess(true);

      // Reset form
      setNewExerciseName('');
      setNewExerciseDescription('');
      setNewExerciseLink('');
      setSelectedTags([]);
    } catch (error) {
      console.error('Error adding exercise:', error);
      setIsLoading(false);
    }
  };

  const renderExerciseItem = ({ item }: { item: ExerciseWithId }) => {
    return (
      <ThemedView style={styles.exerciseItem}>
        <ThemedView style={styles.exerciseHeader}>
          <ThemedText type="defaultSemiBold" style={styles.exerciseName}>
            {item.name}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.tagContainer}>
          {item.tags.map((tag, index) => (
            <ThemedView key={index} style={styles.tag}>
              <ThemedText style={styles.tagText}>{tag}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>

        {item.description ? (
          <ThemedText style={styles.description} numberOfLines={2}>
            {item.description}
          </ThemedText>
        ) : null}
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Exercises</ThemedText>
        <Pressable
          style={styles.addButton}
          onPress={() => setIsAddModalVisible(true)}
        >
          <IconSymbol size={24} name="plus" color="#FFFFFF" />
        </Pressable>
      </ThemedView>

      <FlatList
        data={exerciseList}
        keyExtractor={(item) => item.id}
        renderItem={renderExerciseItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Exercise Modal */}
      <Modal
        visible={isAddModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ThemedView style={styles.modalHeader}>
              <ThemedText type="subtitle">Add New Exercise</ThemedText>
              <Pressable onPress={() => setIsAddModalVisible(false)}>
                <IconSymbol size={24} name="xmark" color="#FFFFFF" />
              </Pressable>
            </ThemedView>

            <ScrollView style={styles.formContainer}>
              <ThemedView style={styles.formSection}>
                <ThemedText style={styles.inputLabel}>
                  Exercise Name *
                </ThemedText>
                <TextInput
                  style={styles.input}
                  value={newExerciseName}
                  onChangeText={setNewExerciseName}
                  placeholder="Name of the exercise"
                  placeholderTextColor="#999"
                  selectionColor="#0a7ea4"
                />
              </ThemedView>

              <ThemedView style={styles.formSection}>
                <ThemedText style={styles.inputLabel}>Description</ThemedText>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newExerciseDescription}
                  onChangeText={setNewExerciseDescription}
                  placeholder="Describe the exercise and technique"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  selectionColor="#0a7ea4"
                />
              </ThemedView>

              <ThemedView style={styles.formSection}>
                <ThemedText style={styles.inputLabel}>
                  Link (Optional)
                </ThemedText>
                <TextInput
                  style={styles.input}
                  value={newExerciseLink}
                  onChangeText={setNewExerciseLink}
                  placeholder="URL to video or guide"
                  placeholderTextColor="#999"
                  keyboardType="url"
                  selectionColor="#0a7ea4"
                />
              </ThemedView>

              <ThemedView style={styles.formSection}>
                <ThemedText style={styles.inputLabel}>Tags</ThemedText>
                <ThemedView style={styles.tagsContainer}>
                  {commonExerciseTags.map((tag) => (
                    <Pressable
                      key={tag}
                      style={[
                        styles.tagOption,
                        selectedTags.includes(tag) && styles.selectedTag,
                      ]}
                      onPress={() => toggleTag(tag)}
                    >
                      <ThemedText
                        style={[
                          styles.tagOptionText,
                          selectedTags.includes(tag) && styles.selectedTagText,
                        ]}
                      >
                        {tag}
                      </ThemedText>
                    </Pressable>
                  ))}
                </ThemedView>
              </ThemedView>

              <Pressable
                style={[
                  styles.saveButton,
                  (!newExerciseName.trim() || isLoading) &&
                    styles.disabledButton,
                ]}
                onPress={handleAddExercise}
                disabled={!newExerciseName.trim() || isLoading}
              >
                <ThemedText style={styles.saveButtonText}>
                  {isLoading ? 'Saving...' : 'Save Exercise'}
                </ThemedText>
                {!isLoading && (
                  <IconSymbol size={20} name="checkmark" color="#FFFFFF" />
                )}
              </Pressable>
            </ScrollView>
          </ThemedView>
        </ThemedView>
      </Modal>

      {/* Success Overlay */}
      {showSuccess && (
        <Animated.View
          style={[styles.overlayContainer, { opacity: successOpacity }]}
        >
          <ThemedView style={styles.successContainer}>
            <Animated.View
              style={[
                styles.checkmarkCircle,
                { transform: [{ scale: checkmarkScale }] },
              ]}
            >
              <IconSymbol size={40} name="checkmark" color="#FFFFFF" />
            </Animated.View>
            <ThemedText style={styles.successText}>Exercise Added!</ThemedText>
          </ThemedView>
        </Animated.View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  addButton: {
    backgroundColor: '#0a7ea4',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  exerciseItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 18,
    marginBottom: 4,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
    gap: 6,
  },
  tag: {
    backgroundColor: 'rgba(10, 126, 164, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(10, 126, 164, 0.3)',
  },
  tagText: {
    fontSize: 12,
    color: '#0a7ea4',
  },
  description: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    maxHeight: '80%',
    backgroundColor: '#151718',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  formSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    opacity: 0.8,
  },
  input: {
    height: 48,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 5,
  },
  tagOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 1,
  },
  selectedTag: {
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
    borderColor: 'rgba(0, 122, 255, 0.7)',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  tagOptionText: {
    fontSize: 14,
    color: '#ffffff',
  },
  selectedTagText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    marginTop: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  disabledButton: {
    opacity: 0.4,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 10,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
