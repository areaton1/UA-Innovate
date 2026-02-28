import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { generateActionPlan, type Action, type ActionPriority } from '../data/financialEngine';

const PNC_NAVY = '#003087';
const PNC_ORANGE = '#EF7622';

const PRIORITY_CONFIG: Record<ActionPriority, { color: string; label: string }> = {
  high:   { color: '#C62828', label: 'Do this now' },
  medium: { color: '#EF7622', label: 'This week' },
  low:    { color: '#2E7D32', label: 'When ready' },
};

const ACTION_STEPS: Record<string, { title: string; steps: string }> = {
  'spending-high': {
    title: 'Reduce Spending',
    steps: '1. Review your transactions this month\n2. Identify your top 3 non-essential categories\n3. Set a weekly cash limit for discretionary spending\n4. Check back next week to see your progress',
  },
  'credit-high': {
    title: 'Pay Down Credit Card',
    steps: '1. Go to Accounts → Cash Rewards Visa\n2. Tap "Pay Now" and pay more than the minimum\n3. Target paying the balance down to under 30% of your limit\n4. Set up autopay to avoid interest charges',
  },
  'savings-low': {
    title: 'Build Emergency Fund',
    steps: '1. Open your Growth Savings account\n2. Set up a recurring weekly transfer of $50+\n3. Treat it like a bill — non-negotiable\n4. Goal: 3 months of expenses (~$1,100)',
  },
  'subscriptions': {
    title: 'Audit Subscriptions',
    steps: '1. Go to Transactions → filter by "Subscriptions"\n2. List every recurring charge\n3. Ask yourself: did I use this in the last 30 days?\n4. Cancel any you haven\'t used — you can always resubscribe',
  },
  'dining': {
    title: 'Cut Dining Costs',
    steps: '1. Meal prep on Sundays to reduce weekday temptation\n2. Set a $40/week dining budget\n3. Cook at home at least 4 nights this week\n4. Use your Safe-to-Spend amount before ordering out',
  },
  'invest': {
    title: 'Start Investing',
    steps: '1. Open a brokerage or Roth IRA account\n2. Start with a low-cost index fund (e.g. VTI or FXAIX)\n3. Contribute even $25/mo to start — compounding takes time\n4. Increase contributions by 1% each year',
  },
  'automate': {
    title: 'Automate Savings',
    steps: '1. Go to Transfers → Scheduled Transfers\n2. Set up a $50 weekly transfer to Growth Savings\n3. Schedule it for the day after your paycheck arrives\n4. Increase by $10 every 3 months',
  },
};

function ActionItem({ action, isLast }: { action: Action; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = PRIORITY_CONFIG[action.priority];
  const router = useRouter();

  function handleTakeAction() {
    const config = ACTION_STEPS[action.id];
    if (action.id === 'subscriptions') {
      router.push('/(tabs)/transactions');
      return;
    }
    if (config) {
      Alert.alert(config.title, config.steps, [{ text: 'Got it', style: 'default' }]);
    }
  }

  return (
    <TouchableOpacity
      onPress={() => setExpanded((v) => !v)}
      activeOpacity={0.8}
      style={[styles.actionItem, !isLast && styles.actionItemBorder]}
    >
      <View style={styles.actionRow}>
        <View style={[styles.priorityBar, { backgroundColor: cfg.color }]} />
        <Text style={styles.actionIcon}>{action.icon}</Text>
        <View style={styles.actionContent}>
          <View style={styles.actionHeader}>
            <Text style={styles.actionTitle}>{action.title}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: cfg.color + '18' }]}>
              <Text style={[styles.priorityLabel, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
          </View>
          <Text style={styles.actionImpact}>{action.impact}</Text>

          {expanded && (
            <View style={styles.expandedContent}>
              <Text style={styles.actionDescription}>{action.description}</Text>
              <TouchableOpacity style={styles.ctaBtn} onPress={handleTakeAction}>
                <Text style={styles.ctaBtnText}>Take Action →</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ActionPlanCard() {
  const actions = generateActionPlan();
  const highCount = actions.filter((a) => a.priority === 'high').length;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.cardLabel}>Your Action Plan</Text>
          <Text style={styles.cardSubtitle}>
            {highCount > 0
              ? `${highCount} urgent item${highCount > 1 ? 's' : ''} need${highCount === 1 ? 's' : ''} attention`
              : 'You\'re on the right track'}
          </Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{actions.length}</Text>
          <Text style={styles.countBadgeLabel}>steps</Text>
        </View>
      </View>

      <View style={styles.actionList}>
        {actions.map((action, i) => (
          <ActionItem
            key={action.id}
            action={action}
            isLast={i === actions.length - 1}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Tap each step to see personalized guidance based on your spending data.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: PNC_NAVY,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  countBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PNC_NAVY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadgeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 20,
  },
  countBadgeLabel: {
    color: '#A8C8E8',
    fontSize: 9,
    fontWeight: '600',
  },
  actionList: {},
  actionItem: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  actionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  priorityBar: {
    width: 3,
    borderRadius: 2,
    alignSelf: 'stretch',
    marginRight: 10,
    minHeight: 20,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 1,
  },
  actionContent: {
    flex: 1,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  priorityLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  actionImpact: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
    marginTop: 3,
  },
  expandedContent: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 10,
  },
  actionDescription: {
    fontSize: 13,
    color: '#555',
    lineHeight: 19,
  },
  ctaBtn: {
    alignSelf: 'flex-start',
    backgroundColor: PNC_NAVY,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  ctaBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  chevron: {
    fontSize: 10,
    color: '#CCC',
    marginLeft: 6,
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#F8F9FB',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  footerText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
});
