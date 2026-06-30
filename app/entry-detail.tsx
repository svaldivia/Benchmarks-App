import { ThemedText } from "@/components/ThemedText";
import { getEntryById } from "@/data/firebase/entries";
import { getExerciseById } from "@/data/firebase/exercises";
import { timestampToDate } from "@/data/firebase/helpers";
import { Entry, Exercise } from "@/data/firebase/types";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";

const CARD = "mb-3 rounded-md border border-border bg-surface p-4 shadow-sm";
const LABEL = "mb-1.5 text-sm font-medium uppercase tracking-wide text-text-2";

export default function EntryDetailScreen() {
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  const [entry, setEntry] = useState<(Entry & { exercise: Exercise }) | null>(
    null
  );

  useEffect(() => {
    const fetchEntry = async () => {
      const entry = await getEntryById(entryId);
      if (entry) {
        const exercise = await getExerciseById(entry.exerciseId);
        if (exercise) {
          setEntry({ ...entry, exercise });
        }
      }
    };
    if (entryId) fetchEntry();
  }, [entryId]);

  if (!entryId || !entry) {
    return (
      <View className="flex-1 bg-bg">
        <ThemedText>Entry not found</ThemedText>
      </View>
    );
  }

  const exerciseName = entry.exercise.name;
  const formattedDate = timestampToDate(entry.createdDate).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <View className="flex-1 bg-bg">
      <View className="px-5 pb-4 pt-[60px]">
        <ThemedText type="title" className="text-center">
          Entry Details
        </ThemedText>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className={CARD}>
          <ThemedText className={LABEL}>Exercise</ThemedText>
          <ThemedText className="mb-1 text-h3 font-bold">
            {exerciseName}
          </ThemedText>
          {entry.exercise?.description ? (
            <ThemedText className="mt-1 text-body leading-snug text-text-2">
              {entry.exercise.description}
            </ThemedText>
          ) : null}
        </View>

        <View className="mb-3 flex-row gap-3">
          <View className="flex-1 rounded-md border border-border bg-surface p-4 shadow-sm">
            <ThemedText className={LABEL}>Weight</ThemedText>
            <ThemedText className="text-xl font-bold">
              {entry.value} {entry.unit}
            </ThemedText>
          </View>
          <View className="flex-1 rounded-md border border-border bg-surface p-4 shadow-sm">
            <ThemedText className={LABEL}>Rep Max</ThemedText>
            <ThemedText className="text-xl font-bold">
              {entry.repMax} RM
            </ThemedText>
          </View>
        </View>

        <View className={CARD}>
          <ThemedText className={LABEL}>Date</ThemedText>
          <ThemedText className="text-body-lg">{formattedDate}</ThemedText>
        </View>

        {entry.tags && entry.tags.length > 0 ? (
          <View className={CARD}>
            <ThemedText className={LABEL}>Tags</ThemedText>
            <View className="mt-1 flex-row flex-wrap gap-2">
              {entry.tags.map((tag, index) => (
                <View
                  key={index}
                  className="rounded-md border border-border bg-brand-subtle px-3 py-1.5"
                >
                  <ThemedText className="text-sm text-brand">{tag}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {entry.notes ? (
          <View className={CARD}>
            <ThemedText className={LABEL}>Notes</ThemedText>
            <ThemedText className="text-base leading-snug">
              {entry.notes}
            </ThemedText>
          </View>
        ) : null}

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
