import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { calculateSafeToSpend } from '../data/financialEngine';

const PNC_ORANGE = '#EF7622';

export default function SafeToSpendWidget() {
  const [view, setView] = useState<'daily' | 'weekly'>('daily');
  const result = calculateSafeToSpend();

  const amount = view === 'daily' ? result.dailyAmount : result.weeklyAmount;
  const label = view === 'daily' ? 'today' : 'this week';

  const urgencyColor =
    result.dailyAmount > 80 ? '#2E7D32'
    : result.dailyAmount > 40 ? PNC_ORANGE
    : '#C62828';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.cardLabel}>Safe to Spend</Text>
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, view === 'daily' && styles.toggleBtnActive]}
            onPress={() => setView('daily')}
          >
            <Text style={[styles.toggleText, view === 'daily' && styles.toggleTextActive]}>
              Daily
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, view === 'weekly' && styles.toggleBtnActive]}
            onPress={() => setView('weekly')}
          >
            <Text style={[styles.toggleText, view === 'weekly' && styles.toggleTextActive]}>
              Weekly
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.amountRow}>
        <Text style={[styles.amount, { color: urgencyColor }]}>
          ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <Text style={styles.amountLabel}>{label}</Text>
      </View>

      <Text style={styles.reasoning}>{result.reasoning}</Text>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Text style={styles.footerValue}>{result.daysLeftInMonth}</Text>
          <Text style={styles.footerLabel}>days left</Text>
        </View>
        <View style={styles.footerDivider} />
        <View style={styles.footerItem}>
          <Text style={styles.footerValue}>
            ${result.weeklyAmount.toFixed(0)}
          </Text>
          <Text style={styles.footerLabel}>weekly budget</Text>
        </View>
        <View style={styles.footerDivider} />
        <View style={styles.footerItem}>
          <Text style={[styles.footerValue, { color: urgencyColor }]}>
            {result.dailyAmount > 80 ? 'Healthy' : result.dailyAmount > 40 ? 'Moderate' : 'Tight'}
          </Text>
          <Text style={styles.footerLabel}>status</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: PNC_ORANGE,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
  },
  toggleTextActive: {
    color: '#fff',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    marginBottom: 6,
  },
  amount: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1,
  },
  amountLabel: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
    marginBottom: 6,
  },
  reasoning: {
    fontSize: 13,
    color: '#666',
    marginBottom: 14,
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 12,
  },
  footerItem: {
    flex: 1,
    alignItems: 'center',
  },
  footerValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
  },
  footerLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  footerDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
});
