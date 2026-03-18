import { ThemedText } from '@/components/ThemedText';
import { Palette } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { addEntry } from '@/data/firebase/entries';
import { ExerciseWithId, getExercises } from '@/data/firebase/exercises';
import { dateToTimestamp } from '@/data/firebase/helpers';
import { useAppColors } from '@/hooks/useAppColors';
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
  View,
} from 'react-native';

export default function NewEntryScreen() {
  const colors = useAppColors();
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

  const successOpacity = new Animated.Value(0);
  const checkmarkScale = new Animated.Value(0);

  const availableTags = ['pr', 'strength', 'technique', 'explosive', 'test', '1rm'];
  const repMaxOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  const isFormValid = selectedExercise && weight && repMax;


  const handleWeightChange = (text: string) => {
    const numericValue = text.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    if (parts.length > 2) return;
    setWeight(numericValue);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

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

  const saveEntry = async () => {
    if (!selectedExercise || !weight || !repMax) return;

    const newEntry = {
      exerciseId: selectedExercise,
      value: parseFloat(weight),
      unit: 'lbs',
      repMax: parseInt(repMax, 10),
      createdDate: dateToTimestamp(new Date()),
      tags: selectedTags,
      notes,
    };

    try {
      setIsLoading(true);
      const newEntryId = await addEntry(newEntry);
      console.log('New entry created with ID:', newEntryId);
      setIsLoading(false);
      setShowSuccess(true);
      setTimeout(() => {
        setSelectedExercise('');
        setWeight('');
        setRepMax('');
        setNotes('');
        setSelectedTags([]);
      }, 1800);
    } catch (error) {
      console.error('Error saving entry:', error);
      setIsLoading(false);
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
      style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText type="title">New Entry</ThemedText>
        </View>

        {/* Select Exercise */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Select Exercise</ThemedText>
          <Pressable
            style={[styles.dropdown, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
            onPress={() => setIsDropdownOpen(true)}
          >
            <ThemedText style={[styles.dropdownText, !selectedExercise && { color: colors.textMuted }]}>
              {selectedExercise
                ? exerciseOptions.find((ex) => ex.id === selectedExercise)?.name || 'Select an exercise'
                : 'Select an exercise'}
            </ThemedText>
            <IconSymbol size={18} name="chevron.down" color={colors.textSecondary} />
          </Pressable>

          <Modal visible={isDropdownOpen} transparent animationType="slide" onRequestClose={() => setIsDropdownOpen(false)}>
            <Pressable style={[styles.modalOverlay, { backgroundColor: colors.overlay }]} onPress={() => setIsDropdownOpen(false)}>
              <View style={[styles.modalContent, { backgroundColor: colors.backgroundSecondary }]}>
                <View style={styles.modalHeader}>
                  <ThemedText type="subtitle">Select Exercise</ThemedText>
                  <Pressable onPress={() => setIsDropdownOpen(false)}>
                    <IconSymbol size={22} name="xmark" color={colors.textSecondary} />
                  </Pressable>
                </View>
                <FlatList
                  data={exerciseOptions}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.listItem,
                        { borderBottomColor: colors.border },
                        selectedExercise === item.id && { backgroundColor: colors.accentBackground },
                      ]}
                      onPress={() => { setSelectedExercise(item.id); setIsDropdownOpen(false); }}
                    >
                      <ThemedText style={[styles.listItemText, selectedExercise === item.id && { color: colors.accentText, fontWeight: '600' }]}>
                        {item.name}
                      </ThemedText>
                      {selectedExercise === item.id && <IconSymbol size={18} name="checkmark" color={colors.accentText} />}
                    </TouchableOpacity>
                  )}
                  style={styles.list}
                />
              </View>
            </Pressable>
          </Modal>
        </View>

        {/* Performance */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Performance</ThemedText>
          <View style={styles.performanceRow}>
            <View style={styles.inputHalf}>
              <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Weight (lbs)</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                value={weight}
                onChangeText={handleWeightChange}
                placeholder="0"
                keyboardType="decimal-pad"
                placeholderTextColor={colors.textMuted}
                selectionColor={colors.tint}
              />
            </View>
            <View style={styles.inputHalf}>
              <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Rep Max</ThemedText>
              <Pressable
                style={[styles.dropdown, styles.dropdownSmall, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
                onPress={() => setIsRepMaxDropdownOpen(true)}
              >
                <ThemedText style={[styles.dropdownText, !repMax && { color: colors.textMuted }]}>
                  {repMax ? `${repMax} RM` : 'Select'}
                </ThemedText>
                <IconSymbol size={16} name="chevron.down" color={colors.textSecondary} />
              </Pressable>
            </View>
          </View>

          <Modal visible={isRepMaxDropdownOpen} transparent animationType="slide" onRequestClose={() => setIsRepMaxDropdownOpen(false)}>
            <Pressable style={[styles.modalOverlay, { backgroundColor: colors.overlay }]} onPress={() => setIsRepMaxDropdownOpen(false)}>
              <View style={[styles.modalContent, { backgroundColor: colors.backgroundSecondary }]}>
                <View style={styles.modalHeader}>
                  <ThemedText type="subtitle">Select Rep Max</ThemedText>
                  <Pressable onPress={() => setIsRepMaxDropdownOpen(false)}>
                    <IconSymbol size={22} name="xmark" color={colors.textSecondary} />
                  </Pressable>
                </View>
                <FlatList
                  data={repMaxOptions}
                  keyExtractor={(item) => item.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.listItem,
                        { borderBottomColor: colors.border },
                        repMax === item.toString() && { backgroundColor: colors.accentBackground },
                      ]}
                      onPress={() => { setRepMax(item.toString()); setIsRepMaxDropdownOpen(false); }}
                    >
                      <ThemedText style={[styles.listItemText, repMax === item.toString() && { color: colors.accentText, fontWeight: '600' }]}>
                        {item} Rep Max
                      </ThemedText>
                      {repMax === item.toString() && <IconSymbol size={18} name="checkmark" color={colors.accentText} />}
                    </TouchableOpacity>
                  )}
                  style={styles.list}
                />
              </View>
            </Pressable>
          </Modal>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Tags</ThemedText>
          <View style={styles.tagsContainer}>
            {availableTags.map((tag) => {
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

        {/* Notes */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Notes (Optional)</ThemedText>
          <TextInput
            style={[styles.notesInput, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.textPrimary }]}
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any details about this workout..."
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.tint}
          />
        </View>

        {/* Save Button */}
        <Pressable
          style={[styles.saveButton, { backgroundColor: colors.tint }, (isLoading || !isFormValid) && styles.disabledButton]}
          onPress={saveEntry}
          disabled={isLoading || !isFormValid}
        >
          <ThemedText style={styles.saveButtonText}>Save Entry</ThemedText>
          <IconSymbol size={18} name="checkmark" color={Palette.white} />
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={[styles.overlayContainer, { backgroundColor: colors.overlay }]}>
          <View style={[styles.loadingBox, { backgroundColor: colors.backgroundSecondary }]}>
            <ActivityIndicator size="large" color={colors.tint} />
            <ThemedText style={styles.loadingText}>Saving entry...</ThemedText>
          </View>
        </View>
      )}

      {/* Success Overlay */}
      {showSuccess && (
        <Animated.View style={[styles.overlayContainer, { backgroundColor: colors.overlay, opacity: successOpacity }]}>
          <View style={styles.successContainer}>
            <Animated.View style={[styles.checkmarkCircle, { backgroundColor: colors.tint, transform: [{ scale: checkmarkScale }] }]}>
              <IconSymbol size={40} name="checkmark" color={Palette.white} />
            </Animated.View>
            <ThemedText style={styles.successText}>Entry Saved!</ThemedText>
          </View>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  dropdownSmall: { height: 48, marginTop: 0, padding: 12 },
  dropdownText: { fontSize: 16 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: {
    maxHeight: '70%',
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
    marginBottom: 12,
  },
  list: { paddingHorizontal: 10 },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderRadius: 8,
    marginHorizontal: 4,
    marginVertical: 1,
  },
  listItemText: { fontSize: 16 },
  performanceRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  inputHalf: { flex: 1 },
  inputLabel: { marginBottom: 6, fontSize: 14 },
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
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tag: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  tagText: { fontSize: 14 },
  notesInput: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    textAlignVertical: 'top',
    fontSize: 16,
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  saveButton: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
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
  loadingBox: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '80%',
    maxWidth: 280,
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  loadingText: { marginTop: 16, fontSize: 16, fontWeight: '500' },
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
