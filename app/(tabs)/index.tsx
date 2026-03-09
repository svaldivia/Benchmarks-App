import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fitness Benchmarks App</Text>
      <Text style={styles.subtitle}>
        Track your workout performance and progress
      </Text>

      <Pressable
        style={styles.button}
        onPress={() => router.push('/new-entry')}
      >
        <Text style={styles.buttonText}>Record New Entry</Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.secondaryButton]}
        onPress={() => router.push('/entries')}
      >
        <Text style={styles.secondaryButtonText}>View All Entries</Text>
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
    backgroundColor: '#151718',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ECEDEE',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9BA1A6',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0a7ea4',
  },
  secondaryButtonText: {
    color: '#0a7ea4',
    fontSize: 18,
    fontWeight: '600',
  },
});
