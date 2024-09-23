import { NativeStackScreenProps } from "@react-navigation/native-stack"

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList {}
    }
}

export type RootStackParamList = {
    Root: undefined
    SignIn: undefined
    MyProfile: undefined
    CreateTimesheet: undefined
    Timesheets: undefined
    Tab: undefined
    TimesheetDetails: { id: number }
    WorkItemDetails: { workItem: WorkItem }
}

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
    NativeStackScreenProps<RootStackParamList, Screen>

export type Engineer = {
    birthDate: string
    createdAt: string
    email: string
    firstName: string
    id: number
    lastName: string
    user_id: string
}

export type WorkItem = {
    id: number
    name: string
    quantity: number
    timesheetId: number
    workArea: string
    notes: string
}

export type Timesheet = {
    createdAt: string
    dateOfWork: string
    engineers: Engineer[]
    id: number
    notes: string
    status: string
    workItems: WorkItem[]
    workProvider: string
}

export type TimesheetInput = {
    work_provider: string
    date_of_work?: Date
    order_num: string
    work_item: string
    quantity: number
    notes: string
    gang_price_split: string
}

export type TimesheetWithEngineers = {
    timesheet: {
        id: number
        workProvider: string
        dateOfWork: number
        notes: string
        createdAt: string
    }
    engineers: [
        {
            id: number
            firstName: string
            lastName: string
            birthDate: string
            createdAt: string
            user_id: string
        }[],
    ]
}
