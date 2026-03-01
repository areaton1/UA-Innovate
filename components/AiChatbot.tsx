import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAccounts } from '../context/AccountsContext';
import { MOCK_TRANSACTIONS, MOCK_USER, MOCK_SUBSCRIPTIONS } from '../data/mockData';
import { colors } from '../constants/theme';

const PNC_ORANGE = '#EF7622';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const GREETING: Message = {
  role: 'assistant',
  content: `Hey ${MOCK_USER.name.split(' ')[0]}! I'm your PNC AI Advisor. I can see your accounts and recent spending — ask me anything about your finances.`,
};

// ── Scripted fallback (no API key needed) ────────────────────────────────────

type ScriptedRule = { keywords: string[]; response: string };

const SCRIPTED_RULES: ScriptedRule[] = [
  {
    keywords: ['hello', 'hi', 'hey', 'sup', 'what can you do', 'help'],
    response: "Hey Everett! I can see your full account picture. Ask me about your credit card, rent, subscriptions, spending habits, savings — anything on your mind.",
  },
  {
    keywords: ['credit', 'utilization', 'visa', '7712', 'credit score', 'fico'],
    response: "Your Cash Rewards Visa is at 97% utilization — $3,890 owed on a $4,000 limit. That's actively hurting your credit score. Even getting it to $3,200 (80%) would help. Your minimum payment of $35 is due March 19.",
  },
  {
    keywords: ['rent', 'apartment', 'riverside', 'landlord', 'march 14', 'due'],
    response: "Rent is $1,250 due around the 14th. With $711 available in checking right now, you'll be counting on your next paycheck (expected ~March 13) to land first. It should, but it'll be close — don't add big expenses before then.",
  },
  {
    keywords: ['subscription', 'netflix', 'hulu', 'spotify', 'disney', 'planet fitness', 'streaming', 'cancel'],
    response: "You're spending $82.95/mo on subscriptions: Netflix ($15.99), Spotify ($9.99), Hulu ($17.99), Planet Fitness ($24.99), Disney+ ($13.99). Canceling Netflix + Hulu alone saves $33.98/mo — that's $408/year.",
  },
  {
    keywords: ['doordash', 'uber eats', 'food delivery', 'delivery', 'takeout', 'eating out', 'dining'],
    response: "Food delivery is one of your biggest variable expenses. DoorDash and Uber Eats added up to $70+ in February alone. Cutting back to 2x/week instead of daily could save you $50–80/month.",
  },
  {
    keywords: ['savings', 'emergency fund', 'growth', '9034', 'save'],
    response: "You have $850 in Growth Savings earning 0.05% APY. That's a decent start for an emergency fund, but you had to pull $100 out last month to cover an overdraft. Try to keep it untouched and add $50/paycheck to build a real buffer.",
  },
  {
    keywords: ['overdraft', 'fee', '$36', 'negative', 'overdrawn'],
    response: "That $36 overdraft fee in February happened when your balance dipped before the Feb 27 paycheck. Setting up a $200 low-balance alert would give you time to transfer from savings before it hits zero.",
  },
  {
    keywords: ['budget', 'spending', 'where is my money', 'where does my money go', 'plan'],
    response: "Your fixed costs are roughly $1,368/mo: rent ($1,250) + subscriptions ($82.95) + credit minimum ($35). You earn ~$4,900/mo gross, so you have ~$1,532 per paycheck for food, gas, fun, and debt paydown. Right now food delivery is eating a big chunk of that.",
  },
  {
    keywords: ['paycheck', 'income', 'salary', 'direct deposit', 'initech', 'pay'],
    response: "You get $2,450 bi-weekly from Initech Corp — next one is expected around March 13. That's $4,900/mo gross. After rent and subs, about $3,532 is left each month for everything else.",
  },
  {
    keywords: ['balance', 'checking', '4821', 'available', 'how much do i have'],
    response: "Your Virtual Wallet has $847.22 balance, with $711.22 available right now ($136 held in pending — including a $38.47 DoorDash). Savings has $850. Credit card owes $3,890.",
  },
  {
    keywords: ['confidence', 'score', 'grade', 'financial health', 'at risk'],
    response: "Your financial confidence score is currently a D — \"At Risk.\" The two biggest drags are your 97% credit utilization and high food delivery spending. Pay an extra $100 on the card and cut one streaming service to start climbing toward a C.",
  },
  {
    keywords: ['goal', 'goals', 'saving for', 'emergency', 'vacation', '$5000'],
    response: "Your savings goal is $5,000 and you're at $850 — 17% there. Automating $100/paycheck would get you to $5k in about 20 months. Even $50 keeps momentum. Don't dip into it for non-emergencies.",
  },
  {
    keywords: ['tip', 'advice', 'what should i do', 'recommend', 'suggest', 'improve'],
    response: "Top 3 moves right now: 1) Pay more than the $35 minimum on your Visa — even $150 extra cuts your utilization fast. 2) Cancel one streaming service (you have 3). 3) Set a $20/week food delivery cap. These three alone could move your confidence score to a C within 2 months.",
  },
  {
    keywords: ['thank', 'thanks', 'appreciate', 'helpful', 'awesome', 'great'],
    response: "Happy to help! Small wins add up fast — you've got this. Let me know if anything else comes up. ",
  },
];

function getScriptedResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const rule of SCRIPTED_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.response;
    }
  }
  return "Good question! Right now I'd focus on two things: 1) Get your Visa below 80% utilization — it's at 97% and hurting your credit score. 2) Watch your checking balance ahead of rent on the 14th. Want details on either?";
}

// ── Live API prompt builder ───────────────────────────────────────────────────

function buildSystemPrompt(accounts: ReturnType<typeof useAccounts>['accounts']) {
  const checking = accounts.find((a) => a.id === '1');
  const savings = accounts.find((a) => a.id === '2');
  const credit = accounts.find((a) => a.id === '3');
  const utilization = credit && credit.creditLimit
    ? Math.round((Math.abs(credit.balance) / credit.creditLimit) * 100)
    : 0;

  const recentTx = MOCK_TRANSACTIONS.slice(0, 12)
    .map((t) => `  ${t.date} | ${t.description.padEnd(35)} | ${t.amount > 0 ? '+' : ''}$${Math.abs(t.amount).toFixed(2)} (${t.category})`)
    .join('\n');

  const subs = MOCK_SUBSCRIPTIONS
    .map((s) => `  ${s.name}: $${s.amount.toFixed(2)}/mo`)
    .join('\n');
  const subTotal = MOCK_SUBSCRIPTIONS.reduce((sum, s) => sum + s.amount, 0);

  return `You are PNC's AI financial advisor embedded in the PNC mobile banking app. You are helping ${MOCK_USER.name.split(' ')[0]}, a recent college grad. Be concise, friendly, and specific — reference their real numbers. Keep responses to 2–4 sentences unless they ask for more detail. Never be preachy.

ACCOUNTS (live):
- Checking (Virtual Wallet ****4821): $${checking?.available.toFixed(2)} available, $${checking?.balance.toFixed(2)} balance
- Savings (Growth Savings ****9034): $${savings?.available.toFixed(2)} available
- Credit Card (Cash Rewards Visa ****7712): $${Math.abs(credit?.balance ?? 0).toFixed(2)} owed of $${credit?.creditLimit?.toLocaleString()} limit (${utilization}% utilization), $${credit?.minimumPayment} min payment due ${credit?.paymentDueDate}

RECENT TRANSACTIONS:
${recentTx}

SUBSCRIPTIONS ($${subTotal.toFixed(2)}/mo total):
${subs}

FINANCIAL CONTEXT:
- Income: ~$2,450 bi-weekly ($4,900/mo gross)
- Rent: $1,250/mo, due around the 14th
- Had a $36 overdraft fee last month
- Credit card utilization is very high (bad for credit score)
- Lots of food delivery spending (DoorDash, Uber Eats)
- Financial confidence score is in the "At Risk" range (Grade D)
- Next paycheck expected ~March 13`;
}

