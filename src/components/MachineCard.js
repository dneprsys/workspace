import React from "react";
import { Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import {
  bltRes,
  formatClock,
  n,
  plusShort,
  secPerPart,
  shiftRes,
} from "../utils/machine";
import { COLORS, presets, progressColor } from "../theme";

export default function MachineCard({
  m,
  styles,
  updateMachine,
  openCalc,
  startMachine,
  togglePause,
  resetMachine,
  deleteMachine,
  copyShift,
  copyBillet,
}) {
  const sr = shiftRes(m);
  const br = bltRes(m);
  const total = Math.round(n(m.qty) * secPerPart(m));
  const remainPct = m.totalSec > 0 ? (m.remainSec / m.totalSec) * 100 : 100;

  return (
    <View style={[styles.card, { borderLeftColor: m.borderColor, padding: 0 }]}>
      <TouchableOpacity style={styles.cardHeader} onPress={() => updateMachine(m.id, (x) => ({ collapsed: !x.collapsed }))}>
        <Text style={styles.cardTitle}>⚙️ Станок №{m.id}</Text>
        <Text style={[styles.status, { color: m.statusColor }]}>{m.status}</Text>
      </TouchableOpacity>
      {!m.collapsed && (
        <View style={{ padding: 12 }}>
          <View style={styles.tabs}>
            {["timer", "shift", "billet"].map((t) => (
              <TouchableOpacity key={t} style={[styles.tab, m.activeTab === t && styles.tabActive]} onPress={() => updateMachine(m.id, () => ({ activeTab: t }))}>
                <Text style={[styles.tabText, m.activeTab === t && styles.tabTextActive]}>
                  {t === "timer" ? "⏱ Таймер" : t === "shift" ? "📊 Смена" : "📏 Заготовка"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {m.activeTab === "timer" && (
            <View>
              <View style={styles.row}>
                <TextInput style={[styles.input, { flex: 1 }]} value={m.qty} onChangeText={(v) => updateMachine(m.id, () => ({ qty: v }))} placeholder="Количество деталей" placeholderTextColor="#666" keyboardType="numeric" />
                <TouchableOpacity style={styles.calcBtn} onPress={() => openCalc(m.id, "qty")}><Text style={{ color: COLORS.accent }}>🧮</Text></TouchableOpacity>
              </View>
              <View style={styles.presetRow}>
                {presets.map((p) => (
                  <TouchableOpacity key={p.label} style={styles.presetBtn} onPress={() => updateMachine(m.id, () => ({ isDec: false, min: p.min, sec: p.sec }))}>
                    <Text style={styles.presetText}>{p.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.switchRow}>
                <Switch value={m.isDec} onValueChange={(v) => updateMachine(m.id, () => ({ isDec: v }))} />
                <Text style={styles.note}>Ввод в десятичных минутах (3.5)</Text>
              </View>
              <View style={styles.row}>
                <TextInput style={[styles.input, styles.half]} value={m.min} onChangeText={(v) => updateMachine(m.id, () => ({ min: v }))} placeholder={m.isDec ? "Мин (десятичные)" : "Мин"} placeholderTextColor="#666" keyboardType="numeric" />
                {!m.isDec && <TextInput style={[styles.input, styles.half]} value={m.sec} onChangeText={(v) => updateMachine(m.id, () => ({ sec: v }))} placeholder="Сек" placeholderTextColor="#666" keyboardType="numeric" />}
              </View>
              {total > 0 && <View style={styles.banner}><Text style={styles.bannerText}>Итого серия: {(total / 3600).toFixed(2)} ч.</Text></View>}
              <View style={styles.resultPanel}>
                <View style={{ flex: 1 }}><Text style={styles.small}>Осталось</Text><Text style={styles.timer}>{m.running ? formatClock(m.remainSec) : "--:--:--"}</Text></View>
                <View style={{ flex: 1 }}><Text style={styles.small}>Конец в</Text><Text style={styles.timer}>{m.running ? plusShort(m.remainSec) : "--:--"}</Text></View>
              </View>
              <View style={styles.progressBg}><View style={[styles.progressBar, { width: `${Math.max(0, remainPct)}%`, backgroundColor: progressColor(remainPct) }]} /></View>
              <View style={styles.row}>
                <TouchableOpacity style={[styles.btn, styles.btnSuccess]} onPress={() => startMachine(m.id)}><Text style={styles.btnText}>▶ ЗАПУСК</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnAccent]} onPress={() => togglePause(m.id)}><Text style={styles.btnTextDark}>{m.isPaused ? "▶ ПРОДОЛЖИТЬ" : "⏸ ПАУЗА"}</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnMuted]} onPress={() => resetMachine(m.id)}><Text style={styles.btnText}>СБРОС</Text></TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteMachine(m.id)}><Text style={{ color: COLORS.danger }}>🗑</Text></TouchableOpacity>
              </View>
            </View>
          )}

          {m.activeTab === "shift" && (
            <View>
              <View style={styles.row}>
                <TextInput style={[styles.input, styles.half]} value={m.shiftH} onChangeText={(v) => updateMachine(m.id, () => ({ shiftH: v }))} placeholder="Смена — Часы" placeholderTextColor="#666" keyboardType="numeric" />
                <TextInput style={[styles.input, styles.half]} value={m.shiftM} onChangeText={(v) => updateMachine(m.id, () => ({ shiftM: v }))} placeholder="Смена — Мин" placeholderTextColor="#666" keyboardType="numeric" />
              </View>
              <View style={styles.row}>
                <TextInput style={[styles.input, styles.half]} value={m.partM} onChangeText={(v) => updateMachine(m.id, () => ({ partM: v }))} placeholder="Деталь — Мин" placeholderTextColor="#666" keyboardType="numeric" />
                <TextInput style={[styles.input, styles.half]} value={m.partS} onChangeText={(v) => updateMachine(m.id, () => ({ partS: v }))} placeholder="Деталь — Сек" placeholderTextColor="#666" keyboardType="numeric" />
              </View>
              {sr && <View style={styles.calcBox}><Text style={styles.note}>📦 Деталей за смену: {sr.qty} шт.</Text><Text style={styles.note}>🕐 Занято времени: {sr.used}</Text><Text style={styles.note}>💤 Остаток смены: {sr.left}</Text><Text style={styles.note}>⚡ Производительность: {sr.eff}%</Text><Text style={styles.note}>🏁 Конец смены в: {sr.end}</Text></View>}
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => copyShift(m)}><Text style={styles.secondaryText}>↗ Скопировать в Таймер</Text></TouchableOpacity>
            </View>
          )}

          {m.activeTab === "billet" && (
            <View>
              <View style={styles.row}>
                <TextInput style={[styles.input, styles.half]} value={m.bltLen} onChangeText={(v) => updateMachine(m.id, () => ({ bltLen: v }))} placeholder="Длина заготовки (мм)" placeholderTextColor="#666" keyboardType="numeric" />
                <TextInput style={[styles.input, styles.half]} value={m.bltWaste} onChangeText={(v) => updateMachine(m.id, () => ({ bltWaste: v }))} placeholder="Отходы/зажим (мм)" placeholderTextColor="#666" keyboardType="numeric" />
              </View>
              <TextInput style={styles.input} value={m.bltPart} onChangeText={(v) => updateMachine(m.id, () => ({ bltPart: v }))} placeholder="Длина 1 детали (мм)" placeholderTextColor="#666" keyboardType="numeric" />
              <View style={styles.row}>
                <TextInput style={[styles.input, styles.half]} value={m.bltM} onChangeText={(v) => updateMachine(m.id, () => ({ bltM: v }))} placeholder="Деталь — Мин" placeholderTextColor="#666" keyboardType="numeric" />
                <TextInput style={[styles.input, styles.half]} value={m.bltS} onChangeText={(v) => updateMachine(m.id, () => ({ bltS: v }))} placeholder="Деталь — Сек" placeholderTextColor="#666" keyboardType="numeric" />
              </View>
              {br && <View style={styles.calcBox}><Text style={styles.note}>📦 Деталей из заготовки: {br.qty} шт.</Text><Text style={styles.note}>📐 Остаток заготовки: {br.rem} мм</Text><Text style={styles.note}>⏱ Время на заготовку: {br.total}</Text><Text style={styles.note}>🔄 Замена через / в: {br.changeAt}</Text></View>}
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => copyBillet(m)}><Text style={styles.secondaryText}>↗ Скопировать в Таймер</Text></TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
