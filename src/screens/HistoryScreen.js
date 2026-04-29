import React, { useMemo, useState } from "react";
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { fmtDur } from "../utils/machine";
import { COLORS, styles } from "../theme";

/**
 * Экран истории — полный список завершённых заданий с фильтрацией.
 */
export default function HistoryScreen({ history, exportCsv, exportJson, clearHistory }) {
  const [search, setSearch] = useState("");
  const [filterMachine, setFilterMachine] = useState("");

  // Уникальные ID станков в истории
  const machineIds = useMemo(
    () => [...new Set(history.map((h) => h.machineId))].sort((a, b) => a - b),
    [history]
  );

  // Фильтрация
  const filtered = useMemo(() => {
    let items = history;
    if (filterMachine) {
      items = items.filter((h) => String(h.machineId) === filterMachine);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (h) =>
          String(h.machineId).includes(q) ||
          (h.startedAt && h.startedAt.toLowerCase().includes(q)) ||
          (h.finishedAt && h.finishedAt.toLowerCase().includes(q))
      );
    }
    return items;
  }, [history, search, filterMachine]);

  // Сводка по отфильтрованным
  const totalSec = useMemo(
    () => filtered.reduce((s, h) => s + (h.durationSec || 0), 0),
    [filtered]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.root}>
        <View style={styles.centerWrap}>
          <Text style={styles.h1}>🧾 История завершений</Text>
          <Text style={styles.sub}>
            Всего: {history.length} записей · Показано: {filtered.length}
          </Text>

          {/* Поиск */}
          <TextInput
            style={[styles.input, { marginBottom: 8 }]}
            value={search}
            onChangeText={setSearch}
            placeholder="🔍 Поиск по номеру или дате..."
            placeholderTextColor="#666"
          />

          {/* Фильтр по станку */}
          <View style={[styles.presetRow, { marginBottom: 12 }]}>  
            <TouchableOpacity
              style={[styles.presetBtn, !filterMachine && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
              onPress={() => setFilterMachine("")}
            >
              <Text style={[styles.presetText, !filterMachine && { color: "#111" }]}>Все</Text>
            </TouchableOpacity>
            {machineIds.map((id) => (
              <TouchableOpacity
                key={id}
                style={[
                  styles.presetBtn,
                  filterMachine === String(id) && { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
                ]}
                onPress={() => setFilterMachine(filterMachine === String(id) ? "" : String(id))}
              >
                <Text style={[styles.presetText, filterMachine === String(id) && { color: "#111" }]}>
                  №{id}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Сводка */}
          {filtered.length > 0 && (
            <View style={[styles.banner, { marginBottom: 12 }]}>
              <Text style={styles.bannerText}>
                📊 Общее время: {fmtDur(totalSec)} · Среднее: {fmtDur(Math.round(totalSec / filtered.length))}
              </Text>
            </View>
          )}

          {/* Кнопки экспорта */}
          <View style={[styles.row, { marginBottom: 12 }]}>
            <TouchableOpacity style={[styles.btn, styles.btnMuted]} onPress={exportCsv}>
              <Text style={styles.btnText}>📄 CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnAccent]} onPress={exportJson}>
              <Text style={styles.btnTextDark}>📋 JSON</Text>
            </TouchableOpacity>
            {clearHistory && (
              <TouchableOpacity style={[styles.btn, { backgroundColor: "#3a1a1a" }]} onPress={clearHistory}>
                <Text style={{ color: COLORS.danger, fontWeight: "700", fontSize: 14 }}>🗑 Очистить</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Список */}
          <View style={[styles.card, { borderLeftColor: COLORS.primary }]}>
            <View style={{ padding: 12 }}>
              {!filtered.length && (
                <Text style={styles.note}>Ничего не найдено.</Text>
              )}
              {filtered.map((h) => (
                <View key={h.id} style={styles.historyItem}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={[styles.note, { fontWeight: "700" }]}>
                      ⚙️ Станок №{h.machineId}
                    </Text>
                    <Text style={[styles.small, { color: COLORS.primary }]}>
                      {fmtDur(h.durationSec || 0)}
                    </Text>
                  </View>
                  <Text style={styles.small}>
                    {h.startedAt ? new Date(h.startedAt).toLocaleString("ru-RU") : "—"} →{" "}
                    {h.finishedAt ? new Date(h.finishedAt).toLocaleString("ru-RU") : "—"}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
