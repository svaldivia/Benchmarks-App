import { QueryBoundary } from "@/components/QueryBoundary";
import { ThemedText } from "@/components/ThemedText";
import { Badge, Card } from "@/components/ds";
import { EntryWithId } from "@/data/firebase/entries";
import { ExerciseWithId } from "@/data/firebase/exercises";
import { timestampToDate } from "@/data/firebase/helpers";
import {
  entriesQuery,
  exercisesQuery,
  queryKeys,
} from "@/data/firebase/queries";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import { useSuspenseQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import { FlatList, View } from "react-native";

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

function EntriesList() {
  const { data: entries } = useSuspenseQuery(entriesQuery());
  const { data: exercises } = useSuspenseQuery(exercisesQuery());

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
  useRefreshOnFocus(queryKeys.entries, queryKeys.exercises);

  return (
    <View className="flex-1 bg-bg pt-15">
      <View className="px-5 pb-4">
        <ThemedText type="title">Entries</ThemedText>
      </View>
      <QueryBoundary>
        <EntriesList />
      </QueryBoundary>
    </View>
  );
}
