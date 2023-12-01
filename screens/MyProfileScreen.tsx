import * as React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button } from "react-native-paper";
import { SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-expo";
import { log } from "../logger";
import { RootStackScreenProps } from "../types";
import { useNavigation } from "@react-navigation/native";

export default function SafeMyProfileScreen(props: any) {
  const navigation = useNavigation();
  return (
    <>
      <SignedIn>
        <MyProfileScreen {...props} />
      </SignedIn>
      <SignedOut>
        <View style={styles.container}>
          <Text>Unauthorized</Text>
          <Button mode="contained" onPress={() => navigation.navigate("Root")}>
            Sign In
          </Button>
        </View>
      </SignedOut>
    </>
  );
}

function MyProfileScreen({ navigation }: RootStackScreenProps<"MyProfile">) {
  const { getToken, signOut } = useAuth();
  const { user } = useUser();

  const [sessionToken, setSessionToken] = React.useState("");

  const onSignOutPress = async () => {
    try {
      await signOut();
    } catch (err: any) {
      log("Error:> " + err?.status || "");
      log("Error:> " + err?.errors ? JSON.stringify(err.errors) : err);
    }
  };

  React.useEffect(() => {
    const scheduler = setInterval(async () => {
      const token = await getToken();
      setSessionToken(token as string);
    }, 1000);

    return () => clearInterval(scheduler);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome {user?.firstName}</Text>
      <Button
        mode="contained"
        textColor="white"
        buttonColor="red"
        onPress={onSignOutPress}
      >
        Sign Out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: "#2e78b7",
  },
  token: {
    marginTop: 15,
    paddingVertical: 15,
    fontSize: 15,
  },
});
