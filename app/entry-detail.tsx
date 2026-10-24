import { QueryBoundary } from "@/components/QueryBoundary";
import { ThemedText } from "@/components/ThemedText";
import { Badge, Card, StatTile } from "@/components/ds";
import { timestampToDate } from "@/data/firebase/helpers";
import { entriesQuery, exercisesQuery } from "@/data/firebase/queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";

const LABEL = "mb-1.5 text-xs font-medium uppercase tracking-caps text-text-3";

/**
 * Reads from the same list queries the Home and Entries tabs use rather than
 * fetching the document on its own. Every way into this screen goes through
 * one of those lists, so the data is already cached and the screen renders
 * without a network round-trip. Fetching the entry on its own here stalled on
 * the first open after a fresh page load. On a deep link the lists load
 * normally.
 */
function EntryDetail({ entryId }: { entryId: string }) {
  const { data: entries } = useSuspenseQuery(entriesQuery());
  const { data: exercises } = useSuspenseQuery(exercisesQuery());

  const found = entries.find((e) => e.id === entryId);
  const exercise = found
    ? exercises.find((ex) => ex.id === found.exerciseId)
    : undefined;
  const entry = found && exercise ? { ...found, exercise } : null;

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

  if (!entryId) {
    return (
      <View className="flex-1 bg-bg">
        <ThemedText>Entry not found</ThemedText>
      </View>
    );
  }

  return (
    <QueryBoundary>
      <EntryDetail entryId={entryId} />
    </QueryBoundary>
  );
}
