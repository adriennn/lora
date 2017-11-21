const TelegramBotClient = require('telegram-bot-client')
const client = new TelegramBotClient(process.env.TELEGRAM_TOKEN)

/*
 * This middleware allows the Telegram bot to interact with the app
 */

module.exports = (req, res, next) => {

    console.log('hit bot controller: ', req.body)

    let chatid= req.body.message.chat.id

    let keyboard = JSON.stringify({
    inline_keyboard: [
        [
          {text:'Add a device',callback_data:'device'},
          {text:'Remove a device',callback_data:'remove'}
        ],
        [
          {text:'List all devices',callback_data:'list'}
        ]
      ]
    })

    let text = 'What do you want to do?'

      try  {

          client.sendMessage(chatid, text, keyboard).promise().catch(err => {
          console.log(err)
          res.end()
      })
          // return res.status(200).send('OK')
          res.end()
      }

      catch (err) {

        return res.status(500).send('Internal Server Error')
      }
}
