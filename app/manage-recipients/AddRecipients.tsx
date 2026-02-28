import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import {
  User,
  CreditCard,
  Camera,
  CheckCircle2,
  ShieldCheck,
  Building2,
} from "lucide-react-native";

import { theme } from "@/theme";
import { getLatLong } from "@/utils/location";
import CustomInput from "@/components/ui/CustomInput";
import CustomDropdown3 from "@/components/ui/CustomDropdwon3";
import { createRecipient, getPaysprintBanks, uploadRecipientDocs } from "@/api/recipients.api";
import Toast from "react-native-toast-message";

interface RecipientForm {
  accountHolderName: string;
  bankName: string;
  bankId: string;
  accountNumber: string;
  ifsc: string;
  docType: "PAN" | "AADHAAR";
  panImage: any;
  aadhaarFront: any;
  aadhaarBack: any;
  passbook: any;
}

type FlatTouchedKeys = keyof RecipientForm |
  "aadhaarFront" | "aadhaarBack" | "panImage" | "passbook";

type FlatErrorKeys = FlatTouchedKeys;

const AddRecipient = () => {
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState<any[]>([]);

  const [form, setForm] = useState<RecipientForm>({
    accountHolderName: "",
    bankName: "",
    bankId: "",
    accountNumber: "",
    ifsc: "",
    docType: "PAN",
    panImage: null,
    aadhaarFront: null,
    aadhaarBack: null,
    passbook: null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RecipientForm, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof RecipientForm, boolean>>>({});

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) return;
      const res = await getPaysprintBanks(token);
      if (res.success) setBanks(res.data);
    } catch (err) {
      console.error("Bank fetch error:", err);
    }
  };

  const bankOptions = useMemo(() => {
    return banks.map((bank) => ({
      label: bank.bank_name,
      value: bank.bank_id.toString(),
    }));
  }, [banks]);

  // Validation Logic
  const validateField = (field: keyof RecipientForm, value: any) => {
    let error = "";
    switch (field) {
      case "accountHolderName":
        if (!value.trim()) error = "Name is required";
        break;
      case "bankId":
        if (!value) error = "Please select a bank";
        break;
      case "accountNumber":
        if (!value.trim()) error = "Account number is required";
        else if (value.length < 9) error = "Enter a valid account number";
        break;
      case "ifsc":
        if (!value.trim()) error = "IFSC is required";
        else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) error = "Invalid IFSC format";
        break;
      case "passbook":
        if (!value) error = "Passbook/Cheque image is required";
        break;
    }
    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const update = (field: keyof RecipientForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (touched[field]) validateField(field, value);
  };

  const handleBlur = (field: keyof RecipientForm) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, form[field]);
  };

  const handleUpload = async (field: keyof RecipientForm, label: string) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to access your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.3,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        if (!asset.uri) {
          Toast.show({
            type: 'error',
            text1: 'Invalid Image',
            text2: 'Image URI is missing'
          });
          return;
        }

        const fileObj = {
          uri: Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri,
          type: asset.mimeType || 'image/jpeg',
          name: asset.fileName || `${field}_${Date.now()}.jpg`,
        };

        setForm(prev => ({ ...prev, [field]: fileObj }));

        const errorKey = field as FlatErrorKeys;
        if (errors[errorKey]) {
          setErrors(prev => ({ ...prev, [errorKey]: undefined }));
        }

        Toast.show({
          type: 'success',
          text1: 'Image Selected',
          text2: `${label} ready to upload.`
        });
      }
    } catch (error: any) {
      console.error("Image upload error:", error);
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: error?.message || 'Failed to select image'
      });
    }
  };



  const validateAll = () => {
    const fields: (keyof RecipientForm)[] = [
      'accountHolderName',
      'bankId',
      'accountNumber',
      'ifsc',
      'passbook'
    ];

    // 1. Validate all standard fields (don't use .every() here)
    const validationResults = fields.map(f => validateField(f, form[f]));
    let isValid = validationResults.every(result => result === true);

    // 2. Validate conditional Document fields
    if (form.docType === "PAN") {
      if (!form.panImage) {
        setErrors(prev => ({ ...prev, panImage: "PAN image is required" }));
        isValid = false;
      }
    } else if (form.docType === "AADHAAR") {
      if (!form.aadhaarFront) {
        setErrors(prev => ({ ...prev, aadhaarFront: "Front image required" }));
        isValid = false;
      }
      if (!form.aadhaarBack) {
        setErrors(prev => ({ ...prev, aadhaarBack: "Back image required" }));
        isValid = false;
      }
    }

    // 3. Mark all fields as touched so the red text actually shows up
    const allTouched: Partial<Record<keyof RecipientForm, boolean>> = {};
    [...fields, 'panImage', 'aadhaarFront', 'aadhaarBack'].forEach(key => {
      allTouched[key as keyof RecipientForm] = true;
    });

    setTouched(allTouched);

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateAll()) return;

    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync("userToken");
      const location = await getLatLong();
      if (!token) {
        Toast.show({
          type: 'error',
          text1: "Token not exist"
        })
        return;
      }

      const res1 = await createRecipient(token, {
        account_holder_name: form.accountHolderName,
        bank_name: form.bankName,
        account_number: form.accountNumber,
        ifsc_code: form.ifsc,
        bankid: form.bankId,
      }, location);

      // Standard Success Handling
      if (res1?.success || [1, 2].includes(res1?.data?.code)) {
        await proceedToUpload(res1.data.data.bene_id, token, location);
        return;
      }

    } catch (error: any) {
      // --- HANDLE THE "ALREADY ADDED" CASE ---
      const errorData = error?.response?.data?.data;

      // Check for code 4 (Already added)
      if (errorData?.code === 4 || errorData?.response_code === 4) {
        const beneId = errorData?.data?.bene_id || errorData?.bene_id;

        Toast.show({
          type: "success", // We show success because the goal is met
          text1: "Already Registered",
          text2: "Moving to document upload...",
        });

        // Automatically move to the next step using the existing bene_id
        await proceedToUpload(beneId, await SecureStore.getItemAsync("userToken"), await getLatLong());
        return;
      }

      // Default Error Handling for actual failures
      Toast.show({
        type: "error",
        text1: "Submission Failed",
        text2: error?.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to handle the document upload part
  const proceedToUpload = async (beneId: string, token: any, location: any) => {
    const formData = new FormData();
    formData.append("bene_id", beneId);
    formData.append("doctype", form.docType);
    formData.append("passbook", form.passbook as any);

    if (form.docType === "PAN") formData.append("panimage", form.panImage as any);
    else {
      formData.append("front_aadhar", form.aadhaarFront as any);
      formData.append("back_aadhar", form.aadhaarBack as any);
    }

    const res2 = await uploadRecipientDocs(token, formData, location);
    console.log("res2",res2)
    const isSuccess =
      res2?.status === "success" ||
      res2?.code === 1 
      // res2?.message === "Please upload Relationship document";

    if (isSuccess) {
      Toast.show({
        type: "success",
        text1: "Recipient added successfully",
      });
      router.back();
    } else {
      Toast.show({
        type: "error",
        text1: "Doc Upload Failed",
        text2: "Please Upload correct document",
      });
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <CustomInput
          label="Account Holder Name"
          placeholder="Enter name as per bank"
          iconStart={User}
          value={form.accountHolderName}
          onChangeText={(txt) => update("accountHolderName", txt)}
          onBlur={() => handleBlur("accountHolderName")}
          error={touched.accountHolderName ? errors.accountHolderName : undefined}
        />

        <CustomDropdown3
          label="Bank Name"
          placeholder="Select your bank"
          items={bankOptions}
          value={form.bankId}
          onSelect={(item) => {
            setForm(prev => ({ ...prev, bankName: item.label, bankId: item.value }));
            setErrors(prev => ({ ...prev, bankId: undefined }));
          }}
          error={touched.bankId ? errors.bankId : undefined}
        />

        <CustomInput
          label="Account Number"
          placeholder="Enter account number"
          iconStart={CreditCard}
          keyboardType="number-pad"
          value={form.accountNumber}
          onChangeText={(txt) => update("accountNumber", txt)}
          onBlur={() => handleBlur("accountNumber")}
          error={touched.accountNumber ? errors.accountNumber : undefined}
        />

        <CustomInput
          label="IFSC Code"
          placeholder="e.g. SBIN0001234"
          iconStart={ShieldCheck}
          autoCapitalize="characters"
          value={form.ifsc}
          onChangeText={(txt) => update("ifsc", txt.toUpperCase())}
          onBlur={() => handleBlur("ifsc")}
          error={touched.ifsc ? errors.ifsc : undefined}
        />

        <Text style={styles.fieldLabel}>Verification Method</Text>
        <View style={styles.tabContainer}>
          {["PAN", "AADHAAR"].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.tab, form.docType === type && styles.activeTab]}
              onPress={() => setForm(prev => ({ ...prev, docType: type as any }))}
            >
              <Text style={[styles.tabText, form.docType === type && styles.activeTabText]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.uploadSection}>
          {form.docType === "PAN" ? (
            <FilePickerBox
              label="PAN Card Image"
              value={form.panImage}
              onPress={() => handleUpload("panImage", "PAN Card")}
              error={errors.panImage}
            />
          ) : (
            <>
              <FilePickerBox
                label="Aadhaar Front"
                value={form.aadhaarFront}
                onPress={() => handleUpload("aadhaarFront", "Aadhaar Front")}
                error={errors.aadhaarFront}
              />
              <FilePickerBox
                label="Aadhaar Back"
                value={form.aadhaarBack}
                onPress={() => handleUpload("aadhaarBack", "Aadhaar Back")}
                error={errors.aadhaarBack}
              />
            </>
          )}
          <FilePickerBox
            label="Passbook / Cancelled Cheque"
            value={form.passbook}
            onPress={() => handleUpload("passbook", "Passbook")}
            error={errors.passbook}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.8 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Verify & Add Recipient</Text>}
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const FilePickerBox = ({ label, value, onPress, error }: any) => (
  <View style={styles.fileBoxContainer}>
    <Text style={styles.fileLabel}>{label}</Text>
    <TouchableOpacity
      style={[styles.filePicker, value && styles.filePickerActive, error && styles.filePickerError]}
      onPress={onPress}
    >
      {value ? (
        <View style={styles.fileInfo}>
          <CheckCircle2 size={16} color="#27AE60" />
          <Text style={styles.fileSuccessText}>Attached</Text>
        </View>
      ) : (
        <View style={styles.fileInfo}>
          <Camera size={18} color={theme.colors.text.tertiary} />
          <Text style={styles.filePlaceholder}>Tap to Upload</Text>
        </View>
      )}
    </TouchableOpacity>
    {error && <Text style={styles.errorTextSmall}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { paddingHorizontal: 16, paddingTop: 10 },
  fieldLabel: { fontSize: 14, fontWeight: "700", color: theme.colors.text.secondary, marginBottom: 8, marginTop: 20 },
  tabContainer: { flexDirection: "row", gap: 10 },
  tab: { flex: 1, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#E2E8F0" },
  activeTab: { backgroundColor: theme.colors.primary[500] },
  tabText: { fontWeight: "700", color: "#64748B" },
  activeTabText: { color: "#FFF" },
  uploadSection: { marginTop: 20, gap: 15 },
  fileBoxContainer: { marginBottom: 5 },
  fileLabel: { fontSize: 13, fontWeight: "600", color: theme.colors.text.tertiary, marginBottom: 6 },
  filePicker: { height: 56, borderRadius: 14, borderWidth: 1, borderStyle: "dashed", borderColor: "#CBD5E1", backgroundColor: "#FFF", justifyContent: "center", alignItems: "center" },
  filePickerActive: { borderColor: "#27AE60", backgroundColor: "#F0FDF4", borderStyle: "solid" },
  filePickerError: { borderColor: "#EF4444" },
  fileInfo: { flexDirection: "row", alignItems: "center", gap: 8 },
  fileSuccessText: { color: "#27AE60", fontWeight: "700" },
  filePlaceholder: { color: "#94A3B8" },
  errorTextSmall: { color: "#EF4444", fontSize: 11, marginTop: 4, fontWeight: "600" },
  submitBtn: { backgroundColor: theme.colors.primary[500], height: 58, borderRadius: 16, justifyContent: "center", alignItems: "center", marginTop: 35, elevation: 4 },
  submitBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});

export default AddRecipient;