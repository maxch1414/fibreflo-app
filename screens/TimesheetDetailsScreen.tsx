import * as React from "react";
import { Button, View, StyleSheet } from "react-native";
import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-expo";
import { Engineer, RootStackScreenProps, Timesheet } from "../types";
import { HelperText, List, Text } from "react-native-paper";
import { format } from "date-fns";
import { LoadingIndicator } from "../components/Loading";
import axios from "axios";

export default function SafeTimesheetDetailsScreen(
  props: any,
  navigation: any
) {
  return (
    <>
      <SignedIn>
        <TimesheetDetailsScreen {...props} />
      </SignedIn>
      <SignedOut>
        <View style={styles.container}>
          <Text>Unauthorized</Text>
          <Button
            title="Sign In"
            onPress={() => navigation.navigate("SignIn")}
          />
        </View>
      </SignedOut>
    </>
  );
}

type TimesheetWithEngineers = {
  timesheet: {
    id: number;
    work_provider: string;
    date_of_work: number;
    order_num: string;
    work_item: string;
    quantity: number;
    notes: string;
    gang_price_split: string;
    created_at: string;
    timesheetsToEngineers: {
      engineer_id: number;
      timesheet_id: number;
    };
  };
  engineersArr: [
    {
      id: number;
      first_name: string;
      last_name: string;
      birth_date: string;
      created_at: string;
    }[]
  ];
};

function TimesheetDetailsScreen({
  navigation,
  route,
}: RootStackScreenProps<"TimesheetDetails">) {
  const [timesheetLoading, setTimesheetLoading] = React.useState(false);
  const [data, setData] = React.useState<TimesheetWithEngineers>();

  const { getToken, sessionId } = useAuth();
  const [sessionToken, setSessionToken] = React.useState("");

  React.useEffect(() => {
    const scheduler = setInterval(async () => {
      const token = await getToken();
      setSessionToken(token as string);
    }, 1000);

    return () => clearInterval(scheduler);
  }, []);

  React.useEffect(() => {
    getTimesheet(route.params.id);
  }, []);

  const getTimesheet = async (id: number) => {
    setTimesheetLoading(true);
    try {
      const response = await axios.get(
        `https://api.fibreflo.com/timesheets/${id}/engineers`
      );
      setData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setTimesheetLoading(false);
    }
  };

  if (timesheetLoading) return <LoadingIndicator />;

  if (!data) return null;

  const timesheet: Timesheet = data.timesheet;
  const engineers: any = data.engineersArr;
  const engineersList = engineers.map((engineer: Engineer) => {
    return ` ${engineer.first_name} ${engineer.last_name}`;
  });

  return (
    <View style={styles.container}>
      <List.Item
        title={`Date of Work: ${format(
          new Date(timesheet.date_of_work),
          "dd/MM/yyyy"
        )}`}
        titleStyle={styles.text}
      />
      <List.Item
        title={`Work Provider: ${timesheet.work_provider}`}
        titleStyle={styles.text}
      />
      <List.Item
        title={`Order Number: ${timesheet.order_num}`}
        titleStyle={styles.text}
      />
      <List.Item
        title={`Work Item: ${timesheet.work_item}`}
        titleStyle={styles.text}
      />
      <List.Item
        title={`Quantity: ${timesheet.quantity}`}
        titleStyle={styles.text}
      />
      <List.Item title={`Notes: ${timesheet.notes}`} titleStyle={styles.text} />
      <List.Item
        title={`Engineers:${engineersList}`}
        titleStyle={styles.text}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  text: {
    color: "#000000",
  },
  engineers: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
});
