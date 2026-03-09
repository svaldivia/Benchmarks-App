import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { addEntry } from '@/data/firebase/entries';
import { ExerciseWithId, getExercises } from '@/data/firebase/exercises';
import { dateToTimestamp } from '@/data/firebase/helpers';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';

export default function NewEntryScreen() {
  const [selectedExercise, setSelectedExercise] = useState('');
  const [weight, setWeight] = useState('');
  const [repMax, setRepMax] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRepMaxDropdownOpen, setIsRepMaxDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [exerciseOptions, setExerciseOptions] = useState<ExerciseWithId[]>([]);

  // Animation values
  const successOpacity = new Animated.Value(0);
  const checkmarkScale = new Animated.Value(0);

  const availableTags = [
    'pr',
    'strength',
    'technique',
    'explosive',
    'test',
    '1rm',
  ];
  const repMaxOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  // Check if form is valid (all required fields filled)
  const isFormValid = selectedExercise && weight && repMax;

  // Function to handle weight input validation (numbers and decimal only)
  const handleWeightChange = (text: string) => {
    // Allow only numbers and one decimal point
    const numericValue = text.replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return;
    }
    setWeight(numericValue);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

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
  }, [animateSuccess, showSuccess]);

  const saveEntry = async () => {
    // Validation
    if (!selectedExercise || !weight || !repMax) {
      // Could add more validation or error messaging
      return;
    }

    // Prepare entry data
    const newEntry = {
      exerciseId: selectedExercise,
      value: parseFloat(weight),
      unit: 'lbs', // This could be made configurable
      repMax: parseInt(repMax, 10),
      createdDate: dateToTimestamp(new Date()),
      tags: selectedTags,
      notes,
    };

    try {
      // Start loading state
      setIsLoading(true);

      // Save entry to data store
      const newEntryId = await addEntry(newEntry);
      console.log('New entry created with ID:', newEntryId);

      // Show success state
      setIsLoading(false);
      setShowSuccess(true);

      // Reset form after success animation completes
      setTimeout(() => {
        setSelectedExercise('');
        setWeight('');
        setRepMax('');
        setNotes('');
        setSelectedTags([]);
      }, 1800); // Allow time for success animation to complete
    } catch (error) {
      console.error('Error saving entry:', error);
      setIsLoading(false);
      // Could add error state/messaging here
    }
  };

  useEffect(() => {
    const fetchExercises = async () => {
      const exercises = await getExercises();
      setExerciseOptions(exercises);
    };

    fetchExercises();
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.header}>
          <ThemedText type="title">New Entry</ThemedText>
        </ThemedView>

        <ThemedView style={styles.formSection}>
          <ThemedText type="subtitle">Select Exercise</ThemedText>
          <Pressable
            style={styles.dropdownButton}
            onPress={() => setIsDropdownOpen(true)}
          >
            <ThemedText style={styles.dropdownButtonText}>
              {selectedExercise
                ? exerciseOptions.find((ex) => ex.id === selectedExercise)
                    ?.name || 'Select an exercise'
                : 'Select an exercise'}
            </ThemedText>
            <IconSymbol size={20} name="chevron.down" color="#FFFFFF" />
          </Pressable>

          <Modal
            visible={isDropdownOpen}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIsDropdownOpen(false)}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setIsDropdownOpen(false)}
            >
              <ThemedView style={styles.modalContent}>
                <ThemedView style={styles.modalHeader}>
                  <ThemedText type="subtitle">Select Exercise</ThemedText>
                  <Pressable onPress={() => setIsDropdownOpen(false)}>
                    <IconSymbol size={24} name="xmark" color="#FFFFFF" />
                  </Pressable>
                </ThemedView>

                <FlatList
                  data={exerciseOptions}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.exerciseListItem,
                        selectedExercise === item.id &&
                          styles.selectedExerciseItem,
                      ]}
                      onPress={() => {
                        setSelectedExercise(item.id);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <ThemedText
                        style={[
                          styles.exerciseItemText,
                          selectedExercise === item.id &&
                            styles.selectedExerciseText,
                        ]}
                      >
                        {item.name}
                      </ThemedText>
                      {selectedExercise === item.id && (
                        <IconSymbol
                          size={20}
                          name="checkmark"
                          color="#0a7ea4"
                        />
                      )}
                    </TouchableOpacity>
                  )}
                  style={styles.exerciseList}
                />
              </ThemedView>
            </Pressable>
          </Modal>
        </ThemedView>

        <ThemedView style={styles.formSection}>
          <ThemedText type="subtitle">Performance</ThemedText>
          <ThemedView style={styles.performanceContainer}>
            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Weight (lbs)</ThemedText>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={handleWeightChange}
                placeholder="0"
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
                selectionColor="#0a7ea4"
              />
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Rep Max</ThemedText>
              <Pressable
                style={styles.performanceDropdown}
                onPress={() => setIsRepMaxDropdownOpen(true)}
              >
                <ThemedText style={styles.dropdownButtonText}>
                  {repMax || 'Select rep max'}
                </ThemedText>
                <IconSymbol size={20} name="chevron.down" color="#FFFFFF" />
              </Pressable>
            </ThemedView>
          </ThemedView>

          <Modal
            visible={isRepMaxDropdownOpen}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIsRepMaxDropdownOpen(false)}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setIsRepMaxDropdownOpen(false)}
            >
              <ThemedView style={styles.modalContent}>
                <ThemedView style={styles.modalHeader}>
                  <ThemedText type="subtitle">Select Rep Max</ThemedText>
                  <Pressable onPress={() => setIsRepMaxDropdownOpen(false)}>
                    <IconSymbol size={24} name="xmark" color="#FFFFFF" />
                  </Pressable>
                </ThemedView>

                <FlatList
                  data={repMaxOptions}
                  keyExtractor={(item) => item.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.exerciseListItem,
                        repMax === item.toString() &&
                          styles.selectedExerciseItem,
                      ]}
                      onPress={() => {
                        setRepMax(item.toString());
                        setIsRepMaxDropdownOpen(false);
                      }}
                    >
                      <ThemedText
                        style={[
                          styles.exerciseItemText,
                          repMax === item.toString() &&
                            styles.selectedExerciseText,
                        ]}
                      >
                        {item} Rep Max
                      </ThemedText>
                      {repMax === item.toString() && (
                        <IconSymbol
                          size={20}
                          name="checkmark"
                          color="#0a7ea4"
                        />
                      )}
                    </TouchableOpacity>
                  )}
                  style={styles.exerciseList}
                />
              </ThemedView>
            </Pressable>
          </Modal>
        </ThemedView>

        <ThemedView style={styles.formSection}>
          <ThemedText type="subtitle">Tags</ThemedText>
          <ThemedView style={styles.tagsContainer}>
            {availableTags.map((tag) => (
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
                    styles.tagText,
                    selectedTags.includes(tag) && styles.selectedTagText,
                  ]}
                >
                  {tag}
                </ThemedText>
              </Pressable>
            ))}
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.formSection}>
          <ThemedText type="subtitle">Notes (Optional)</ThemedText>
          <TextInput
            style={styles.notesInput}
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any details about this workout..."
            placeholderTextColor="#999"
            selectionColor="#0a7ea4"
          />
        </ThemedView>

        <Pressable
          style={[
            styles.saveButton,
            (isLoading || !isFormValid) && styles.disabledButton,
          ]}
          onPress={saveEntry}
          disabled={isLoading || !isFormValid}
        >
          <ThemedText style={styles.saveButtonText}>Save Entry</ThemedText>
          <IconSymbol size={20} name="checkmark" color="#FFFFFF" />
        </Pressable>
      </ScrollView>

      {/* Loading Overlay */}
      {isLoading && (
        <ThemedView style={styles.overlayContainer}>
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0a7ea4" />
            <ThemedText style={styles.loadingText}>Saving entry...</ThemedText>
          </ThemedView>
        </ThemedView>
      )}

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
            <ThemedText style={styles.successText}>Entry Saved!</ThemedText>
          </ThemedView>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  formSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    maxHeight: '70%',
    backgroundColor: '#151718',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  exerciseList: {
    paddingHorizontal: 10,
  },
  exerciseListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedExerciseItem: {
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
  },
  exerciseItemText: {
    fontSize: 16,
    color: '#ffffff',
  },
  selectedExerciseText: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  performanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  inputContainer: {
    flex: 1,
    marginRight: 10,
  },
  inputLabel: {
    marginBottom: 6,
    fontSize: 14,
    opacity: 0.7,
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
  performanceDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  tagOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
    marginBottom: 8,
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
  tagText: {
    fontSize: 14,
    color: '#000000',
  },
  selectedTagText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  notesInput: {
    height: 100,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    textAlignVertical: 'top',
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 0,
    marginBottom: 0,
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
  loadingContainer: {
    backgroundColor: '#151718',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    width: '80%',
    maxWidth: 280,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
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
