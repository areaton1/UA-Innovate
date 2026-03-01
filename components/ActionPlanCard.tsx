import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { generateActionPlan, type Action, type ActionPriority } from '@/app/data/financialEngine';
import { getAIActionAdvice } from '@/app/data/aiService';
import { GEMINI_API_KEY } from '@/constants/aiConfig';

const PNC_ORANGE = '#EF7622';

const PRIORITY_CONFIG: Record<ActionPriority, { color: string; label: string }> = {
  high:   { color: '#C62828', label: 'Do this now' },
  medium: { color: '#EF7622', label: 'This week' },
  low:    { color: '#2E7D32', label: 'When ready' },
};

function ActionItem({ action, isLast }: { action: Action; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const cfg = PRIORITY_CONFIG[action.priority];
  const router = useRouter();
  const hasAI = GEMINI_API_KEY !== 'YOUR_GEMINI_KEY_HERE';

  async function handleTakeAction() {
    if (!hasAI) {
      router.push(`/action/${action.id}`);
      return;
    }
    setAiLoading(true);
    try {
      const advice = await getAIActionAdvice(action.title, action.description);
      Alert.alert(`AI Advice: ${action.title}`, advice, [{ text: 'Got it' }]);
    } catch {
      router.push(`/action/${action.id}`);
    } finally {
      setAiLoading(false);
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
        <Ionicons name={action.icon as any} size={20} color="#555" style={styles.actionIcon} />
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
              <TouchableOpacity
                style={[styles.ctaBtn, aiLoading && { opacity: 0.7 }]}
                onPress={handleTakeAction}
                disabled={aiLoading}
              >
                {aiLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.ctaBtnText}>
                    {hasAI ? '✦ Ask AI' : 'Take Action →'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color="#CCC" style={styles.chevron} />
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
    color: '#222',
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
    backgroundColor: PNC_ORANGE,
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
    color: 'rgba(255,255,255,0.7)',
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
    backgroundColor: PNC_ORANGE,
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
