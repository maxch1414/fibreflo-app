import { Engineer } from "types";

export async function fetchEngineers() {
  const engineers = await fetch(`https://api.fibreflo.com/engineers`, {
    method: "GET",
  });
  const result: Engineer[] = await engineers.json();
  return result;
}

export async function fetchEngineer(id: number) {
  const engineer = await fetch(`https://api.fibreflo.com/engineers/${id}`, {
    method: "GET",
  });
  const result: Engineer = await engineer.json();
  return result;
}
