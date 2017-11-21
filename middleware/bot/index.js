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
                ['List devices'],
                ['Add new device'],
                ['Remove device'],
                [
                    {'text':'Hallo','callback_data': '1'}
                  , {'text':'Link','url':'https://garbagepla.net'}
                ]
              ]
            })
        }

        let chatid= req.body.message.chat.id

        client.sendMessage(chatid, 'What now?', keyboard).catch(err => {

          console.log(err)
          res.end()
        })

        res.end()
      }

      catch (err) {

        console.log('error in bot controller', err)

        return res.end()
    }
}
