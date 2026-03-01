import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { MOCK_ACCOUNTS } from '../data/mockData';
import { useAccounts } from '../context/AccountsContext';
import { colors, spacing, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const PAYEES = [
  { id: 'elec', name: 'Alabama Power', icon: 'flash-outline' },
  { id: 'water', name: 'City Water Works', icon: 'water-outline' },
  { id: 'internet', name: 'Spectrum Internet', icon: 'wifi-outline' },
  { id: 'phone', name: 'AT&T Wireless', icon: 'phone-portrait-outline' },
  { id: 'insurance', name: 'State Farm', icon: 'shield-checkmark-outline' },
  { id: 'rent', name: 'Rental Management Co.', icon: 'home-outline' },
];

const PAY_ACCOUNTS = MOCK_ACCOUNTS.filter((a) => a.type !== 'Credit');

export default function PayBillsModal({ visible, onClose }: Props) {
  const { adjustBalance, accounts } = useAccounts();
  const [payeeId, setPayeeId] = useState(PAYEES[0].id);
  const [accountId, setAccountId] = useState(PAY_ACCOUNTS[0]?.id ?? MOCK_ACCOUNTS[0].id);
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState(false);

  function reset() {
    setPayeeId(PAYEES[0].id);
    setAccountId(PAY_ACCOUNTS[0]?.id ?? MOCK_ACCOUNTS[0].id);
    setAmount('');
    setSuccess(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit() {
    if (!amount || isNaN(Number(amount))) return;
    const amt = Number(amount);
    const account = accounts.find((a) => a.id === accountId)!;
    if (amt > account.available) {
      Alert.alert('Insufficient funds', `Available balance is $${account.available.toFixed(2)}.`);
      return;
    }
    adjustBalance(accountId, -amt);
    setSuccess(true);
  }

  const selectedPayee = PAYEES.find((p) => p.id === payeeId)!;
  const today = new Date();
  const dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5);
  const dueDateStr = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheet}>
          <View style={styles.handle} />

          {success ? (
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark" size={40} color="#2e7d32" />
              </View>
              <Text style={styles.successTitle}>Payment Scheduled</Text>
              <Text style={styles.successSub}>
                ${Number(amount).toFixed(2)} to {selectedPayee.name}{'\n'}scheduled for {dueDateStr}
              </Text>
              <TouchableOpacity style={styles.doneBtn} onPress={handleClose}>
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.header}>
                <Text style={styles.title}>Pay a Bill</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Select Payee</Text>
              {PAYEES.map((payee) => (
                <TouchableOpacity
                  key={payee.id}
                  style={[styles.payeeRow, payeeId === payee.id && styles.payeeRowActive]}
                  onPress={() => setPayeeId(payee.id)}
                >
                  <Ionicons name={payee.icon as any} size={18} color={colors.navBg} style={styles.payeeIcon} />
                  <Text style={[styles.payeeName, payeeId === payee.id && styles.payeeNameActive]}>
                    {payee.name}
                  </Text>
                  {payeeId === payee.id && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
                </TouchableOpacity>
              ))}

              <Text style={[styles.label, { marginTop: 14 }]}>Pay From</Text>
              <View style={styles.pickerRow}>
                {PAY_ACCOUNTS.map((acct) => (
                  <TouchableOpacity
                    key={acct.id}
                    style={[styles.pickerChip, accountId === acct.id && styles.pickerChipActive]}
                    onPress={() => setAccountId(acct.id)}
                  >
                    <Text style={[styles.pickerChipText, accountId === acct.id && styles.pickerChipTextActive]}>
                      {acct.type}
                    </Text>
                    <Text style={[styles.pickerChipSub, accountId === acct.id && styles.pickerChipTextActive]}>
                      {acct.number}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Amount</Text>
              <View style={styles.amountRow}>
                <Text style={styles.dollarSign}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="#aaa"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>

              <View style={styles.dueDateRow}>
                <Text style={styles.dueDateLabel}>Estimated delivery</Text>
                <Text style={styles.dueDateValue}>{dueDateStr}</Text>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, !amount && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={!amount}
              >
                <Text style={styles.submitBtnText}>Schedule Payment</Text>
              </TouchableOpacity>

              <View style={{ height: spacing.xl }} />
            </ScrollView>
          )}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: { ...typography.headline, color: colors.text },
  closeBtn: { padding: 4 },
  closeText: { fontSize: 18, color: colors.textMuted },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: 8 },
  payeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    backgroundColor: colors.offWhite,
  },
  payeeRowActive: { borderColor: colors.primary, backgroundColor: '#fff4eb' },
  payeeIcon: { marginRight: 12 },
  payeeName: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },
  payeeNameActive: { color: colors.primary },
  pickerRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  pickerChip: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 10,
    alignItems: 'center',
    backgroundColor: colors.offWhite,
  },
  pickerChipActive: { borderColor: colors.primary, backgroundColor: '#fff4eb' },
  pickerChipText: { fontSize: 13, fontWeight: '700', color: colors.text },
  pickerChipTextActive: { color: colors.primary },
  pickerChipSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 52,
    marginBottom: 14,
    backgroundColor: colors.offWhite,
  },
  dollarSign: { fontSize: 20, fontWeight: '700', color: colors.text, marginRight: 4 },
  amountInput: { flex: 1, fontSize: 24, fontWeight: '700', color: colors.text },
  dueDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.gray,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  dueDateLabel: { fontSize: 13, color: colors.textMuted },
  dueDateValue: { fontSize: 13, fontWeight: '700', color: colors.text },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: { backgroundColor: '#ddd' },
  submitBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  successIcon: {
    backgroundColor: '#e8f5e9',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  successTitle: { ...typography.headline, color: colors.text, marginBottom: 8 },
  successSub: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: 28, lineHeight: 22 },
  doneBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
