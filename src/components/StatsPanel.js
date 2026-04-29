import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { COLORS } from "../theme";
import { fmtDur } from "../utils/machine";

/**
 * Панель сводной статистики — показывает общую информацию
 * по текущим станкам и истории.
 */
export default function StatsPanel({ styles, machines, history }) {
  const stats = useMemo(() => {
    const running = machines.filter((m) => m.running && !m.isPaused).length;
    const paused = machines.filter((m) => m.isPaused).length;
    const idle = machines.filter((m) => !m.running).length;
    const total = machines.length;

    // Статистика за последние 24 часа
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const todayHistory = history.filter(
      (h) => h.finishedAt && Date.parse(h.finishedAt) > dayAgo
    );
    const todayCount = todayHistory.length;
    const todayTotalSec = todayHistory.reduce((s, h) => s + (h.durationSec || 0), 0);

    // Среднее время задания
    const avgSec = todayCount > 0 ? Math.round(todayTotalSec / todayCount) : 0;

    return { running, paused, idle, total, todayCount, todayTotalSec, avgSec };
  }, [machines, history]);

  if (stats.total === 0) return null;

  return (
    <View style={[styles.card, { borderLeftColor: COLORS.primary }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>📊 Сводка</Text>
      </View>
      <View style={{ padding: 12 }}>
        {/* Статус станков */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
          <StatBadge label="В работе" value={stats.running} color={COLORS.primary} />
          <StatBadge label="Пауза" value={stats.paused} color={COLORS.accent} />
          <StatBadge label="Свободно" value={stats.idle} color={COLORS.success} />
        </View>

        {/* Статистика за 24ч */}
        <View
          style={{
            backgroundColor: "#1a1a2e",
            borderRadius: 8,
            padding: 10,
            borderLeftWidth: 3,
            borderLeftColor: COLORS.primary,
          }}
        >
          <Text style={{ color: "#888", fontSize: 11, marginBottom: 4 }}>За последние 24 часа</Text>
          <Text style={styles.note}>
            ✅ Завершено: <Text style={{ color: COLORS.primary, fontWeight: "700" }}>{stats.todayCount}</Text> заданий
          </Text>
          {stats.todayTotalSec > 0 && (
            <Text style={styles.note}>
              ⏱ Общее время: <Text style={{ color: COLORS.primary, fontWeight: "700" }}>{fmtDur(stats.todayTotalSec)}</Text>
            </Text>
          )}
          {stats.avgSec > 0 && (
            <Text style={styles.note}>
              📈 Среднее время: <Text style={{ color: COLORS.primary, fontWeight: "700" }}>{fmtDur(stats.avgSec)}</Text>
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

function StatBadge({ label, value, color }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={{ color, fontSize: 22, fontWeight: "800" }}>{value}</Text>
      <Text style={{ color: "#888", fontSize: 10, marginTop: 2 }}>{label}</Text>
    </View>
  );
}
