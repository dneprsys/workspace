import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { COLORS, styles } from "../theme";
import { loadTemplates, saveTemplates, createTemplate } from "../services/templates";
import { fmtDur, n } from "../utils/machine";

/**
 * Экран шаблонов — сохранение и применение частых настроек.
 */
export default function TemplatesScreen({ machines, updateMachine }) {
  const [templates, setTemplates] = useState([]);
  const [newName, setNewName] = useState("");
  const [selectedMachineId, setSelectedMachineId] = useState(null);

  useEffect(() => {
    loadTemplates().then(setTemplates);
  }, []);

  const saveNewTemplate = async () => {
    if (!newName.trim()) {
      return Alert.alert("Ошибка", "Введите название шаблона.");
    }
    if (!selectedMachineId) {
      return Alert.alert("Ошибка", "Выберите станок для создания шаблона.");
    }
    const machine = machines.find((m) => m.id === selectedMachineId);
    if (!machine) return;

    const tpl = createTemplate(newName.trim(), machine);
    const updated = [tpl, ...templates];
    setTemplates(updated);
    await saveTemplates(updated);
    setNewName("");
    Alert.alert("Готово", `Шаблон "${tpl.name}" сохранён.`);
  };

  const applyTemplate = (tpl) => {
    if (!machines.length) {
      return Alert.alert("Ошибка", "Нет станков для применения.");
    }

    // Если только один станок — применяем сразу
    if (machines.length === 1) {
      updateMachine(machines[0].id, () => ({
        qty: tpl.qty,
        min: tpl.min,
        sec: tpl.sec,
        isDec: tpl.isDec,
        shiftH: tpl.shiftH,
        shiftM: tpl.shiftM,
        partM: tpl.partM,
        partS: tpl.partS,
        bltLen: tpl.bltLen,
        bltWaste: tpl.bltWaste,
        bltPart: tpl.bltPart,
        bltM: tpl.bltM,
        bltS: tpl.bltS,
        activeTab: "timer",
      }));
      Alert.alert("Применено", `Шаблон "${tpl.name}" применён к станку №${machines[0].id}.`);
      return;
    }

    // Выбор станка
    const buttons = machines.slice(0, 5).map((m) => ({
      text: `Станок №${m.id}`,
      onPress: () => {
        updateMachine(m.id, () => ({
          qty: tpl.qty,
          min: tpl.min,
          sec: tpl.sec,
          isDec: tpl.isDec,
          shiftH: tpl.shiftH,
          shiftM: tpl.shiftM,
          partM: tpl.partM,
          partS: tpl.partS,
          bltLen: tpl.bltLen,
          bltWaste: tpl.bltWaste,
          bltPart: tpl.bltPart,
          bltM: tpl.bltM,
          bltS: tpl.bltS,
          activeTab: "timer",
        }));
        Alert.alert("Применено", `Шаблон "${tpl.name}" применён к станку №${m.id}.`);
      },
    }));
    buttons.push({ text: "Отмена", style: "cancel" });
    Alert.alert("Выберите станок", `Применить шаблон "${tpl.name}" к:`, buttons);
  };

  const deleteTemplate = async (id) => {
    Alert.alert("Удалить шаблон?", "Это действие нельзя отменить.", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        style: "destructive",
        onPress: async () => {
          const updated = templates.filter((t) => t.id !== id);
          setTemplates(updated);
          await saveTemplates(updated);
        },
      },
    ]);
  };

  const totalSec = (tpl) => {
    const partSec = tpl.isDec ? n(tpl.min) * 60 : n(tpl.min) * 60 + n(tpl.sec);
    return Math.round(n(tpl.qty) * partSec);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.root}>
        <View style={styles.centerWrap}>
          <Text style={styles.h1}>📋 Шаблоны заданий</Text>
          <Text style={styles.sub}>Сохраняйте частые настройки для быстрого применения</Text>

          {/* Создание нового шаблона */}
          <View style={[styles.card, { borderLeftColor: COLORS.success }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>➕ Новый шаблон</Text>
            </View>
            <View style={{ padding: 12 }}>
              <TextInput
                style={styles.input}
                value={newName}
                onChangeText={setNewName}
                placeholder="Название (напр. «Шестерня M8»)"
                placeholderTextColor="#666"
              />
              <Text style={[styles.small, { marginBottom: 8 }]}>Создать из станка:</Text>
              <View style={styles.presetRow}>
                {machines.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      styles.presetBtn,
                      selectedMachineId === m.id && { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
                    ]}
                    onPress={() => setSelectedMachineId(m.id)}
                  >
                    <Text style={[styles.presetText, selectedMachineId === m.id && { color: "#111" }]}>
                      №{m.id}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={[styles.btn, styles.btnSuccess, { marginTop: 4 }]} onPress={saveNewTemplate}>
                <Text style={styles.btnText}>💾 Сохранить шаблон</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Список шаблонов */}
          {!templates.length && (
            <View style={[styles.card, { borderLeftColor: "#444" }]}>
              <View style={{ padding: 16, alignItems: "center" }}>
                <Text style={{ fontSize: 40, marginBottom: 10 }}>📋</Text>
                <Text style={[styles.note, { textAlign: "center" }]}>
                  Нет сохранённых шаблонов.{"\n"}Настройте станок и сохраните как шаблон.
                </Text>
              </View>
            </View>
          )}

          {templates.map((tpl) => {
            const total = totalSec(tpl);
            return (
              <View key={tpl.id} style={[styles.card, { borderLeftColor: COLORS.accent }]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: COLORS.accent }]}>{tpl.name}</Text>
                  <Text style={styles.small}>
                    {new Date(tpl.createdAt).toLocaleDateString("ru-RU")}
                  </Text>
                </View>
                <View style={{ padding: 12 }}>
                  <View style={{ flexDirection: "row", gap: 16, marginBottom: 10 }}>
                    <View>
                      <Text style={styles.small}>Деталей</Text>
                      <Text style={[styles.note, { fontWeight: "700" }]}>{tpl.qty || "—"}</Text>
                    </View>
                    <View>
                      <Text style={styles.small}>Время/деталь</Text>
                      <Text style={[styles.note, { fontWeight: "700" }]}>
                        {tpl.isDec ? `${tpl.min} мин` : `${tpl.min}м ${tpl.sec}с`}
                      </Text>
                    </View>
                    {total > 0 && (
                      <View>
                        <Text style={styles.small}>Серия</Text>
                        <Text style={[styles.note, { fontWeight: "700", color: COLORS.primary }]}>
                          {fmtDur(total)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.row}>
                    <TouchableOpacity style={[styles.btn, styles.btnSuccess]} onPress={() => applyTemplate(tpl)}>
                      <Text style={styles.btnText}>▶ Применить</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, { backgroundColor: "#3a1a1a" }]} onPress={() => deleteTemplate(tpl.id)}>
                      <Text style={{ color: COLORS.danger, fontWeight: "700", fontSize: 14 }}>🗑 Удалить</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
