import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ConfidenceScoreCard from '../../components/ConfidenceScoreCard';
import SafeToSpendWidget from '../../components/SafeToSpendWidget';
import ActionPlanCard from '../../components/ActionPlanCard';
import ChallengesView from '../../components/ChallengesView';
import GoalsView from '../../components/GoalsView';
import { ForecastContent } from './future-forecast';

const PNC_NAVY = '#003087';

type Section = 'insights' | 'challenges' | 'forecast' | 'goals';

const SECTIONS: { id: Section; label: string; icon: string }[] = [
  { id: 'insights',   label: 'Insights',    icon: 'pulse-outline' },
  { id: 'challenges', label: 'Challenges',  icon: 'trophy-outline' },
  { id: 'forecast',   label: 'Forecast',    icon: 'trending-up-outline' },
  { id: 'goals',      label: 'Goals',       icon: 'flag-outline' },
];

export default function CompassScreen() {
  const [section, setSection] = useState<Section>('insights');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <View style={styles.navRow}>
          <Ionicons name="compass-outline" size={20} color="#A8C8E8" />
          <Text style={styles.navTitle}>PNC Compass</Text>
        </View>
        <Text style={styles.navSubtitle}>Your financial navigation center</Text>
      </View>

      {/* Segment control */}
      <View style={styles.segmentBar}>
        {SECTIONS.map((s) => {
          const active = section === s.id;
          return (
            <TouchableOpacity
              key={s.id}
              style={[styles.segment, active && styles.segmentActive]}
              onPress={() => setSection(s.id)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={s.icon as any}
                size={14}
                color={active ? '#fff' : '#666'}
              />
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Section content */}
      {section === 'insights' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.insightsScroll}
        >
          <ConfidenceScoreCard />
          <SafeToSpendWidget />
          <ActionPlanCard />
          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      {section === 'challenges' && <ChallengesView />}

      {section === 'forecast' && <ForecastContent />}

      {section === 'goals' && <GoalsView />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },
  navbar: {
    backgroundColor: PNC_NAVY,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  navSubtitle: {
    color: '#A8C8E8',
    fontSize: 12,
    marginTop: 3,
  },
  segmentBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F0F2F5',
  },
  segmentActive: {
    backgroundColor: PNC_NAVY,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },
  segmentTextActive: {
    color: '#fff',
  },
  insightsScroll: {
    padding: 16,
  },
});
