import AsyncStorage from "@react-native-async-storage/async-storage";

const TEMPLATES_KEY = "cnc_templates_v1";

/**
 * Загрузка сохранённых шаблонов заданий.
 * @returns {Promise<Array>} массив шаблонов
 */
export async function loadTemplates() {
  try {
    const raw = await AsyncStorage.getItem(TEMPLATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("[CNC] Ошибка загрузки шаблонов:", e);
    return [];
  }
}

/**
 * Сохранение массива шаблонов.
 * @param {Array} templates
 */
export async function saveTemplates(templates) {
  try {
    await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  } catch (e) {
    console.warn("[CNC] Ошибка сохранения шаблонов:", e);
  }
}

/**
 * Создание нового шаблона из текущих параметров станка.
 * @param {string} name — имя шаблона
 * @param {object} machine — объект станка
 * @returns {object} шаблон
 */
export function createTemplate(name, machine) {
  return {
    id: `tpl_${Date.now()}`,
    name,
    createdAt: new Date().toISOString(),
    qty: machine.qty || "",
    min: machine.min || "",
    sec: machine.sec || "",
    isDec: machine.isDec || false,
    shiftH: machine.shiftH || "12",
    shiftM: machine.shiftM || "0",
    partM: machine.partM || "",
    partS: machine.partS || "",
    bltLen: machine.bltLen || "3000",
    bltWaste: machine.bltWaste || "300",
    bltPart: machine.bltPart || "",
    bltM: machine.bltM || "",
    bltS: machine.bltS || "",
  };
}
