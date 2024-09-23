import { Engineer } from "types"

export async function fetchEngineers(token: string) {
    const engineers = await fetch(`https://api.fibreflo.com/engineers`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    const result: Engineer[] = await engineers.json()
    return result
}

export async function fetchEngineer(id: number, token: string) {
    const engineer = await fetch(`https://api.fibreflo.com/engineers/${id}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    const result: Engineer = await engineer.json()
    return result
}
