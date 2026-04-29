export const n = (v) => Number(v || 0);

export const machineFactory = (id) => ({
  id,
  collapsed: false,
  activeTab: "timer",
  status: "ОЖИДАНИЕ",
  statusColor: "#888",
  borderColor: "#444",
  qty: "",
  min: "",
  sec: "",
  isDec: false,
  running: false,
  isPaused: false,
  remainSec: 0,
  totalSec: 0,
  endTime: null,
  warnSent: false,
  warnedAt: false,
  startedAt: null,
  shiftH: "12",
  shiftM: "0",
  partM: "",
  partS: "",
  bltLen: "3000",
  bltWaste: "300",
  bltPart: "",
  bltM: "",
  bltS: "",
});

export const secPerPart = (m) => (m.isDec ? n(m.min) * 60 : n(m.min) * 60 + n(m.sec));

export const formatClock = (sec) => {
  const s = Math.max(0, Math.floor(sec));
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${ss}`;
};

export const fmtDur = (sec) => {
  const t = Math.max(0, Math.round(sec));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  if (h > 0) return `${h}ч ${m}м`;
  if (m > 0) return `${m}м ${s}с`;
  return `${s}с`;
};

export const nowISO = () => new Date().toISOString();
export const nowShort = () =>
  new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
export const plusShort = (sec) =>
  new Date(Date.now() + sec * 1000).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const shiftRes = (m) => {
  const shiftSec = n(m.shiftH) * 3600 + n(m.shiftM) * 60;
  const partSec = n(m.partM) * 60 + n(m.partS);
  if (shiftSec <= 0 || partSec <= 0) return null;
  const qty = Math.floor(shiftSec / partSec);
  const used = qty * partSec;
  return {
    qty,
    used: fmtDur(used),
    left: fmtDur(shiftSec - used),
    eff: ((used / shiftSec) * 100).toFixed(1),
    end: plusShort(shiftSec),
  };
};

export const bltRes = (m) => {
  const usable = n(m.bltLen) - n(m.bltWaste);
  const partLen = n(m.bltPart);
  if (usable <= 0 || partLen <= 0 || partLen > usable) return null;
  const qty = Math.floor(usable / partLen);
  const partSec = n(m.bltM) * 60 + n(m.bltS);
  const total = qty * partSec;
  return {
    qty,
    rem: (usable - qty * partLen).toFixed(1),
    total: partSec > 0 ? fmtDur(total) : "—",
    changeAt: partSec > 0 ? `${fmtDur(total)} → в ${plusShort(total)}` : "—",
  };
};
