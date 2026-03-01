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
import { MOCK_ACCOUNTS } from '../data/mockData';
import { colors, spacing, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function TransferModal({ visible, onClose }: Props) {
  const [fromId, setFromId] = useState(MOCK_ACCOUNTS[0].id);
  const [toId, setToId] = useState(MOCK_ACCOUNTS[1].id);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [success, setSuccess] = useState(false);

  function reset() {
    setFromId(MOCK_ACCOUNTS[0].id);
    setToId(MOCK_ACCOUNTS[1].id);
    setAmount('');
    setNote('');
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

  const fromAccount = MOCK_ACCOUNTS.find((a) => a.id === fromId)!;
  const toAccount = MOCK_ACCOUNTS.find((a) => a.id === toId)!;

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
              <Text style={styles.successTitle}>Transfer Submitted</Text>
              <Text style={styles.successSub}>
                ${Number(amount).toFixed(2)} from {fromAccount.name} to {toAccount.name}
              </Text>
              <TouchableOpacity style={styles.doneBtn} onPress={handleClose}>
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.header}>
                <Text style={styles.title}>Transfer Money</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>From</Text>
              <View style={styles.pickerRow}>
                {MOCK_ACCOUNTS.map((acct) => (
                  <TouchableOpacity
                    key={acct.id}
                    style={[styles.pickerChip, fromId === acct.id && styles.pickerChipActive]}
                    onPress={() => setFromId(acct.id)}
                  >
                    <Text style={[styles.pickerChipText, fromId === acct.id && styles.pickerChipTextActive]}>
                      {acct.type}
                    </Text>
                    <Text style={[styles.pickerChipSub, fromId === acct.id && styles.pickerChipTextActive]}>
                      {acct.number}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>To</Text>
              <View style={styles.pickerRow}>
                {MOCK_ACCOUNTS.map((acct) => (
                  <TouchableOpacity
                    key={acct.id}
                    style={[styles.pickerChip, toId === acct.id && styles.pickerChipActive]}
                    onPress={() => setToId(acct.id)}
                  >
                    <Text style={[styles.pickerChipText, toId === acct.id && styles.pickerChipTextActive]}>
                      {acct.type}
                    </Text>
                    <Text style={[styles.pickerChipSub, toId === acct.id && styles.pickerChipTextActive]}>
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

              <Text style={styles.label}>Note (optional)</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="Add a note..."
                placeholderTextColor="#aaa"
                value={note}
                onChangeText={setNote}
              />

              <TouchableOpacity
                style={[styles.submitBtn, (!amount || fromId === toId) && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={!amount || fromId === toId}
              >
                <Text style={styles.submitBtnText}>Transfer</Text>
              </TouchableOpacity>

              {fromId === toId && (
                <Text style={styles.errorText}>From and To accounts must be different.</Text>
              )}

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
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 8,
    marginTop: 4,
  },
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
  noteInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.offWhite,
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: { backgroundColor: '#ddd' },
  submitBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  errorText: { color: '#c62828', fontSize: 12, textAlign: 'center', marginTop: 8 },
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
  successSub: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: 28 },
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
