import axios from "axios";

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

interface DiscordAlertData {
  deviceId: string;
  userId?: number | null;
  accX: number;
  accY: number;
  accZ: number;
}

export const sendDiscordFallAlert = async (data: DiscordAlertData) => {
  if (!DISCORD_WEBHOOK_URL) {
    console.warn("Webhook de Discord no configurado");
    return;
  }

  const message = {
    username: "🚨 Fall Detection System",
    embeds: [
      {
        title: "⚠️ CAÍDA DETECTADA",
        color: 15158332,
        fields: [
          {
            name: "📟 Dispositivo",
            value: data.deviceId,
            inline: true,
          },
          {
            name: "👤 Usuario (ID)",
            value: data.userId ? data.userId.toString() : "No asignado",
            inline: true,
          },
          {
            name: "📊 Aceleración",
            value: `X: ${data.accX}\nY: ${data.accY}\nZ: ${data.accZ}`,
            inline: false,
          },
          {
            name: "📅 Fecha",
            value: new Date().toLocaleString(),
            inline: false,
          },
        ],
        footer: {
          text: "Sistema inteligente de detección de caídas",
        },
      },
    ],
  };

  try {
    const response = await axios.post(DISCORD_WEBHOOK_URL, message);
    console.log("✅ Alerta enviada a Discord. Status:", response.status);
  } catch (error: any) {
    // Esto te dirá exactamente por qué Discord rechaza la petición
    console.error("❌ Error de Discord API:", error.response?.data || error.message);
    throw error; // Re-lanzar para que el device.service también se entere
  }
};
