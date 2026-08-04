import { ThemedText } from "@/components/ThemedText";
import { Badge, Card } from "@/components/ds";
import { useAppColors } from "@/hooks/useAppColors";
import { EntryWithId, getEntries } from "@/data/firebase/entries";
import { ExerciseWithId, getExercises } from "@/data/firebase/exercises";
import { timestampToDate } from "@/data/firebase/helpers";
import { usePromise } from "@/hooks/usePromise";
import { router } from "expo-router";
import React, { Suspense, use } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";

type EntriesData = [EntryWithId[], ExerciseWithId[]];

function fetchEntriesData() {
  return Promise.all([getEntries(), getExercises()]);
}

function EntryListItem({
  item,
  exercises,
}: {
  item: EntryWithId;
  exercises: ExerciseWithId[];
}) {
  const exercise = exercises.find((ex) => ex.id === item.exerciseId);
  const exerciseName = exercise?.name || "Unknown Exercise";
  const formattedDate = timestampToDate(item.createdDate).toLocaleDateString();

  return (
    <Card
      className="mb-3"
      onPress={() =>
        router.push({ pathname: "/entry-detail", params: { entryId: item.id } })
      }
    >
      <View className="mb-3 flex-row items-center justify-between">
        <ThemedText type="defaultSemiBold" className="flex-1 text-body-lg">
          {exerciseName}
        </ThemedText>
        <ThemedText className="text-sm text-text-3">{formattedDate}</ThemedText>
      </View>
      <View className="flex-row items-end justify-between">
        <ThemedText className="font-display text-h3 text-text">
          {item.value}
          <ThemedText className="text-body-lg text-text-3">
            {" "}
            {item.unit}
          </ThemedText>
        </ThemedText>
        <Badge tone="brand">{item.repMax} RM</Badge>
      </View>
    </Card>
  );
}

function EntriesList({ dataPromise }: { dataPromise: Promise<EntriesData> }) {
  const [entries, exercises] = use(dataPromise);

  return (
    <FlatList
      data={entries}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <EntryListItem item={item} exercises={exercises} />
      )}
      contentContainerClassName="px-5 pb-5"
      showsVerticalScrollIndicator={false}
    />
  );
}

export default function EntriesScreen() {
  const colors = useAppColors();
  const [dataPromise] = usePromise(fetchEntriesData);

  return (
    <View className="flex-1 bg-bg pt-[60px]">
      <View className="px-5 pb-4">
        <ThemedText type="title">Entries</ThemedText>
      </View>
      <Suspense
        fallback={
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.tint} />
          </View>
        }
      >
        <EntriesList dataPromise={dataPromise} />
      </Suspense>
    </View>
  );
}
