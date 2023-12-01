import * as React from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { log } from "../logger";
import { Controller, useForm } from "react-hook-form";

export default function SignInScreen({ navigation }: any) {
  const { signIn, setSession, isLoaded } = useSignIn();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      emailAddress: "",
      password: "",
    },
  });

  type Data = {
    emailAddress: string;
    password: string;
  };

  const onSubmit = async (data: Data) => {
    if (!isLoaded) {
      return;
    }

    const { emailAddress, password } = data;

    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });

      await setSession(completeSignIn.createdSessionId);
    } catch (err: any) {
      log("Error:> " + err?.status || "");
      log("Error:> " + err?.errors ? JSON.stringify(err.errors) : err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputView}>
        <Controller
          control={control}
          rules={{
            required: "Please enter an email address.",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address.",
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              autoCapitalize="none"
              placeholder="Email Address"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={styles.textInput}
            />
          )}
          name="emailAddress"
        />
      </View>
      {errors.emailAddress && (
        <Text style={styles.errorMessage}>{errors.emailAddress.message}</Text>
      )}
      <View style={styles.inputView}>
        <Controller
          control={control}
          rules={{
            required: "Please enter a password.",
            min: 10,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              autoCapitalize="none"
              placeholder="Password"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={styles.textInput}
            />
          )}
          name="password"
        />
      </View>
      {errors.password && (
        <Text style={styles.errorMessage}>{errors.password.message}</Text>
      )}

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={styles.primaryButtonText}>Sign in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 20,
  },

  errorMessage: {
    color: "#CA0800",
  },

  inputView: {
    borderRadius: 5,
    width: "90%",
    height: 45,
    marginBottom: 20,
    borderColor: "#000",
    borderStyle: "solid",
    borderWidth: 1,
  },

  textInput: {
    height: 50,
    flex: 1,
    padding: 10,
    marginLeft: 20,
  },

  primaryButton: {
    width: "90%",
    borderRadius: 5,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    backgroundColor: "#000",
    color: "#ffffff",
  },

  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },

  titleText: {
    color: "#000",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },

  footer: {
    color: "#000",
    marginTop: 20,
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
  },

  secondaryButton: {
    marginTop: 15,
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#000",
  },

  secondaryButtonText: {
    color: "#000",
    fontWeight: "bold",
  },

  head: { height: 40, backgroundColor: "#f1f8ff" },
  text: { margin: 6 },
});
