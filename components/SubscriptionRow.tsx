import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import type { Subscription } from '@/app/data/mockData';

const CATEGORY_COLORS: Record<string, string> = {
  Streaming: '#0069aa',
  Music:     '#f58025',
  Software:  '#414e58',
  Gaming:    '#2e7d32',
  Fitness:   '#7b1fa2',
  News:      '#795548',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

type Props = {
  subscription: Subscription;
};

export default function SubscriptionRow({ subscription }: Props) {
  const categoryColor = CATEGORY_COLORS[subscription.subCategory] ?? colors.textMuted;

  return (
    <View style={styles.row}>
      <View style={[styles.iconCircle, { backgroundColor: categoryColor + '18' }]}>
        <Ionicons name={subscription.icon as any} size={20} color={categoryColor} />
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{subscription.name}</Text>
        <View style={styles.meta}>
          <View style={[styles.badge, { backgroundColor: categoryColor + '22' }]}>
            <Text style={[styles.badgeText, { color: categoryColor }]}>{subscription.subCategory}</Text>
          </View>
          <Text style={styles.nextDate}>Next: {formatDate(subscription.nextBillingDate)}</Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.amount}>-${subscription.amount.toFixed(2)}</Text>
        <Text style={styles.cycle}>{subscription.billingCycle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {},
  info: { flex: 1 },
  name: { fontWeight: '600', color: colors.text, fontSize: 14, marginBottom: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: { fontSize: 10, fontWeight: '700' },
  nextDate: { color: colors.textMuted, fontSize: 11 },
  right: { alignItems: 'flex-end' },
  amount: { fontWeight: '700', color: '#c62828', fontSize: 15 },
  cycle: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
});
