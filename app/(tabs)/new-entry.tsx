import { ThemedText } from "@/components/ThemedText";
import { Button, Input } from "@/components/ds";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Palette } from "@/constants/Colors";
import { addEntry } from "@/data/firebase/entries";
import { ExerciseWithId, getExercises } from "@/data/firebase/exercises";
import { dateToTimestamp } from "@/data/firebase/helpers";
import { commonEntryTags, EntryTag } from "@/data/firebase/types";
import { useAppColors } from "@/hooks/useAppColors";
import { usePromise } from "@/hooks/usePromise";
import React, { Suspense, use, useEffect, useState } from "react";
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
  const [selectedTags, setSelectedTags] = useState<EntryTag[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRepMaxDropdownOpen, setIsRepMaxDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const exerciseOptions = use(exercisesPromise);

  const successOpacity = new Animated.Value(0);
  const checkmarkScale = new Animated.Value(0);

  const repMaxOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  const isFormValid = selectedExercise && weight && repMax;

  const handleWeightChange = (text: string) => {
    const numericValue = text.replace(/[^0-9.]/g, "");
    const parts = numericValue.split(".");
    if (parts.length > 2) return;
    setWeight(numericValue);
  };

  const toggleTag = (tag: EntryTag) => {
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
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(checkmarkScale, {
        toValue: 1,
        duration: 500,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.timing(successOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
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
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-5 pb-10 pt-[60px]"
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="title">New Entry</ThemedText>

        {/* Select Exercise */}
        <ThemedText type="subtitle">Select Exercise</ThemedText>
        <Pressable
          className="mt-3 h-12 flex-row items-center justify-between rounded-xs border-[1.5px] border-field-border bg-field-bg px-4"
          onPress={() => setIsDropdownOpen(true)}
        >
          <ThemedText
            className={`font-sans text-body-lg ${selectedExercise ? "" : "text-text-3"}`}
          >
            {selectedExercise
              ? exerciseOptions.find((ex) => ex.id === selectedExercise)
                  ?.name || "Select an exercise"
              : "Select an exercise"}
          </ThemedText>
          <IconSymbol
            size={18}
            name="chevron.down"
            color={colors.textSecondary}
          />
        </Pressable>

        <Modal
          visible={isDropdownOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setIsDropdownOpen(false)}
        >
          <Pressable
            className="flex-1 justify-end bg-scrim"
            onPress={() => setIsDropdownOpen(false)}
          >
            <View className="max-h-[70%] rounded-t-[20px] bg-surface pb-[30px] pt-5">
              <View className="mb-3 flex-row items-center justify-between px-5">
                <ThemedText type="subtitle">Select Exercise</ThemedText>
                <Pressable onPress={() => setIsDropdownOpen(false)}>
                  <IconSymbol
                    size={22}
                    name="xmark"
                    color={colors.textSecondary}
                  />
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
                        selectedExercise === item.id
                          ? "font-semibold text-brand"
                          : ""
                      }`}
                    >
                      {item.name}
                    </ThemedText>
                    {selectedExercise === item.id && (
                      <IconSymbol
                        size={18}
                        name="checkmark"
                        color={colors.accentText}
                      />
                    )}
                  </TouchableOpacity>
                )}
                className="px-2.5"
              />
            </View>
          </Pressable>
        </Modal>

        {/* Performance */}
        <ThemedText type="subtitle">Performance</ThemedText>
        <View className="mt-3 flex-row gap-3">
          <Input
            containerClassName="flex-1"
            label="Weight"
            numeric
            suffix="lbs"
            value={weight}
            onChangeText={handleWeightChange}
            placeholder="0"
            keyboardType="decimal-pad"
          />
          <View className="flex-1 gap-1.5">
            <ThemedText className="font-sans-semibold text-sm text-text-2">
              Rep Max
            </ThemedText>
            <Pressable
              className="h-12 flex-row items-center justify-between rounded-xs border-[1.5px] border-field-border bg-field-bg px-4"
              onPress={() => setIsRepMaxDropdownOpen(true)}
            >
              <ThemedText
                className={`font-sans text-body-lg ${repMax ? "" : "text-text-3"}`}
              >
                {repMax ? `${repMax} RM` : "Select"}
              </ThemedText>
              <IconSymbol
                size={16}
                name="chevron.down"
                color={colors.textSecondary}
              />
            </Pressable>
          </View>

          <Modal
            visible={isRepMaxDropdownOpen}
            transparent
            animationType="slide"
            onRequestClose={() => setIsRepMaxDropdownOpen(false)}
          >
            <Pressable
              className="flex-1 justify-end bg-scrim"
              onPress={() => setIsRepMaxDropdownOpen(false)}
            >
              <View className="max-h-[70%] rounded-t-[20px] bg-surface pb-[30px] pt-5">
                <View className="mb-3 flex-row items-center justify-between px-5">
                  <ThemedText type="subtitle">Select Rep Max</ThemedText>
                  <Pressable onPress={() => setIsRepMaxDropdownOpen(false)}>
                    <IconSymbol
                      size={22}
                      name="xmark"
                      color={colors.textSecondary}
                    />
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
                          repMax === item.toString()
                            ? "font-semibold text-brand"
                            : ""
                        }`}
                      >
                        {item} Rep Max
                      </ThemedText>
                      {repMax === item.toString() && (
                        <IconSymbol
                          size={18}
                          name="checkmark"
                          color={colors.accentText}
                        />
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
        <ThemedText type="subtitle">Tags</ThemedText>
        <View className="mt-3 flex-row flex-wrap gap-2">
          {commonEntryTags.map((tag) => {
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

        {/* Notes */}
        <ThemedText type="subtitle">Notes (Optional)</ThemedText>
        <TextInput
          className="mt-3 min-h-[100px] rounded-xs border-[1.5px] border-field-border bg-field-bg p-4 font-sans text-body-lg text-text"
          style={{ textAlignVertical: "top" }}
          multiline
          numberOfLines={4}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add any details about this workout..."
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.tint}
        />

        {/* Save Button */}
        <Button
          variant="primary"
          size="lg"
          full
          onPress={saveEntry}
          disabled={isLoading || !isFormValid}
        >
          Save Entry
        </Button>
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
  const [exercisesPromise] = usePromise<ExerciseWithId[]>(getExercises);

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
