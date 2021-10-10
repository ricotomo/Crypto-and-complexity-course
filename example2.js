"use strict";
const LOCK_UNTIL_BLOCK = 115; // pick a block height above the current tip
const bitcore = require("bitcore-lib"); // bitcore-lib should be in the same folder as the js file
bitcore.Networks.defaultNetwork = bitcore.Networks.testnet;
var privateKey = new bitcore.PrivateKey();
var address = privateKey.toAddress();
var utxo = {
"txId" : "115e8f72f39fad874cfab0deed11a80f24f967a84079fb56ddf53ea02e308986",
"outputIndex" : 0,
"address" : "17XBj6iFEsf8kzDMGQk5ghZipxX49VXuaV",
"script" : "76a91447862fe165e6121af80d5dde1ecb478ed170565b88ac",
"satoshis" : 50000
};
var transaction = new bitcore.Transaction()
.from(utxo)
.to('1Gokm82v6DmtwKEB8AiVhm82hyFSsEvBDK', 15000)
.sign(privateKey);
console.log(JSON.stringify(transaction, null, 2));
//A standard transaction
