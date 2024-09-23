import * as React from "react"
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
} from "react-native"
import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-expo"
import { Engineer, RootStackScreenProps, WorkItem } from "../types"
import {
    List,
    Text,
    Button,
    Portal,
    Dialog,
    TextInput,
    HelperText,
} from "react-native-paper"
import { format } from "date-fns"
import { LoadingIndicator } from "../components/Loading"
import { fetchTimesheet } from "lib/timesheets"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRefreshOnFocus } from "hooks/useRefreshOnFocus"
import { wessexRateCard } from "../lib/config/ratecards/wessex"
import DropDownPicker from "react-native-dropdown-picker"
import { postWorkItem } from "lib/workItems"
import { Controller, useForm } from "react-hook-form"

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

function TimesheetDetailsScreen({
    navigation,
    route,
}: RootStackScreenProps<"TimesheetDetails">) {
    const [visible, setVisible] = React.useState(false)
    const [selectedWorkItem, setSelectedWorkItem] = React.useState(null)

    const queryClient = useQueryClient()

    const concatenatedWorkItems = [...wessexRateCard]
    const [workItems, setWorkItems] = React.useState<
        {
            label: string
            value: string
        }[]
    >(concatenatedWorkItems)
    const [workItemIsOpen, setWorkItemIsOpen] = React.useState(false)

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            quantity: "",
            workArea: "",
            name: "",
            notes: "",
        },
    })

    const showDialog = () => setVisible(true)

    const hideDialog = () => setVisible(false)

    const { getToken } = useAuth()

    const mutation = useMutation({
        mutationFn: async (data: MutationData) => {
            const name = selectedWorkItem!
            const numQuantity = Number(data.quantity)

            const form: MutationData = {
                quantity: numQuantity,
                workArea: data.workArea,
                name,
                timesheetId: data.timesheetId,
                notes: data.notes,
            }

            const token = await getToken()
            if (token) {
                const res = await postWorkItem(token, form)
                return res
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["timesheet"] })
        },
    })

    const { isLoading, error, data, refetch } = useQuery({
        queryKey: ["timesheet"],
        queryFn: async () => {
            const token = await getToken()
            if (token) {
                const res = await fetchTimesheet(route.params.id, token)
                return res
            }
        },
    })

    useRefreshOnFocus(refetch)

    const timesheet = data

    if (isLoading) return <LoadingIndicator />

    if (error)
        return (
            <View>
                <Text>{error.message}</Text>
            </View>
        )

    if (!timesheet) return null

    const engineers: any = timesheet.engineers
    const engineersList = engineers.map((engineer: Engineer) => {
        return `${engineer.firstName} ${engineer.lastName}`
    })

    const handleWorkItemClick = (workItem: any) => {
        navigation.navigate("WorkItemDetails", { workItem })
    }

    type Data = {
        quantity: string
        notes: string
        workArea: string
        name: string
    }

    type MutationData = {
        timesheetId: number
        quantity: number
        notes: string
        workArea: string
        name: string
    }

    const handleCreateWorkItem = (data: Data) => {
        const timesheetId = Number(timesheet.id)
        const numQuantity = Number(data.quantity)
        const form: MutationData = {
            notes: data.notes,
            quantity: numQuantity,
            timesheetId,
            workArea: data.workArea,
            name: data.name,
        }

        mutation.mutate(form)
        hideDialog()
    }

    return (
        <View style={styles.container}>
            <Button
                style={styles.addWorkItemButton}
                mode="contained"
                onPress={showDialog}
                icon="plus"
            >
                Add Work Item
            </Button>
            <Portal>
                <Dialog
                    style={{ backgroundColor: "white" }}
                    visible={visible}
                    onDismiss={hideDialog}
                >
                    <Dialog.Title onPress={Keyboard.dismiss}>
                        Add Work Item
                    </Dialog.Title>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <Dialog.Content style={{ gap: 6 }}>
                            <Controller
                                control={control}
                                rules={{
                                    required: "Please enter a quantity.",
                                }}
                                render={({
                                    field: { onChange, onBlur, value },
                                }) => (
                                    <TextInput
                                        mode="outlined"
                                        multiline={true}
                                        placeholder="Enter Quantity"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        style={styles.textInput}
                                        keyboardType="numeric"
                                    />
                                )}
                                name="quantity"
                            />
                            <HelperText
                                type="error"
                                visible={!!errors.quantity}
                                style={styles.errorMessage}
                            >
                                {errors.quantity?.message}
                            </HelperText>

                            <Controller
                                control={control}
                                rules={{
                                    required: "Please enter a work area.",
                                }}
                                render={({
                                    field: { onChange, onBlur, value },
                                }) => (
                                    <TextInput
                                        mode="outlined"
                                        multiline={true}
                                        placeholder="Enter Work Area"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        style={styles.textInput}
                                    />
                                )}
                                name="workArea"
                            />

                            <HelperText
                                type="error"
                                visible={!!errors.workArea}
                                style={styles.errorMessage}
                            >
                                {errors.workArea?.message}
                            </HelperText>

                            <Controller
                                control={control}
                                rules={{
                                    required: "Please enter some notes.",
                                }}
                                render={({
                                    field: { onChange, onBlur, value },
                                }) => (
                                    <TextInput
                                        mode="outlined"
                                        multiline={true}
                                        placeholder="Enter Notes"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        style={styles.textInput}
                                    />
                                )}
                                name="notes"
                            />

                            <HelperText
                                type="error"
                                visible={!!errors.notes}
                                style={styles.errorMessage}
                            >
                                {errors.notes?.message}
                            </HelperText>

                            <DropDownPicker
                                open={workItemIsOpen}
                                value={selectedWorkItem}
                                items={workItems}
                                setOpen={setWorkItemIsOpen}
                                setValue={setSelectedWorkItem}
                                placeholder="Select Work Item"
                                searchPlaceholder="Search Work Items"
                                searchable={true}
                                listMode="MODAL"
                                modalAnimationType="slide"
                            />
                        </Dialog.Content>
                    </TouchableWithoutFeedback>
                    <Dialog.Actions style={{ justifyContent: "space-between" }}>
                        <Button
                            style={styles.cancelModalButton}
                            labelStyle={{ color: "black" }}
                            onPress={hideDialog}
                        >
                            Cancel
                        </Button>
                        <Button
                            style={styles.confirmModalButton}
                            labelStyle={{ color: "white" }}
                            onPress={handleSubmit(handleCreateWorkItem)}
                        >
                            Done
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            <ScrollView>
                <FlatList
                    scrollEnabled={false}
                    data={[
                        {
                            key: "Date of Work",
                            value: format(
                                new Date(timesheet.dateOfWork),
                                "dd/MM/yyyy"
                            ),
                        },
                        { key: "Work Provider", value: timesheet.workProvider },
                        { key: "Notes", value: timesheet.notes },
                        { key: "Engineers", value: engineersList.join(", ") },
                        // ...timesheet.workItems.map((item) => ({
                        //     key: item.name,
                        //     value: `${item.name} - ${item.quantity}`,
                        //     id: item.id, // For key extractor
                        // })),
                    ]}
                    // keyExtractor={(item) =>
                    //     item.id ? item.id.toString() : item.key
                    // }
                    //@ts-ignore
                    renderItem={({ item }) => {
                        return (
                            <List.Item
                                title={`${item.key}: ${item.value}`}
                                titleStyle={styles.text}
                            />
                        )
                    }}
                />
                <FlatList
                    scrollEnabled={false}
                    data={timesheet.workItems}
                    keyExtractor={(item) => item.id.toString()}
                    // horizontal
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.workItemButton}
                            onPress={() => handleWorkItemClick(item)}
                        >
                            <List.Item
                                title={`${item.name} - ${item.quantity}`}
                                // style={styles.workItemButtonText}
                            />
                        </TouchableOpacity>
                    )}
                />
            </ScrollView>
            {/* <FlatList
                data={timesheet.workItems}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.workItemButton}
                        onPress={() => handleWorkItemClick(item)}
                    >
                        <List.Item
                            title={`${item.name} - ${item.quantity}`}
                            style={styles.workItemButtonText}
                        />
                    </TouchableOpacity>
                )}
            /> */}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    errorMessage: {
        color: "#CA0800",
        // justifyContent: "center",
        // alignItems: "center",
    },
    textInput: {
        color: "#ffffff",
    },
    text: {
        color: "#000000",
    },
    addWorkItemButton: {
        color: "#ffffff",
        backgroundColor: "#253C78",
        width: "50%",
        marginTop: 10,
    },
    cancelModalButton: {
        backgroundColor: "#EF3E58",
        width: 100,
    },
    confirmModalButton: {
        backgroundColor: "#253C78",
        width: 100,
    },
    heading: {
        marginTop: 10,
        marginBottom: 5,
        fontSize: 16,
        fontWeight: "bold",
        color: "#000000",
    },
    workItem: {
        marginBottom: 5,
        fontSize: 14,
        color: "#000000",
    },
    workItemButton: {
        backgroundColor: "#d3d3d3",
        borderRadius: 5,
        marginVertical: 1,
    },
})
