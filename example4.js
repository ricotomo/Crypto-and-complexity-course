"use strict";
const LOCK_UNTIL_BLOCK = 150; // pick a block height above the current tip
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

var scriptPubKey = new bitcore.Script()
.add(bitcore.Opcode.OP_RIPEMD160)
.add(Buffer.from("3c92bdfea2bb5fd4e81cba44d3091c331d599090", "hex"))
.add(bitcore.Opcode.OP_EQUAL);

var output = new bitcore.Transaction.Output({
"satoshis": 85000000,
"script": scriptPubKey
});

var transaction = new bitcore.Transaction()
.from(utxo)
.addOutput(output)
.sign(privateKey);

console.log(JSON.stringify(transaction, null, 2));

