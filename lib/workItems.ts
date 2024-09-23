import axios from "axios"
import { WorkItem } from "types"

export async function fetchWorkItem(
    timesheetId: number,
    workItemId: number,
    token: string
) {
    const timesheet = await axios.get(
        `https://api.fibreflo.com/timesheets/${timesheetId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )
    const result = await timesheet.data
    const workItem = result.workItems.find(
        (item: WorkItem) => item.id === workItemId
    )
    return workItem
}

type FormInput = {
    name: string
    quantity: number
    workArea: string
    timesheetId: number
    notes: string
}

export async function postWorkItem(token: string, form: FormInput) {
    const timesheet = await axios.post(
        `https://api.fibreflo.com/workitems`,
        form,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )
    const result = await timesheet.data
    return result
}
