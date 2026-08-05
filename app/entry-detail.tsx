import { ThemedText } from "@/components/ThemedText";
import { Badge, Card, StatTile } from "@/components/ds";
import { getEntryById } from "@/data/firebase/entries";
import { getExerciseById } from "@/data/firebase/exercises";
import { timestampToDate } from "@/data/firebase/helpers";
import { Entry, Exercise } from "@/data/firebase/types";
import { useAppColors } from "@/hooks/useAppColors";
import { usePromise } from "@/hooks/usePromise";
import { useLocalSearchParams } from "expo-router";
import React, { Suspense, use } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

type EntryDetailData = (Entry & { exercise: Exercise }) | null;

const LABEL = "mb-1.5 text-xs font-medium uppercase tracking-caps text-text-3";

function fetchEntryDetail(entryId: string): Promise<EntryDetailData> {
  return getEntryById(entryId).then(async (entry) => {
    if (!entry) return null;
    const exercise = await getExerciseById(entry.exerciseId);
    return exercise ? { ...entry, exercise } : null;
  });
}

function EntryDetail({
  entryPromise,
}: {
  entryPromise: Promise<EntryDetailData>;
}) {
  const entry = use(entryPromise);

  if (!entry) {
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
    },
  );

  return (
    <View className="flex-1 bg-bg">
      <View className="px-5 pt-15 pb-4">
        <ThemedText type="title" className="text-center">
          Entry Details
        </ThemedText>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="gap-3"
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <ThemedText className={LABEL}>Exercise</ThemedText>
          <ThemedText type="subtitle" className="mb-1">
            {exerciseName}
          </ThemedText>
          {entry.exercise?.description ? (
            <ThemedText className="mt-1 text-body/snug text-text-2">
              {entry.exercise.description}
            </ThemedText>
          ) : null}
        </Card>

        <View className="flex-row gap-3">
          <Card className="flex-1">
            <StatTile
              size="sm"
              label="Weight"
              value={entry.value}
              unit={entry.unit}
            />
          </Card>
          <Card className="flex-1">
            <StatTile
              size="sm"
              label="Rep Max"
              value={entry.repMax}
              unit="RM"
            />
          </Card>
        </View>

        <Card>
          <ThemedText className={LABEL}>Date</ThemedText>
          <ThemedText className="text-body-lg">{formattedDate}</ThemedText>
        </Card>

        {entry.tags && entry.tags.length > 0 ? (
          <Card>
            <ThemedText className={LABEL}>Tags</ThemedText>
            <View className="mt-1 flex-row flex-wrap gap-2">
              {entry.tags.map((tag, index) => (
                <Badge key={index} tone="brand">
                  {tag}
                </Badge>
              ))}
            </View>
          </Card>
        ) : null}

        {entry.notes ? (
          <Card>
            <ThemedText className={LABEL}>Notes</ThemedText>
            <ThemedText className="text-body/snug">
              {entry.notes}
            </ThemedText>
          </Card>
        ) : null}

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}

export default function EntryDetailScreen() {
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  const colors = useAppColors();
  const [entryPromise] = usePromise<EntryDetailData>(() =>
    entryId ? fetchEntryDetail(entryId) : Promise.resolve(null),
  );

  if (!entryId) {
    return (
      <View className="flex-1 bg-bg">
        <ThemedText>Entry not found</ThemedText>
      </View>
    );
  }

  return (
    <Suspense
      fallback={
        <View className="flex-1 items-center justify-center bg-bg">
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      }
    >
      <EntryDetail entryPromise={entryPromise} />
    </Suspense>
  );
}
