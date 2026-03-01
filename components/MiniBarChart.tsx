import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

type BarData = {
  label: string;
  value: number;
};

type Props = {
  data: BarData[];
  color?: string;
  highlightLast?: boolean;
};

export default function MiniBarChart({ data, color = colors.primary, highlightLast = true }: Props) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={styles.container}>
      <View style={styles.bars}>
        {data.map((item, i) => {
          const isLast = i === data.length - 1;
          const barColor = highlightLast && isLast ? color : color + '66';
          const heightPct = (item.value / max) * 100;

          return (
            <View key={item.label} style={styles.barCol}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${heightPct}%` as any,
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, isLast && styles.barLabelActive]}>{item.label}</Text>
              {isLast && (
                <Text style={styles.barValue}>${item.value.toFixed(0)}</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 90,
    gap: 6,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  barLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  barValue: {
    fontSize: 9,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 1,
  },
});
