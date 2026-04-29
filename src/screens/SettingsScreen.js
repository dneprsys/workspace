import React from "react";
import { Alert, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { COLORS, styles } from "../theme";

/**
 * Экран настроек — Telegram, бекап, информация.
 */
export default function SettingsScreen({
  tgToken,
  setTgToken,
  tgChatId,
  setTgChatId,
  tgWarnMin,
  setTgWarnMin,
  tgStatus,
  testTelegram,
  backupSettings,
  restoreSettings,
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.root}>
        <View style={styles.centerWrap}>
          <Text style={styles.h1}>⚡ Настройки</Text>
          <Text style={styles.sub}>Telegram · Бекап · Информация</Text>

          {/* Telegram */}
          <View style={[styles.card, { borderLeftColor: "#1a4a6a" }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>📱 Telegram уведомления</Text>
              <Text style={[styles.status, { color: tgToken && tgChatId ? "#4ade80" : "#888" }]}>
                {tgToken && tgChatId ? "✅ НАСТРОЕН" : "НЕ НАСТРОЕН"}
              </Text>
            </View>
            <View style={{ padding: 12 }}>
              <Text style={[styles.small, { marginBottom: 6 }]}>Bot Token</Text>
              <TextInput
                style={styles.input}
                value={tgToken}
                onChangeText={setTgToken}
                placeholder="Вставьте токен от @BotFather"
                placeholderTextColor="#666"
                secureTextEntry
              />
              <Text style={[styles.small, { marginBottom: 6 }]}>Chat ID</Text>
              <TextInput
                style={styles.input}
                value={tgChatId}
                onChangeText={setTgChatId}
                placeholder="ID чата или пользователя"
                placeholderTextColor="#666"
              />
              <View style={styles.rowInline}>
                <Text style={styles.note}>Предупреждать за</Text>
                <TextInput
                  style={[styles.input, { width: 72, marginBottom: 0 }]}
                  value={tgWarnMin}
                  onChangeText={setTgWarnMin}
                  keyboardType="numeric"
                />
                <Text style={styles.note}>мин</Text>
              </View>
              <TouchableOpacity style={[styles.btn, styles.btnSuccess, { marginTop: 10 }]} onPress={testTelegram}>
                <Text style={styles.btnText}>📤 Тест отправки</Text>
              </TouchableOpacity>
              {!!tgStatus && <Text style={[styles.note, { marginTop: 8 }]}>{tgStatus}</Text>}
            </View>
          </View>

          {/* Инструкция */}
          <View style={[styles.card, { borderLeftColor: COLORS.accent }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>💡 Как настроить Telegram</Text>
            </View>
            <View style={{ padding: 12 }}>
              <Text style={styles.note}>1. Откройте @BotFather в Telegram</Text>
              <Text style={styles.note}>2. Отправьте /newbot и создайте бота</Text>
              <Text style={styles.note}>3. Скопируйте Token сюда</Text>
              <Text style={styles.note}>4. Напишите боту /start</Text>
              <Text style={styles.note}>5. Откройте @userinfobot — он выдаст Chat ID</Text>
              <Text style={styles.note}>6. Вставьте Chat ID и нажмите «Тест»</Text>
            </View>
          </View>

          {/* Бекап */}
          <View style={[styles.card, { borderLeftColor: COLORS.success }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>💾 Резервное копирование</Text>
            </View>
            <View style={{ padding: 12 }}>
              <Text style={[styles.note, { marginBottom: 10 }]}>
                Сохраните все настройки, станки и историю локально.
              </Text>
              <View style={styles.row}>
                <TouchableOpacity style={[styles.btn, styles.btnSuccess]} onPress={backupSettings}>
                  <Text style={styles.btnText}>💾 Сохранить</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnAccent]} onPress={restoreSettings}>
                  <Text style={styles.btnTextDark}>📥 Восстановить</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* О приложении */}
          <View style={[styles.card, { borderLeftColor: "#444" }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>ℹ️ О приложении</Text>
            </View>
            <View style={{ padding: 12 }}>
              <Text style={styles.note}>CNC Мониторинг Pro v1.1.0</Text>
              <Text style={styles.small}>React Native · Expo · AsyncStorage</Text>
              <Text style={[styles.small, { marginTop: 6 }]}>
                Мониторинг CNC-станков, расчёт смен, заготовок, уведомления через Telegram.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
