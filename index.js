const express = require('express');
const mineflayer = require('mineflayer');

const app = express();
app.get('/', (req, res) => res.send('Bot 7/24 Aktif!'));
app.listen(process.env.PORT || 3000, () => console.log('Web sunucusu hazir.'));

process.on('uncaughtException', (err) => {
  console.log('Paket hatasi:', err.message);
});

// SABİT ATERNOS ADRESİN
const ATERNOS_HOST = 'ekip04.aternos.me';
const ATERNOS_PORT = 52241;

let isReconnecting = false;

function createBot() {
  console.log(`${ATERNOS_HOST}:${ATERNOS_PORT} adresine baglaniliyor...`);

  const bot = mineflayer.createBot({
    host: ATERNOS_HOST,
    port: ATERNOS_PORT,
    username: 'AFK_Bot_724',
    version: '1.21.1',
    auth: 'offline',
    checkTimeoutInterval: 120000,
    hideErrors: true,
    physicsEnabled: true
  });

  bot.on('spawn', () => {
    console.log(`Bot (${bot.username}) sunucuya başarıyla girdi!`);
    isReconnecting = false;
    
    // Her 20 saniyede bir fiziksel hareket yap (Aternos AFK tespitini engeller)
    setInterval(() => {
      if (bot && bot.entity) {
        // 1. Zıpla
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 400);

        // 2. İleri-Geri Küçük Adım At
        bot.setControlState('forward', true);
        setTimeout(() => {
          bot.setControlState('forward', false);
          bot.setControlState('back', true);
          setTimeout(() => bot.setControlState('back', false), 300);
        }, 400);

        // 3. Kafasını Rastgele Çevir
        const randomYaw = bot.entity.yaw + (Math.random() * 1.5 - 0.75);
        bot.look(randomYaw, bot.entity.pitch, true);

        // 4. Chat Mesajı At
        bot.chat('AFK Bot Aktif #' + Math.floor(Math.random() * 1000));
      }
    }, 20000); // 20 Saniye
  });

  bot.on('kicked', (reason) => console.log('Atildi:', reason));
  
  function safeReconnect() {
    if (isReconnecting) return;
    isReconnecting = true;
    console.log('Sunucu kapali veya baglanti koptu. 30sn sonra tekrar denenecek...');
    try { bot.end(); } catch (e) {}
    setTimeout(createBot, 30000);
  }

  bot.on('end', safeReconnect);
  bot.on('error', (err) => {
    console.log('Hata:', err.message);
    safeReconnect();
  });
}

createBot();
