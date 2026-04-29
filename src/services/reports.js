export function buildReportJson(history, machines) {
  return {
    exportedAt: new Date().toISOString(),
    history,
    machines: machines.map((m) => ({ id: m.id, status: m.status, running: m.running })),
  };
}

export function buildReportCsv(history) {
  const header = "machineId,startedAt,finishedAt,durationSec";
  const rows = history.map(
    (h) => `${h.machineId},${h.startedAt || ""},${h.finishedAt || ""},${h.durationSec || 0}`
  );
  return [header, ...rows].join("\n");
}
