import * as React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import useCachedResources from "./hooks/useCachedResources";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "./cache";
import {
  MD3LightTheme as DefaultTheme,
  PaperProvider,
} from "react-native-paper";
import Navigation from "./navigation/index";
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from "@tanstack/react-query";
import { useOnlineManager } from "./hooks/useOnlineManager";
import { useAppState } from "./hooks/useAppState";
import { AppStateStatus, Platform } from "react-native";
import { lightTheme } from "./theme";

const publishableKey = "pk_test_aW4tam9leS05OS5jbGVyay5hY2NvdW50cy5kZXYk";

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

const client = new QueryClient();

export default function App() {
  const theme = {
    ...DefaultTheme,
    colors: lightTheme.colors, // Copy it from the color codes scheme and then use it here
  };

  const isLoadingComplete = useCachedResources();

  useOnlineManager();
  useAppState(onAppStateChange);

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <SafeAreaProvider>
          <PaperProvider theme={theme}>
            <QueryClientProvider client={client}>
              <StatusBar />
              <Navigation />
            </QueryClientProvider>
          </PaperProvider>
        </SafeAreaProvider>
      </ClerkProvider>
    );
  }
}
