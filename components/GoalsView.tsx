import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGoals } from '../context/GoalsContext';
import {
  getGoalTimeline,
  getGoalSuggestions,
  DEFAULT_GOAL_ICONS,
  type SavingsGoal,
  type GoalSuggestion,
} from '../data/goalsData';
import { getFinancialContextForGoals } from '../data/financialEngine';

const PNC_NAVY = '#003087';
const PNC_ORANGE = '#EF7622';
const LIGHT_BG = '#F4F6F9';

function formatCurrency(amount: number) {
  return '$' + Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Goal Card ───────────────────────────────────────────────────────────────

function GoalCard({
  goal,
  timeline,
  suggestions,
  onUpdateCurrent,
  onDelete,
}: {
  goal: SavingsGoal;
  timeline: ReturnType<typeof getGoalTimeline>;
  suggestions: GoalSuggestion[];
  onUpdateCurrent: (id: string, currentAmount: number) => void;
  onDelete: (id: string) => void;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const progress = Math.min(100, timeline.progressPercent);
  const iconName = (goal.icon || DEFAULT_GOAL_ICONS.general) as any;

  return (
    <View style={styles.goalCard}>
      <View style={styles.goalHeader}>
        <View style={styles.goalTitleRow}>
          <Ionicons name={iconName} size={22} color={PNC_NAVY} style={styles.goalIcon} />
          <Text style={styles.goalName}>{goal.name}</Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            Alert.alert('Delete goal', `Remove "${goal.name}"?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => onDelete(goal.id) },
            ])
          }
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={18} color="#888" />
        </TouchableOpacity>
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.currentLabel}>Saved</Text>
        <Text style={styles.amountText}>
          {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
        </Text>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress}%`, backgroundColor: progress >= 100 ? '#2E7D32' : PNC_ORANGE },
          ]}
        />
      </View>
      <Text style={styles.progressPct}>{progress.toFixed(0)}%</Text>

      {goal.targetDate && timeline.daysRemaining != null && (
        <View style={styles.timelineBox}>
          <Ionicons name="calendar-outline" size={14} color={PNC_NAVY} />
          <Text style={styles.timelineText}>
            Target: {formatDate(goal.targetDate)} · {timeline.daysRemaining} days left
          </Text>
        </View>
      )}
      {timeline.monthlyRequired != null && timeline.monthlyRequired > 0 && (
        <View style={styles.timelineBox}>
          <Ionicons name="trending-up-outline" size={14} color={PNC_NAVY} />
          <Text style={styles.timelineText}>
            Save {formatCurrency(timeline.monthlyRequired)}/mo to stay on track
          </Text>
        </View>
      )}

      {!timeline.onTrack && goal.targetDate && (
        <View style={styles.alertBox}>
          <Ionicons name="warning-outline" size={14} color={PNC_ORANGE} />
          <Text style={styles.alertText}>Increase monthly savings or move your target date</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.suggestionsToggle}
        onPress={() => setShowSuggestions((v) => !v)}
        activeOpacity={0.7}
      >
        <Text style={styles.suggestionsToggleText}>
          {showSuggestions ? 'Hide' : 'Show'} suggestions to reach this goal
        </Text>
        <Ionicons
          name={showSuggestions ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={PNC_NAVY}
        />
      </TouchableOpacity>

      {showSuggestions && (
        <View style={styles.suggestionsList}>
          {suggestions.map((s) => (
            <View key={s.id} style={styles.suggestionRow}>
              <Ionicons name={s.icon as any} size={16} color="#555" style={styles.suggestionIcon} />
              <View style={styles.suggestionContent}>
                <Text style={styles.suggestionTitle}>{s.title}</Text>
                <Text style={styles.suggestionDesc}>{s.description}</Text>
                <Text style={styles.suggestionImpact}>{s.impact}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Add Goal Modal ──────────────────────────────────────────────────────────

function AddGoalModal({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
}) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('');

  function handleAdd() {
    const target = parseFloat(targetAmount);
    const current = parseFloat(currentAmount) || 0;
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter a goal name.');
      return;
    }
    if (isNaN(target) || target <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid target amount.');
      return;
    }
    if (current < 0 || current > target) {
      Alert.alert('Invalid amount', 'Current amount must be between 0 and the target.');
      return;
    }
    const date = targetDate.trim() || null;
    if (date) {
      const d = new Date(date + 'T00:00:00');
      if (isNaN(d.getTime())) {
        Alert.alert('Invalid date', 'Use format YYYY-MM-DD (e.g. 2026-12-31).');
        return;
      }
    }
    onAdd({
      name: name.trim(),
      targetAmount: target,
      currentAmount: current,
      targetDate: date || null,
      icon: DEFAULT_GOAL_ICONS.general,
    });
    setName('');
    setTargetAmount('');
    setCurrentAmount('0');
    setTargetDate('');
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New savings goal</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>Goal name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Europe trip, Emergency fund"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <Text style={styles.inputLabel}>Target amount ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="5000"
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
            value={targetAmount}
            onChangeText={setTargetAmount}
          />

          <Text style={styles.inputLabel}>Current amount saved ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
            value={currentAmount}
            onChangeText={setCurrentAmount}
          />

          <Text style={styles.inputLabel}>Target date (optional) — YYYY-MM-DD</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 2026-12-31"
            placeholderTextColor="#999"
            value={targetDate}
            onChangeText={setTargetDate}
          />
          <Text style={styles.inputHint}>Add a date for trips or deadlines to get a timeline and monthly target.</Text>

          <TouchableOpacity style={styles.addButton} onPress={handleAdd} activeOpacity={0.8}>
            <Text style={styles.addButtonText}>Add goal</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export default function GoalsView() {
  const { goals, addGoal, updateGoal, deleteGoal } = useGoals();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const financialContext = getFinancialContextForGoals();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Your savings goals</Text>
        <TouchableOpacity
          style={styles.addGoalButton}
          onPress={() => setAddModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addGoalButtonText}>Add goal</Text>
        </TouchableOpacity>
      </View>

      {goals.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="flag-outline" size={48} color="#bbb" />
          <Text style={styles.emptyTitle}>No goals yet</Text>
          <Text style={styles.emptySubtitle}>
            Add a savings goal (e.g. a trip or emergency fund) and we’ll suggest how much to save each month and how to get there.
          </Text>
          <TouchableOpacity
            style={styles.emptyCta}
            onPress={() => setAddModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.emptyCtaText}>Add your first goal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        goals.map((goal) => {
          const timeline = getGoalTimeline(goal, {
            monthlyIncome: financialContext.monthlyIncome,
            monthlySavingsCapacity: Math.max(0, financialContext.monthlyIncome - financialContext.monthlySpending),
          });
          const suggestions = getGoalSuggestions(goal, timeline, {
            monthlyIncome: financialContext.monthlyIncome,
            monthlySpending: financialContext.monthlySpending,
            diningSpending: financialContext.diningSpending,
            subscriptionSpending: financialContext.subscriptionSpending,
          });
          return (
            <GoalCard
              key={goal.id}
              goal={goal}
              timeline={timeline}
              suggestions={suggestions}
              onUpdateCurrent={(id, amount) => updateGoal(id, { currentAmount: amount })}
              onDelete={deleteGoal}
            />
          );
        })
      )}

      <AddGoalModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAdd={addGoal}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LIGHT_BG },
  scrollContent: { padding: 16, paddingBottom: 32 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#222' },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: PNC_NAVY,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addGoalButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#444', marginTop: 12 },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  emptyCta: {
    marginTop: 24,
    backgroundColor: PNC_ORANGE,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyCtaText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  goalTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  goalIcon: { marginRight: 8 },
  goalName: { fontSize: 16, fontWeight: '700', color: '#222', flex: 1 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
  currentLabel: { fontSize: 12, color: '#888' },
  amountText: { fontSize: 15, fontWeight: '700', color: PNC_NAVY },
  progressTrack: {
    height: 8,
    backgroundColor: '#E8ECF0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: { height: '100%', borderRadius: 4 },
  progressPct: { fontSize: 11, color: '#888', marginBottom: 8 },
  timelineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  timelineText: { fontSize: 12, color: '#555' },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF8F0',
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  alertText: { fontSize: 12, color: '#B45309', flex: 1 },
  suggestionsToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  suggestionsToggleText: { fontSize: 13, fontWeight: '600', color: PNC_NAVY },
  suggestionsList: { marginTop: 8 },
  suggestionRow: { flexDirection: 'row', marginBottom: 10 },
  suggestionIcon: { marginRight: 8, marginTop: 2 },
  suggestionContent: { flex: 1 },
  suggestionTitle: { fontSize: 13, fontWeight: '700', color: '#333' },
  suggestionDesc: { fontSize: 12, color: '#666', marginTop: 2 },
  suggestionImpact: { fontSize: 11, color: PNC_ORANGE, marginTop: 2, fontWeight: '600' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#222' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  inputHint: { fontSize: 11, color: '#888', marginTop: -10, marginBottom: 16 },
  addButton: {
    backgroundColor: PNC_NAVY,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
