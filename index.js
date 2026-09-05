const express = require('express');
const mineflayer = require('mineflayer');
const dns = require('dns');

const app = express();
app.get('/', (req, res) => res.send('Bot 7/24 Aktif!'));
app.listen(process.env.PORT || 3000, () => console.log('Web sunucusu hazir.'));

process.on('uncaughtException', (err) => {
  console.log('Paket hatasi:', err.message);
});

// ATERNOS SABİT ADRESİN (Hiç değişmeyen adres)
const ATERNOS_HOST = 'ekip04.aternos.me';

let isReconnecting = false;

function connectBot(host, port) {
  console.log(`Baglaniliyor: ${host}:${port}...`);

  const bot = mineflayer.createBot({
    host: host,
    port: port,
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
    console.log('Baglanti koptu. 25sn sonra tekrar deneniyor...');
    try { bot.end(); } catch (e) {}
    setTimeout(startBot, 25000);
  }

  bot.on('end', safeReconnect);
  bot.on('error', (err) => {
    console.log('Hata:', err.message);
    safeReconnect();
  });
}

function startBot() {
  // Aternos'un o an atadığı dinamik IP ve Portu ekip04.aternos.me üzerinden bulur
  dns.resolveSrv(`_minecraft._tcp.${ATERNOS_HOST}`, (err, addresses) => {
    if (!err && addresses && addresses.length > 0) {
      const resolvedHost = addresses[0].name;
      const resolvedPort = addresses[0].port;
      console.log(`Dinamik adres otomatik cozuldu: ${resolvedHost}:${resolvedPort}`);
      connectBot(resolvedHost, resolvedPort);
    } else {
      console.log('SRV cozulemedı, doğrudan deneniyor...');
      connectBot(ATERNOS_HOST, 25565);
    }
  });
}

startBot();
