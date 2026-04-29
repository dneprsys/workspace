import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE = {
  META: "cnc_meta_v2",
  TG: "cnc_tg_v2",
  BACKUP: "cnc_backup_v2",
  machine: (id) => `cnc_machine_${id}_v2`,
};

export async function loadAppState() {
  const [metaRaw, tgRaw] = await Promise.all([
    AsyncStorage.getItem(STORAGE.META),
    AsyncStorage.getItem(STORAGE.TG),
  ]);
  const meta = metaRaw ? JSON.parse(metaRaw) : null;
  const tg = tgRaw ? JSON.parse(tgRaw) : null;
  let machines = [];
  if (meta?.machineIds?.length) {
    const raws = await Promise.all(meta.machineIds.map((id) => AsyncStorage.getItem(STORAGE.machine(id))));
    machines = raws.map((r) => (r ? JSON.parse(r) : null)).filter(Boolean);
  }
  return { meta, tg, machines };
}

export async function persistMeta(counter, history, machines) {
  const machineIds = machines.map((m) => m.id);
  await AsyncStorage.setItem(
    STORAGE.META,
    JSON.stringify({ counter, machineIds, history })
  );
}

export async function persistTg(tgToken, tgChatId, tgWarnMin) {
  await AsyncStorage.setItem(STORAGE.TG, JSON.stringify({ tgToken, tgChatId, tgWarnMin }));
}

export async function persistMachine(machine) {
  await AsyncStorage.setItem(STORAGE.machine(machine.id), JSON.stringify(machine));
}

export async function removeMachineById(id) {
  await AsyncStorage.removeItem(STORAGE.machine(id));
}

export async function saveBackup(payload) {
  await AsyncStorage.setItem(STORAGE.BACKUP, JSON.stringify(payload));
}

export async function loadBackup() {
  const raw = await AsyncStorage.getItem(STORAGE.BACKUP);
  return raw ? JSON.parse(raw) : null;
}
