const express = require('express');
const mineflayer = require('mineflayer');

const app = express();
app.get('/', (req, res) => res.send('Bot 7/24 Aktif!'));
app.listen(process.env.PORT || 3000, () => console.log('Web sunucusu hazir.'));

process.on('uncaughtException', (err) => {
  console.log('Paket hatasi:', err.message);
});

const ATERNOS_HOST = 'halibut.aternos.host';
const ATERNOS_PORT = 52241;

let isReconnecting = false;

function createBot() {
  console.log(`${ATERNOS_HOST}:${ATERNOS_PORT} baglaniliyor...`);

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
    console.log(`Bot (${bot.username}) sunucuya girdi!`);
    isReconnecting = false;
    
    setTimeout(() => {
      setInterval(() => {
        if (bot && bot.entity) {
          bot.chat('.');
          bot.setControlState('jump', true);
          setTimeout(() => bot.setControlState('jump', false), 500);
          bot.look(bot.entity.yaw + 0.5, bot.entity.pitch, true);
        }
      }, 60000);
    }, 5000);
  });

  bot.on('kicked', (reason) => console.log('Atildi:', reason));
  
  function safeReconnect() {
    if (isReconnecting) return;
    isReconnecting = true;
    console.log('Baglanti koptu, 30sn bekleniyor...');
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
