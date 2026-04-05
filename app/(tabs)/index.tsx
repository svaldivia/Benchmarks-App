import { Palette } from '@/constants/Colors';
import { useAppColors } from '@/hooks/useAppColors';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Index() {
  const colors = useAppColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        Fitness Benchmarks
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Track your workout performance and progress
      </Text>

      <Pressable
        style={[styles.button, { backgroundColor: colors.tint }]}
        onPress={() => router.push('/new-entry')}
      >
        <Text style={styles.buttonText}>Record New Entry</Text>
      </Pressable>

      <Pressable
        style={[styles.secondaryButton, { borderColor: colors.tint }]}
        onPress={() => router.push('/entries')}
      >
        <Text style={[styles.secondaryButtonText, { color: colors.tint }]}>
          View All Entries
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginBottom: 16,
    width: '80%',
    alignItems: 'center',
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: Palette.white,
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginBottom: 16,
    width: '80%',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
