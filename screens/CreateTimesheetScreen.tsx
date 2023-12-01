import * as React from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-expo";
import { Engineer, RootStackScreenProps } from "../types";
import { Controller, useForm } from "react-hook-form";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { HelperText, TextInput, Button, Text } from "react-native-paper";
import { LoadingIndicator } from "../components/Loading";
import DropDownPicker from "react-native-dropdown-picker";

export default function SafeCreateTimesheetScreen(props: any) {
  const navigation = useNavigation();
  return (
    <>
      <SignedIn>
        <CreateTimesheetScreen {...props} />
      </SignedIn>
      <SignedOut>
        <View style={styles.container}>
          <Text>Unauthorized</Text>
          <Button onPress={() => navigation.navigate("SignIn")}>Sign In</Button>
        </View>
      </SignedOut>
    </>
  );
}

type EngineerItem = {
  label: string;
  value: number;
};

function CreateTimesheetScreen({
  navigation,
}: RootStackScreenProps<"CreateTimesheet">) {
  const { getToken, signOut } = useAuth();
  const { user } = useUser();
  const [loading, setLoading] = React.useState(false);
  const [formLoading, setFormLoading] = React.useState(false);
  const [engineersValue, setEngineersValue] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<EngineerItem[]>([]);

  const [sessionToken, setSessionToken] = React.useState("");
  const [date, setDate] = React.useState(new Date());

  React.useEffect(() => {
    const scheduler = setInterval(async () => {
      const token = await getToken();
      setSessionToken(token as string);
    }, 1000);

    return () => clearInterval(scheduler);
  }, []);

  const today = new Date();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      work_provider: "",
      date_of_work: today,
      order_num: "",
      work_item: "",
      quantity: "",
      notes: "",
      gang_price_split: "",
    },
  });

  type Data = {
    work_provider: string;
    date_of_work: Date;
    order_num: string;
    work_item: string;
    quantity: string;
    notes: string;
    gang_price_split: string;
  };

  const onSubmit = async (data: Data) => {
    setFormLoading(true);
    const gangPriceSplit = data.gang_price_split.split("/");
    const gangPriceSplitSum = +gangPriceSplit[0] + +gangPriceSplit[1];
    if (gangPriceSplitSum !== 100) {
      setError("gang_price_split", {
        type: "validate",
        message: "Gang price split should add up to 100",
      });
    }

    if (!errors.root && !errors.gang_price_split) {
      const {
        work_provider,
        order_num,
        work_item,
        quantity,
        notes,
        gang_price_split,
      } = data;

      const quantityNum = +quantity;
      const workItem = work_item.toString();

      const form = {
        work_provider,
        order_num,
        work_item: workItem,
        quantity: quantityNum,
        notes,
        gang_price_split,
        date_of_work: new Date(date).getTime(),
        engineer_ids: engineersValue,
      };

      await axios.post(`https://api.fibreflo.com/timesheets`, form);
      setFormLoading(false);
      navigation.navigate("Timesheets");
    }
  };

  const onDateChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate;
    setDate(currentDate);
  };

  const getEngineers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://api.fibreflo.com//engineers`);
      const data = await response.data;
      const items = data.map((engineer: Engineer) => {
        return {
          label: `${engineer.first_name} ${engineer.last_name}`,
          value: engineer.id,
        };
      });
      setItems(items);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    getEngineers();
  }, []);

  if (loading) return <LoadingIndicator />;

  console.log(sessionToken);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Controller
          control={control}
          rules={{
            required: "Please enter a work provider.",
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              autoCapitalize="none"
              placeholder="Work Provider"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={styles.text}
            />
          )}
          name="work_provider"
        />
        <HelperText
          type="error"
          visible={!!errors.work_provider}
          style={styles.errorMessage}
        >
          {errors.work_provider?.message}
        </HelperText>

        <DropDownPicker
          open={open}
          value={engineersValue}
          items={items}
          setOpen={setOpen}
          setValue={setEngineersValue}
          setItems={setItems}
          multiple={true}
          min={1}
          style={styles.engineerPicker}
          placeholder="Select Engineer(s)"
          searchPlaceholder="Search Engineers"
          searchable={true}
        />

        <Controller
          control={control}
          rules={{
            required: "Please enter an order number.",
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              placeholder="Order Number"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="numeric"
              style={styles.text}
            />
          )}
          name="order_num"
        />
        <HelperText
          type="error"
          visible={!!errors.order_num}
          style={styles.errorMessage}
        >
          {errors.order_num?.message}
        </HelperText>

        <Controller
          control={control}
          rules={{
            required: "Please enter a work item.",
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              placeholder="Work Item"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="numeric"
              style={styles.text}
            />
          )}
          name="work_item"
        />
        <HelperText
          type="error"
          visible={!!errors.work_item}
          style={styles.errorMessage}
        >
          {errors.work_item?.message}
        </HelperText>

        <Controller
          control={control}
          rules={{
            required: "Please enter a quantity.",
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              placeholder="Quantity"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value.toString()}
              keyboardType="numeric"
              style={styles.text}
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

        <Controller
          control={control}
          rules={{
            required: "Please enter a gang split, it's normally 50/50.",
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              multiline={true}
              placeholder="Gang Price Split"
              maxLength={5}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={styles.text}
            />
          )}
          name="gang_price_split"
        />
        {errors.gang_price_split ? (
          <HelperText type="info" visible={true} style={styles.helperText}>
            Please enter as num/num, e.g 50/50
          </HelperText>
        ) : (
          ""
        )}
        <HelperText
          type="error"
          visible={!!errors.gang_price_split}
          style={styles.errorMessageGangPrice}
        >
          {errors.gang_price_split?.message}
        </HelperText>

        <View style={styles.datePickerContainer}>
          <Text>Date of Work: </Text>
          <DateTimePicker
            value={date}
            mode={"date"}
            is24Hour={true}
            onChange={onDateChange}
            style={styles.datePicker}
          />
          <HelperText type="error" visible={!!errors.date_of_work}>
            {errors.date_of_work?.message}
          </HelperText>
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={formLoading}
        >
          Create Timesheet
        </Button>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  datePicker: {},
  datePickerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    marginBottom: 40,
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
    paddingBottom: 20,
  },
  engineerPicker: {
    marginBottom: 10,
  },
  text: {
    color: "#000000",
    backgroundColor: "#ffffff",
  },
});
