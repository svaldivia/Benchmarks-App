import { QueryBoundary } from "@/components/QueryBoundary";
import { ThemedText } from "@/components/ThemedText";
import { Badge, Button, Card, IconButton } from "@/components/ds";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Palette } from "@/constants/Colors";
import { addExercise, ExerciseWithId } from "@/data/firebase/exercises";
import { exercisesQuery, queryKeys } from "@/data/firebase/queries";
import { commonExerciseTags, ExerciseTag } from "@/data/firebase/types";
import { useAppColors } from "@/hooks/useAppColors";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

function ExercisesScreenContent() {
  const colors = useAppColors();
  const queryClient = useQueryClient();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: exerciseList } = useSuspenseQuery(exercisesQuery());

  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseDescription, setNewExerciseDescription] = useState("");
  const [newExerciseLink, setNewExerciseLink] = useState("");
  const [selectedTags, setSelectedTags] = useState<ExerciseTag[]>([]);

  // Refs, not fresh instances each render: a re-render mid-animation (the list
  // refreshing after a save, for one) would otherwise swap in new values and
  // strand the success overlay part-way through.
  const successOpacity = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

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

  const toggleTag = (tag: ExerciseTag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const { mutate: createExercise, isPending: isSaving } = useMutation({
    mutationFn: addExercise,
    onSuccess: () => {
      // Marks the list stale and refetches it in the background. The screen
      // already has data, so it updates in place rather than re-suspending and
      // hiding the success animation behind a spinner.
      void queryClient.invalidateQueries({ queryKey: queryKeys.exercises });
      setIsAddModalVisible(false);
      setShowSuccess(true);
      setNewExerciseName("");
      setNewExerciseDescription("");
      setNewExerciseLink("");
      setSelectedTags([]);
    },
    onError: (error) => {
      console.error("Error adding exercise:", error);
    },
  });

  const handleAddExercise = () => {
    if (!newExerciseName.trim()) return;

    createExercise({
      name: newExerciseName.trim(),
      description: newExerciseDescription.trim(),
      link: newExerciseLink.trim(),
      tags: selectedTags,
    });
  };

  const renderExerciseItem = ({ item }: { item: ExerciseWithId }) => (
    <Card className="mb-3">
      <ThemedText type="defaultSemiBold" className="mb-2 text-body-lg">
        {item.name}
      </ThemedText>

      {item.tags.length > 0 ? (
        <View className="mb-1 flex-row flex-wrap gap-1.5">
          {item.tags.map((tag, index) => (
            <Badge key={index} tone="brand">
              {tag}
            </Badge>
          ))}
        </View>
      ) : null}

      {item.description ? (
        <ThemedText className="mt-2 text-sm/snug text-text-2" numberOfLines={2}>
          {item.description}
        </ThemedText>
      ) : null}
    </Card>
  );

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-row items-center justify-between px-5 pt-15 pb-4">
        <ThemedText type="title">Exercises</ThemedText>
        <IconButton
          variant="solid"
          round
          onPress={() => setIsAddModalVisible(true)}
        >
          <IconSymbol size={22} name="plus" color={Palette.white} />
        </IconButton>
      </View>

      <FlatList
        data={exerciseList}
        keyExtractor={(item) => item.id}
        renderItem={renderExerciseItem}
        contentContainerClassName="px-5 pb-5"
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={isAddModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-scrim">
          <View className="max-h-[80%] rounded-t-[20px] bg-surface pt-5">
            <View className="mb-3 flex-row items-center justify-between px-5">
              <ThemedText type="subtitle">Add New Exercise</ThemedText>
              <Pressable onPress={() => setIsAddModalVisible(false)}>
                <IconSymbol
                  size={22}
                  name="xmark"
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>

            <ScrollView className="px-5">
              <View className="mb-5">
                <ThemedText className="mb-2 font-sans-semibold text-sm text-text-2">
                  Exercise Name *
                </ThemedText>
                <TextInput
                  className="
                    h-12 rounded-xs border-[1.5px] border-field-border
                    bg-field-bg px-4 font-sans text-body-lg text-text
                  "
                  value={newExerciseName}
                  onChangeText={setNewExerciseName}
                  placeholder="Name of the exercise"
                  placeholderTextColor={colors.textMuted}
                  selectionColor={colors.tint}
                />
              </View>

              <View className="mb-5">
                <ThemedText className="mb-2 font-sans-semibold text-sm text-text-2">
                  Description
                </ThemedText>
                <TextInput
                  className="
                    min-h-25 rounded-xs border-[1.5px] border-field-border
                    bg-field-bg px-4 pt-3 font-sans text-body-lg text-text
                  "
                  style={{ textAlignVertical: "top" }}
                  value={newExerciseDescription}
                  onChangeText={setNewExerciseDescription}
                  placeholder="Describe the exercise and technique"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={4}
                  selectionColor={colors.tint}
                />
              </View>

              <View className="mb-5">
                <ThemedText className="mb-2 font-sans-semibold text-sm text-text-2">
                  Link (Optional)
                </ThemedText>
                <TextInput
                  className="
                    h-12 rounded-xs border-[1.5px] border-field-border
                    bg-field-bg px-4 font-sans text-body-lg text-text
                  "
                  value={newExerciseLink}
                  onChangeText={setNewExerciseLink}
                  placeholder="URL to video or guide"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="url"
                  selectionColor={colors.tint}
                />
              </View>

              <View className="mb-5">
                <ThemedText className="mb-2 font-sans-semibold text-sm text-text-2">
                  Tags
                </ThemedText>
                <View className="flex-row flex-wrap gap-2">
                  {commonExerciseTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <Pressable
                        key={tag}
                        className={`
                          rounded-pill border px-4 py-2
                          ${
                            isSelected
                              ? "border-brand bg-brand-subtle-2"
                              : "border-border bg-brand-subtle"
                          }
                        `}
                        onPress={() => toggleTag(tag)}
                      >
                        <ThemedText
                          className={`
                            text-sm
                            ${
                              isSelected
                                ? "font-semibold text-brand"
                                : "text-text-2"
                            }
                          `}
                        >
                          {tag}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <Button
                variant="primary"
                size="lg"
                full
                className="mt-2.5 mb-10"
                onPress={handleAddExercise}
                disabled={!newExerciseName.trim() || isSaving}
              >
                {isSaving ? "Saving…" : "Save Exercise"}
              </Button>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {showSuccess && (
        <Animated.View
          style={{ opacity: successOpacity }}
          className="absolute inset-0 z-10 items-center justify-center bg-scrim"
        >
          <View className="items-center justify-center">
            <Animated.View
              style={{ transform: [{ scale: checkmarkScale }] }}
              className="
                mb-4 size-20 items-center justify-center rounded-full bg-brand
              "
            >
              <IconSymbol size={40} name="checkmark" color={Palette.white} />
            </Animated.View>
            <ThemedText className="text-xl font-bold text-on-brand">
              Exercise Added!
            </ThemedText>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

export default function ExercisesScreen() {
  return (
    <QueryBoundary>
      <ExercisesScreenContent />
    </QueryBoundary>
  );
}
