import { ThemedText } from '@/components/ThemedText';
import { Palette } from '@/constants/Colors';
import { getEntryById } from '@/data/firebase/entries';
import { getExerciseById } from '@/data/firebase/exercises';
import { timestampToDate } from '@/data/firebase/helpers';
import { Entry, Exercise } from '@/data/firebase/types';
import { useAppColors } from '@/hooks/useAppColors';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function EntryDetailScreen() {
  const colors = useAppColors();
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  const [entry, setEntry] = useState<(Entry & { exercise: Exercise }) | null>(null);

  useEffect(() => {
    const fetchEntry = async () => {
      const entry = await getEntryById(entryId);
      if (entry) {
        const exercise = await getExerciseById(entry.exerciseId);
        if (exercise) {
          setEntry({ ...entry, exercise });
        }
      }
    };
    if (entryId) fetchEntry();
  }, [entryId]);

  if (!entryId || !entry) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
        <ThemedText>Entry not found</ThemedText>
      </View>
    );
  }

  const exerciseName = entry.exercise.name;
  const formattedDate = timestampToDate(entry.createdDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>Entry Details</ThemedText>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <ThemedText style={[styles.cardLabel, { color: colors.textSecondary }]}>Exercise</ThemedText>
          <ThemedText style={styles.exerciseName}>{exerciseName}</ThemedText>
          {entry.exercise?.description && (
            <ThemedText style={[styles.exerciseDescription, { color: colors.textSecondary }]}>
              {entry.exercise.description}
            </ThemedText>
          )}
        </View>

        <View style={styles.performanceRow}>
          <View style={[styles.performanceCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <ThemedText style={[styles.cardLabel, { color: colors.textSecondary }]}>Weight</ThemedText>
            <ThemedText style={styles.performanceValue}>
              {entry.value} {entry.unit}
            </ThemedText>
          </View>
          <View style={[styles.performanceCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <ThemedText style={[styles.cardLabel, { color: colors.textSecondary }]}>Rep Max</ThemedText>
            <ThemedText style={styles.performanceValue}>{entry.repMax} RM</ThemedText>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <ThemedText style={[styles.cardLabel, { color: colors.textSecondary }]}>Date</ThemedText>
          <ThemedText style={styles.dateText}>{formattedDate}</ThemedText>
        </View>

        {entry.tags.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <ThemedText style={[styles.cardLabel, { color: colors.textSecondary }]}>Tags</ThemedText>
            <View style={styles.tagsContainer}>
              {entry.tags.map((tag, index) => (
                <View key={index} style={[styles.tagBadge, { backgroundColor: colors.accentBackground, borderColor: colors.border }]}>
                  <ThemedText style={[styles.tagText, { color: colors.accentText }]}>{tag}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {entry.notes && (
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <ThemedText style={[styles.cardLabel, { color: colors.textSecondary }]}>Notes</ThemedText>
            <ThemedText style={styles.notesText}>{entry.notes}</ThemedText>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { textAlign: 'center' },
  content: { flex: 1, paddingHorizontal: 20 },
  card: {
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
  cardLabel: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  exerciseName: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  exerciseDescription: { fontSize: 15, lineHeight: 22, marginTop: 4 },
  performanceRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  performanceCard: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  performanceValue: { fontSize: 20, fontWeight: 'bold' },
  dateText: { fontSize: 17 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  tagBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1 },
  tagText: { fontSize: 14 },
  notesText: { fontSize: 16, lineHeight: 22 },
});
