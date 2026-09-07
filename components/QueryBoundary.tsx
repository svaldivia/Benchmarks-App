import { QueryErrorResetBoundary } from "@tanstack/react-query";
import React, { ReactNode, Suspense } from "react";
import {
  ErrorBoundary,
  getErrorMessage,
  type FallbackProps,
} from "react-error-boundary";
import { ActivityIndicator, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ds";
import { useAppColors } from "@/hooks/useAppColors";

export function ScreenLoader() {
  const colors = useAppColors();
  return (
    <View className="flex-1 items-center justify-center bg-bg">
      <ActivityIndicator size="large" color={colors.tint} />
    </View>
  );
}

function ScreenError({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-bg px-8">
      <ThemedText type="defaultSemiBold">Couldn’t load this screen</ThemedText>
      <ThemedText className="text-center text-sm text-text-2">
        {/* `error` is typed unknown because anything can be thrown, so read the
            message through the helper rather than assuming an Error. */}
        {getErrorMessage(error) ?? "Something went wrong."}
      </ThemedText>
      <Button
        variant="secondary"
        size="sm"
        className="self-center"
        onPress={() => resetErrorBoundary()}
      >
        Try again
      </Button>
    </View>
  );
}

/**
 * Suspense + error boundary pair for a screen's data. Without the error
 * boundary, a rejected read inside `useSuspenseQuery` unwinds all the way to
 * the router's root ErrorBoundary, which replaces the whole app — navigation
 * included — with an error page.
 *
 * `QueryErrorResetBoundary` wires the retry button back into the query cache,
 * so pressing it refetches instead of replaying the cached failure.
 *
 * Note this only catches errors thrown while rendering. A failing `useMutation`
 * does not reach here (its `throwOnError` defaults to false); those need
 * handling at the call site.
 */
export function QueryBoundary({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          FallbackComponent={ScreenError}
          onError={(error) => console.error("Screen failed to load", error)}
        >
          <Suspense fallback={fallback ?? <ScreenLoader />}>
            {children}
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
