import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Keyboard,
  type EmitterSubscription,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { askFinancialQuestion, type ChatMessage } from '@/app/data/aiService';
import { GEMINI_API_KEY } from '@/constants/aiConfig';
import { colors } from '@/constants/theme';

const STARTER_QUESTIONS = [
  'Why is my confidence score not an A?',
  'Where am I overspending this month?',
  'How should I pay off my credit card?',
  "What's my biggest expense category?",
];

type Message = ChatMessage & { id: string };

function AIBubble({ text }: { text: string }) {
  return (
    <View style={styles.aiBubbleRow}>
      <View style={styles.aiAvatar}>
        <Ionicons name="sparkles" size={12} color="#fff" />
      </View>
      <View style={styles.aiBubble}>
        <Text style={styles.aiBubbleText}>{text}</Text>
      </View>
    </View>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <View style={styles.userBubbleRow}>
      <View style={styles.userBubble}>
        <Text style={styles.userBubbleText}>{text}</Text>
      </View>
    </View>
  );
}

function TypingIndicator() {
  return (
    <View style={styles.aiBubbleRow}>
      <View style={styles.aiAvatar}>
        <Ionicons name="sparkles" size={12} color="#fff" />
      </View>
      <View style={[styles.aiBubble, styles.typingBubble]}>
        <ActivityIndicator size="small" color={colors.navBg} />
      </View>
    </View>
  );
}

export default function AIChatView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);
  const notConfigured = GEMINI_API_KEY === 'YOUR_GEMINI_KEY_HERE';
  const insets = useSafeAreaInsets();
  const [kbHeight, setKbHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show: EmitterSubscription = Keyboard.addListener(showEvent, (e) => setKbHeight(e.endCoordinates.height));
    const hide: EmitterSubscription = Keyboard.addListener(hideEvent, () => setKbHeight(0));
    return () => { show.remove(); hide.remove(); };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, loading]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading || notConfigured) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const chatHistory: ChatMessage[] = updated.map((m) => ({ role: m.role, text: m.text }));
      const reply = await askFinancialQuestion(chatHistory);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + '_ai', role: 'model', text: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + '_err',
          role: 'model',
          text: 'Connection error. Check your API key in constants/aiConfig.ts and try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const showStarters = messages.length === 0;

  return (
    <View style={[styles.container, { paddingBottom: kbHeight }]}>
      {notConfigured && (
        <View style={styles.setupBanner}>
          <Ionicons name="key-outline" size={14} color="#7B3F00" style={{ marginRight: 6 }} />
          <Text style={styles.setupBannerText}>
            Add your Gemini key to{' '}
            <Text style={styles.setupBannerCode}>constants/aiConfig.ts</Text>
          </Text>
        </View>
      )}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.messageList, showStarters && styles.messageListCentered]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          showStarters ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="sparkles" size={24} color="#fff" />
              </View>
              <Text style={styles.emptyTitle}>Ask me about your finances</Text>
              <Text style={styles.emptySubtitle}>
                I know your accounts, transactions, and spending patterns.
              </Text>
              <View style={styles.starters}>
                {STARTER_QUESTIONS.map((q) => (
                  <TouchableOpacity
                    key={q}
                    style={styles.starterChip}
                    onPress={() => sendMessage(q)}
                    disabled={notConfigured}
                  >
                    <Text style={styles.starterChipText}>{q}</Text>
                    <Ionicons name="arrow-forward" size={12} color={colors.navBg} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) =>
          item.role === 'user' ? (
            <UserBubble text={item.text} />
          ) : (
            <AIBubble text={item.text} />
          )
        }
        ListFooterComponent={loading ? <TypingIndicator /> : null}
      />

      <View style={[styles.inputRow, { paddingBottom: kbHeight > 0 ? 10 : insets.bottom + 10 }]}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={notConfigured ? 'Set up API key first…' : 'Ask about your spending, score…'}
          placeholderTextColor="#AAA"
          multiline
          maxLength={500}
          editable={!notConfigured}
          returnKeyType="send"
          onSubmitEditing={() => sendMessage(input)}
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            (!input.trim() || loading || notConfigured) && styles.sendBtnDisabled,
          ]}
          onPress={() => sendMessage(input)}
          disabled={!input.trim() || loading || notConfigured}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="arrow-up" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F9' },
  setupBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    marginHorizontal: 12,
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
  },
  setupBannerText: { color: '#7B3F00', fontSize: 12, flex: 1 },
  setupBannerCode: {
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  messageList: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8 },
  messageListCentered: { flexGrow: 1, justifyContent: 'center' },
  emptyState: { alignItems: 'center', paddingHorizontal: 8 },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.navBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  starters: { width: '100%', gap: 8 },
  starterChip: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E8F4',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  starterChipText: { color: colors.navBg, fontSize: 13, fontWeight: '600', flex: 1 },
  aiBubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    gap: 8,
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.navBg,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '82%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  typingBubble: { paddingVertical: 14 },
  aiBubbleText: { color: '#222', fontSize: 14, lineHeight: 21 },
  userBubbleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: colors.navBg,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '82%',
  },
  userBubbleText: { color: '#fff', fontSize: 14, lineHeight: 21 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F4F6F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#222',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#DDE3EC',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.navBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#C8CDD6' },
});
