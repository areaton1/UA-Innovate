import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

type Props = {
  label: string;
  amount: number;
  maxAmount: number;
  color: string;
  percentage: number;
};

export default function SpendingBar({ label, amount, maxAmount, color, percentage }: Props) {
  const fillWidth = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.rightMeta}>
          <Text style={styles.pct}>{Math.round(percentage)}%</Text>
          <Text style={styles.amount}>${amount.toFixed(2)}</Text>
        </View>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${fillWidth}%` as any, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: { fontWeight: '600', color: colors.text, fontSize: 13 },
  rightMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pct: { color: colors.textMuted, fontSize: 12 },
  amount: { fontWeight: '700', color: colors.text, fontSize: 13, minWidth: 52, textAlign: 'right' },
  track: {
    height: 8,
    backgroundColor: colors.offWhite,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
