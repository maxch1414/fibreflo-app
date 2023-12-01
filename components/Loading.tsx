import * as React from "react";
import { View, StyleSheet } from "react-native";
import { ActivityIndicator } from "react-native-paper";

export function LoadingIndicator() {
  return (
    <View style={styles.fill}>
      <ActivityIndicator animating={true} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
