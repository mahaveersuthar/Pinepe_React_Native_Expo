import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { theme } from "@/theme";
import { Ticket, AlignLeft, Send } from "lucide-react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import Toast from "react-native-toast-message";

import { getLatLong } from "@/utils/location";
import { createTicketApi } from "../../api/complaintsTickets.api";

import CustomInput from "@/components/ui/CustomInput";
import DropDownPicker from "react-native-dropdown-picker";

const CreateTicket = () => {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("low");

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const priorities = [
    { label: "Low Priority", value: "low" },
    { label: "Medium Priority", value: "medium" },
    { label: "High Priority", value: "high" },
    { label: "Low Priority", value: "low" },
    { label: "Medium Priority", value: "medium" },
    { label: "High Priority", value: "high" },
    { label: "Low Priority", value: "low" },
    { label: "Medium Priority", value: "medium" },
    { label: "High Priority", value: "high" },
    { label: "Low Priority", value: "low" },
    { label: "Medium Priority", value: "medium" },
    { label: "High Priority", value: "high" },
    { label: "Low Priority", value: "low" },
    { label: "Medium Priority", value: "medium" },
    { label: "High Priority", value: "high" },
    { label: "Low Priority", value: "low" },
    { label: "Medium Priority", value: "medium" },
    { label: "High Priority", value: "high" },
  ];

  const handleCreate = async () => {
    if (!subject.trim()) {
      Toast.show({
        type: "error",
        text1: "Subject required",
        text2: "Please enter a subject",
      });
      return;
    }

    if (!description.trim()) {
      Toast.show({
        type: "error",
        text1: "Description required",
        text2: "Please describe your issue",
      });
      return;
    }

    try {
      setLoading(true);

      const location = await getLatLong();
      const token = await SecureStore.getItemAsync("userToken");

      const res = await createTicketApi({
        subject,
        description,
        priority,
        latitude: location?.latitude?.toString() || "0",
        longitude: location?.longitude?.toString() || "0",
        token: token || "",
      });

      if (res?.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: `Ticket ${res.data.data.ticket_number} created!`,
        });
        router.back();
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formCard}>
          <Text style={styles.title}>New Support Ticket</Text>

          <CustomInput
            label="Subject"
            placeholder="Enter subject"
            value={subject}
            onChangeText={setSubject}
            iconStart={Ticket}
          />

          {/* PRIORITY DROPDOWN */}
          <Text style={{fontSize: 14,fontWeight: "600",color: theme.colors.text.secondary,marginBottom: 8,marginTop: 12,}}>Priority</Text>
          <DropDownPicker
            open={open}
            value={priority}
            items={priorities}
            setOpen={setOpen}
            setValue={(cb) => {
              const value =
                typeof cb === "function" ? cb(priority) : cb;
              setPriority(value as "low" | "medium" | "high");
            }}
            setItems={() => {}}
            placeholder="Select priority"
            listMode="SCROLLVIEW"
            style={{borderColor: "rgba(0,0,0,0.1)",backgroundColor: "#FFF",borderRadius: 14,borderWidth: 1,minHeight: 55,paddingHorizontal: 15,}}
            dropDownContainerStyle={{borderColor: "rgba(0,0,0,0.1)",borderRadius: 14,}}
            placeholderStyle={{color: theme.colors.text.secondary,fontSize: 15,}}
            labelStyle={{  color: theme.colors.text.primary,fontSize: 15,}}
            zIndex={3000}
          />

          <CustomInput
            label="Description"
            placeholder="Tell us more about the issue..."
            value={description}
            onChangeText={setDescription}
            iconStart={AlignLeft}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <View style={styles.btnRow}>
                <Send size={18} color="#FFF" />
                <Text style={styles.btnText}>Submit Ticket</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  scrollContent: {
    padding: 20,
  },
  formCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text.secondary,
    marginBottom: 8,
    marginTop: 12,
  },
  dropdown: {
    borderColor: "rgba(0,0,0,0.1)",
    backgroundColor: "#FFF",
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 55,
    paddingHorizontal: 15,
  },
  dropdownContainer: {
    borderColor: "rgba(0,0,0,0.1)",
    borderRadius: 14,
  },
  placeholder: {
    color: theme.colors.text.secondary,
    fontSize: 15,
  },
  itemLabel: {
    color: theme.colors.text.primary,
    fontSize: 15,
  },
  btn: {
    backgroundColor: theme.colors.primary[500],
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  btnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});


export default CreateTicket;
