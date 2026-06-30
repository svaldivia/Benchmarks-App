import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-bg p-5">
      <Text className="mb-3 text-center font-display text-3xl font-bold text-text">
        Fitness Benchmarks
      </Text>
      <Text className="mb-10 text-center text-body-lg text-text-2">
        Track your workout performance and progress
      </Text>

      <Pressable
        className="mb-4 w-4/5 items-center rounded-md bg-brand px-6 py-4 shadow-sm"
        onPress={() => router.push("/new-entry")}
      >
        <Text className="text-lg font-semibold text-on-brand">
          Record New Entry
        </Text>
      </Pressable>

      <Pressable
        className="mb-4 w-4/5 items-center rounded-md border-[1.5px] border-brand bg-transparent px-6 py-4"
        onPress={() => router.push("/entries")}
      >
        <Text className="text-lg font-semibold text-brand">View All Entries</Text>
      </Pressable>
    </View>
  );
}
