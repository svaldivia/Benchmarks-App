import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getEntryById } from '@/data/firebase/entries';
import { getExerciseById } from '@/data/firebase/exercises';
import { timestampToDate } from '@/data/firebase/helpers';
import { Entry, Exercise } from '@/data/firebase/types';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function EntryDetailScreen() {
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  const [entry, setEntry] = useState<(Entry & { exercise: Exercise }) | null>(
    null
  );

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
    if (entryId) {
      fetchEntry();
    }
  }, [entryId]);

  if (!entryId || !entry) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Entry not found</ThemedText>
      </ThemedView>
    );
  }

  const exerciseName = entry.exercise.name;
  const formattedDate = timestampToDate(entry.createdDate).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Entry Details
        </ThemedText>
      </ThemedView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Exercise
          </ThemedText>
          <ThemedText style={styles.exerciseName}>{exerciseName}</ThemedText>
          {entry.exercise?.description && (
            <ThemedText style={styles.exerciseDescription}>
              {entry.exercise.description}
            </ThemedText>
          )}
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Performance
          </ThemedText>
          <ThemedView style={styles.performanceContainer}>
            <ThemedView style={styles.performanceItem}>
              <ThemedText style={styles.performanceLabel}>Weight</ThemedText>
              <ThemedText style={styles.performanceValue}>
                {entry.value} {entry.unit}
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.performanceItem}>
              <ThemedText style={styles.performanceLabel}>Rep Max</ThemedText>
              <ThemedText style={styles.performanceValue}>
                {entry.repMax} RM
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Date
          </ThemedText>
          <ThemedText style={styles.dateText}>{formattedDate}</ThemedText>
        </ThemedView>

        {entry.tags.length > 0 && (
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Tags
            </ThemedText>
            <ThemedView style={styles.tagsContainer}>
              {entry.tags.map((tag, index) => (
                <ThemedView key={index} style={styles.tag}>
                  <ThemedText style={styles.tagText}>{tag}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          </ThemedView>
        )}

        {entry.notes && (
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Notes
            </ThemedText>
            <ThemedText style={styles.notesText}>{entry.notes}</ThemedText>
          </ThemedView>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 18,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  exerciseDescription: {
    fontSize: 16,
    opacity: 0.8,
    lineHeight: 22,
  },
  performanceContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  performanceItem: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  performanceLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 18,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  tagText: {
    fontSize: 14,
    color: '#007AFF',
  },
  notesText: {
    fontSize: 16,
    lineHeight: 22,
    opacity: 0.9,
  },
});
