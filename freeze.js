"use strict"
const bitcore = require("bitcore-lib");
bitcore.Networks.defaultNetwork = bitcore.Networks.testnet;
const LOCK_UNTIL_BLOCK = 150;

var privateKey = new bitcore.PrivateKey();

var address = privateKey.toAddress();

var utxo = {
  "txId" : "115e8f72f39fad874cfab0deed11a80f24f967a84079fb56ddf53ea02e308986",
  "outputIndex" : 0,
  "address" : "17XBj6iFEsf8kzDMGQk5ghZipxX49VXuaV",
  "script" : "76a91447862fe165e6121af80d5dde1ecb478ed170565b88ac",
  "satoshis" : 50000
};

//redeem script
//var scriptPubKey = new bitcore.Script()
//.add(bitcore.Opcode.OP_CHECKLOCKTIMEVERIFY).add('OP_DROP')
//.add(bitcore.Script.buildPublicKeyHashOut(privKey.toAddress()));

//redeem script generates p2shadress where we send the funds to to be frozen
const redeemScript = bitcore.Script.empty()
  .add(bitcore.crypto.BN.fromNumber(LOCK_UNTIL_BLOCK).toScriptNumBuffer())
  .add('OP_CHECKLOCKTIMEVERIFY').add('OP_DROP')
  .add(bitcore.Script.buildPublicKeyHashOut(privKey.toAddress()));

const p2shAddress = bitcore.Address.payingTo(redeemScript);

//send to new adress frozen
//funds are sent from an existing UTXO to the UTXO that
// will be frozen. The frozen output will be a P2SH output based on a redeem
// script that uses the CHECKLOCKTIMEVERIFY (CLTV) opcode.
var freezeTransaction = new bitcore.Transaction()
  .from(utxo)
  .to(p2shAddress, 15000)
  .sign(privateKey);

//try to spend in broken way
var utxo_invalid= {
  "txId" : freezeTransaction.id,
  "outputIndex" : 0,
  "address" : "17XBj6iFEsf8kzDMGQk5ghZipxX49VXuaV",
  "script" :  redeemScript.toScriptHashOut(),
  "satoshis" : 50000
};

var result = new bitcore.Transaction()
        .from(utxo_invalid)
        .to(address, 5000)
        .lockUntilBlockheight(LOCK_UNTIL_BLOCK);


//try to spend valid
var utxo_valid= {
  "txId" : freezeTransaction.id,
  "outputIndex" : 0,
  "address" : "17XBj6iFEsf8kzDMGQk5ghZipxX49VXuaV",
  "script" :  redeemScript.toScriptHashOut(),
  "satoshis" : 50000
};

var result = new bitcore.Transaction()
	.from(utxo_valid)
	.to(address, 5000)
	.lockUntilBlockheight(LOCK_UNTIL_BLOCK);

