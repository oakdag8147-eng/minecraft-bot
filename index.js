const express = require('express');
const mineflayer = require('mineflayer');

const app = express();
app.get('/', (req, res) => res.send('Bot 7/24 Aktif!'));
app.listen(process.env.PORT || 3000, () => console.log('Web sunucusu hazir.'));

process.on('uncaughtException', (err) => {
  console.log('Paket hatasi:', err.message);
});

// Aternos "Bağlan" Penceresinden Aldığın Dinamik IP ve Port
const ATERNOS_HOST = 'bluegill.aternos.host'; // Buraya kendi Dinamik IP'ni yaz (örneğin halibut.aternos.host)
const ATERNOS_PORT = 52241;                // Buraya "Bağlantı Noktası" sayısını yaz

let isReconnecting = false;

function startBot() {
  console.log(`Baglaniliyor: ${ATERNOS_HOST}:${ATERNOS_PORT}...`);

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
    
    function doRandomAction() {
      if (!bot || !bot.entity) return;

      const actions = [
        () => {
          bot.setControlState('jump', true);
          setTimeout(() => bot.setControlState('jump', false), 400);
        },
        () => {
          const randomYaw = bot.entity.yaw + (Math.random() * 2 - 1);
          bot.look(randomYaw, bot.entity.pitch, true);
        },
        () => {
          bot.setControlState('forward', true);
          setTimeout(() => {
            bot.setControlState('forward', false);
            bot.setControlState('back', true);
            setTimeout(() => bot.setControlState('back', false), 300);
          }, 300);
        },
        () => {
          bot.setControlState('sneak', true);
          setTimeout(() => bot.setControlState('sneak', false), 800);
        }
      ];

      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      randomAction();

      const nextTime = Math.floor(Math.random() * 30000) + 15000;
      setTimeout(doRandomAction, nextTime);
    }

    setTimeout(doRandomAction, 3000);
  });

  bot.on('kicked', (reason) => console.log('Atildi:', reason));
  
  function safeReconnect() {
    if (isReconnecting) return;
    isReconnecting = true;
    console.log('Baglanti koptu. 20sn sonra tekrar denenecek...');
    try { bot.end(); } catch (e) {}
    setTimeout(startBot, 20000);
  }

  bot.on('end', safeReconnect);
  bot.on('error', (err) => {
    console.log('Hata:', err.message);
    safeReconnect();
  });
}

startBot();
