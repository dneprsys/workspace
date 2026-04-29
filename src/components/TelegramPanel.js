import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function TelegramPanel({
  styles,
  tgOpen,
  setTgOpen,
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
    <View style={[styles.card, { borderLeftColor: "#1a4a6a" }]}>
      <TouchableOpacity style={styles.cardHeader} onPress={() => setTgOpen((v) => !v)}>
        <Text style={styles.cardTitle}>📱 Telegram уведомления</Text>
        <Text style={[styles.status, { color: tgToken && tgChatId ? "#4ade80" : "#888" }]}>
          {tgToken && tgChatId ? "✅ НАСТРОЕН" : "НЕ НАСТРОЕН"}
        </Text>
      </TouchableOpacity>
      {tgOpen && (
        <View style={{ padding: 12 }}>
          <TextInput style={styles.input} value={tgToken} onChangeText={setTgToken} placeholder="Bot Token" placeholderTextColor="#666" secureTextEntry />
          <TextInput style={styles.input} value={tgChatId} onChangeText={setTgChatId} placeholder="Chat ID" placeholderTextColor="#666" />
          <View style={styles.rowInline}>
            <Text style={styles.note}>Предупреждать за</Text>
            <TextInput style={[styles.input, { width: 72, marginBottom: 0 }]} value={tgWarnMin} onChangeText={setTgWarnMin} keyboardType="numeric" />
            <Text style={styles.note}>мин</Text>
          </View>
          <View style={styles.row}>
            <TouchableOpacity style={[styles.btn, styles.btnSuccess]} onPress={testTelegram}>
              <Text style={styles.btnText}>📤 Тест</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnMuted]} onPress={backupSettings}>
              <Text style={styles.btnText}>💾 Бекап</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnAccent]} onPress={restoreSettings}>
              <Text style={styles.btnTextDark}>📥 Восстановить</Text>
            </TouchableOpacity>
          </View>
          {!!tgStatus && <Text style={[styles.note, { marginTop: 8 }]}>{tgStatus}</Text>}
        </View>
      )}
    </View>
  );
}
