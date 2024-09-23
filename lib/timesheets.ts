import axios from "axios"
import { Timesheet } from "types"

export async function fetchTimesheets(token: string) {
    const timesheets = await fetch(`https://api.fibreflo.com/timesheets`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    const result: Timesheet[] = await timesheets.json()
    return result
}

export async function fetchTimesheet(id: number, token: string) {
    const timesheet = await axios.get(
        `https://api.fibreflo.com/timesheets/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )
    const result: Timesheet = await timesheet.data
    return result
}

type FormInput = {
    workProvider: string
    // workItem: null
    notes: string
    dateOfWork: Date
    engineerIds: null
}

export async function postTimesheet(token: string, form: FormInput) {
    const timesheet = await axios.post(
        `https://api.fibreflo.com/timesheets`,
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
