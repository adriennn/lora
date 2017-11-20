// const TelegramBotClient = require('telegram-bot-client')

// const client = new TelegramBotClient(process.env.TELEGRAM_TOKEN)
const path   = require('path')

const {server} = require(path.join(__dirname,'../../app'))

const Botmaster   = require('botmaster')
const TelegramBot = require('botmaster-telegram')
const botmaster   = new Botmaster({server: server})

// Setup the telegram bot
const telegramSettings = {}
      telegramSettings.credentials = {}
      telegramSettings.credentials.authToken = process.env.TELEGRAM_TOKEN
      telegramSettings.webhookEndpoint = '/webhook' + process.env.TELEGRAM_WEBHOOK_ENDPOINT_HASH

const telegrambot = new TelegramBot(telegramSettings)
botmaster.addBot(telegrambot)

/*
 * This middleware allows the Telegram bot to interact with the app
 */

module.exports = (req, res, next) => {

    console.log('hit bot controller: ', req.body)

    try {

      botmaster.use({
        type: 'incoming',
        name: 'my-middleware',
        controller: (bot, update) => {
          return bot.reply(update, 'Hello world!');
        }
      })

  }

    // let chatid= req.body.message.chat.id
    //
    // try  {
    //
    //     client.sendMessage(chatid, 'Oh hi Mark');
    //     // return res.status(200).send('OK')
    //     res.end()
    // }

    catch (err) {

      return res.status(500).send('Internal Server Error')
    }
}
