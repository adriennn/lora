# Readme

## Getting started

This tool is a work in progress. Use this to receive and test rpc calls from IOT network servers and visualize data. It requires mongodb for certain command persistence and data dumps as well as redis for command queues. The below assumes you have nodejs installed (tested with 7.10.1 and 8.5.0). First run `npm i`.

if you are using pm2, you can simply do: `npm start`

Else from the root directory of the app type: `node ./www/bin`

visit `localhost:PORT/lora` in your webrowser to access the user interface.

## .ENV file

You will need to have an `.env` file with the following:

```
APP_URL=
APP_ROOT=/lora/
APP_WEB_URL=
RPC_CLIENT_URL=rpc
IO_URL=
MONGO_URL=
REDIS_URL=
REDIS_PORT=
ONEMTOM_URL=http://1m2m.eu/services/GETPAYLOAD?Human=0&PL=
TELEGRAM_TOKEN= <NOT IN USE>
TELEGRAM_PUBLIC_URL= <NOT IN USE>
TELEGRAM_WEBHOOK_ENDPOINT_HASH= <NOT IN USE>
NODE_ENV=development
PORT=
MAPBOX_TOKEN=
APP_REQ_DELAY=
APP_REQ_LIMIT=
APP_REQ_WINDOW=
```

## LoraWAN Network Server providers
Supported methods in the `methods`middleware currently include the Everynet core API. To add your own provider, simply extend the module with `method.youprovider.myMethod()`. Set the `RPC_CLIENT_URL` key in the `.env` with the same value you gave to your network server provider as callback url for your app.

## Backend
If you are serving your app online, you will need to configure your web server to proxy requests to nodejs and sockets.io to listen to live rpc calls.

## Improvements

- allow programmation of several devices at the same time
- Move controllers to /controllers
- Make db get
- Make simple token auth
- migrate data from file to mongo
- put legend and labels on graphs
- ...
