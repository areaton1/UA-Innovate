import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { calculateConfidenceScore, type ScoreBreakdown } from '../data/financialEngine';

type Props = {
  aiInsight?: string;
  aiLoading?: boolean;
};

function FactorBar({ item }: { item: ScoreBreakdown }) {
  const barColor =
    item.score >= 70 ? '#2E7D32' : item.score >= 45 ? '#EF7622' : '#C62828';

  return (
    <View style={styles.factorRow}>
      <View style={styles.factorHeader}>
        <Text style={styles.factorLabel}>{item.label}</Text>
        <Text style={[styles.factorScore, { color: barColor }]}>{item.score}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${item.score}%`, backgroundColor: barColor }]} />
      </View>
      <Text style={styles.factorInsight}>{item.insight}</Text>
    </View>
  );
}

export default function ConfidenceScoreCard({ aiInsight, aiLoading }: Props = {}) {
  const [expanded, setExpanded] = useState(false);
  const result = calculateConfidenceScore();

  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.85}
        style={styles.mainRow}
      >
        <View style={[styles.scoreBadge, { borderColor: result.color }]}>
          <Text style={[styles.scoreNumber, { color: result.color }]}>{result.score}</Text>
          <Text style={[styles.scoreGrade, { color: result.color }]}>{result.grade}</Text>
        </View>

        <View style={styles.scoreInfo}>
          <Text style={styles.tierLabel}>{result.tier}</Text>
          <Text style={styles.cardLabel}>Financial Confidence Score</Text>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${result.score}%`, backgroundColor: result.color }]}
            />
          </View>
        </View>

        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color="#CCC" />
      </TouchableOpacity>

      {(aiLoading || aiInsight) && (
        <View style={styles.aiInsightBox}>
          {aiLoading ? (
            <View style={styles.aiInsightLoading}>
              <ActivityIndicator size="small" color="#414e58" style={{ marginRight: 8 }} />
              <Text style={styles.aiInsightLoadingText}>Getting AI insight…</Text>
            </View>
          ) : (
            <>
              <View style={styles.aiInsightHeader}>
                <Ionicons name="sparkles" size={12} color="#414e58" style={{ marginRight: 4 }} />
                <Text style={styles.aiInsightLabel}>AI Summary</Text>
              </View>
              <Text style={styles.aiInsightText}>{aiInsight}</Text>
            </>
          )}
        </View>
      )}

      {expanded && (
        <View style={styles.breakdown}>
          {result.breakdown.map((item) => (
            <FactorBar key={item.label} item={item} />
          ))}
        </View>
      )}
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
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
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
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 24,
  },
  scoreGrade: {
    fontSize: 11,
    fontWeight: '700',
  },
  scoreInfo: {
    flex: 1,
  },
  tierLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#222',
  },
  cardLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    marginBottom: 6,
  },
  progressTrack: {
    height: 5,
    backgroundColor: '#EFEFEF',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 5,
    borderRadius: 3,
  },
  chevron: {},
  aiInsightBox: {
    marginHorizontal: 18,
    marginBottom: 14,
    backgroundColor: '#EEF2F7',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#414e58',
  },
  aiInsightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  aiInsightLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#414e58',
    letterSpacing: 0.5,
  },
  aiInsightText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 19,
  },
  aiInsightLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiInsightLoadingText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  breakdown: {
    paddingHorizontal: 18,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 14,
    paddingTop: 14,
  },
  factorRow: {
    gap: 4,
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  factorLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
  },
  factorScore: {
    fontSize: 13,
    fontWeight: '700',
  },
  barTrack: {
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: 4,
    borderRadius: 2,
  },
  factorInsight: {
    fontSize: 11,
    color: '#888',
    marginTop: 1,
  },
});
