import { fetchOnboardingStatus } from "@/api/paysprint.api";
import { getLatLong } from "@/utils/location";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from "react-native"
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";
import OnboardingScreen from "./Onboarding";
import Ekyc from "./Ekyc";
import AepsPaysprint from "./AepsPaysprint";
import Aeps2FA from "./Aeps2FA";
import OnboardingUnderReview from "./OnboardingUnderReview";
import { theme } from "@/theme";
import { ShieldAlert } from "lucide-react-native";


const AepsAirtel = () => {

    const [code, setCode] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<string | null>(null);
    const [is2FADone, setIs2FADone] = useState(false)
    const [merchantCode, setMerchantCode] = useState("")
    const [merchantOwnStatus, setMerchantOwnStatus] = useState("");


    useEffect(() => {
        fetchStatus();
    }, [])

    const fetchStatus = async () => {

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
                return;
            }

            const token = await SecureStore.getItemAsync("userToken");

            if (!token) {
                throw new Error("User not authenticated");
            }

            const res = await fetchOnboardingStatus(

                {
                    token: token,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    bank: "bank5"
                }
            );
            setMerchantCode(res.merchant.merchantcode)
            setIs2FADone(res.isTwoFaDone)
            setStatus(res.response.data?.is_approved)
            setCode(res.response.code);
            setMerchantOwnStatus(res.merchant.onboard_status)
        } catch (err: any) {

            if (err.message == "Merchant not found") {


            }
            else {
                Toast.show({
                    type: "error",
                    text1: "Status Not Fetched",
                    text2: err.message || "Network Error",
                });

            }

        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <ActivityIndicator size="large" color={theme.colors.primary[500]} />
            </View>
        );
    }


    if (code === 0) {
        if (merchantOwnStatus == "pending") {
            return <OnboardingScreen merchantCode={merchantCode} fetchStatus={fetchStatus} />
        }
        return <OnboardingUnderReview onRefresh={fetchStatus} />;
    }


    const renderScreen = () => {
        switch (code) {
            case 2:
                return <OnboardingScreen merchantCode={merchantCode} fetchStatus={fetchStatus} />
            case 1:
                if (status == "Pending") {
                    return <Ekyc fetchStatus={fetchStatus} />
                }

                if (status === "Rejected") {
                    return (
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={{ flex: 1 }}
                        >
                            <ScrollView
                                style={{ flex: 1 }}
                                contentContainerStyle={{ paddingBottom: 40, paddingTop: 16 }}
                                keyboardShouldPersistTaps="handled"
                            >
                                {/* Rejection Alert Section */}
                                <View style={{ alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 }}>
                                    <ShieldAlert
                                        size={48}
                                        color={theme.colors.error[500]}
                                        strokeWidth={2}
                                        style={{ marginBottom: 12 }}
                                    />
                                    <Text style={{
                                        color: theme.colors.error[500],
                                        fontSize: theme.typography.fontSizes.lg,
                                        fontWeight: '700',
                                        textAlign: 'center'
                                    }}>
                                        Your KYC is rejected.
                                    </Text>
                                    <Text style={{
                                        color: '#6B7280',
                                        fontSize: theme.typography.fontSizes.sm,
                                        textAlign: 'center',
                                        marginTop: 4
                                    }}>
                                        Please review your details and try again below.
                                    </Text>
                                </View>

                                {/* Re-onboarding Section */}
                                <View style={{ flex: 1 }}>
                                    <OnboardingScreen
                                        merchantCode={merchantCode}
                                        fetchStatus={fetchStatus}
                                    />
                                </View>
                            </ScrollView>
                        </KeyboardAvoidingView>
                    );
                }

                if (is2FADone) {
                    return <AepsPaysprint />
                }

                return <Aeps2FA fetchStatus={fetchStatus} />
            default:
                return <OnboardingScreen merchantCode={merchantCode} fetchStatus={fetchStatus} />


        }
    }



    return renderScreen();

    //  return <OnboardingScreen  merchantCode={merchantCode}  fetchStatus={fetchStatus}/>

    //  return <AepsPaysprint />
}

export default AepsAirtel
