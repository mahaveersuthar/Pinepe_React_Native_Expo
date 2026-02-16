import { AnimatedButton } from "@/components/animated/AnimatedButton";
import { AnimatedCard } from "@/components/animated/AnimatedCard"
import CustomInput from "@/components/ui/CustomInput";
import { theme } from "@/theme"
import { useState } from "react";
import { Text, View } from "react-native"

import { NativeModules } from 'react-native';

const { PaysprintModule } = NativeModules;

type PaysprintForm = {
    pId: string;
    pApiKey: string;
    mCode: string;
    mobile: string;
    lat: string;
    lng: string;
    pipe: string;
    firm: string;
    email: string;
};

type OnboardingScreenProps = {
    merchantCode: string;
    lat: string;
    lng: string;

}

const OnboardingScreen = (props: OnboardingScreenProps) => {

    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<{
        mobile?: string;
        email?: string;
    }>({});

    const validate = () => {
        const newErrors: typeof errors = {};

        // Mobile validation
        if (!form.mobile.trim()) {
            newErrors.mobile = "Mobile number is required";
        } else if (!/^[6-9]\d{9}$/.test(form.mobile)) {
            newErrors.mobile = "Enter a valid 10-digit mobile number";
        }

        // Email validation
        if (!form.email.trim()) {
            newErrors.email = "Email is required";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
        ) {
            newErrors.email = "Enter a valid email address";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };






    const [form, setForm] = useState<PaysprintForm>({
        pId: 'PS002194',
        pApiKey: 'UFMwMDIxOTQ5MDdkOWI4N2QxZmRhNzEzMWUwZWZkOTU5Njc3MmI0Zg==',
        mCode: props.merchantCode,
        mobile: '',
        lat: props.lat,
        lng: props.lng,
        pipe: 'bank1',
        firm: 'Pinepe',
        email: '',
    });

    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);

        try {

            const res = await PaysprintModule.startPaysprint(
                form.pId,
                form.pApiKey,
                form.mCode,
                form.mobile,
                form.lat,
                form.lng,
                form.pipe,
                form.firm,
                form.email
            );

            console.log("sdk result",res)

        } finally {
            setLoading(false);
        }
    };


    const update = (key: keyof PaysprintForm, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    return (
        <View style={{ flex: 1, marginHorizontal: 16 }}>
            <Text style={{ fontSize: theme.typography.fontSizes["xl"], fontWeight: theme.typography.fontWeights.medium, alignSelf: 'center', marginTop: 16 }}>Merchant Onboarding</Text>

            <View style={{ marginTop: 16, }}>
                <AnimatedCard>
                    <View>
                        <CustomInput
                            label="Mobile Number"
                            placeholder="Enter your number"
                            value={form.mobile}
                            maxLength={10}
                            error={errors.mobile}
                            keyboardType='number-pad'
                            onChangeText={(text: string) => {
                                update("mobile", text);
                                if (errors.mobile) {
                                    setErrors(prev => ({ ...prev, mobile: undefined }));
                                }
                            }}
                        />

                        <CustomInput
                            label="Email"
                            placeholder="Enter your email"
                            value={form.email}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            error={errors.email}
                            onChangeText={(text: string) => {
                                update("email", text);
                                if (errors.email) {
                                    setErrors(prev => ({ ...prev, email: undefined }));
                                }
                            }}
                        />


                        <AnimatedButton
                            title="Submit"
                            onPress={handleSubmit}
                            variant="primary"
                            size="large"
                            loading={loading}
                            style={{ marginTop: 16 }}
                        />
                    </View>
                </AnimatedCard>
            </View>


        </View>
    )
}

export default OnboardingScreen