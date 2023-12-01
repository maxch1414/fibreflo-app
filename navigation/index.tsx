import * as React from "react";
import { NavigationContainer, useRoute } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignInScreen from "../screens/SignInScreen";
import MyProfileScreen from "../screens/MyProfileScreen";
import { RootStackParamList } from "../types";
import LinkingConfiguration from "./LinkingConfig";
import { ClerkLoaded, useUser } from "@clerk/clerk-expo";
import SafeTimesheetsScreen from "../screens/TimesheetsScreen";
import SafeCreateTimesheetScreen from "../screens/CreateTimesheetScreen";
import BottomNavbar from "./BottomNavbar";
import SafeTimesheetDetailsScreen from "../screens/TimesheetDetailsScreen";

export default function Navigation() {
  return (
    <NavigationContainer linking={LinkingConfiguration}>
      <RootNavigator />
      <BottomNavbar />
    </NavigationContainer>
  );
}

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { isSignedIn } = useUser();

  return (
    <ClerkLoaded>
      <Stack.Navigator>
        {isSignedIn ? (
          <>
            <Stack.Screen
              name="Timesheets"
              component={SafeTimesheetsScreen}
              options={{ title: "View Timesheets" }}
            />
            <Stack.Screen
              name="CreateTimesheet"
              component={SafeCreateTimesheetScreen}
              options={{ title: "Create Timesheet" }}
            />
            <Stack.Screen
              name="MyProfile"
              component={MyProfileScreen}
              options={{ title: "My Profile" }}
            />
            <Stack.Screen
              name="TimesheetDetails"
              component={SafeTimesheetDetailsScreen}
              options={{ title: "Timesheet Details" }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="SignIn"
              component={SignInScreen}
              options={{ title: "Sign In" }}
            />
          </>
        )}
      </Stack.Navigator>
    </ClerkLoaded>
  );
};
