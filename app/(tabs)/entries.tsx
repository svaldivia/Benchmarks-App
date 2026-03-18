import { ThemedText } from '@/components/ThemedText';
import { Palette } from '@/constants/Colors';
import { EntryWithId, getEntries } from '@/data/firebase/entries';
import { ExerciseWithId, getExercises } from '@/data/firebase/exercises';
import { timestampToDate } from '@/data/firebase/helpers';
import { useAppColors } from '@/hooks/useAppColors';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

function EntryListItem({
  item,
  exercises,
  colors,
}: {
  item: EntryWithId;
  exercises: ExerciseWithId[];
  colors: ReturnType<typeof useAppColors>;
}) {
  const exercise = exercises.find((ex) => ex.id === item.exerciseId);
  const exerciseName = exercise?.name || 'Unknown Exercise';
  const formattedDate = timestampToDate(item.createdDate).toLocaleDateString();

  return (
    <Pressable
      style={[styles.entryCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
      onPress={() =>
        router.push({ pathname: '/entry-detail', params: { entryId: item.id } })
      }
    >
      <View style={styles.entryHeader}>
        <ThemedText type="defaultSemiBold" style={styles.exerciseName}>
          {exerciseName}
        </ThemedText>
        <ThemedText style={[styles.date, { color: colors.textSecondary }]}>
          {formattedDate}
        </ThemedText>
      </View>
      <View style={styles.entryDetails}>
        <ThemedText style={styles.value}>
          {item.value} {item.unit}
        </ThemedText>
        <ThemedText style={[styles.repMax, { color: colors.textSecondary }]}>
          {item.repMax} RM
        </ThemedText>
      </View>
    </Pressable>
  );
}

export default function EntriesScreen() {
  const colors = useAppColors();
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
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <View style={styles.header}>
        <ThemedText type="title">Entries</ThemedText>
      </View>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EntryListItem item={item} exercises={exercises} colors={colors} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  entryCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: { fontSize: 17, flex: 1 },
  date: { fontSize: 14 },
  entryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  value: { fontSize: 16, fontWeight: '600' },
  repMax: { fontSize: 14 },
});
