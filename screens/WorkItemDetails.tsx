import * as React from "react"
import { Button, View, StyleSheet, FlatList } from "react-native"
import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-expo"
import { RootStackScreenProps } from "../types"
import { List, Text } from "react-native-paper"
import { format } from "date-fns"
import { LoadingIndicator } from "../components/Loading"
import { useQuery } from "@tanstack/react-query"
import { useRefreshOnFocus } from "hooks/useRefreshOnFocus"
import { fetchWorkItem } from "lib/workItems"

export default function SafeWorkItemDetailsScreen(props: any, navigation: any) {
    return (
        <>
            <SignedIn>
                <WorkItemDetailsScreen {...props} />
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
    )
}

function WorkItemDetailsScreen({
    navigation,
    route,
}: RootStackScreenProps<"WorkItemDetails">) {
    const workItem = route.params.workItem
    return (
        <FlatList
            style={styles.container}
            data={[
                {
                    key: "Type",
                    value: workItem.name,
                },
                {
                    key: "Quantity",
                    value: workItem.quantity,
                },
                {
                    key: "Work Area",
                    value: workItem.workArea,
                },
                {
                    key: "Notes",
                    value: workItem.notes,
                },
            ]}
            renderItem={({ item }) => {
                return (
                    <List.Item
                        title={`${item.key}: ${item.value}`}
                        titleStyle={styles.text}
                    />
                )
            }}
        />
    )
}

const styles = StyleSheet.create({
    // container: {
    //   alignItems: "center",
    //   justifyContent: "center",
    //   padding: 20,
    // },
    // text: {
    //   color: "#000000",
    // },
    // engineers: {
    //   alignItems: "flex-start",
    //   justifyContent: "flex-start",
    // },
    container: {
        padding: 20,
    },
    text: {
        color: "#000000",
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
})
