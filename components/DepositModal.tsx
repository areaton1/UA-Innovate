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
} from 'react-native';
import { MOCK_ACCOUNTS } from '@/app/data/mockData';
import { colors, spacing, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const DEPOSIT_ACCOUNTS = MOCK_ACCOUNTS.filter((a) => a.type !== 'Credit');

export default function DepositModal({ visible, onClose }: Props) {
  const [accountId, setAccountId] = useState(DEPOSIT_ACCOUNTS[0]?.id ?? MOCK_ACCOUNTS[0].id);
  const [amount, setAmount] = useState('');
  const [photoTaken, setPhotoTaken] = useState(false);
  const [success, setSuccess] = useState(false);

  function reset() {
    setAccountId(DEPOSIT_ACCOUNTS[0]?.id ?? MOCK_ACCOUNTS[0].id);
    setAmount('');
    setPhotoTaken(false);
    setSuccess(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit() {
    if (!amount || isNaN(Number(amount))) return;
    setSuccess(true);
  }

  const selectedAccount = MOCK_ACCOUNTS.find((a) => a.id === accountId)!;

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
              <Text style={styles.successTitle}>Deposit Submitted</Text>
              <Text style={styles.successSub}>
                ${Number(amount).toFixed(2)} will be deposited into{'\n'}{selectedAccount.name} {selectedAccount.number}
              </Text>
              <Text style={styles.successNote}>Funds typically available within 1–2 business days.</Text>
              <TouchableOpacity style={styles.doneBtn} onPress={handleClose}>
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.header}>
                <Text style={styles.title}>Mobile Deposit</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Deposit To</Text>
              <View style={styles.pickerRow}>
                {DEPOSIT_ACCOUNTS.map((acct) => (
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

              <Text style={styles.label}>Check Amount</Text>
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

              <Text style={styles.label}>Check Photos</Text>
              <View style={styles.photoRow}>
                <TouchableOpacity
                  style={[styles.photoBox, photoTaken && styles.photoBoxDone]}
                  onPress={() => setPhotoTaken(true)}
                >
                  {photoTaken ? (
                    <>
                      <Ionicons name="checkmark-circle" size={32} color="#2e7d32" style={styles.photoCheckmark} />
                      <Text style={styles.photoLabel}>Photos Captured</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="camera-outline" size={32} color={colors.navBg} style={styles.cameraIcon} />
                      <Text style={styles.photoLabel}>Take Photo of Check</Text>
                      <Text style={styles.photoSubLabel}>Front & back required</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.tipBox}>
                <Text style={styles.tipText}>
                  💡 Make sure all 4 corners are visible and the image is clear.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, (!amount || !photoTaken) && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={!amount || !photoTaken}
              >
                <Text style={styles.submitBtnText}>Submit Deposit</Text>
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
  photoRow: { marginBottom: 14 },
  photoBox: {
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    backgroundColor: colors.offWhite,
  },
  photoBoxDone: { borderColor: '#2e7d32', borderStyle: 'solid', backgroundColor: '#e8f5e9' },
  cameraIcon: { marginBottom: 8 },
  photoCheckmark: { marginBottom: 8 },
  photoLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  photoSubLabel: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  tipBox: {
    backgroundColor: '#fff8f0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffd5a8',
  },
  tipText: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
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
  successSub: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: 8, lineHeight: 22 },
  successNote: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginBottom: 28, fontStyle: 'italic' },
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
