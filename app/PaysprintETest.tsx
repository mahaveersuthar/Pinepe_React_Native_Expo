import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { NativeModules } from 'react-native';

const { PaysprintModule } = NativeModules;

/* ---------- Types ---------- */

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

type InputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'numeric';
  secureTextEntry?: boolean;
};

/* ---------- Input Component ---------- */

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  keyboardType = 'default',
  secureTextEntry = false,
}) => (
  <View style={styles.inputBox}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      style={styles.input}
      placeholder={label}
      autoCapitalize="none"
    />
  </View>
);

/* ---------- Main Screen ---------- */

const PaysprintTest: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  const [form, setForm] = useState<PaysprintForm>({
    pId: 'PS002194',
    pApiKey: '',
    mCode: '101196',
    mobile: '',
    lat: '41.10',
    lng: '76.00',
    pipe: 'bank1',
    firm: '',
    email: '',
  });

  const update = (key: keyof PaysprintForm, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const startPaysprint = async () => {
    const { pId, pApiKey, mobile, firm } = form;

    if (!pId || !pApiKey || !mobile || !firm) {
      Alert.alert('Validation Error', 'Please fill all required fields (*)');
      return;
    }

    try {
      setLoading(true);
      setResult(null);

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

      const parsed = typeof res === 'string' ? JSON.parse(res) : res;
      setResult(parsed);

      Alert.alert(
        'Paysprint Result',
        `Status: ${parsed.status}\nResponse: ${parsed.response}\nMessage: ${parsed.message}`
      );
    } catch (err: any) {
      console.error('Paysprint Error:', err);
      Alert.alert('Paysprint Error', err?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Paysprint SDK Test</Text>

      <Input label="Partner ID *" value={form.pId} onChange={v => update('pId', v)} />
      <Input
        label="API Key *"
        value={form.pApiKey}
        onChange={v => update('pApiKey', v)}
        secureTextEntry
      />
      <Input label="Merchant Code" value={form.mCode} onChange={v => update('mCode', v)} />
      <Input
        label="Mobile *"
        value={form.mobile}
        keyboardType="phone-pad"
        onChange={v => update('mobile', v)}
      />
      <Input label="Latitude" value={form.lat} onChange={v => update('lat', v)} />
      <Input label="Longitude" value={form.lng} onChange={v => update('lng', v)} />
      <Input label="Pipe (bank1 / bank2)" value={form.pipe} onChange={v => update('pipe', v)} />
      <Input label="Firm Name *" value={form.firm} onChange={v => update('firm', v)} />
      <Input
        label="Email"
        value={form.email}
        keyboardType="email-address"
        onChange={v => update('email', v)}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.disabled]}
        onPress={startPaysprint}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Launching Paysprint…' : 'Start Paysprint'}
        </Text>
      </TouchableOpacity>

      {result && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Result JSON</Text>
          <Text style={styles.resultText}>
            {JSON.stringify(result, null, 2)}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default PaysprintTest;

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputBox: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    marginBottom: 4,
    color: '#475569',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultBox: {
    marginTop: 30,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
