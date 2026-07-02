import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Palette } from "@/constants/Colors";
import { addEntry } from "@/data/firebase/entries";
import { ExerciseWithId, getExercises } from "@/data/firebase/exercises";
import { dateToTimestamp } from "@/data/firebase/helpers";
import { useAppColors } from "@/hooks/useAppColors";
import { useFocusEffect } from "expo-router";
import React, {
  Suspense,
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

function NewEntryScreenContent({
  exercisesPromise,
}: {
  exercisesPromise: Promise<ExerciseWithId[]>;
}) {
  const colors = useAppColors();
  const [selectedExercise, setSelectedExercise] = useState("");
  const [weight, setWeight] = useState("");
  const [repMax, setRepMax] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRepMaxDropdownOpen, setIsRepMaxDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const exerciseOptions = use(exercisesPromise);

  const successOpacity = new Animated.Value(0);
  const checkmarkScale = new Animated.Value(0);

  const availableTags = ["pr", "strength", "technique", "explosive", "test", "1rm"];
  const repMaxOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  const isFormValid = selectedExercise && weight && repMax;

  const handleWeightChange = (text: string) => {
    const numericValue = text.replace(/[^0-9.]/g, "");
    const parts = numericValue.split(".");
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
      unit: "lbs",
      repMax: parseInt(repMax, 10),
      createdDate: dateToTimestamp(new Date()),
      tags: selectedTags,
      notes,
    };

    try {
      setIsLoading(true);
      const newEntryId = await addEntry(newEntry);
      console.log("New entry created with ID:", newEntryId);
      setIsLoading(false);
      setShowSuccess(true);
      setTimeout(() => {
        setSelectedExercise("");
        setWeight("");
        setRepMax("");
        setNotes("");
        setSelectedTags([]);
      }, 1800);
    } catch (error) {
      console.error("Error saving entry:", error);
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pb-4 pt-[60px]">
          <ThemedText type="title">New Entry</ThemedText>
        </View>

        {/* Select Exercise */}
        <View className="mb-6 px-5">
          <ThemedText type="subtitle">Select Exercise</ThemedText>
          <Pressable
            className="mt-3 flex-row items-center justify-between rounded-md border border-border bg-surface p-3.5 shadow-xs"
            onPress={() => setIsDropdownOpen(true)}
          >
            <ThemedText
              className={`text-base ${selectedExercise ? "" : "text-text-3"}`}
            >
              {selectedExercise
                ? exerciseOptions.find((ex) => ex.id === selectedExercise)?.name ||
                  "Select an exercise"
                : "Select an exercise"}
            </ThemedText>
            <IconSymbol size={18} name="chevron.down" color={colors.textSecondary} />
          </Pressable>

          <Modal visible={isDropdownOpen} transparent animationType="slide" onRequestClose={() => setIsDropdownOpen(false)}>
            <Pressable className="flex-1 justify-end bg-scrim" onPress={() => setIsDropdownOpen(false)}>
              <View className="max-h-[70%] rounded-t-[20px] bg-surface pb-[30px] pt-5">
                <View className="mb-3 flex-row items-center justify-between px-5">
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
                      className={`mx-1 my-px flex-row items-center justify-between rounded-sm border-b border-border px-3.5 py-3.5 ${
                        selectedExercise === item.id ? "bg-brand-subtle" : ""
                      }`}
                      onPress={() => {
                        setSelectedExercise(item.id);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <ThemedText
                        className={`text-base ${
                          selectedExercise === item.id ? "font-semibold text-brand" : ""
                        }`}
                      >
                        {item.name}
                      </ThemedText>
                      {selectedExercise === item.id && (
                        <IconSymbol size={18} name="checkmark" color={colors.accentText} />
                      )}
                    </TouchableOpacity>
                  )}
                  className="px-2.5"
                />
              </View>
            </Pressable>
          </Modal>
        </View>

        {/* Performance */}
        <View className="mb-6 px-5">
          <ThemedText type="subtitle">Performance</ThemedText>
          <View className="mt-3 flex-row gap-3">
            <View className="flex-1">
              <ThemedText className="mb-1.5 text-sm text-text-2">Weight (lbs)</ThemedText>
              <TextInput
                className="h-12 rounded-md border border-border bg-surface px-3.5 text-base text-text shadow-xs"
                value={weight}
                onChangeText={handleWeightChange}
                placeholder="0"
                keyboardType="decimal-pad"
                placeholderTextColor={colors.textMuted}
                selectionColor={colors.tint}
              />
            </View>
            <View className="flex-1">
              <ThemedText className="mb-1.5 text-sm text-text-2">Rep Max</ThemedText>
              <Pressable
                className="h-12 flex-row items-center justify-between rounded-md border border-border bg-surface p-3 shadow-xs"
                onPress={() => setIsRepMaxDropdownOpen(true)}
              >
                <ThemedText className={`text-base ${repMax ? "" : "text-text-3"}`}>
                  {repMax ? `${repMax} RM` : "Select"}
                </ThemedText>
                <IconSymbol size={16} name="chevron.down" color={colors.textSecondary} />
              </Pressable>
            </View>
          </View>

          <Modal visible={isRepMaxDropdownOpen} transparent animationType="slide" onRequestClose={() => setIsRepMaxDropdownOpen(false)}>
            <Pressable className="flex-1 justify-end bg-scrim" onPress={() => setIsRepMaxDropdownOpen(false)}>
              <View className="max-h-[70%] rounded-t-[20px] bg-surface pb-[30px] pt-5">
                <View className="mb-3 flex-row items-center justify-between px-5">
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
                      className={`mx-1 my-px flex-row items-center justify-between rounded-sm border-b border-border px-3.5 py-3.5 ${
                        repMax === item.toString() ? "bg-brand-subtle" : ""
                      }`}
                      onPress={() => {
                        setRepMax(item.toString());
                        setIsRepMaxDropdownOpen(false);
                      }}
                    >
                      <ThemedText
                        className={`text-base ${
                          repMax === item.toString() ? "font-semibold text-brand" : ""
                        }`}
                      >
                        {item} Rep Max
                      </ThemedText>
                      {repMax === item.toString() && (
                        <IconSymbol size={18} name="checkmark" color={colors.accentText} />
                      )}
                    </TouchableOpacity>
                  )}
                  className="px-2.5"
                />
              </View>
            </Pressable>
          </Modal>
        </View>

        {/* Tags */}
        <View className="mb-6 px-5">
          <ThemedText type="subtitle">Tags</ThemedText>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <Pressable
                  key={tag}
                  className={`rounded-pill border px-4 py-2 ${
                    isSelected
                      ? "border-brand bg-brand-subtle-2"
                      : "border-border bg-brand-subtle"
                  }`}
                  onPress={() => toggleTag(tag)}
                >
                  <ThemedText
                    className={`text-sm ${
                      isSelected ? "font-semibold text-brand" : "text-text-2"
                    }`}
                  >
                    {tag}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Notes */}
        <View className="mb-6 px-5">
          <ThemedText type="subtitle">Notes (Optional)</ThemedText>
          <TextInput
            className="mt-3 min-h-[100px] rounded-md border border-border bg-surface p-3.5 text-base text-text shadow-xs"
            style={{ textAlignVertical: "top" }}
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
          className={`mx-5 flex-row items-center justify-center gap-2 rounded-md bg-brand p-4 shadow-sm ${
            isLoading || !isFormValid ? "opacity-40" : ""
          }`}
          onPress={saveEntry}
          disabled={isLoading || !isFormValid}
        >
          <ThemedText className="text-lg font-semibold text-on-brand">
            Save Entry
          </ThemedText>
          <IconSymbol size={18} name="checkmark" color={Palette.white} />
        </Pressable>

        <View className="h-10" />
      </ScrollView>

      {/* Loading Overlay */}
      {isLoading && (
        <View className="absolute inset-0 z-10 items-center justify-center bg-scrim">
          <View className="w-4/5 max-w-[280px] items-center rounded-lg bg-surface p-6 shadow-lg">
            <ActivityIndicator size="large" color={colors.tint} />
            <ThemedText className="mt-4 text-base font-medium">
              Saving entry...
            </ThemedText>
          </View>
        </View>
      )}

      {/* Success Overlay */}
      {showSuccess && (
        <Animated.View
          style={{ opacity: successOpacity }}
          className="absolute inset-0 z-10 items-center justify-center bg-scrim"
        >
          <View className="items-center justify-center">
            <Animated.View
              style={{ transform: [{ scale: checkmarkScale }] }}
              className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-brand"
            >
              <IconSymbol size={40} name="checkmark" color={Palette.white} />
            </Animated.View>
            <ThemedText className="text-xl font-bold text-on-brand">
              Entry Saved!
            </ThemedText>
          </View>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}

export default function NewEntryScreen() {
  const colors = useAppColors();
  const [exercisesPromise, setExercisesPromise] = useState(() =>
    getExercises()
  );
  const isFirstFocus = useRef(true);

  // Re-fetch on every focus except the first. Kept above the Suspense boundary
  // so this effect isn't torn down and re-run each time the child suspends.
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      setExercisesPromise(getExercises());
    }, [])
  );

  return (
    <Suspense
      fallback={
        <View className="flex-1 items-center justify-center bg-bg">
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      }
    >
      <NewEntryScreenContent exercisesPromise={exercisesPromise} />
    </Suspense>
  );
}
