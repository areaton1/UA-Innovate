import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

const PNC_ORANGE = '#EF7622';
const PNC_NAVY = '#003087';
const PNC_LIGHT_BLUE = '#E6F4FE';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));
    const success = login(email, password);
    setLoading(false);
    if (success) {
      router.replace('/(tabs)/home');
    } else {
      Alert.alert('Login Failed', 'Invalid email or password.\n\nHint: use ep@email.com / password123');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        {/* Header / Logo */}
        <View style={styles.header}>
          <Image
            source={require('../data/logo_pnc.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />

          <Text style={styles.tagline}>The Certain Way to Financial Success</Text>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          <Text style={styles.signInTitle}>Sign In</Text>

          <Text style={styles.label}>Online User ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email or user ID"
            placeholderTextColor="#999"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Enter password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.showBtn}
              onPress={() => setShowPassword((v) => !v)}
            >
              <Text style={styles.showBtnText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotLink}>
            <Text style={styles.forgotText}>Forgot User ID or Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.biometricBtn}>
            <Text style={styles.biometricText}>Sign in with Face ID / Touch ID</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>New to PNC?</Text>
          <TouchableOpacity>
            <Text style={styles.enrollText}> Enroll Now</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logoImage: {
    width: 120,
    height: 50,
    marginBottom: 10,
  },
  container: {
    flex: 1,
    backgroundColor: PNC_NAVY,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
  },
  logoContainer: {
    backgroundColor: PNC_ORANGE,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 4,
  },
  tagline: {
    color: '#A8C8E8',
    fontSize: 13,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  signInTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: PNC_NAVY,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#222',
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    marginBottom: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  showBtn: {
    borderWidth: 1.5,
    borderLeftWidth: 0,
    borderColor: '#D0D0D0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  showBtnText: {
    color: PNC_NAVY,
    fontWeight: '600',
    fontSize: 14,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -8,
  },
  forgotText: {
    color: PNC_NAVY,
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  loginBtn: {
    backgroundColor: PNC_ORANGE,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    color: '#888',
    marginHorizontal: 10,
    fontSize: 13,
  },
  biometricBtn: {
    borderWidth: 1.5,
    borderColor: PNC_NAVY,
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
  },
  biometricText: {
    color: PNC_NAVY,
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  footerText: {
    color: '#A8C8E8',
    fontSize: 14,
  },
  enrollText: {
    color: PNC_ORANGE,
    fontSize: 14,
    fontWeight: '700',
  },
});
