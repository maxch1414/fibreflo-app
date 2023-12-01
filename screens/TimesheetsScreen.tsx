import * as React from "react";
import { Button, View, StyleSheet } from "react-native";
import { SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-expo";
import { RootStackScreenProps, Timesheet } from "../types";
import { DataTable, Text } from "react-native-paper";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { fetchTimesheets } from "../lib/timesheets";
import { LoadingIndicator } from "../components/Loading";
import { useRefreshOnFocus } from "../hooks/useRefreshOnFocus";
import * as ScreenOrientation from "expo-screen-orientation";
import { Searchbar } from "react-native-paper";

export default function SafeTimesheetsScreen(props: any, navigation: any) {
  return (
    <>
      <SignedIn>
        <TimesheetsScreen {...props} />
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

function TimesheetsScreen({ navigation }: RootStackScreenProps<"Timesheets">) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [page, setPage] = React.useState<number>(0);
  const [numberOfItemsPerPageList] = React.useState([6, 8, 10]);
  const [itemsPerPage, onItemsPerPageChange] = React.useState(
    numberOfItemsPerPageList[0]
  );

  const { getToken, sessionId } = useAuth();
  const [sessionToken, setSessionToken] = React.useState("");

  React.useEffect(() => {
    const scheduler = setInterval(async () => {
      const token = await getToken();
      setSessionToken(token as string);
    }, 1000);

    return () => clearInterval(scheduler);
  }, []);

  const { isLoading, error, data, refetch } = useQuery<Timesheet[], Error>(
    ["timesheets"],
    fetchTimesheets
  );

  // const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch);
  useRefreshOnFocus(refetch);

  const timesheets = data;

  if (isLoading) return <LoadingIndicator />;

  if (error)
    return (
      <View>
        <Text>Error</Text>
      </View>
    );

  if (!timesheets) return null;

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, timesheets.length);

  const onChangeSearch = (query: string) => setSearchQuery(query);

  return (
    <View style={styles.container}>
      {/* <Searchbar
        placeholder="Search Timesheets by Work Provider"
        onChangeText={onChangeSearch}
        value={searchQuery}
        mode="bar"
      /> */}
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>
            <Text style={styles.text}>Id</Text>
          </DataTable.Title>
          <DataTable.Title>
            <Text style={styles.text}>Work Prov</Text>
          </DataTable.Title>
          <DataTable.Title>
            <Text style={styles.text}>Date</Text>
          </DataTable.Title>
          <DataTable.Title>
            <Text style={styles.text}>Order Num</Text>
          </DataTable.Title>
          <DataTable.Title>
            <Text style={styles.text}>Work Item</Text>
          </DataTable.Title>
          <DataTable.Title numeric>
            <Text style={styles.text}>Quantity</Text>
          </DataTable.Title>
        </DataTable.Header>

        {timesheets.slice(from, to).map((item) => (
          <DataTable.Row
            key={item.id}
            onPress={() =>
              navigation.navigate("TimesheetDetails", { id: item.id })
            }
            style={{ shadowColor: "#000000" }}
          >
            <DataTable.Cell>
              <Text style={styles.text}>{item.id}</Text>
            </DataTable.Cell>
            <DataTable.Cell>
              <Text style={styles.text}>{item.work_provider}</Text>
            </DataTable.Cell>
            <DataTable.Cell>
              <Text style={styles.text}>
                {format(new Date(item.date_of_work), "dd/MM/yyyy")}
              </Text>
            </DataTable.Cell>
            <DataTable.Cell numeric>
              <Text style={styles.text}>{item.order_num}</Text>
            </DataTable.Cell>
            <DataTable.Cell numeric>
              <Text style={styles.text}>{item.work_item}</Text>
            </DataTable.Cell>
            <DataTable.Cell numeric>
              <Text style={styles.text}>{item.quantity}</Text>
            </DataTable.Cell>
          </DataTable.Row>
        ))}

        <DataTable.Pagination
          page={page}
          numberOfPages={Math.ceil(timesheets.length / itemsPerPage)}
          onPageChange={(page) => setPage(page)}
          label={`${from + 1}-${to} of ${timesheets.length}`}
          numberOfItemsPerPageList={numberOfItemsPerPageList}
          numberOfItemsPerPage={itemsPerPage}
          onItemsPerPageChange={onItemsPerPageChange}
          showFastPaginationControls
          selectPageDropdownLabel={"Rows per page"}
          style={styles.pagination}
        />
      </DataTable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  text: {
    color: "#000000",
  },
  inputView: {
    width: "50%",
    height: 45,
    marginBottom: 20,
    borderColor: "#000",
    borderStyle: "solid",
    borderWidth: 1,
  },
  primaryButton: {
    width: "50%",
    borderRadius: 5,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: "#000",
    color: "#ffffff",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  errorMessage: {
    color: "#CA0800",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
  pagination: {
    justifyContent: "center",
  },
});
