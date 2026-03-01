import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  INITIAL_CHALLENGES,
  LEADERBOARD,
  TIERS,
  getTier,
  getNextTier,
  type Challenge,
  type ChallengeStatus,
} from '../data/challengesData';

const PNC_NAVY = '#003087';
const PNC_ORANGE = '#EF7622';

const STATUS_CONFIG: Record<ChallengeStatus, { label: string; color: string; bg: string }> = {
  completed: { label: 'Completed',   color: '#2E7D32', bg: '#F0FBF0' },
  active:    { label: 'In Progress', color: PNC_ORANGE, bg: '#FFF8F3' },
  available: { label: 'Available',   color: '#555',    bg: '#F5F5F5' },
};

const TIER_COLORS: Record<string, string> = {
  Bronze:   '#CD7F32',
  Silver:   '#9E9E9E',
  Gold:     '#FFB300',
  Platinum: '#0069aa',
  Diamond:  '#7C4DFF',
};

// ─── Rank Card ───────────────────────────────────────────────────────────────

function RankCard({ xp }: { xp: number }) {
  const tier = getTier(xp);
  const nextTier = getNextTier(xp);
  const progress = nextTier
    ? ((xp - tier.minXP) / (nextTier.minXP - tier.minXP)) * 100
    : 100;

  return (
    <View style={[styles.rankCard, { borderTopColor: tier.color }]}>
      <View style={styles.rankTop}>
        <View>
          <Text style={styles.rankGreeting}>Your Rank</Text>
          <View style={styles.rankTierRow}>
            <Ionicons name={tier.badge as any} size={24} color={tier.color} />
            <Text style={[styles.rankTierName, { color: tier.color }]}>{tier.name}</Text>
          </View>
        </View>
        <View style={styles.rankXPBox}>
          <Text style={styles.rankXPNum}>{xp}</Text>
          <Text style={styles.rankXPLabel}>XP</Text>
        </View>
      </View>

      {nextTier && (
        <>
          <View style={styles.rankProgressRow}>
            <Text style={styles.rankProgressLabel}>
              {nextTier.minXP - xp} XP to {nextTier.name}
            </Text>
            <Text style={styles.rankProgressPct}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%`, backgroundColor: tier.color },
              ]}
            />
          </View>
        </>
      )}
    </View>
  );
}

// ─── Challenge Card ──────────────────────────────────────────────────────────

function ChallengeCard({
  challenge,
  onComplete,
  onStart,
}: {
  challenge: Challenge;
  onComplete: (id: string) => void;
  onStart: (id: string) => void;
}) {
  const cfg = STATUS_CONFIG[challenge.status];

  return (
    <View style={[styles.challengeCard, { borderLeftColor: cfg.color, borderLeftWidth: 4 }]}>
      <View style={styles.challengeTop}>
        <Ionicons name={challenge.icon as any} size={28} color="#555" style={styles.challengeIcon} />
        <View style={styles.challengeInfo}>
          <View style={styles.challengeHeaderRow}>
            <Text style={styles.challengeTitle}>{challenge.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
              <Text style={[styles.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
          </View>
          <Text style={styles.challengeDesc}>{challenge.description}</Text>

          <View style={styles.challengeMeta}>
            <View style={styles.challengeDurationRow}>
              <Ionicons name="time-outline" size={12} color="#888" />
              <Text style={styles.challengeDuration}>{challenge.duration}</Text>
            </View>
            <View style={styles.xpBadge}>
              <Text style={styles.xpBadgeText}>+{challenge.xp} XP</Text>
            </View>
          </View>
        </View>
      </View>

      {(challenge.status === 'active' || challenge.status === 'available') &&
        challenge.progress > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabelText}>{challenge.progressLabel}</Text>
              <Text style={styles.progressPct}>{challenge.progress}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${challenge.progress}%`, backgroundColor: PNC_NAVY },
                ]}
              />
            </View>
          </View>
        )}

      {challenge.status === 'active' && (
        <TouchableOpacity
          style={styles.completeBtn}
          onPress={() => onComplete(challenge.id)}
        >
          <Text style={styles.completeBtnText}>Mark Complete</Text>
        </TouchableOpacity>
      )}

      {challenge.status === 'available' && (
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => onStart(challenge.id)}
        >
          <Text style={styles.startBtnText}>Start Challenge</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Leaderboard Row ─────────────────────────────────────────────────────────

function LeaderboardRow({ entry }: { entry: (typeof LEADERBOARD)[0] }) {
  const tierColor = TIER_COLORS[entry.tierName] ?? '#888';
  const isUser = entry.isCurrentUser;
  const initial = entry.name.charAt(0).toUpperCase();
  const displayName = isUser ? entry.name : entry.name.charAt(0) + '•••••';

  return (
    <View style={[styles.lbRow, isUser && styles.lbRowHighlight]}>
      {entry.rank <= 3 ? (
        <Ionicons
          name="trophy-outline"
          size={18}
          color={['#FFB300', '#9E9E9E', '#CD7F32'][entry.rank - 1]}
          style={styles.lbRankTrophy}
        />
      ) : (
        <Text style={styles.lbRankNum}>{`#${entry.rank}`}</Text>
      )}
      <View style={[styles.lbAvatar, { backgroundColor: entry.avatarColor }]}>
        <Text style={styles.lbAvatarText}>{initial}</Text>
      </View>
      <View style={styles.lbInfo}>
        <Text style={[styles.lbName, isUser && styles.lbNameHighlight]}>
          {displayName}{isUser ? ' (You)' : ''}
        </Text>
        <Text style={[styles.lbTier, { color: tierColor }]}>{entry.tierName}</Text>
      </View>
      <Text style={[styles.lbXP, isUser && styles.lbXPHighlight]}>{entry.xp} XP</Text>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ChallengesScreen() {
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);
  const [xp, setXP] = useState(150); // starts with 50 + 100 from completed challenges

  const completed = challenges.filter((c) => c.status === 'completed');
  const active = challenges.filter((c) => c.status === 'active');
  const available = challenges.filter((c) => c.status === 'available');

  function handleComplete(id: string) {
    const challenge = challenges.find((c) => c.id === id);
    if (!challenge) return;
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: 'completed', progress: 100, progressLabel: 'Completed' }
          : c
      )
    );
    setXP((prev) => prev + challenge.xp);
  }

  function handleStart(id: string) {
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'active' } : c))
    );
  }

  // Keep leaderboard current user xp in sync
  const leaderboard = LEADERBOARD.map((e) =>
    e.isCurrentUser ? { ...e, xp } : e
  ).sort((a, b) => b.xp - a.xp).map((e, i) => ({ ...e, rank: i + 1 }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navbar}>
        <Text style={styles.navTitle}>Challenges</Text>
        <Text style={styles.navSubtitle}>Earn XP. Level up. Build confidence.</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <RankCard xp={xp} />

        {/* Active Challenges */}
        {active.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>In Progress</Text>
            {active.map((c) => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                onComplete={handleComplete}
                onStart={handleStart}
              />
            ))}
          </>
        )}

        {/* Available Challenges */}
        {available.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Available Challenges</Text>
            {available.map((c) => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                onComplete={handleComplete}
                onStart={handleStart}
              />
            ))}
          </>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Completed</Text>
              <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
            </View>
            {completed.map((c) => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                onComplete={handleComplete}
                onStart={handleStart}
              />
            ))}
          </>
        )}

        {/* Leaderboard */}
        <Text style={styles.sectionTitle}>Leaderboard</Text>
        <View style={styles.leaderboardCard}>
          {leaderboard.map((entry) => (
            <LeaderboardRow key={entry.rank} entry={entry} />
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F9' },
  navbar: {
    backgroundColor: PNC_NAVY,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  navTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  navSubtitle: {
    color: '#A8C8E8',
    fontSize: 12,
    marginTop: 2,
  },
  scroll: { padding: 16 },

  // Rank Card
  rankCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  rankTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  rankGreeting: { fontSize: 12, color: '#888', fontWeight: '600' },
  rankTierRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  rankTierBadge: {},
  rankTierName: { fontSize: 22, fontWeight: '900' },
  rankXPBox: {
    alignItems: 'center',
    backgroundColor: PNC_NAVY,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rankXPNum: { color: '#fff', fontSize: 22, fontWeight: '900', lineHeight: 24 },
  rankXPLabel: { color: '#A8C8E8', fontSize: 11, fontWeight: '600' },
  rankProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  rankProgressLabel: { fontSize: 12, color: '#666' },
  rankProgressPct: { fontSize: 12, fontWeight: '700', color: '#444' },

  // Progress bar (shared)
  progressTrack: {
    height: 6,
    backgroundColor: '#EFEFEF',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: 6, borderRadius: 3 },

  // Section
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10, marginTop: 4 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 10,
    marginTop: 4,
  },

  // Challenge Card
  challengeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  challengeTop: { flexDirection: 'row', gap: 12 },
  challengeIcon: { marginTop: 2 },
  challengeInfo: { flex: 1 },
  challengeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  challengeTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', flex: 1 },
  statusBadge: { borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  statusLabel: { fontSize: 10, fontWeight: '700' },
  challengeDesc: { fontSize: 12, color: '#666', lineHeight: 17, marginBottom: 8 },
  challengeMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  challengeDurationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  challengeDuration: { fontSize: 11, color: '#888' },
  xpBadge: {
    backgroundColor: '#FFF8E6',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  xpBadgeText: { fontSize: 11, fontWeight: '800', color: '#E65100' },

  progressSection: { marginTop: 10 },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabelText: { fontSize: 11, color: '#888' },
  progressPct: { fontSize: 11, fontWeight: '700', color: '#444' },

  completeBtn: {
    marginTop: 12,
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  completeBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  startBtn: {
    marginTop: 12,
    backgroundColor: PNC_NAVY,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  startBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Leaderboard
  leaderboardCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 10,
  },
  lbRowHighlight: { backgroundColor: '#EEF4FB' },
  lbRankTrophy: { width: 32, textAlign: 'center' },
  lbRankNum: { fontSize: 16, width: 32, textAlign: 'center', color: '#888' },
  lbAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lbAvatarText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  lbInfo: { flex: 1 },
  lbName: { fontSize: 14, fontWeight: '600', color: '#222' },
  lbNameHighlight: { fontWeight: '800', color: PNC_NAVY },
  lbTier: { fontSize: 11, fontWeight: '600', marginTop: 1 },
  lbXP: { fontSize: 14, fontWeight: '700', color: '#444' },
  lbXPHighlight: { color: PNC_NAVY, fontWeight: '900' },
});
