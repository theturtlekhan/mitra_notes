import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';


// ---------- کارهای پیش‌فرض که همیشه باید توی لیست روزانه باشند ----------
const DEFAULT_TASKS = [
  { id: 'water', text: 'نوشیدن ۸ لیوان آب 💧', done: false, isDefault: true },
  { id: 'armin', text: 'صحبت کردن با آرمین 💬', done: false, isDefault: true },
];

const STORAGE_KEY_TODAY = 'MITRA_TODAY_TASKS';
const STORAGE_KEY_HISTORY = 'MITRA_HISTORY';

function getTodayLabel() {
  const d = new Date();
  const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
  const dayName = days[d.getDay()];
  return `${dayName} - ${d.toLocaleDateString('en-GB')}`;
}

export default function App() {

const [fontsLoaded] = useFonts({
  vazir: require('./assets/fonts/vazir.ttf'),
  shams: require('./assets/fonts/Shams.ttf'),
});


  const [showWelcome, setShowWelcome] = useState(true);
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'history'
  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [newTaskText, setNewTaskText] = useState('');
  const [history, setHistory] = useState([]);
  const [endDayModalVisible, setEndDayModalVisible] = useState(false);
  const [dayNote, setDayNote] = useState('');
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // بارگذاری اطلاعات ذخیره‌شده هنگام باز شدن برنامه
  useEffect(() => {
    (async () => {
      try {
        const savedTasks = await AsyncStorage.getItem(STORAGE_KEY_TODAY);
        const savedHistory = await AsyncStorage.getItem(STORAGE_KEY_HISTORY);
        if (savedTasks) setTasks(JSON.parse(savedTasks));
        if (savedHistory) setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.log('خطا در بارگذاری اطلاعات:', e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // ذخیره‌ی خودکار کارهای امروز
  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(STORAGE_KEY_TODAY, JSON.stringify(tasks));
    }
  }, [tasks, loaded]);

  // ذخیره‌ی خودکار تاریخچه
  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    }
  }, [history, loaded]);

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const addTask = () => {
    const text = newTaskText.trim();
    if (!text) return;
    const newTask = {
      id: `task_${Date.now()}`,
      text,
      done: false,
      isDefault: false,
    };
    setTasks((prev) => [...prev, newTask]);
    setNewTaskText('');
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const openEndDayModal = () => {
    setDayNote('');
    setEndDayModalVisible(true);
  };

  const confirmEndDay = () => {
    const doneCount = tasks.filter((t) => t.done).length;
    const dayRecord = {
      id: `day_${Date.now()}`,
      label: getTodayLabel(),
      note: dayNote.trim(),
      tasks: tasks,
      total: tasks.length,
      done: doneCount,
    };
    setHistory((prev) => [dayRecord, ...prev]);
    setTasks(DEFAULT_TASKS.map((t) => ({ ...t }))); // شروع یک روز جدید با کارهای پیش‌فرض
    setEndDayModalVisible(false);
    setActiveTab('today');
  };

  const askEndDay = () => {
    Alert.alert(
      'پایان روز',
      'مطمئنی می‌خوای روز رو تموم کنی؟ کارهای امروز ذخیره میشن و یک روز جدید شروع میشه.',
      [
        { text: 'انصراف', style: 'cancel' },
        { text: 'بله، تمومش کن', onPress: openEndDayModal },
      ]
    );
  };

  // ---------- صفحه‌ی خوش‌آمدگویی ----------
  if (showWelcome) {
    return (
      <SafeAreaView style={styles.welcomeContainer}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.welcomeEmoji}>🌸</Text>
        <Text style={styles.welcomeTitle}>خوش اومدی میترا جان</Text>
        <Text style={styles.welcomeSubtitle}>
          بریم یه روز خوب دیگه رو با هم بسازیم ✨
        </Text>
        <TouchableOpacity
          style={styles.welcomeButton}
          onPress={() => setShowWelcome(false)}
        >
          <Text style={styles.welcomeButtonText}>شروع کن</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* هدر */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>یادداشت‌های میترا </Text>
      </View>

      {/* تب‌ها */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'today' && styles.tabButtonActive]}
          onPress={() => setActiveTab('today')}
        >
          <Text
            style={[styles.tabButtonText, activeTab === 'today' && styles.tabButtonTextActive]}
          >
            امروز
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text
            style={[styles.tabButtonText, activeTab === 'history' && styles.tabButtonTextActive]}
          >
            تاریخچه روزها
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'today' ? (
        <View style={styles.flex1}>
          <Text style={styles.dateLabel}>{getTodayLabel()}</Text>

          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.taskList}
            renderItem={({ item }) => (
              <View style={styles.taskRow}>
                <TouchableOpacity
                  style={styles.taskTextTouchable}
                  onPress={() => toggleTask(item.id)}
                >
                  <View style={[styles.checkbox, item.done && styles.checkboxDone]}>
                    {item.done && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text
                    style={[styles.taskText, item.done && styles.taskTextDone]}
                  >
                    {item.text}
                  </Text>
                </TouchableOpacity>
                {!item.isDefault && (
                  <TouchableOpacity onPress={() => deleteTask(item.id)}>
                    <Text style={styles.deleteIcon}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          />

          {/* افزودن کار جدید */}
          <View style={styles.addTaskRow}>
            <TextInput
              style={styles.input}
              placeholder="کار جدید بنویس..."
              placeholderTextColor="#c98aa8"
              value={newTaskText}
              onChangeText={setNewTaskText}
              onSubmitEditing={addTask}
            />
            <TouchableOpacity style={styles.addButton} onPress={addTask}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* دکمه پایان روز */}
          <TouchableOpacity style={styles.endDayButton} onPress={askEndDay}>
            <Text style={styles.endDayButtonText}>پایان روز 🌙</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.historyList}>
          {history.length === 0 ? (
            <Text style={styles.emptyHistory}>
              هنوز هیچ روزی ثبت نشده. وقتی روزت تموم شد، از تب «کارهای امروز» دکمه پایان روز رو بزن 🌸
            </Text>
          ) : (
            history.map((day) => (
              <TouchableOpacity
                key={day.id}
                style={styles.historyCard}
                onPress={() =>
                  setExpandedHistoryId(expandedHistoryId === day.id ? null : day.id)
                }
              >
                <View style={styles.historyCardHeader}>
                  <Text style={styles.historyCardDate}>{day.label}</Text>
                  <Text style={styles.historyCardProgress}>
                    {day.done}/{day.total} ✓
                  </Text>
                </View>

                {day.note ? (
                  <Text style={styles.historyCardNote}>«{day.note}»</Text>
                ) : null}

                {expandedHistoryId === day.id && (
                  <View style={styles.historyTaskList}>
                    {day.tasks.map((t) => (
                      <Text
                        key={t.id}
                        style={[
                          styles.historyTaskItem,
                          t.done && styles.historyTaskItemDone,
                        ]}
                      >
                        {t.done ? '✓' : '○'} {t.text}
                      </Text>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* مودال پایان روز - نوشتن توضیح درباره روز */}
      <Modal visible={endDayModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>این روز رو چطور توصیف می‌کنی؟</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="مثلا: روز خوب و پرانرژی‌ای بود..."
              placeholderTextColor="#c98aa8"
              value={dayNote}
              onChangeText={setDayNote}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setEndDayModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>انصراف</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmButton} onPress={confirmEndDay}>
                <Text style={styles.modalConfirmText}>ثبت و پایان روز</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const PINK_BG = '#FFF0F6';
const PINK_LIGHT = '#FFD6E8';
const PINK_MAIN = '#FF6FA5';
const PINK_DARK = '#8E2A57';
const WHITE = '#FFFFFF';

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: PINK_BG,
  },
  // --- خوش‌آمدگویی ---
  welcomeContainer: {
    flex: 1,
    backgroundColor: PINK_BG,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  welcomeEmoji: { fontSize: 60, marginBottom: 12 },
  welcomeTitle: {
    fontSize: 28,
    fontFamily:"vazir",
    color: PINK_DARK,
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#B15883',
    marginBottom: 40,
    textAlign: 'center',
  },
  welcomeButton: {
    backgroundColor: PINK_MAIN,
    paddingVertical: 14,
    paddingHorizontal: 42,
    borderRadius: 30,
  },
  welcomeButtonText: {
    color: WHITE,
    fontSize: 18,
    fontFamily:"vazir",
  },
  // --- هدر ---
  header: {
    paddingTop: 30,
    paddingBottom: 12,
    alignItems: 'center',
    backgroundColor: PINK_MAIN,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily:"vazir",
    color: WHITE,
  },
  // --- تب‌ها ---
  tabBar: {
    flexDirection: 'row',
    margin: 14,
    backgroundColor: PINK_LIGHT,
    borderRadius: 20,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: PINK_MAIN,
  },
  tabButtonText: {
    color: PINK_DARK,
    fontWeight: '600',
    fontFamily:"vazir",
  },
  tabButtonTextActive: {
    color: WHITE,
  },
  // --- امروز ---
  dateLabel: {
    textAlign: 'center',
    color: '#B15883',
    marginBottom: 15,
    fontFamily:"vazir",
    fontSize: 14,
  },
  taskList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  taskTextTouchable: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: PINK_MAIN,
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: PINK_MAIN,
  },
  checkmark: {
    color: WHITE,
    fontFamily:"vazir",
  },
  taskText: {
    fontFamily:"vazir",
    fontSize: 13,
    color: '#4A2338',
    flexShrink: 1,
    textAlign: 'right',
  },
  taskTextDone: {
    textDecorationLine: 'line-through',
    color: '#B7899E',
  },
  deleteIcon: {
    color: '#D98CA8',
    fontSize: 16,
    paddingHorizontal: 6,
  },
  addTaskRow: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    textAlign: 'right',
    color: '#4A2338',
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: PINK_MAIN,
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontFamily:"vazir",
    color: WHITE,
    fontSize: 22,
  },
 endDayButton: {
  backgroundColor: PINK_DARK,
  marginHorizontal: 16,
  marginTop: 8,
  marginBottom: 55, // دکمه را بالاتر می‌آورد
  paddingVertical: 14,
  borderRadius: 18,
  alignItems: 'center',
},
  endDayButtonText: {
    color: WHITE,
    fontSize: 16,
    fontFamily:"vazir",
  },
  // --- تاریخچه ---
  historyList: {
    padding: 16,
  },
  emptyHistory: {
    textAlign: 'center',
    color: '#B7899E',
    marginTop: 40,
    fontSize: 14,
    lineHeight: 22,
  },
  historyCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyCardDate: {
    color: PINK_DARK,
    fontWeight: 'bold',
    fontSize: 15,
  },
  historyCardProgress: {
    color: PINK_MAIN,
    fontWeight: '600',
  },
  historyCardNote: {
    marginTop: 8,
    color: '#7A4A62',
    fontStyle: 'italic',
    textAlign: 'right',
  },
  historyTaskList: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: PINK_LIGHT,
    paddingTop: 8,
  },
  historyTaskItem: {
    color: '#4A2338',
    textAlign: 'right',
    marginBottom: 4,
  },
  historyTaskItemDone: {
    color: '#B7899E',
    textDecorationLine: 'line-through',
  },
  // --- مودال پایان روز ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: PINK_DARK,
    marginBottom: 12,
    textAlign: 'right',
  },
  modalInput: {
    backgroundColor: PINK_BG,
    borderRadius: 14,
    padding: 12,
    minHeight: 90,
    textAlign: 'right',
    textAlignVertical: 'top',
    color: '#4A2338',
    marginBottom: 16,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: PINK_LIGHT,
    alignItems: 'center',
  },
  modalCancelText: {
    color: PINK_DARK,
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: PINK_MAIN,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: WHITE,
    fontWeight: 'bold',
  },
});
