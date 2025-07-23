import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { EntryWithId, getEntries } from '@/data/firebase/entries';
import { ExerciseWithId, getExercises } from '@/data/firebase/exercises';
import { timestampToDate } from '@/data/firebase/helpers';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';

function EntryListItem({
  item,
  exercises,
}: {
  item: EntryWithId;
  exercises: ExerciseWithId[];
}) {
  const exercise = exercises.find((ex) => ex.id === item.exerciseId);
  const exerciseName = exercise?.name || 'Unknown Exercise';
  const formattedDate = timestampToDate(item.createdDate).toLocaleDateString();

  return (
    <Pressable
      style={styles.entryItem}
      onPress={() =>
        router.push({
          pathname: '/entry-detail',
          params: { entryId: item.id },
        })
      }
    >
      <ThemedView style={styles.entryContainer}>
        <ThemedView style={styles.entryHeader}>
          <ThemedText type="defaultSemiBold" style={styles.exerciseName}>
            {exerciseName}
          </ThemedText>
          <ThemedText style={styles.date}>{formattedDate}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.entryDetails}>
          <ThemedText style={styles.value}>
            {item.value} {item.unit}
          </ThemedText>
          <ThemedText style={styles.repMax}>{item.repMax} RM</ThemedText>
        </ThemedView>
      </ThemedView>
    </Pressable>
  );
}

export default function EntriesScreen() {
  const [entries, setEntries] = useState<EntryWithId[]>([]);
  const [exercises, setExercises] = useState<ExerciseWithId[]>([]);

  // TODO: cache the exercises so we don't have to fetch them every time
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
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Entries</ThemedText>
      </ThemedView>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EntryListItem item={item} exercises={exercises} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  list: {
    paddingHorizontal: 20,
  },
  entryItem: {
    marginBottom: 12,
  },
  entryContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 18,
    flex: 1,
  },
  date: {
    fontSize: 14,
    opacity: 0.7,
  },
  entryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  repMax: {
    fontSize: 14,
    opacity: 0.8,
  },
});
