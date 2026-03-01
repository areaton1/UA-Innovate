import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { generateActionPlan, type ActionPriority } from '../../data/financialEngine';

const PNC_ORANGE = '#EF7622';
const PNC_NAV_BG = '#414e58';

const PRIORITY_CONFIG: Record<ActionPriority, { color: string; label: string }> = {
  high:   { color: '#C62828', label: 'Do this now' },
  medium: { color: '#EF7622', label: 'This week' },
  low:    { color: '#2E7D32', label: 'When ready' },
};

const ACTION_STEPS: Record<string, string[]> = {
  'spending-high': [
    'Review your transactions this month',
    'Identify your top 3 non-essential spending categories',
    'Set a weekly cash limit for discretionary spending',
    'Check back next week to track your progress',
  ],
  'credit-high': [
    'Go to Accounts → Cash Rewards Visa',
    'Tap "Pay Now" and pay more than the minimum',
    'Target paying the balance down to under 30% of your limit',
    'Set up autopay to avoid future interest charges',
  ],
  'savings-low': [
    'Open your Growth Savings account',
    'Set up a recurring weekly transfer of $50 or more',
    'Treat it like a bill — non-negotiable',
    'Goal: 3 months of expenses (~$1,800)',
  ],
  'subscriptions': [
    'Go to the Transactions tab and filter by "Subscriptions"',
    'List every recurring charge you find',
    'Ask yourself: did I use this in the last 30 days?',
    'Cancel any you haven\'t used — you can always resubscribe',
  ],
  'dining': [
    'Meal prep on Sundays to reduce weekday temptation',
    'Set a $40/week dining budget',
    'Cook at home at least 4 nights this week',
    'Check your Safe-to-Spend amount before ordering out',
  ],
  'invest': [
    'Open a brokerage or Roth IRA account',
    'Start with a low-cost index fund (e.g. VTI or FXAIX)',
    'Contribute even $25/month to start — compounding takes time',
    'Increase contributions by 1% each year',
  ],
  'automate': [
    'Go to Transfers → Scheduled Transfers',
    'Set up a $50 weekly transfer to Growth Savings',
    'Schedule it for the day after your paycheck arrives',
    'Increase the amount by $10 every 3 months',
  ],
};

export default function ActionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const actions = generateActionPlan();
  const action = actions.find((a) => a.id === id);
  const steps = ACTION_STEPS[id ?? ''] ?? [];

  if (!action) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        <Text style={{ padding: 20 }}>Action not found.</Text>
      </SafeAreaView>
    );
  }

  const cfg = PRIORITY_CONFIG[action.priority];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Action Plan</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Action Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <Ionicons name={action.icon as any} size={32} color={PNC_ORANGE} />
            <View style={[styles.priorityBadge, { backgroundColor: cfg.color + '20' }]}>
              <View style={[styles.priorityDot, { backgroundColor: cfg.color }]} />
              <Text style={[styles.priorityLabel, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>{action.title}</Text>
          <Text style={styles.heroDescription}>{action.description}</Text>
          <View style={styles.impactRow}>
            <Ionicons name="cash-outline" size={16} color="#2E7D32" />
            <Text style={styles.impactText}>{action.impact}</Text>
          </View>
        </View>

        {/* Steps */}
        <Text style={styles.stepsHeading}>How to do it</Text>
        {steps.map((step, i) => (
          <View key={i} style={styles.stepCard}>
            <View style={[styles.stepNumber, { backgroundColor: PNC_ORANGE }]}>
              <Text style={styles.stepNumberText}>{i + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}

        {/* Special CTA for subscriptions */}
        {id === 'subscriptions' && (
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/(tabs)/transactions')}
          >
            <Text style={styles.ctaButtonText}>View My Subscriptions →</Text>
          </TouchableOpacity>
        )}

        {/* Motivational footer */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationText}>
            Small steps add up. Completing this action can meaningfully improve your Financial Confidence Score.
          </Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },
  header: {
    backgroundColor: PNC_NAV_BG,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 60,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  scroll: {
    padding: 16,
  },
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  priorityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  priorityLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 21,
    marginBottom: 14,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F9F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  impactText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2E7D32',
  },
  stepsHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
  },
  stepCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 21,
    paddingTop: 4,
  },
  ctaButton: {
    backgroundColor: PNC_ORANGE,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  motivationCard: {
    backgroundColor: '#FFF4EC',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: PNC_ORANGE,
  },
  motivationText: {
    fontSize: 13,
    color: '#444',
    lineHeight: 20,
  },
});
