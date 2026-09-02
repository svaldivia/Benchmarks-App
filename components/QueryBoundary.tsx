import { QueryErrorResetBoundary } from "@tanstack/react-query";
import React, { Component, ReactNode, Suspense } from "react";
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

type ErrorCatchProps = { onReset: () => void; children: ReactNode };
type ErrorCatchState = { error: Error | null };

/**
 * Screen-local error boundary. Without one, a rejected read inside `use()` /
 * `useSuspenseQuery` unwinds all the way to the router's root ErrorBoundary,
 * which replaces the whole app — navigation included — with an error page.
 */
class ErrorCatch extends Component<ErrorCatchProps, ErrorCatchState> {
  state: ErrorCatchState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorCatchState {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("Screen failed to load", error);
  }

  retry = () => {
    // Clear the cached rejection first, otherwise re-rendering the children
    // throws the same error straight back.
    this.props.onReset();
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <View className="flex-1 items-center justify-center gap-3 bg-bg px-8">
        <ThemedText type="defaultSemiBold">Couldn’t load this screen</ThemedText>
        <ThemedText className="text-center text-sm text-text-2">
          {error.message}
        </ThemedText>
        <Button
          variant="secondary"
          size="sm"
          className="self-center"
          onPress={this.retry}
        >
          Try again
        </Button>
      </View>
    );
  }
}

/**
 * Suspense + error boundary pair for a screen's data. `QueryErrorResetBoundary`
 * wires the retry button back into the query cache so pressing it refetches
 * instead of replaying the failure.
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
        <ErrorCatch onReset={reset}>
          <Suspense fallback={fallback ?? <ScreenLoader />}>
            {children}
          </Suspense>
        </ErrorCatch>
      )}
    </QueryErrorResetBoundary>
  );
}
