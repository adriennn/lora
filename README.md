# Readme

## Getting started

This tool is a work in progress. Use this to receive and test rpc calls from IOT network servers and visualize data. It requires mongodb for certain command persistence and data dumps as well as redis for command queues. The below assumes you have nodejs installed (tested with 7.10.1 and 8.5.0). First run `npm i`.

if you are using pm2, you can simply do: `npm start`

Else from the root directory of the app type: `node ./www/bin`

visit `localhost:PORT/lora` in your webrowser and you can send receive RPC and make manual RCP calls.

## .ENV file

You will need to have an `.env` file with the following:

```
RPC_CLIENT_URL=.../lora/rpc
IO_URL=...
WS_URL=...
MONGO_URL=mongodb:...
REDIS_URL=...
REDIS_PORT=...
ONEMTOM_URL=http://1m2m.eu/services/GETPAYLOAD?Human=0&PL=
NODE_ENV=(development | production)
PORT=...
```

## LoraWAN Network Server providers
Supported methods in the `methods`middleware currently include the Everynet core API. To add your own provider, simply extend the module with `method.youprovider.myMethod()`. Set the `RPC_CLIENT_URL` key in the `.env` with the same value you gave to your network server provider as callback url for your app.

## Backend
If you are serving your app online, you will need to configure your web server to proxy requests to nodejs and sockets.io to listen to live rpc calls.

## TODO

- rewrite promises with `await` where applicable
- put middlewares and controllers in their own folder and rename to index.js to load them with require(./path/to/folder)
- Move controllers to /controllers
- Make db get
- Make token auth
