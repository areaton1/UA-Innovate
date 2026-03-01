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

type Props = {
  visible: boolean;
  onClose: () => void;
};

const RECENT_CONTACTS = [
  { id: 'c1', name: 'Mom', handle: 'mom@email.com' },
  { id: 'c2', name: 'Jake T.', handle: '+1 (205) 555-0142' },
  { id: 'c3', name: 'Sarah L.', handle: 'sarah.l@email.com' },
];

const ZELLE_ACCOUNTS = MOCK_ACCOUNTS.filter((a) => a.type !== 'Credit');

export default function ZelleModal({ visible, onClose }: Props) {
  const [recipient, setRecipient] = useState('');
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [accountId, setAccountId] = useState(ZELLE_ACCOUNTS[0]?.id ?? MOCK_ACCOUNTS[0].id);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [success, setSuccess] = useState(false);

  function reset() {
    setRecipient('');
    setSelectedContact(null);
    setAccountId(ZELLE_ACCOUNTS[0]?.id ?? MOCK_ACCOUNTS[0].id);
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
    if (!recipient && !selectedContact) return;
    setSuccess(true);
  }

  const recipientDisplay = selectedContact
    ? RECENT_CONTACTS.find((c) => c.id === selectedContact)?.name ?? recipient
    : recipient;

  const canSubmit = amount && (recipient.length > 0 || selectedContact !== null);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheet}>
          <View style={styles.handle} />

          {success ? (
            <View style={styles.successContainer}>
              <View style={styles.zelleBadge}>
                <Text style={styles.zelleBadgeText}>Z</Text>
              </View>
              <Text style={styles.successTitle}>Payment Sent!</Text>
              <Text style={styles.successSub}>
                ${Number(amount).toFixed(2)} sent to {recipientDisplay} via Zelle®
              </Text>
              {note ? <Text style={styles.successNote}>"{note}"</Text> : null}
              <TouchableOpacity style={styles.doneBtn} onPress={handleClose}>
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  <View style={styles.zelleTag}>
                    <Text style={styles.zelleTagText}>Z</Text>
                  </View>
                  <Text style={styles.title}>Send with Zelle®</Text>
                </View>
                <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Recent</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.contactsRow}>
                {RECENT_CONTACTS.map((contact) => (
                  <TouchableOpacity
                    key={contact.id}
                    style={[styles.contactChip, selectedContact === contact.id && styles.contactChipActive]}
                    onPress={() => {
                      setSelectedContact(contact.id);
                      setRecipient('');
                    }}
                  >
                    <View style={[styles.contactAvatar, selectedContact === contact.id && styles.contactAvatarActive]}>
                      <Text style={styles.contactAvatarText}>{contact.name[0]}</Text>
                    </View>
                    <Text style={[styles.contactName, selectedContact === contact.id && styles.contactNameActive]}>
                      {contact.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.label, { marginTop: 14 }]}>Send To</Text>
              <TextInput
                style={[styles.textInput, selectedContact && styles.textInputDisabled]}
                placeholder="Email, phone, or name"
                placeholderTextColor="#aaa"
                value={selectedContact ? RECENT_CONTACTS.find((c) => c.id === selectedContact)?.handle ?? '' : recipient}
                onChangeText={(v) => {
                  setRecipient(v);
                  setSelectedContact(null);
                }}
                editable={!selectedContact}
              />
              {selectedContact && (
                <TouchableOpacity onPress={() => setSelectedContact(null)} style={styles.clearContact}>
                  <Text style={styles.clearContactText}>✕ Clear</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.label}>From Account</Text>
              <View style={styles.pickerRow}>
                {ZELLE_ACCOUNTS.map((acct) => (
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

              <Text style={styles.label}>Note (optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="What's it for?"
                placeholderTextColor="#aaa"
                value={note}
                onChangeText={setNote}
              />

              <TouchableOpacity
                style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={!canSubmit}
              >
                <Text style={styles.submitBtnText}>Send Money</Text>
              </TouchableOpacity>

              <Text style={styles.disclaimer}>
                Zelle® and the Zelle® related marks are wholly owned by Early Warning Services, LLC.
              </Text>

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
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  zelleTag: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#6b1ed3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zelleTagText: { color: colors.white, fontSize: 14, fontWeight: '900' },
  title: { ...typography.headline, color: colors.text },
  closeBtn: { padding: 4 },
  closeText: { fontSize: 18, color: colors.textMuted },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: 8 },
  contactsRow: { marginBottom: 0 },
  contactChip: {
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 4,
  },
  contactChipActive: {},
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.offWhite,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  contactAvatarActive: { borderColor: '#6b1ed3', backgroundColor: '#f3ecfd' },
  contactAvatarText: { fontSize: 18, fontWeight: '700', color: colors.text },
  contactName: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  contactNameActive: { color: '#6b1ed3', fontWeight: '700' },
  textInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.offWhite,
    marginBottom: 8,
  },
  textInputDisabled: { backgroundColor: '#f0ecfd', borderColor: '#c5a8f5', color: '#6b1ed3' },
  clearContact: { alignSelf: 'flex-end', marginBottom: 10 },
  clearContactText: { fontSize: 12, color: '#6b1ed3', fontWeight: '600' },
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
  pickerChipActive: { borderColor: '#6b1ed3', backgroundColor: '#f3ecfd' },
  pickerChipText: { fontSize: 13, fontWeight: '700', color: colors.text },
  pickerChipTextActive: { color: '#6b1ed3' },
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
  submitBtn: {
    backgroundColor: '#6b1ed3',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  submitBtnDisabled: { backgroundColor: '#ddd' },
  submitBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  disclaimer: {
    fontSize: 10,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 14,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  zelleBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6b1ed3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  zelleBadgeText: { color: colors.white, fontSize: 36, fontWeight: '900' },
  successTitle: { ...typography.headline, color: colors.text, marginBottom: 8 },
  successSub: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: 8, lineHeight: 22 },
  successNote: { fontSize: 13, color: '#6b1ed3', fontStyle: 'italic', marginBottom: 24 },
  doneBtn: {
    backgroundColor: '#6b1ed3',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
