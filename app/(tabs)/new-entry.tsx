import { QueryBoundary } from "@/components/QueryBoundary";
import { ThemedText } from "@/components/ThemedText";
import { Button, Input } from "@/components/ds";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Palette } from "@/constants/Colors";
import { addEntry } from "@/data/firebase/entries";
import { dateToTimestamp } from "@/data/firebase/helpers";
import { exercisesQuery, queryKeys } from "@/data/firebase/queries";
import { commonEntryTags, EntryTag } from "@/data/firebase/types";
import { useAppColors } from "@/hooks/useAppColors";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
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

function NewEntryScreenContent() {
  const colors = useAppColors();
  const queryClient = useQueryClient();
  const [selectedExercise, setSelectedExercise] = useState("");
  const [weight, setWeight] = useState("");
  const [repMax, setRepMax] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedTags, setSelectedTags] = useState<EntryTag[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRepMaxDropdownOpen, setIsRepMaxDropdownOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: exerciseOptions } = useSuspenseQuery(exercisesQuery());

  // Refs, not fresh instances each render — see exercises.tsx.
  const successOpacity = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

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

  const { mutate: createEntry, isPending: isSaving } = useMutation({
    mutationFn: addEntry,
    onSuccess: () => {
      // Home and Entries read the same cached list, so invalidating here is
      // what makes a new benchmark show up on those tabs. Previously they only
      // picked it up on their next focus refetch.
      void queryClient.invalidateQueries({ queryKey: queryKeys.entries });
      setShowSuccess(true);
      setTimeout(() => {
        setSelectedExercise("");
        setWeight("");
        setRepMax("");
        setNotes("");
        setSelectedTags([]);
      }, 1800);
    },
    onError: (error) => {
      console.error("Error saving entry:", error);
    },
  });

  const saveEntry = () => {
    if (!selectedExercise || !weight || !repMax) return;

    createEntry({
      exerciseId: selectedExercise,
      value: parseFloat(weight),
      unit: "lbs",
      repMax: parseInt(repMax, 10),
      createdDate: dateToTimestamp(new Date()),
      tags: selectedTags,
      notes,
    });
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-5 pt-15 pb-10"
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
            <View className="max-h-[70%] rounded-t-[20px] bg-surface pt-5 pb-7.5">
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
                    className={`mx-1 my-px flex-row items-center justify-between rounded-sm border-b border-border p-3.5 ${
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
            <View className="max-h-[70%] rounded-t-[20px] bg-surface pt-5 pb-7.5">
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
                    className={`mx-1 my-px flex-row items-center justify-between rounded-sm border-b border-border p-3.5 ${
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
          className="mt-3 min-h-25 rounded-xs border-[1.5px] border-field-border bg-field-bg p-4 font-sans text-body-lg text-text"
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
          disabled={isSaving || !isFormValid}
        >
          Save Entry
        </Button>
      </ScrollView>

      {/* Loading Overlay */}
      {isSaving && (
        <View className="absolute inset-0 z-10 items-center justify-center bg-scrim">
          <View className="w-4/5 max-w-70 items-center rounded-lg bg-surface p-6 shadow-lg">
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
              className="mb-4 size-20 items-center justify-center rounded-full bg-brand"
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
  useRefreshOnFocus(queryKeys.exercises);

  return (
    <QueryBoundary>
      <NewEntryScreenContent />
    </QueryBoundary>
  );
}
