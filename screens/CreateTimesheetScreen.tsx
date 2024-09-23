import * as React from "react"
import { View, StyleSheet } from "react-native"
import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-expo"
import { Engineer, RootStackScreenProps } from "../types"
import { Controller, useForm } from "react-hook-form"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useNavigation } from "@react-navigation/native"
import { HelperText, TextInput, Button, Text } from "react-native-paper"
import { LoadingIndicator } from "../components/Loading"
import DropDownPicker from "react-native-dropdown-picker"
import { postTimesheet } from "lib/timesheets"
import { useMutation, useQuery } from "@tanstack/react-query"
import { fetchEngineers } from "lib/engineers"

export default function SafeCreateTimesheetScreen(props: any) {
    const navigation = useNavigation()
    return (
        <>
            <SignedIn>
                <CreateTimesheetScreen {...props} />
            </SignedIn>
            <SignedOut>
                <View style={styles.container}>
                    <Text>Unauthorized</Text>
                    <Button onPress={() => navigation.navigate("SignIn")}>
                        Sign In
                    </Button>
                </View>
            </SignedOut>
        </>
    )
}

function CreateTimesheetScreen({
    navigation,
}: Readonly<RootStackScreenProps<"CreateTimesheet">>) {
    const { getToken } = useAuth()
    const [engineersValue, setEngineersValue] = React.useState(null)

    const [workProviderOpen, setWorkProviderOpen] = React.useState(false)
    const [engineersOpen, setEngineersOpen] = React.useState(false)

    const [workProvider, setWorkProvider] = React.useState("")
    const workProviderItems = [
        {
            label: "Wessex",
            value: "Wessex",
        },
        {
            label: "Gigaclear",
            value: "Gigaclear",
        },
    ]

    const [date, setDate] = React.useState(new Date())

    const today = new Date()

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            workProvider: "",
            dateOfWork: today,
            workItems: "",
            notes: "",
        },
    })

    type Data = {
        dateOfWork: Date
        notes: string
    }

    const onSubmit = (data: Data) => {
        const result = mutation.mutate(data)
    }

    const mutation = useMutation({
        mutationFn: async (data: Data) => {
            const form = {
                workProvider,
                notes: data.notes,
                dateOfWork: new Date(date),
                engineerIds: engineersValue,
            }

            const token = await getToken()
            if (token) {
                const res = await postTimesheet(token, form)
                return res
            }
        },
        onSuccess: (data) => {
            navigation.navigate("TimesheetDetails", { id: data })
        },
    })

    const onDateChange = (event: any, selectedDate: any) => {
        const currentDate = selectedDate
        setDate(currentDate)
    }

    const { isLoading, error, data, refetch } = useQuery({
        queryKey: ["engineers"],
        queryFn: async () => {
            const token = await getToken()
            if (token) {
                const res = await fetchEngineers(token)
                return res
            }
        },
    })

    if (isLoading && mutation.isPending) return <LoadingIndicator />

    if (error)
        return (
            <View>
                <Text>{error.message}</Text>
            </View>
        )

    if (!data) return null

    const engineers = data.map((engineer: Engineer) => {
        return {
            label: `${engineer.firstName} ${engineer.lastName}`,
            value: engineer.id,
        }
    })

    return (
        <View style={styles.container}>
            <DropDownPicker
                open={workProviderOpen}
                value={workProvider}
                items={workProviderItems}
                setOpen={setWorkProviderOpen}
                setValue={setWorkProvider}
                multiple={false}
                style={styles.workProviderPicker}
                placeholder="Select Work Provider"
                searchPlaceholder="Search Work Providers"
                searchable={true}
                listMode="MODAL"
                modalAnimationType="slide"
            />

            <DropDownPicker
                open={engineersOpen}
                value={engineersValue}
                items={engineers}
                setOpen={setEngineersOpen}
                setValue={setEngineersValue}
                multiple={true}
                min={1}
                style={styles.engineerPicker}
                placeholder={"Select Engineer(s)"}
                searchPlaceholder="Search Engineers"
                searchable={true}
                listMode="MODAL"
                modalAnimationType="slide"
            />

            <Controller
                control={control}
                rules={{
                    required: "Please enter some notes, or leave N/A if none",
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        mode="outlined"
                        multiline={true}
                        placeholder="Notes"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        style={styles.text}
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
            <View style={styles.datePickerContainer}>
                <Text style={styles.dateOfWorkText}>Date of Work: </Text>
                <DateTimePicker
                    value={date}
                    mode={"date"}
                    is24Hour={true}
                    onChange={onDateChange}
                    style={styles.datePicker}
                />
                <HelperText type="error" visible={!!errors.dateOfWork}>
                    {errors.dateOfWork?.message}
                </HelperText>
            </View>

            <Button
                style={styles.button}
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={mutation.isPending}
            >
                Create Timesheet
            </Button>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        rowGap: 4,
    },
    button: {
        color: "#ffffff",
        backgroundColor: "#253C78",
        marginHorizontal: 5,
    },
    datePickerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
        marginLeft: 10,
    },
    dateOfWorkText: {},
    datePicker: {
        right: 6,
        position: "absolute",
    },
    primaryButtonText: {
        color: "#ffffff",
        fontWeight: "bold",
    },
    helperText: {
        color: "#808080",
    },
    errorMessage: {
        color: "#CA0800",
        justifyContent: "center",
        alignItems: "center",
    },
    errorMessageGangPrice: {
        color: "#CA0800",
    },
    engineerPicker: {
        marginBottom: 24,
        color: "#CA0800",
    },
    workProviderPicker: {
        marginBottom: 24,
    },
    text: {
        color: "#000000",
        backgroundColor: "#ffffff",
    },
})
