import { ExternalLink } from "@/components/ExternalLink";
import { QueryBoundary } from "@/components/QueryBoundary";
import { ThemedText } from "@/components/ThemedText";
import { Badge, Card, StatTile } from "@/components/ds";
import { cx } from "@/components/ds/cn";
import { useUserId } from "@/contexts/AuthContext";
import { EntryWithId } from "@/data/firebase/entries";
import { timestampToDate } from "@/data/firebase/helpers";
import {
  entriesForExerciseQuery,
  exerciseDetailQuery,
} from "@/data/firebase/queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";

const LABEL = "mb-1.5 text-xs font-medium uppercase tracking-caps text-text-3";

function NotFound() {
  return (
    <View className="flex-1 items-center justify-center bg-bg px-8">
      <ThemedText>Exercise not found</ThemedText>
    </View>
  );
}

function EntryRow({ entry }: { entry: EntryWithId }) {
  const date = timestampToDate(entry.createdDate).toLocaleDateString();
  return (
    <Card
      pad="sm"
      variant="flat"
      onPress={() =>
        router.push({
          pathname: "/entry-detail",
          params: { entryId: entry.id },
        })
      }
    >
      <View className="flex-row items-center gap-3">
        <View className="flex-1 gap-1">
          <ThemedText className="text-sm text-text-3">{date}</ThemedText>
          {entry.notes ? (
            <ThemedText className="text-sm text-text-2" numberOfLines={1}>
              {entry.notes}
            </ThemedText>
          ) : null}
        </View>
        <View className="items-end gap-1">
          <ThemedText className="font-display text-h4 text-text">
            {entry.value}
            <ThemedText className="text-sm text-text-3">
              {" "}
              {entry.unit}
            </ThemedText>
          </ThemedText>
          <Badge tone="brand">{entry.repMax} RM</Badge>
        </View>
      </View>
    </Card>
  );
}

/**
 * The heaviest entry, compared only against entries in the same unit as the
 * most recent one so kg and lb are never mixed. Ties go to the earliest entry,
 * the day the PB was first hit. Entries arrive newest first.
 */
function findPersonalBest(entries: EntryWithId[]): EntryWithId | null {
  const latest = entries[0];
  if (!latest) return null;
  let best: EntryWithId | null = null;
  for (const entry of entries) {
    if (entry.unit !== latest.unit) continue;
    if (!best || entry.value >= best.value) best = entry;
  }
  return best;
}

function PersonalBestCard({ entry }: { entry: EntryWithId }) {
  const date = timestampToDate(entry.createdDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <Card
      variant="brand"
      onPress={() =>
        router.push({
          pathname: "/entry-detail",
          params: { entryId: entry.id },
        })
      }
    >
      <View className="flex-row items-end justify-between gap-3">
        <StatTile
          onBrand
          label="Personal Best"
          value={entry.value}
          unit={entry.unit}
        />
        <ThemedText className="font-sans-bold text-body-lg text-white">
          {entry.repMax} RM
        </ThemedText>
      </View>
      <ThemedText className="mt-2 text-sm text-white/70">{date}</ThemedText>
      {entry.notes ? (
        <ThemedText className="mt-1 text-sm text-white/90" numberOfLines={2}>
          {entry.notes}
        </ThemedText>
      ) : null}
    </Card>
  );
}

function ExerciseDetail({ exerciseId }: { exerciseId: string }) {
  const userId = useUserId();
  const { data: exercise } = useSuspenseQuery(
    exerciseDetailQuery(userId, exerciseId),
  );
  const { data: entries } = useSuspenseQuery(
    entriesForExerciseQuery(userId, exerciseId),
  );

  if (!exercise) return <NotFound />;

  const personalBest = findPersonalBest(entries);

  return (
    <View className="flex-1 bg-bg">
      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="gap-3 pt-5"
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <ThemedText type="title" className="mb-2">
            {exercise.name}
          </ThemedText>
          {exercise.tags.length > 0 ? (
            <View className="mb-1 flex-row flex-wrap gap-1.5">
              {exercise.tags.map((tag) => (
                <Badge key={tag} tone="brand">
                  {tag}
                </Badge>
              ))}
            </View>
          ) : null}
          {exercise.description ? (
            <ThemedText className="mt-2 text-body/snug text-text-2">
              {exercise.description}
            </ThemedText>
          ) : null}
          {exercise.link ? (
            <ExternalLink href={exercise.link} className="mt-3">
              <ThemedText type="link">Watch / read guide</ThemedText>
            </ExternalLink>
          ) : null}
        </Card>

        {personalBest ? <PersonalBestCard entry={personalBest} /> : null}

        <ThemedText className={cx(LABEL, "mt-2")}>
          Entries ({entries.length})
        </ThemedText>
        {entries.length > 0 ? (
          entries.map((entry) => <EntryRow key={entry.id} entry={entry} />)
        ) : (
          <Card variant="inset">
            <ThemedText className="text-center text-sm text-text-2">
              No entries logged for this exercise yet.
            </ThemedText>
          </Card>
        )}

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}

export default function ExerciseDetailScreen() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();

  if (!exerciseId) return <NotFound />;

  return (
    <QueryBoundary>
      <ExerciseDetail exerciseId={exerciseId} />
    </QueryBoundary>
  );
}
