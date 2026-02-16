import { useEffect, useState } from "react";
import {
    Text,
    View,
    ScrollView,
    StyleSheet,
    Modal,
    Pressable,
    TextInput
} from "react-native";
import * as SecureStore from "expo-secure-store";
import Toast from "react-native-toast-message";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from "react-native-reanimated";

import { getLatLong } from "@/utils/location";
import { paysprinBankList, paysprintBalanceEnquiry } from "@/api/paysprint.api";

import { AnimatedCard } from "@/components/animated/AnimatedCard";
import CustomInput from "@/components/ui/CustomInput";
import { AnimatedButton } from "@/components/animated/AnimatedButton";
import DropDownPicker from "react-native-dropdown-picker";
import { theme } from "@/theme";
import { BiometricScanner } from "@/components/ui/BiometricScanner";
import {
    X,
    CheckCircle,
    XCircle,
    Printer,
    Download,
    ArrowRight
} from "lucide-react-native";

interface BalanceEnquiryForm {
    mobileno: string;
    aadhaar: string;
    bankIIN: string;
    biometricData: string;
    ipAddress: string;
}

interface DropdownItem {
    label: string;
    value: string;
}

// Response type based on your API response
interface BalanceEnquiryResponse {
    success: boolean;
    code: number;
    message: string;
    data: {
        response_code: number;
        status: boolean;
        message: string;
        ackno: number;
        amount: number;
        balanceamount: string;
        bankrrn: number;
        bankiin: string;
        mobile: string;
        errorcode: number;
    };
}

