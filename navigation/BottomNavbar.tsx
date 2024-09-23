import { useUser } from "@clerk/clerk-expo";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, StyleSheet } from "react-native";
import { Button } from "react-native-paper";

export default function BottomNavbar() {
  const navigation = useNavigation();
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    return (
      <View style={styles.row}>
        <Button
          style={styles.button}
          icon="eye"
          onPress={() => navigation.navigate("Timesheets")}
        >
          View
        </Button>
        <Button
          style={styles.button}
          icon="plus"
          onPress={() => navigation.navigate("CreateTimesheet")}
        >
          Create
        </Button>
        <Button
          style={styles.button}
          icon="account"
          onPress={() => navigation.navigate("MyProfile")}
        >
          Profile
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "#253C78", // Navy background color
  },
  button: {
    marginBottom: 20,
    color: "#000000", // White text color
    backgroundColor: "#ffffff", // Navy button color
    marginHorizontal: 5, // Add some spacing between buttons
  },
});
