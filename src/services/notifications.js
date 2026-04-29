import * as Notifications from "expo-notifications";

export async function initNotifications() {
  await Notifications.requestPermissionsAsync();
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldSetBadge: false,
    }),
  });
}

export async function notifyWarning(machineId, warnMin) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Станок №${machineId}`,
      body: `Осталось менее ${warnMin} мин`,
    },
    trigger: null,
  });
}

export async function notifyFinish(machineId) {
  await Notifications.scheduleNotificationAsync({
    content: { title: `Станок №${machineId}`, body: "Задание завершено" },
    trigger: null,
  });
}
