const express = require('express')
const TelegramBotClient = require('telegram-bot-client')
const client = new TelegramBotClient(process.env.TELEGRAM_TOKEN)


/*
 * This middleware allows the Telegram bot to interact with the app
 */

module.exports = (req, res, next) => {

    console.log('hit bot controller: ', req.body)

    let chatid= req.body.message.message_id

    try  {

        client.sendMessage(chatid, 'Oh hi Mark');
        // return res.status(200).send('OK')
        res.end()
    }

    catch (err) {

      return res.status(500).send('Internal Server Error')
    }
}
