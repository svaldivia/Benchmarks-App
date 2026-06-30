import { ThemedText } from "@/components/ThemedText";
import { EntryWithId, getEntries } from "@/data/firebase/entries";
import { ExerciseWithId, getExercises } from "@/data/firebase/exercises";
import { timestampToDate } from "@/data/firebase/helpers";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, View } from "react-native";

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
    <Pressable
      className="mb-3 rounded-md border border-border bg-surface p-4 shadow-sm"
      onPress={() =>
        router.push({ pathname: "/entry-detail", params: { entryId: item.id } })
      }
    >
      <View className="mb-2 flex-row items-center justify-between">
        <ThemedText type="defaultSemiBold" className="flex-1 text-body-lg">
          {exerciseName}
        </ThemedText>
        <ThemedText className="text-sm text-text-2">{formattedDate}</ThemedText>
      </View>
      <View className="flex-row items-center justify-between">
        <ThemedText className="text-base font-semibold">
          {item.value} {item.unit}
        </ThemedText>
        <ThemedText className="text-sm text-text-2">{item.repMax} RM</ThemedText>
      </View>
    </Pressable>
  );
}

export default function EntriesScreen() {
  const [entries, setEntries] = useState<EntryWithId[]>([]);
  const [exercises, setExercises] = useState<ExerciseWithId[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [entriesData, exercisesData] = await Promise.all([
        getEntries(),
        getExercises(),
      ]);
      setEntries(entriesData);
      setExercises(exercisesData);
    };
    fetchData();
  }, []);

  return (
    <View className="flex-1 bg-bg pt-[60px]">
      <View className="px-5 pb-4">
        <ThemedText type="title">Entries</ThemedText>
      </View>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EntryListItem item={item} exercises={exercises} />
        )}
        contentContainerClassName="px-5 pb-5"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
