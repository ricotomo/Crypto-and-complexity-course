//args passed in other script txid, vout, scriptPubKey, satoshis
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


//redeem script generates p2shadress where we send the funds to to be frozen
const redeemScript = bitcore.Script.empty()
  .add(bitcore.crypto.BN.fromNumber(LOCK_UNTIL_BLOCK).toScriptNumBuffer())
  .add('OP_CHECKLOCKTIMEVERIFY').add('OP_DROP')
  .add(bitcore.Script.buildPublicKeyHashOut(privateKey.toAddress()));

const p2shAddress = bitcore.Address.payingTo(redeemScript);

//send to new adress frozen
//funds are sent from an existing UTXO to the UTXO that
// will be frozen. The frozen output will be a P2SH output based on a redeem
// script that uses the CHECKLOCKTIMEVERIFY (CLTV) opcode.
var freezeTransaction = new bitcore.Transaction()
  .from(utxo)
  .to(p2shAddress, 15000)
  .sign(privateKey);

//generic spend transaction
const getSpendTransaction = function(lockTime, sequenceNumber) {
  var utxo2= {
  "txId" : freezeTransaction.id,
  "outputIndex" : 0,
  "address" : "17XBj6iFEsf8kzDMGQk5ghZipxX49VXuaV",
  "script" :  redeemScript.toScriptHashOut(),
  "satoshis" : 50000
  };
  const result = new bitcore.Transaction()
   .from(utxo)
  // for testing we send the money back to first address
  .to(address,5000)
  // CLTV say the transaction needs to have block height greater than or equal to the argument I gave the redeem script
  .lockUntilBlockHeight(lockTime);
  // the CLTV opcode requires that the input sequence number is not finalized
  result.inputs[0].sequenceNumber = sequenceNumber;

  const signature = bitcore.Transaction.sighash.sign(
    result,
    privateKey,
    bitcore.crypto.Signature.SIGHASH_ALL,
    0,
    redeemScript
  );

  // setup the scriptSig of the spending transaction to spend the p2sh-cltv-p2pkh redeem script
  result.inputs[0].setScript(
    bitcore.Script.empty()
    .add(signature.toTxFormat())
    .add(privateKey.toPublicKey().toBuffer())
    .add(redeemScript.toBuffer())
  );

  return result;
};

//try to spend in broken way
//the CLTV rejects both the lower blockheight than the one we set and the sequence number
const brokenSpendTransaction = getSpendTransaction(110, 0xffffffff);


//try to spend valid
const spendTransaction = getSpendTransaction(LOCK_UNTIL_BLOCK, 0);

//output the result as per https://github.com/mruddy/bip65-demos/blob/master/freeze.js
const result = {
  fromAddress: privateKey.toAddress().toString(),
  p2shAddress: p2shAddress.toString(),
  redeemScript: redeemScript.toString(),
  freezeTransaction: {
    txid: freezeTransaction.id,
    raw: freezeTransaction.serialize(true),
  },
  spendTransaction: {
    txid: spendTransaction.id,
    raw: spendTransaction.serialize(true),
  },
  brokenSpendTransaction: {
    txid: brokenSpendTransaction.id,
    raw: brokenSpendTransaction.serialize(true),
  },
};

console.log(JSON.stringify(result, null, 2));