const BalanceEnquiry = () => {
    /* ---------------- STATE ---------------- */

    const [bankOptions, setBankOptions] = useState<DropdownItem[]>([]);
    const [bankOpen, setBankOpen] = useState(false);

    const [form, setForm] = useState<BalanceEnquiryForm>({
        mobileno: "",
        aadhaar: "",
        bankIIN: "",
        biometricData: "",
        ipAddress: ""
    });

    const [errors, setErrors] = useState<{
        mobileno?: string;
        aadhaar?: string;
        bankIIN?: string;
        biometricData?: string;
        ipAddress?: string;
    }>({});

    const [touched, setTouched] = useState<{
        mobileno: boolean;
        aadhaar: boolean;
        bankIIN: boolean;
        biometricData: boolean;
    }>({
        mobileno: false,
        aadhaar: false,
        bankIIN: false,
        biometricData: false,
    });

    const [loading, setLoading] = useState(false);

    // Modal states
    const [modalVisible, setModalVisible] = useState(false);
    const [responseData, setResponseData] = useState<BalanceEnquiryResponse | null>(null);

    // Animation value for the modal
    const translateY = useSharedValue(700);

    useEffect(() => {
        translateY.value = modalVisible
            ? withSpring(0, { damping: 18 })
            : withTiming(700);
    }, [modalVisible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    /* ---------------- HELPERS ---------------- */

    const update = (key: keyof BalanceEnquiryForm, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
        // Clear error for this field when user starts typing
        if (errors[key as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [key]: undefined }));
        }
    };

    const handleBlur = (field: keyof typeof touched) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        // Validate the field on blur
        validateField(field);
    };

    /* ---------------- BANK LIST ---------------- */

    const fetchBankList = async () => {
        try {
            const location = await getLatLong();
            if (!location) {
                Toast.show({
                    type: "error",
                    text1: "Location Required",
                    text2: "Please enable location permission",
                });
                return;
            }

            const token = await SecureStore.getItemAsync("userToken");
            if (!token) throw new Error("User not authenticated");

            const response = await paysprinBankList({
                token,
                latitude: location.latitude,
                longitude: location.longitude,
            });

            if (response?.success) {
                const list: DropdownItem[] =
                    response.data.banklist.data.map((b: any) => ({
                        label: b.bankName,
                        value: b.iinno,
                    }));

                setBankOptions(list);
            } else {
                throw new Error(response?.message || "Failed to fetch banks");
            }
        } catch (err: any) {
            Toast.show({
                type: "error",
                text1: "Bank List Error",
                text2: err.message || "Network Error",
            });
        }
    };

    useEffect(() => {
        fetchBankList();
    }, []);

    useEffect(() => {
        // Dynamic IP fetch
        fetch("https://api.ipify.org?format=json")
            .then(res => res.json())
            .then(data => update("ipAddress", data.ip))
            .catch(() => {
                update("ipAddress", "192.168.1.1"); // Fallback IP
                console.error("IP fetch failed");
            });
    }, []);

    /* ---------------- VALIDATION ---------------- */

    const validateField = (field: keyof typeof touched) => {
        let errorMessage = "";

        switch (field) {
            case "mobileno":
                if (!form.mobileno.trim()) {
                    errorMessage = "Mobile number is required";
                } else if (!/^[6-9]\d{9}$/.test(form.mobileno)) {
                    errorMessage = "Enter valid 10-digit mobile number starting with 6-9";
                }
                break;

            case "aadhaar":
                if (!form.aadhaar.trim()) {
                    errorMessage = "Aadhaar number is required";
                } else if (!/^\d{12}$/.test(form.aadhaar)) {
                    errorMessage = "Enter valid 12-digit Aadhaar number";
                }
                break;

            case "bankIIN":
                if (!form.bankIIN) {
                    errorMessage = "Please select a bank";
                }
                break;

            case "biometricData":
                if (!form.biometricData) {
                    errorMessage = "Biometric scan is required";
                }
                break;
        }

        setErrors(prev => ({ ...prev, [field]: errorMessage }));
        return !errorMessage;
    };

    const validate = () => {
        const mobileValid = validateField("mobileno");
        const aadhaarValid = validateField("aadhaar");
        const bankValid = validateField("bankIIN");
        const biometricValid = validateField("biometricData");

        // Mark all fields as touched
        setTouched({
            mobileno: true,
            aadhaar: true,
            bankIIN: true,
            biometricData: true,
        });

        return mobileValid && aadhaarValid && bankValid && biometricValid;
    };

    /* ---------------- SUBMIT ---------------- */

    const handleSubmit = async () => {
        if (!validate()) {
            Toast.show({
                type: "error",
                text1: "Validation Failed",
                text2: "Please fix the errors before submitting",
            });
            return;
        }

        setLoading(true);

        try {
            // 📍 Get location
            const location = await getLatLong();

            if (!location) {
                Toast.show({
                    type: "error",
                    text1: "Location Required",
                    text2: "Please enable location permission to continue",
                });
                setLoading(false);
                return;
            }

            const token = await SecureStore.getItemAsync("userToken");

            if (!token) {
                throw new Error("User not authenticated");
            }

            const payload = {
                token: token,
                latitude: location.latitude,
                longitude: location.longitude,
                bank: "bank5",
                accessmodetype: "APP",
                piddata: form.biometricData,
                ipaddress: form.ipAddress,
                mobilenumber: form.mobileno,
                adhaarnumber: form.aadhaar,
                nationalbankidentificationnumber: form.bankIIN,
            };

            const res = await paysprintBalanceEnquiry(payload);

            // Set response data and show modal
            setResponseData(res);
            setModalVisible(true);

            if (res?.success && res.data?.status) {
                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: "Balance enquiry completed successfully",
                });
                // Reset form on success
                setForm({
                    mobileno: "",
                    aadhaar: "",
                    bankIIN: "",
                    biometricData: "",
                    ipAddress: form.ipAddress, // Keep IP address
                });
                setTouched({
                    mobileno: false,
                    aadhaar: false,
                    bankIIN: false,
                    biometricData: false,
                });
            } else {
                throw new Error(res?.message || "Balance enquiry failed");
            }
        } catch (err: any) {
            Toast.show({
                type: "error",
                text1: "Submission Error",
                text2: err.message || "Network Error",
            });
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: string) => {
        return `₹${parseFloat(amount).toFixed(2)}`;
    };

    const handlePrint = () => {
        // Implement print functionality
        Toast.show({
            type: "info",
            text1: "Print",
            text2: "Print functionality coming soon",
        });
    };

    const handleDownload = () => {
        // Implement download functionality
        Toast.show({
            type: "info",
            text1: "Download",
            text2: "Download functionality coming soon",
        });
    };

    /* ---------------- UI ---------------- */

    return (
        <>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                <AnimatedCard style={{ marginTop: 16, marginHorizontal: 16 }}>
                    {/* Mobile */}
                    <CustomInput
                        label="Mobile Number"
                        placeholder="Enter mobile number"
                        value={form.mobileno}
                        maxLength={10}
                        keyboardType="number-pad"
                        error={touched.mobileno ? errors.mobileno : undefined}
                        onChangeText={(text) => update("mobileno", text)}
                        onBlur={() => handleBlur("mobileno")}
                    />

                    {/* Aadhaar */}
                    <CustomInput
                        label="Aadhaar Number"
                        placeholder="Enter Aadhaar number"
                        value={form.aadhaar}
                        maxLength={12}
                        keyboardType="number-pad"
                        error={touched.aadhaar ? errors.aadhaar : undefined}
                        onChangeText={(text) => update("aadhaar", text)}
                        onBlur={() => handleBlur("aadhaar")}
                    />

                    <Text style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: theme.colors.text.secondary,
                        marginBottom: 8,
                        marginTop: 12,
                    }}>Select Bank</Text>

                    <DropDownPicker
                        open={bankOpen}
                        value={form.bankIIN || null}
                        items={bankOptions}
                        setOpen={setBankOpen}
                        setValue={(cb) => {
                            setForm(prev => ({
                                ...prev,
                                bankIIN: typeof cb === "function" ? cb(prev.bankIIN) : cb,
                            }));
                            // Clear bank error when selection is made
                            if (errors.bankIIN) {
                                setErrors(prev => ({ ...prev, bankIIN: undefined }));
                            }
                        }}
                        setItems={setBankOptions}
                        placeholder="Choose your bank"
                        listMode="SCROLLVIEW"
                        style={{
                            borderColor: touched.bankIIN && errors.bankIIN
                                ? "#EF4444"
                                : "rgba(0,0,0,0.1)",
                            backgroundColor: "#FFF",
                            borderRadius: 14,
                            borderWidth: 1,
                            minHeight: 55,
                            paddingHorizontal: 15,
                        }}
                        dropDownContainerStyle={{
                            backgroundColor: "#FFF",
                            borderColor: "rgba(0,0,0,0.1)",
                            borderRadius: 14,
                            marginTop: 4,
                        }}
                        placeholderStyle={{
                            color: theme.colors.text.secondary,
                            fontSize: 15,
                        }}
                        labelStyle={{
                            color: theme.colors.text.primary,
                            fontSize: 15,
                        }}
                        disabled={bankOptions.length === 0}
                        onOpen={() => setTouched(prev => ({ ...prev, bankIIN: true }))}
                        zIndex={1000}
                    />

                    {touched.bankIIN && errors.bankIIN && (
                        <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
                            {errors.bankIIN}
                        </Text>
                    )}

                    {/* Biometric Scanner with reset key */}
                    <BiometricScanner
                        key={`biometric-scanner-${form.biometricData}`} // Add this line
                        onScanSuccess={(data) => {
                            update("biometricData", data);
                            // Clear biometric error on successful scan
                            if (errors.biometricData) {
                                setErrors(prev => ({ ...prev, biometricData: undefined }));
                            }
                        }}
                        onScanError={() => {
                            update("biometricData", "");
                            setErrors(prev => ({
                                ...prev,
                                biometricData: "Biometric scan failed. Please try again."
                            }));
                        }}
                    />

                    {touched.biometricData && errors.biometricData && (
                        <Text style={{
                            color: "#EF4444",
                            fontSize: 12,
                            marginTop: 4,
                            marginBottom: 8
                        }}>
                            {errors.biometricData}
                        </Text>
                    )}

                    {/* Submit */}
                    <AnimatedButton
                        title="Submit"
                        onPress={handleSubmit}
                        variant="primary"
                        size="large"
                        loading={loading}
                        style={{ marginTop: 20 }}
                    />
                </AnimatedCard>
            </ScrollView>

            {/* Response Modal - Sliding up/down like DmtTransferModal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <Animated.View style={[styles.modalContainer, animatedStyle]}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Balance Enquiry Result</Text>
                            <Pressable onPress={() => setModalVisible(false)}>
                                <X size={22} color={theme.colors.text.primary} />
                            </Pressable>
                        </View>

                        {responseData && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* Status Icon */}
                                <View style={styles.statusIconContainer}>
                                    {responseData.data?.status ? (
                                        <CheckCircle size={60} color="#10B981" />
                                    ) : (
                                        <XCircle size={60} color="#EF4444" />
                                    )}
                                </View>

                                {/* Status Message */}
                                <View style={[
                                    styles.statusBadge,
                                    responseData.data?.status ? styles.successBadge : styles.errorBadge
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        responseData.data?.status ? styles.successText : styles.errorText
                                    ]}>
                                        {responseData.data?.message || responseData.message}
                                    </Text>
                                </View>

                                {/* Response Details */}
                                <View style={styles.detailsContainer}>
                                    <Text style={styles.sectionTitle}>Transaction Details</Text>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Acknowledgment No:</Text>
                                        <Text style={styles.detailValue}>{responseData.data?.ackno}</Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Bank RRN:</Text>
                                        <Text style={styles.detailValue}>{responseData.data?.bankrrn}</Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Bank IIN:</Text>
                                        <Text style={styles.detailValue}>{responseData.data?.bankiin}</Text>
                                    </View>

                                    <View style={styles.divider} />

                                    <Text style={styles.sectionTitle}>Balance Information</Text>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Current Balance:</Text>
                                        <Text style={styles.balanceValue}>
                                            {formatCurrency(responseData.data?.balanceamount || "0")}
                                        </Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Amount:</Text>
                                        <Text style={styles.detailValue}>
                                            {formatCurrency(responseData.data?.amount.toString() || "0")}
                                        </Text>
                                    </View>

                                    <View style={styles.divider} />

                                    <Text style={styles.sectionTitle}>Additional Information</Text>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Mobile:</Text>
                                        <Text style={styles.detailValue}>
                                            {responseData.data?.mobile || form.mobileno || "N/A"}
                                        </Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Response Code:</Text>
                                        <Text style={styles.detailValue}>{responseData.data?.response_code}</Text>
                                    </View>

                                    {responseData.data?.errorcode !== 0 && (
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Error Code:</Text>
                                            <Text style={[styles.detailValue, styles.errorText]}>
                                                {responseData.data?.errorcode}
                                            </Text>
                                        </View>
                                    )}
                                </View>


                            </ScrollView>
                        )}
                    </Animated.View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    // Modal Styles - Matching DmtTransferModal
    modalOverlay: {
        flex: 1,
        backgroundColor: theme.colors.overlay,
        justifyContent: "flex-end",
    },
    modalContainer: {
        backgroundColor: theme.colors.background.light,
        borderTopLeftRadius: theme.borderRadius?.["2xl"] || 24,
        borderTopRightRadius: theme.borderRadius?.["2xl"] || 24,
        padding: theme.spacing[6] || 24,
        maxHeight: "85%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: theme.typography?.fontSizes?.["2xl"] || 24,
        fontWeight: "800",
        color: theme.colors.text.primary,
    },
    statusIconContainer: {
        alignItems: "center",
        marginVertical: 15,
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: "center",
        marginBottom: 20,
    },
    successBadge: {
        backgroundColor: "#D1FAE5",
    },
    errorBadge: {
        backgroundColor: "#FEE2E2",
    },
    statusText: {
        fontSize: 14,
        fontWeight: "600",
    },
    successText: {
        color: "#10B981",
    },
    errorText: {
        color: "#EF4444",
    },
    detailsContainer: {
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: theme.colors.text.primary,
        marginBottom: 12,
        marginTop: 16,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    detailLabel: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: "500",
        color: theme.colors.text.primary,
        flex: 1,
        textAlign: "right",
    },
    balanceValue: {
        fontSize: 16,
        fontWeight: "700",
        color: "#10B981",
        flex: 1,
        textAlign: "right",
    },
    divider: {
        height: 1,
        backgroundColor: "rgba(0,0,0,0.1)",
        marginVertical: 15,
    },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        marginBottom: 15,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        flex: 0.48,
    },
    printButton: {
        backgroundColor: "#6366F1",
    },
    downloadButton: {
        backgroundColor: "#8B5CF6",
    },
    actionButtonText: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 8,
    },
    doneButton: {
        marginTop: 10,
        backgroundColor: theme.colors.primary[600],
        height: 56,
        borderRadius: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        shadowColor: theme.colors.primary[600],
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 6,
        marginBottom: 20,
    },
    doneButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "800",
    },
});

export default BalanceEnquiry;