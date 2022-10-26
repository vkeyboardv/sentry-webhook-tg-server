const nconf = require('nconf');

nconf.env().argv().file('config.json');

const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const port = nconf.get('app:port');
const { botToken, chatId } = nconf.get('tg');

const tg = new TelegramBot(botToken, { polling: false });

const app = express();

app.use(express.json());

app.post('/webhook', (req, res) => {
  const { action, data } = req.body;

  if (action === 'created' && data.hasOwnProperty('error')) {
    const error = data.error;

    const payload = {
      url: error.web_url,
      title: error.title,
      type: error.type,
      project: error.project,
      environment: error.environment,
    };

    const html = `
⚠️ <b>${payload.title}</b>
Environment: ${payload.environment}

<a href="${payload.url}">View on Sentry</a>
`;

    if (payload.environment !== 'development') {
      tg.sendMessage(chatId, html, {
        parse_mode: 'HTML',
        disable_notification: true,
      });
    }
  }

  res.status(201).send({ status: true });
});

app.listen(port, () => {
  console.log(`Webhook listening on port ${port}`);
});
