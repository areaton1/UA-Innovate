import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import AIChatView from './AIChatView';

export default function AIFloatingButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setOpen(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="sparkles" size={22} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <Ionicons name="sparkles" size={14} color="#fff" />
              </View>
              <View>
                <Text style={styles.headerTitle}>AI Financial Assistant</Text>
                <Text style={styles.headerSubtitle}>Powered by Gemini</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setOpen(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <AIChatView />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 84,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.navBg,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '88%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.navBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#888',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
