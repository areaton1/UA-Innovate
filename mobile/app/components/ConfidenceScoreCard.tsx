import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { calculateConfidenceScore } from '../data/financialEngine';

const PNC_NAVY = '#003087';
const PNC_ORANGE = '#EF7622';

export default function ConfidenceScoreCard() {
  const [expanded, setExpanded] = useState(false);
  const result = calculateConfidenceScore();

  return (
    <View style={styles.card}>
      {/* Header row */}
      <View style={styles.header}>
        <View>
          <Text style={styles.cardLabel}>Financial Confidence Score</Text>
          <Text style={[styles.tier, { color: result.color }]}>{result.tier}</Text>
        </View>
        <View style={[styles.scoreBadge, { borderColor: result.color }]}>
          <Text style={[styles.scoreNumber, { color: result.color }]}>{result.score}</Text>
          <Text style={[styles.scoreGrade, { color: result.color }]}>{result.grade}</Text>
        </View>
      </View>

      {/* Score bar */}
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            { width: `${result.score}%` as any, backgroundColor: result.color },
          ]}
        />
      </View>
      <View style={styles.barLabels}>
        <Text style={styles.barLabelText}>0</Text>
        <Text style={styles.barLabelText}>100</Text>
      </View>

      {/* Expand/collapse breakdown */}
      <TouchableOpacity
        style={styles.expandBtn}
        onPress={() => setExpanded((v) => !v)}
      >
        <Text style={styles.expandBtnText}>
          {expanded ? 'Hide Breakdown ▲' : 'See Breakdown ▼'}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.breakdown}>
          {result.breakdown.map((factor) => (
            <View key={factor.label} style={styles.factorRow}>
              <View style={styles.factorTop}>
                <Text style={styles.factorLabel}>{factor.label}</Text>
                <Text style={[styles.factorScore, { color: scoreColor(factor.score) }]}>
                  {factor.score}/100
                </Text>
              </View>
              <View style={styles.factorBarBg}>
                <View
                  style={[
                    styles.factorBarFill,
                    {
                      width: `${factor.score}%` as any,
                      backgroundColor: scoreColor(factor.score),
                    },
                  ]}
                />
              </View>
              <Text style={styles.factorInsight}>{factor.insight}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function scoreColor(score: number): string {
  if (score >= 75) return '#2E7D32';
  if (score >= 50) return '#EF7622';
  return '#C62828';
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
    marginBottom: 14,
  },
  cardLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    marginBottom: 2,
  },
  tier: {
    fontSize: 18,
    fontWeight: '800',
  },
  scoreBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 22,
  },
  scoreGrade: {
    fontSize: 13,
    fontWeight: '700',
  },
  barBackground: {
    height: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: 10,
    borderRadius: 5,
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  barLabelText: {
    fontSize: 10,
    color: '#AAA',
  },
  expandBtn: {
    marginTop: 12,
    alignSelf: 'center',
  },
  expandBtnText: {
    color: PNC_NAVY,
    fontSize: 13,
    fontWeight: '600',
  },
  breakdown: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    gap: 14,
  },
  factorRow: { gap: 4 },
  factorTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  factorLabel: { fontSize: 13, fontWeight: '600', color: '#333' },
  factorScore: { fontSize: 13, fontWeight: '700' },
  factorBarBg: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  factorBarFill: {
    height: 6,
    borderRadius: 3,
  },
  factorInsight: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
});
