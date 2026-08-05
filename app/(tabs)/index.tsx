import { ThemedText } from "@/components/ThemedText";
import { Avatar, Badge, Card, StatTile } from "@/components/ds";
import { useAuth } from "@/contexts/AuthContext";
import { EntryWithId, getEntries } from "@/data/firebase/entries";
import { ExerciseWithId, getExercises } from "@/data/firebase/exercises";
import { timestampToDate } from "@/data/firebase/helpers";
import { useAppColors } from "@/hooks/useAppColors";
import { usePromise } from "@/hooks/usePromise";
import { router } from "expo-router";
import React, { Suspense, use, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

type HomeData = [EntryWithId[], ExerciseWithId[]];

function fetchHomeData(): Promise<HomeData> {
  return Promise.all([getEntries(), getExercises()]);
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function RecentRow({
  entry,
  exerciseName,
}: {
  entry: EntryWithId;
  exerciseName: string;
}) {
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
        <View className="flex-1">
          <ThemedText type="defaultSemiBold" className="text-body-lg">
            {exerciseName}
          </ThemedText>
          <ThemedText className="text-sm text-text-3">{date}</ThemedText>
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

function HomeContent({ dataPromise }: { dataPromise: Promise<HomeData> }) {
  const { user } = useAuth();
  const [entries, exercises] = use(dataPromise);

  const nameById = new Map(exercises.map((ex) => [ex.id, ex.name]));
  // Pin the window's end to first render so the count can't shift underneath a
  // re-render (reading the clock during render is impure).
  const [now] = useState(() => Date.now());
  const thisWeek = entries.filter(
    (e) => now - timestampToDate(e.createdDate).getTime() < WEEK_MS,
  ).length;
  const recent = entries.slice(0, 3);

  const email = user?.email ?? "";
  const name = email ? email.split("@")[0] : "athlete";
  const greeting = name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerClassName="px-5 pt-15 pb-10"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="mb-5 flex-row items-center justify-between">
        <View>
          <ThemedText type="overline">Your training</ThemedText>
          <ThemedText type="title">Hey, {greeting}</ThemedText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Account settings"
          onPress={() => router.push("/settings")}
        >
          <Avatar name={greeting} size="md" ring />
        </Pressable>
      </View>

      {/* Hero */}
      <Card variant="brand" pad="lg">
        <StatTile
          onBrand
          size="lg"
          label="Weekly trend"
          value={thisWeek}
          unit="/wk"
        />
      </Card>

      {/* Recent entries */}
      <View className="mt-7 mb-3 flex-row items-center justify-between">
        <ThemedText type="subtitle">Recent entries</ThemedText>
        <Pressable onPress={() => router.push("/entries")}>
          <ThemedText className="font-sans-semibold text-sm text-text-link">
            See all
          </ThemedText>
        </Pressable>
      </View>

      {recent.length > 0 ? (
        <View className="gap-2.5">
          {recent.map((entry) => (
            <RecentRow
              key={entry.id}
              entry={entry}
              exerciseName={nameById.get(entry.exerciseId) ?? "Unknown"}
            />
          ))}
        </View>
      ) : (
        <Card variant="inset" pad="lg">
          <ThemedText className="text-center text-text-2">
            No entries yet. Record your first benchmark.
          </ThemedText>
        </Card>
      )}
    </ScrollView>
  );
}

export default function Index() {
  const colors = useAppColors();
  const [dataPromise] = usePromise<HomeData>(fetchHomeData);

  return (
    <Suspense
      fallback={
        <View className="flex-1 items-center justify-center bg-bg">
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      }
    >
      <HomeContent dataPromise={dataPromise} />
    </Suspense>
  );
}
