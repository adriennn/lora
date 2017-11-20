const express = require('express')

/*
 * This middleware allows the Telegram bot to interact with the app
 */

 // incomingMiddleware = (bot, update) => {
 //
 //   if (update.message.text === 'hi') {
 //     return bot.reply(update, 'well hi right back at you')
 //   }
 // }

module.exports = (req, res, next) => {

    console.log('hit bot controller: ', req.body)

    try  {

        let bm = req.app.get('botmaster')
        let tb = req.app.get('telegrambot')

        bm.use({
          type: 'incoming',
          name: 'incoming-middleware',
          controller: (bot, update) => {
            console.log('bm bot', update)
            return bot.reply(update, 'Oh hi Mark bm');
          }
        })

        tb.use({
          type: 'incoming',
          name: 'incoming-middleware',
          controller: (bot, update) => {
            console.log('tb bot', update)
            return bot.reply(update, 'Oh hi Mark tb');
          }
        })

        // return res.status(200).send('OK')
    }

    catch (err) {

      return res.status(500).send('Internal Server Error')
    }
}
