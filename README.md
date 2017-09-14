# Readme

## Getting started

This tool is still a work in progress. Use this to test rpc calls and do other kind of things. The below assumes you have node installed.

Clone the repo and cd to the root directory of the app and type:

```
npm i
```

if you have it, launch the app with pm2:

```
npm start
```

or from the root directory fo the app, simply type:

```
node ./www/bin
```

visit `localhost:5000/lora` in your webrowser and test some stuff.

Visit the url `/lora/:dev_eui` where `:dev_eui` is the value of the device unique id for which you recorded your command.