export default function AiChatbot() {
  const { accounts } = useAccounts();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  function scrollToBottom() {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const updated: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(updated);
    setInput('');
    setLoading(true);
    scrollToBottom();

    try {
      const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
      if (!apiKey || apiKey.startsWith('sk-ant-api03-...')) {
        // Scripted fallback — works without a real API key
        await new Promise((r) => setTimeout(r, 600)); // brief thinking delay
        const reply = getScriptedResponse(text);
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
        return;
      }

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 350,
          system: buildSystemPrompt(accounts),
          messages: updated.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      const reply: string = data.content?.[0]?.text ?? "Sorry, I couldn't get a response right now.";
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Connection error — please try again.' },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setOpen(true)} activeOpacity={0.85}>
        <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Chat Modal */}
      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.sheet}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.aiAvatar}>
                  <Ionicons name="sparkles" size={15} color="#fff" />
                </View>
                <View>
                  <Text style={styles.headerTitle}>PNC AI Advisor</Text>
                  <Text style={styles.headerSub}>Powered by Claude</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setOpen(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={22} color="#b0bec5" />
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <ScrollView
              ref={scrollRef}
              style={styles.messageList}
              contentContainerStyle={styles.messageContent}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={scrollToBottom}
            >
              {messages.map((msg, i) => (
                <View
                  key={i}
                  style={[
                    styles.bubbleRow,
                    msg.role === 'user' ? styles.bubbleRowUser : styles.bubbleRowAI,
                  ]}
                >
                  {msg.role === 'assistant' && (
                    <View style={styles.aiBadge}>
                      <Ionicons name="sparkles" size={10} color="#fff" />
                    </View>
                  )}
                  <View
                    style={[
                      styles.bubble,
                      msg.role === 'user' ? styles.userBubble : styles.aiBubble,
                    ]}
                  >
                    <Text style={[styles.bubbleText, msg.role === 'user' && styles.userBubbleText]}>
                      {msg.content}
                    </Text>
                  </View>
                </View>
              ))}

              {loading && (
                <View style={[styles.bubbleRow, styles.bubbleRowAI]}>
                  <View style={styles.aiBadge}>
                    <Ionicons name="sparkles" size={10} color="#fff" />
                  </View>
                  <View style={[styles.bubble, styles.aiBubble, styles.loadingBubble]}>
                    <ActivityIndicator size="small" color={PNC_ORANGE} />
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input row */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Ask about your finances..."
                placeholderTextColor="#999"
                value={input}
                onChangeText={setInput}
                onSubmitEditing={sendMessage}
                returnKeyType="send"
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
                onPress={sendMessage}
                disabled={!input.trim() || loading}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-up" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
  position: 'absolute',
  bottom: 100,
  right: 20,
  zIndex: 999,
},
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PNC_ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#f4f6f9',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '82%',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: colors.navBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: PNC_ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  headerSub: {
    color: '#b0bec5',
    fontSize: 11,
    marginTop: 1,
  },
  messageList: {
    flex: 1,
  },
  messageContent: {
    padding: 16,
    gap: 10,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  bubbleRowUser: {
    justifyContent: 'flex-end',
  },
  bubbleRowAI: {
    justifyContent: 'flex-start',
  },
  aiBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: PNC_ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    flexShrink: 0,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: PNC_ORANGE,
    borderBottomRightRadius: 4,
  },
  loadingBubble: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  bubbleText: {
    fontSize: 14,
    color: '#222',
    lineHeight: 20,
  },
  userBubbleText: {
    color: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e8ecf0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f4f6f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#222',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#e0e4e8',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: PNC_ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#ccc',
  },
});
