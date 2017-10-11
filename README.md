# Readme

## Getting started

This tool is a work in progress. Use this to test rpc calls and visualize data. It uses `node-cache` for certain command persistence and redis for queues. The below assumes you have node installed.

```
npm i
```

if you are using pm2, you can simply do:

```
npm start
```

Else from the root directory of the app type:

```
node ./www/bin
```

visit `localhost:5000/lora` in your webrowser and you can send receive RPC and make manual RCP calls.

## ENV file

Note that you will need to have a `.env` file with the following:

```
CLIENT_URL=http://127.0.0.1:5000/lora/rpc
IO_CONNECT=http://127.0.0.1:5000
NODE_ENV=development
PORT=5000
QUEUE_KEY=YOUR_REDIS_SECRET_IF_ANY
```

## LoraWAN Network Server providers
Supported methods in the `methods`middleware currently include the Everynet core API. To add your own provider, simply extend the module `method.youprovider.methodA()`. Set the `CLIENT_URL` key in the `.env` with the same value you gave to your network server provider as callback url for your app.

## Backend
If you are serving your app online, you will need to configure your web server to proxy requests to sockets.ioin addition to node to listen to live rpc calls.

## TODO

Move controllers to /controllers
Make DB set / get
Make token auth
