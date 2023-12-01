import { NativeStackScreenProps } from "@react-navigation/native-stack";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Root: undefined;
  SignIn: undefined;
  MyProfile: undefined;
  CreateTimesheet: undefined;
  Timesheets: undefined;
  Tab: undefined;
  TimesheetDetails: { id: number };
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

export type Timesheet = {
  id: number;
  work_provider: string;
  date_of_work: number;
  order_num: string;
  work_item: string;
  quantity: number;
  notes: string;
  gang_price_split: string;
  created_at: string;
  timesheetsToEngineers: any;
};

export type Engineer = {
  id: number;
  first_name: string;
  last_name: string;
  birth_date: string;
  created_at: string;
};

export type TimesheetInput = {
  work_provider: string;
  date_of_work?: Date;
  order_num: string;
  work_item: string;
  quantity: number;
  notes: string;
  gang_price_split: string;
};
