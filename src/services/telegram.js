/**
 * Отправка сообщения через Telegram Bot API.
 * @param {string} token — Bot Token
 * @param {string} chatId — Chat ID
 * @param {string} text — HTML-текст сообщения
 * @returns {Promise<boolean>} true если отправлено успешно
 */
export async function sendTelegram(token, chatId, text) {
  if (!token || !chatId) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    const json = await res.json();
    return json?.ok === true;
  } catch (e) {
    console.warn("[CNC] Ошибка Telegram:", e);
    return false;
  }
}
