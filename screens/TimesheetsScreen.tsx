import * as React from "react"
import { View, StyleSheet, TouchableOpacity } from "react-native"
import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-expo"
import { RootStackScreenProps, Timesheet } from "../types"
import { DataTable, Text, Button } from "react-native-paper"
import {
    addDays,
    format,
    isEqual,
    isSameDay,
    isToday,
    isWithinInterval,
} from "date-fns"
import { useQuery } from "@tanstack/react-query"
import { fetchTimesheets } from "../lib/timesheets"
import { LoadingIndicator } from "../components/Loading"
import { useRefreshOnFocus } from "../hooks/useRefreshOnFocus"
import { AntDesign } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
// import * as ScreenOrientation from "expo-screen-orientation";
// import { Searchbar } from "react-native-paper";

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
                        mode="contained"
                        onPress={() => navigation.navigate("SignIn")}
                    >
                        Sign In
                    </Button>
                </View>
            </SignedOut>
        </>
    )
}

function TimesheetsScreen({ navigation }: RootStackScreenProps<"Timesheets">) {
    const [page, setPage] = React.useState<number>(0)
    const [numberOfItemsPerPageList] = React.useState([6, 8, 10])
    const [itemsPerPage, onItemsPerPageChange] = React.useState(
        numberOfItemsPerPageList[0]
    )
    const [date, setDate] = React.useState(new Date())
    const [filteredTimesheets, setFilteredTimesheets] =
        React.useState<Timesheet[]>()

    const { getToken, userId } = useAuth()

    const { isLoading, error, data, refetch } = useQuery({
        queryKey: ["timesheets"],
        queryFn: async () => {
            const token = await getToken()
            if (token) {
                const res = await fetchTimesheets(token)
                return res
            }
        },
    })

    // const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch);
    useRefreshOnFocus(refetch)

    if (isLoading) return <LoadingIndicator />

    if (error)
        return (
            <View>
                <Text>{error.message}</Text>
            </View>
        )

    if (!data) return null

    const userTimesheets = data.filter((timesheet) =>
        timesheet.engineers.some((engineer) => engineer.user_id === userId)
    )

    const filterTimesheetsByDate = (date: Date) => {
        const filteredTimesheets = userTimesheets.filter((timesheet) => {
            return isSameDay(date, new Date(timesheet.dateOfWork))
        })
        return filteredTimesheets
    }

    const timesheets = filterTimesheetsByDate(date)

    const from = page * itemsPerPage
    const to = Math.min((page + 1) * itemsPerPage, timesheets.length)

    const onDateChange = (event: any, selectedDate: any) => {
        const currentDate = selectedDate
        setDate(currentDate)
    }

    return (
        <View style={styles.container}>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                }}
            >
                <Button
                    style={styles.addButton}
                    mode="contained"
                    onPress={() => navigation.navigate("CreateTimesheet")}
                    icon="plus"
                >
                    Add Timesheet
                </Button>
                <DateTimePicker
                    value={date}
                    mode="date"
                    is24Hour={true}
                    onChange={onDateChange}
                    style={{ top: 6 }}
                />
            </View>
            <View style={styles.dataTableContainer}>
                <DataTable>
                    <DataTable.Header>
                        <DataTable.Title>
                            <Text style={styles.text}>Id</Text>
                        </DataTable.Title>
                        <DataTable.Title>
                            <Text style={styles.text}>Work Provider</Text>
                        </DataTable.Title>
                        <DataTable.Title>
                            <Text style={styles.text}>Date</Text>
                        </DataTable.Title>
                    </DataTable.Header>

                    {timesheets.slice(from, to).map((item: any) => (
                        <DataTable.Row
                            key={item.id}
                            onPress={() =>
                                navigation.navigate("TimesheetDetails", {
                                    id: item.id,
                                })
                            }
                            style={{ shadowColor: "#000000" }}
                        >
                            <DataTable.Cell>
                                <Text style={styles.text}>{item.id}</Text>
                            </DataTable.Cell>
                            <DataTable.Cell>
                                <Text style={styles.text}>
                                    {item.workProvider}
                                </Text>
                            </DataTable.Cell>
                            <DataTable.Cell>
                                <Text style={styles.text}>
                                    {format(
                                        new Date(item.dateOfWork),
                                        "dd/MM/yyyy"
                                    )}
                                </Text>
                            </DataTable.Cell>
                        </DataTable.Row>
                    ))}

                    <DataTable.Pagination
                        page={page}
                        numberOfPages={Math.ceil(
                            timesheets.length / itemsPerPage
                        )}
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
        </View>
    )
}

const styles = StyleSheet.create({
    dataTableContainer: {
        marginTop: 50,
        flex: 1,
    },
    addButton: {
        color: "#ffffff",
        backgroundColor: "#253C78",
        width: "50%",
        marginTop: 10,
    },
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
})
