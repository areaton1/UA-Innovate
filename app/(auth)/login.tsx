import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography } from '../../constants/theme';

const PncLogo = require('../../assets/pnc-logo-rev.svg').default;

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
        <View style={styles.header}>
          <PncLogo width={120} height={48} />
          <Text style={styles.tagline}>The Certain Way to Financial Success</Text>
        </View>

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
  container: {
    flex: 1,
    backgroundColor: colors.navBg,
  },
  inner: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  tagline: {
    color: '#b0bec5',
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  signInTitle: {
    ...typography.titleSmall,
    color: colors.text,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.md,
    backgroundColor: '#fafafa',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
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
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  showBtnText: {
    color: colors.navBg,
    fontWeight: '600',
    fontSize: 14,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: spacing.md,
    marginTop: -spacing.sm,
  },
  forgotText: {
    color: colors.link,
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  loginBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: colors.white,
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
    backgroundColor: colors.border,
  },
  dividerText: {
    color: '#888',
    marginHorizontal: 10,
    fontSize: 13,
  },
  biometricBtn: {
    borderWidth: 1.5,
    borderColor: colors.navBg,
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
  },
  biometricText: {
    color: colors.navBg,
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  footerText: {
    color: '#b0bec5',
    fontSize: 14,
  },
  enrollText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
