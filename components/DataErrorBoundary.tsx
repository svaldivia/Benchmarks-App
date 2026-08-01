import React, { ReactNode, useState } from "react";
import { View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ds";

type BoundaryProps = {
  children: ReactNode;
  onRetry: () => void;
  onError: () => void;
};

class Boundary extends React.Component<BoundaryProps, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <View className="flex-1 items-center justify-center gap-3 px-8">
        <ThemedText type="defaultSemiBold">Couldn’t load this screen</ThemedText>
        <ThemedText className="text-center text-sm text-text-2">
          {error.message}
        </ThemedText>
        <Button
          variant="secondary"
          size="sm"
          className="self-center"
          onPress={this.props.onRetry}
        >
          Try again
        </Button>
      </View>
    );
  }
}

/**
 * Catches a failed data read so it renders a retry instead of tearing the
 * screen down. Without this, a rejected promise read by `use()` throws during
 * render with nothing to catch it and the app unmounts to a blank screen.
 *
 * Clearing a previous error is driven by a new promise arriving rather than by
 * the button press: refreshes run inside a transition, so resetting on press
 * would re-render the children against the still-rejected promise and throw
 * again immediately.
 *
 * The remount only happens when recovering from an error. Routine focus
 * refetches also change the promise, and remounting on those would drop the
 * rendered screen and flash the Suspense fallback on every navigation.
 */
export function DataErrorBoundary({
  promise,
  onRetry,
  children,
}: {
  promise: Promise<unknown>;
  onRetry: () => void;
  children: ReactNode;
}) {
  const [seen, setSeen] = useState(promise);
  const [errored, setErrored] = useState(false);
  const [attempt, setAttempt] = useState(0);

  if (seen !== promise) {
    setSeen(promise);
    if (errored) {
      setErrored(false);
      setAttempt((a) => a + 1);
    }
  }

  return (
    <Boundary key={attempt} onRetry={onRetry} onError={() => setErrored(true)}>
      {children}
    </Boundary>
  );
}
