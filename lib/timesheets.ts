import { Timesheet } from "types";

export async function fetchTimesheets() {
  const timesheets = await fetch(`https://api.fibreflo.com/timesheets`, {
    method: "GET",
  });
  const result: Timesheet[] = await timesheets.json();
  return result;
}

export async function fetchTimesheet(id: number) {
  const timesheet = await fetch(`https://api.fibreflo.com/timesheets/${id}`, {
    method: "GET",
  });
  const result: Timesheet = await timesheet.json();
  return result;
}
