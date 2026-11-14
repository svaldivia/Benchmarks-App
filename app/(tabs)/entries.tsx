import { QueryBoundary } from "@/components/QueryBoundary";
import { SearchBar } from "@/components/SearchBar";
import { useUserId } from "@/contexts/AuthContext";
import { ThemedText } from "@/components/ThemedText";
import { Badge, Card } from "@/components/ds";
import { EntryWithId } from "@/data/firebase/entries";
import { ExerciseWithId } from "@/data/firebase/exercises";
import { timestampToDate } from "@/data/firebase/helpers";
import { entrySearchQuery, exercisesQuery } from "@/data/firebase/queries";
import { useServerSearch } from "@/hooks/useServerSearch";
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

function EntriesList({ term }: { term: string }) {
  const userId = useUserId();
  // Filtered by Firestore, not here: see searchEntries.
  const { data: entries } = useSuspenseQuery(entrySearchQuery(userId, term));
  const { data: exercises } = useSuspenseQuery(exercisesQuery(userId));

  return (
    <FlatList
      data={entries}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <EntryListItem item={item} exercises={exercises} />
      )}
      contentContainerClassName="px-5 pb-5"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      ListEmptyComponent={
        <ThemedText className="mt-10 text-center text-text-3">
          {term.trim() ? `No entries match “${term.trim()}”` : "No entries yet"}
        </ThemedText>
      }
    />
  );
}

export default function EntriesScreen() {
  const search = useServerSearch();

  return (
    <View className="flex-1 bg-bg pt-15">
      <View className="gap-4 px-5 pb-4">
        <ThemedText type="title">Entries</ThemedText>
        <SearchBar
          value={search.text}
          onChangeText={search.setText}
          placeholder="Search by exercise, tag or note"
          isSearching={search.isSearching}
        />
      </View>
      <QueryBoundary resetKeys={[search.term]}>
        <EntriesList term={search.term} />
      </QueryBoundary>
    </View>
  );
}
