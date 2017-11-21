const TelegramBotClient = require('telegram-bot-client')
const client = new TelegramBotClient(process.env.TELEGRAM_TOKEN)

/*
 * This middleware allows the Telegram bot to interact with the app
 */

module.exports = (req, res, next) => {

    console.log('hit bot controller: ', req.body)

    try  {

        let keyboard = {
            reply_markup: JSON.stringify({
              keyboard: [
                ['1'],
                ['2']
              ]
            })
        }

        let chatid= req.body.message.chat.id

        client.sendMessage(chatid, 'What now?', keyboard).catch(err => {

        console.log(err)
        res.end()
      })
          // return res.status(200).send('OK')
          res.end()
      }

      catch (err) {

        return res.end()
    }
}
