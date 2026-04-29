import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { fmtDur } from "../utils/machine";

export default function HistoryPanel({ styles, historyPreview, exportCsv, exportJson }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>🧾 История завершений</Text>
        <View style={styles.rowInline}>
          <TouchableOpacity style={[styles.smallBtn, styles.btnMuted]} onPress={exportCsv}>
            <Text style={styles.btnText}>CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.smallBtn, styles.btnAccent]} onPress={exportJson}>
            <Text style={styles.btnTextDark}>JSON</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ padding: 12 }}>
        {!historyPreview.length && <Text style={styles.note}>Пока пусто.</Text>}
        {historyPreview.map((h) => (
          <View key={h.id} style={styles.historyItem}>
            <Text style={styles.note}>Станок №{h.machineId}</Text>
            <Text style={styles.small}>
              {h.startedAt ? new Date(h.startedAt).toLocaleString("ru-RU") : "-"} →{" "}
              {h.finishedAt ? new Date(h.finishedAt).toLocaleString("ru-RU") : "-"}
            </Text>
            <Text style={styles.note}>Длительность: {fmtDur(h.durationSec || 0)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
