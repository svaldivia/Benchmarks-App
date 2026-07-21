import { ThemedText } from "@/components/ThemedText";
import { Avatar, Badge, Card, StatTile } from "@/components/ds";
import { EntryWithId, getEntries } from "@/data/firebase/entries";
import { auth } from "@/data/firebase/firebaseConfig";
import { ExerciseWithId, getExercises } from "@/data/firebase/exercises";
import { timestampToDate } from "@/data/firebase/helpers";
import { useAppColors } from "@/hooks/useAppColors";
import { router, useFocusEffect } from "expo-router";
import React, { Suspense, use, useCallback, useRef, useState } from "react";
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
        router.push({ pathname: "/entry-detail", params: { entryId: entry.id } })
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
            <ThemedText className="text-sm text-text-3"> {entry.unit}</ThemedText>
          </ThemedText>
          <Badge tone="brand">{entry.repMax} RM</Badge>
        </View>
      </View>
    </Card>
  );
}

function HomeContent({ dataPromise }: { dataPromise: Promise<HomeData> }) {
  const [entries, exercises] = use(dataPromise);

  const nameById = new Map(exercises.map((ex) => [ex.id, ex.name]));
  const now = Date.now();
  const thisWeek = entries.filter(
    (e) => now - timestampToDate(e.createdDate).getTime() < WEEK_MS
  ).length;
  const recent = entries.slice(0, 3);

  const email = auth.currentUser?.email ?? "";
  const name = email ? email.split("@")[0] : "athlete";
  const greeting = name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerClassName="px-5 pt-[60px] pb-10"
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
      <View className="mb-3 mt-7 flex-row items-center justify-between">
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
  const [dataPromise, setDataPromise] = useState(() => fetchHomeData());
  const isFirstFocus = useRef(true);

  // Re-fetch on every focus except the first — kept above the Suspense boundary
  // so this effect isn't torn down each time the child suspends.
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      setDataPromise(fetchHomeData());
    }, [])
  );

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
