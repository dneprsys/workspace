import { useRef, useCallback } from "react";
import {
  loadAppState,
  persistMachine,
  persistMeta,
  persistTg,
  removeMachineById,
} from "../services/storage";

/**
 * Хук для отложенного сохранения состояния.
 * Группирует частые записи и выполняет их пакетно через 7 секунд.
 */
export function usePersistence() {
  const dirtyMachinesRef = useRef(new Set());
  const dirtyMetaRef = useRef(false);
  const dirtyTgRef = useRef(false);
  const saveTimerRef = useRef(null);
  const machinesRef = useRef([]);
  const metaRef = useRef({ counter: 1, history: [] });
  const tgRef = useRef({ tgToken: "", tgChatId: "", tgWarnMin: "5" });

  const flushSave = useCallback(async () => {
    const ops = [];
    if (dirtyMetaRef.current) {
      dirtyMetaRef.current = false;
      const { counter, history } = metaRef.current;
      ops.push(persistMeta(counter, history, machinesRef.current));
    }
    if (dirtyTgRef.current) {
      dirtyTgRef.current = false;
      const { tgToken, tgChatId, tgWarnMin } = tgRef.current;
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
  }, []);

  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) return;
    saveTimerRef.current = setTimeout(async () => {
      saveTimerRef.current = null;
      await flushSave();
    }, 7000);
  }, [flushSave]);

  const flushNow = useCallback(async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    await flushSave();
  }, [flushSave]);

  const markMachineDirty = useCallback(
    (id) => {
      dirtyMachinesRef.current.add(id);
      scheduleSave();
    },
    [scheduleSave]
  );

  const markMetaDirty = useCallback(() => {
    dirtyMetaRef.current = true;
    scheduleSave();
  }, [scheduleSave]);

  const markTgDirty = useCallback(() => {
    dirtyTgRef.current = true;
    scheduleSave();
  }, [scheduleSave]);

  /** Обновить ref ссылки (вызывать при изменении стейтов) */
  const syncRefs = useCallback(({ machines, counter, history, tgToken, tgChatId, tgWarnMin }) => {
    if (machines !== undefined) machinesRef.current = machines;
    if (counter !== undefined) metaRef.current.counter = counter;
    if (history !== undefined) metaRef.current.history = history;
    if (tgToken !== undefined) tgRef.current.tgToken = tgToken;
    if (tgChatId !== undefined) tgRef.current.tgChatId = tgChatId;
    if (tgWarnMin !== undefined) tgRef.current.tgWarnMin = tgWarnMin;
  }, []);

  const cleanup = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
  }, []);

  return {
    machinesRef,
    tgRef,
    dirtyMachinesRef,
    markMachineDirty,
    markMetaDirty,
    markTgDirty,
    flushNow,
    syncRefs,
    cleanup,
    loadAppState,
    removeMachineById,
  };
}
