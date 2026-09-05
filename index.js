const express = require('express');
const mineflayer = require('mineflayer');
const dns = require('dns');

const app = express();
app.get('/', (req, res) => res.send('Bot 7/24 Aktif!'));
app.listen(process.env.PORT || 3000, () => console.log('Web sunucusu hazir.'));

process.on('uncaughtException', (err) => {
  console.log('Paket hatasi:', err.message);
});

// Aternos Sabit Adresin
const ATERNOS_HOST = 'ekip04.aternos.me';
const DEFAULT_PORT = 52241;

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
    
    // Rastgele aralıklarla gerçek oyuncu taklidi yap
    function doRandomAction() {
      if (!bot || !bot.entity) return;

      const actions = [
        () => {
          // Zıpla
          bot.setControlState('jump', true);
          setTimeout(() => bot.setControlState('jump', false), 400);
        },
        () => {
          // Etrafına bak
          const randomYaw = bot.entity.yaw + (Math.random() * 2 - 1);
          bot.look(randomYaw, bot.entity.pitch, true);
        },
        () => {
          // İleri-geri kısa adım at
          bot.setControlState('forward', true);
          setTimeout(() => {
            bot.setControlState('forward', false);
            bot.setControlState('back', true);
            setTimeout(() => bot.setControlState('back', false), 300);
          }, 300);
        },
        () => {
          // Eğil (Shift)
          bot.setControlState('sneak', true);
          setTimeout(() => bot.setControlState('sneak', false), 800);
        }
      ];

      // Rastgele bir eylem seç ve uygula
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      randomAction();

      // Bir sonraki eylemi 15 ile 45 saniye arasında rastgele bir zamanda yap
      const nextTime = Math.floor(Math.random() * 30000) + 15000;
      setTimeout(doRandomAction, nextTime);
    }

    // Harita yüklendikten 3 saniye sonra eylemleri başlat
    setTimeout(doRandomAction, 3000);
  });

  bot.on('kicked', (reason) => console.log('Atildi:', reason));
  
  function safeReconnect() {
    if (isReconnecting) return;
    isReconnecting = true;
    console.log('Baglanti koptu veya sunucu kapali. 30sn sonra tekrar denenecek...');
    try { bot.end(); } catch (e) {}
    setTimeout(startBot, 30000);
  }

  bot.on('end', safeReconnect);
  bot.on('error', (err) => {
    console.log('Hata:', err.message);
    safeReconnect();
  });
}

function startBot() {
  // Aternos'un o anki dinamik IP ve Portunu Otomatik Çöz
  dns.resolveSrv(`_minecraft._tcp.${ATERNOS_HOST}`, (err, addresses) => {
    if (!err && addresses && addresses.length > 0) {
      const resolvedHost = addresses[0].name;
      const resolvedPort = addresses[0].port;
      console.log(`Dinamik adres cozuldu: ${resolvedHost}:${resolvedPort}`);
      connectBot(resolvedHost, resolvedPort);
    } else {
      // Bulamazsa varsayılan adresle dene
      connectBot(ATERNOS_HOST, DEFAULT_PORT);
    }
  });
}

startBot();
