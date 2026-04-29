import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, SafeAreaView, ScrollView, Share, Text, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { buildReportCsv, buildReportJson } from "./src/services/reports";
import { initNotifications, notifyFinish, notifyWarning } from "./src/services/notifications";
import { safeEval } from "./src/services/mathParser";
import { sendTelegram } from "./src/services/telegram";
import {
  loadAppState,
  loadBackup,
  persistMachine,
  persistMeta,
  persistTg,
  removeMachineById,
  saveBackup,
} from "./src/services/storage";
import CalcModal from "./src/components/CalcModal";
import ErrorBoundary from "./src/components/ErrorBoundary";
import HistoryPanel from "./src/components/HistoryPanel";
import StatsPanel from "./src/components/StatsPanel";
import MachineCard from "./src/components/MachineCard";
import TelegramPanel from "./src/components/TelegramPanel";
import { COLORS, styles } from "./src/theme";
import { machineFactory, n, nowISO, nowShort, secPerPart } from "./src/utils/machine";

export default function App() {
  const [ready, setReady] = useState(false);
  const [counter, setCounter] = useState(1);
  const [machines, setMachines] = useState([machineFactory(1)]);
  const [history, setHistory] = useState([]);
  const [tgToken, setTgToken] = useState("");
  const [tgChatId, setTgChatId] = useState("");
  const [tgWarnMin, setTgWarnMin] = useState("5");
  const [tgOpen, setTgOpen] = useState(false);
  const [tgStatus, setTgStatus] = useState("");
  const [calcOpen, setCalcOpen] = useState(false);
  const [calcExpr, setCalcExpr] = useState("");
  const [calcTarget, setCalcTarget] = useState(null);

  const machinesRef = useRef(machines);
  const tgRef = useRef({ tgToken, tgChatId, tgWarnMin });
  const dirtyMachinesRef = useRef(new Set());
  const dirtyMetaRef = useRef(false);
  const dirtyTgRef = useRef(false);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    machinesRef.current = machines;
  }, [machines]);
  useEffect(() => {
    tgRef.current = { tgToken, tgChatId, tgWarnMin };
  }, [tgToken, tgChatId, tgWarnMin]);

  const scheduleSave = () => {
    if (saveTimerRef.current) return;
    saveTimerRef.current = setTimeout(async () => {
      saveTimerRef.current = null;
      await flushSave();
    }, 7000);
  };

  const flushSave = async () => {
    const ops = [];
    if (dirtyMetaRef.current) {
      dirtyMetaRef.current = false;
      ops.push(persistMeta(counter, history, machinesRef.current));
    }
    if (dirtyTgRef.current) {
      dirtyTgRef.current = false;
      ops.push(persistTg(tgToken, tgChatId, tgWarnMin));
    }
    if (dirtyMachinesRef.current.size > 0) {
      const ids = [...dirtyMachinesRef.current];
      dirtyMachinesRef.current.clear();
      ids.forEach((id) => {
        const m = machinesRef.current.find((x) => x.id === id);
        if (m) ops.push(persistMachine(m));
      });
    }
    if (ops.length) await Promise.all(ops);
  };

  const flushNow = async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    await flushSave();
  };

  const markMachineDirty = (id) => {
    dirtyMachinesRef.current.add(id);
    scheduleSave();
  };
  const markMetaDirty = () => {
    dirtyMetaRef.current = true;
    scheduleSave();
  };
  const markTgDirty = () => {
    dirtyTgRef.current = true;
    scheduleSave();
  };

  useEffect(() => {
    (async () => {
      try {
        const { meta, tg, machines: loadedMachines } = await loadAppState();
        if (tg) {
          setTgToken(tg.tgToken || "");
          setTgChatId(tg.tgChatId || "");
          setTgWarnMin(tg.tgWarnMin || "5");
        }
        if (meta?.counter) setCounter(meta.counter);
        if (meta?.history) setHistory(meta.history);
        if (loadedMachines.length) setMachines(loadedMachines);
      } catch (e) { console.warn("[CNC] Ошибка загрузки состояния:", e); }
      try {
        await initNotifications();
      } catch (e) { console.warn("[CNC] Ошибка инициализации уведомлений:", e); }
      setReady(true);
    })();
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!ready) return undefined;
    const it = setInterval(async () => {
      let changed = false;
      const next = await Promise.all(
        machinesRef.current.map(async (m) => {
          if (!m.running || m.isPaused || !m.endTime) return m;
          const remain = Math.max(0, Math.ceil((m.endTime - Date.now()) / 1000));
          if (remain === m.remainSec) return m;
          changed = true;
          const warnMin = Math.max(1, n(tgRef.current.tgWarnMin || "5"));
          if (!m.warnedAt && remain > 0 && remain <= warnMin * 60) {
            await sendTelegram(
              tgRef.current.tgToken,
              tgRef.current.tgChatId,
              `⚠️ <b>Станок №${m.id}</b> — осталось менее ${warnMin} мин`
            );
            try {
              await notifyWarning(m.id, warnMin);
            } catch (e) { console.warn("[CNC] Ошибка отправки предупреждения:", e); }
          }

          if (remain <= 0) {
            const finishedAtIso = nowISO();
            const durationSec =
              m.startedAt ? Math.max(0, Math.round((Date.now() - Date.parse(m.startedAt)) / 1000)) : m.totalSec;
            const item = {
              id: `${m.id}-${finishedAtIso}`,
              machineId: m.id,
              startedAt: m.startedAt,
              finishedAt: finishedAtIso,
              durationSec,
            };
            setHistory((prev) => [item, ...prev].slice(0, 200));
            markMetaDirty();
            await sendTelegram(
              tgRef.current.tgToken,
              tgRef.current.tgChatId,
              `✅ <b>Станок №${m.id}</b> — задание завершено (${nowShort()})`
            );
            try {
              await notifyFinish(m.id);
            } catch (e) { console.warn("[CNC] Ошибка уведомления о завершении:", e); }
            return {
              ...m,
              remainSec: 0,
              running: false,
              isPaused: false,
              status: "ЗАВЕРШЕНО",
              statusColor: COLORS.success,
              borderColor: COLORS.success,
              collapsed: false,
              warnedAt: true,
            };
          }
          return { ...m, remainSec: remain, warnedAt: m.warnedAt || remain <= warnMin * 60 };
        })
      );
      if (changed) {
        setMachines(next);
        next.forEach((m) => markMachineDirty(m.id));
      }
    }, 1000);
    return () => clearInterval(it);
  }, [ready, counter, history, tgWarnMin]);

  const updateMachine = (id, fn, important = false) => {
    setMachines((prev) => prev.map((m) => (m.id === id ? { ...m, ...fn(m) } : m)));
    markMachineDirty(id);
    if (important) flushNow();
  };

  const addMachine = () => {
    const id = counter + 1;
    setCounter(id);
    setMachines((prev) => [...prev, machineFactory(id)]);
    markMetaDirty();
    markMachineDirty(id);
    flushNow();
  };

  const deleteMachine = (id) => {
    const m = machines.find((x) => x.id === id);
    if (!m) return;
    const remove = async () => {
      setMachines((prev) => prev.filter((x) => x.id !== id));
      markMetaDirty();
      await removeMachineById(id);
      await flushNow();
    };
    if (m.running) {
      Alert.alert("Подтверждение", `Станок №${id} сейчас в работе. Удалить?`, [
        { text: "Отмена", style: "cancel" },
        { text: "Удалить", style: "destructive", onPress: remove },
      ]);
      return;
    }
    remove();
  };

  const startMachine = (id) => {
    const m = machines.find((x) => x.id === id);
    if (!m) return;
    const totalSec = Math.round(n(m.qty) * secPerPart(m));
    if (totalSec <= 0) return Alert.alert("Ошибка", "Введите количество и время.");
    updateMachine(
      id,
      () => ({
        totalSec,
        remainSec: totalSec,
        endTime: Date.now() + totalSec * 1000,
        running: true,
        isPaused: false,
        warnedAt: false,
        startedAt: nowISO(),
        collapsed: true,
        status: "В РАБОТЕ",
        statusColor: COLORS.primary,
        borderColor: COLORS.primary,
      }),
      true
    );
  };

  const togglePause = (id) => {
    const m = machines.find((x) => x.id === id);
    if (!m?.running) {
      Alert.alert("Недоступно", "Пауза доступна только для запущенного станка.");
      return;
    }
    updateMachine(
      id,
      (cur) =>
        cur.isPaused
          ? {
              isPaused: false,
              endTime: Date.now() + cur.remainSec * 1000,
              status: "В РАБОТЕ",
              statusColor: COLORS.primary,
              borderColor: COLORS.primary,
            }
          : {
              isPaused: true,
              remainSec: Math.max(0, Math.ceil((cur.endTime - Date.now()) / 1000)),
              status: "ПАУЗА",
              statusColor: COLORS.accent,
              borderColor: COLORS.accent,
            },
      true
    );
  };

  const resetMachine = (id) => updateMachine(id, () => ({ ...machineFactory(id), id }), true);

  const copyShift = (m) => {
    const shiftSec = n(m.shiftH) * 3600 + n(m.shiftM) * 60;
    const partSec = n(m.partM) * 60 + n(m.partS);
    if (shiftSec <= 0 || partSec <= 0) return Alert.alert("Ошибка", "Сначала рассчитайте смену.");
    const qty = Math.floor(shiftSec / partSec);
    updateMachine(m.id, () => ({ activeTab: "timer", qty: String(qty), min: m.partM, sec: m.partS, isDec: false }));
  };
  const copyBillet = (m) => {
    const usable = n(m.bltLen) - n(m.bltWaste);
    const partLen = n(m.bltPart);
    if (usable <= 0 || partLen <= 0 || partLen > usable) return Alert.alert("Ошибка", "Сначала рассчитайте заготовку.");
    const qty = Math.floor(usable / partLen);
    updateMachine(m.id, () => ({ activeTab: "timer", qty: String(qty), min: m.bltM, sec: m.bltS, isDec: false }));
  };

  const testTelegram = async () => {
    if (!tgToken || !tgChatId) return Alert.alert("Ошибка", "Заполните Token и Chat ID.");
    setTgStatus("⏳ Отправка...");
    const ok = await sendTelegram(tgToken, tgChatId, "✅ <b>CNC Мониторинг Pro</b>\nТест уведомлений работает.");
    setTgStatus(ok ? "✅ Доставлено" : "❌ Ошибка");
    markTgDirty();
    flushNow();
    setTimeout(() => setTgStatus(""), 3000);
  };

  const exportJson = async () => {
    await Share.share({ message: JSON.stringify(buildReportJson(history, machines), null, 2) });
  };
  const exportCsv = async () => {
    await Share.share({ message: buildReportCsv(history) });
  };

  const backupSettings = async () => {
    await saveBackup({ tgToken, tgChatId, tgWarnMin, counter, machines, history, at: nowISO() });
    Alert.alert("Готово", "Резервная копия сохранена.");
  };
  const restoreSettings = async () => {
    const b = await loadBackup();
    if (!b) return Alert.alert("Нет данных", "Резервная копия не найдена.");
    setTgToken(b.tgToken || "");
    setTgChatId(b.tgChatId || "");
    setTgWarnMin(b.tgWarnMin || "5");
    setCounter(b.counter || 1);
    setMachines(b.machines?.length ? b.machines : [machineFactory(1)]);
    setHistory(b.history || []);
    dirtyMetaRef.current = true;
    dirtyTgRef.current = true;
    (b.machines || []).forEach((m) => dirtyMachinesRef.current.add(m.id));
    await flushNow();
    Alert.alert("Готово", "Настройки и данные восстановлены.");
  };

  const openCalc = (id, field) => {
    setCalcTarget({ id, field });
    setCalcExpr("");
    setCalcOpen(true);
  };
  const calcInsert = () => {
    try {
      const value = safeEval(calcExpr || "0");
      if (!Number.isFinite(value)) throw new Error("Результат не является числом");
      if (calcTarget) {
        updateMachine(calcTarget.id, () => ({ [calcTarget.field]: String(Number(value.toFixed(4))) }));
      }
      setCalcOpen(false);
    } catch (e) {
      Alert.alert("Ошибка", e.message || "Некорректное выражение.");
    }
  };

  useEffect(() => {
    if (!ready) return;
    markTgDirty();
  }, [tgToken, tgChatId, tgWarnMin, ready]);

  const historyPreview = useMemo(() => history.slice(0, 20), [history]);

  if (!ready) {
    return (
      <ErrorBoundary>
        <SafeAreaView style={styles.safe}>
          <StatusBar style="light" />
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={styles.note}>Загрузка...</Text>
          </View>
        </SafeAreaView>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.root}>
        <View style={styles.centerWrap}>
          <Text style={styles.h1}>⚙️ CNC Мониторинг Pro</Text>
          <Text style={styles.sub}>Управление станками · Расчёт смен · Заготовки</Text>

          <TelegramPanel
            styles={styles}
            tgOpen={tgOpen}
            setTgOpen={setTgOpen}
            tgToken={tgToken}
            setTgToken={setTgToken}
            tgChatId={tgChatId}
            setTgChatId={setTgChatId}
            tgWarnMin={tgWarnMin}
            setTgWarnMin={setTgWarnMin}
            tgStatus={tgStatus}
            testTelegram={testTelegram}
            backupSettings={backupSettings}
            restoreSettings={restoreSettings}
          />

          <StatsPanel styles={styles} machines={machines} history={history} />

          {machines.map((m) => (
            <MachineCard
              key={m.id}
              m={m}
              styles={styles}
              updateMachine={updateMachine}
              openCalc={openCalc}
              startMachine={startMachine}
              togglePause={togglePause}
              resetMachine={resetMachine}
              deleteMachine={deleteMachine}
              copyShift={copyShift}
              copyBillet={copyBillet}
            />
          ))}

          <HistoryPanel styles={styles} historyPreview={historyPreview} exportCsv={exportCsv} exportJson={exportJson} />

          <Text style={styles.versionText}>CNC Мониторинг Pro v1.1.0</Text>
        </View>

        <TouchableOpacity style={styles.fab} onPress={addMachine}>
          <Text style={{ color: "#000", fontSize: 28, fontWeight: "700" }}>+</Text>
        </TouchableOpacity>
      </ScrollView>

      <CalcModal
        styles={styles}
        calcOpen={calcOpen}
        calcExpr={calcExpr}
        setCalcExpr={setCalcExpr}
        calcInsert={calcInsert}
        setCalcOpen={setCalcOpen}
      />
    </SafeAreaView>
    </ErrorBoundary>
  );
}
