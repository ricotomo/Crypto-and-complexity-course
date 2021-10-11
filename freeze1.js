//based on https://github.com/mruddy/bip65-demos/blob/master/freeze.js

'use strict';
//sets how long funds are frozen
const LOCK_UNTIL_BLOCK = 150; 
//uses the script from previous exercise to read in arguments
const args = require('./args-regtest.js');
const bitcore = require('bitcore-lib');

bitcore.Networks.defaultNetwork = bitcore.Networks.testnet; 

const privKey = bitcore.PrivateKey(bitcore.crypto.BN.One);
//redeemscript implements OP_CHECKLOCKVERIFY
const redeemScript = bitcore.Script.empty()
  .add(bitcore.crypto.BN.fromNumber(LOCK_UNTIL_BLOCK).toScriptNumBuffer())
  .add('OP_CHECKLOCKTIMEVERIFY').add('OP_DROP')
  .add(bitcore.Script.buildPublicKeyHashOut(privKey.toAddress()));
//generate p2sh address from redeemscript
const p2shAddress = bitcore.Address.payingTo(redeemScript);
//freeze funds by sending utxo to another frozen address
const freezeTransaction = new bitcore.Transaction().from({
  txid: args.txid, 
  vout: Number(args.vout), 
  scriptPubKey: args.scriptPubKey, 
  satoshis: Number(args.satoshis),
})
.to(p2shAddress, Number(args.satoshis) - 100000)
.sign(privKey);
//generic spend transaction 
const getSpendTransaction = function(lockTime, sequenceNumber) {
  const result = new bitcore.Transaction().from({
    txid: freezeTransaction.id,
    vout: 0,
    scriptPubKey: redeemScript.toScriptHashOut(),
    satoshis: Number(args.satoshis) - 100000,
  })
  
  .to(privKey.toAddress(), Number(args.satoshis) - 200000)
  .lockUntilBlockHeight(lockTime);
  
  result.inputs[0].sequenceNumber = sequenceNumber;
//scriptSig to unlock
  const signature = bitcore.Transaction.sighash.sign(
    result,
    privKey,
    bitcore.crypto.Signature.SIGHASH_ALL,
    0,
    redeemScript
  );

  result.inputs[0].setScript(
    bitcore.Script.empty()
    .add(signature.toTxFormat())
    .add(privKey.toPublicKey().toBuffer())
    .add(redeemScript.toBuffer())
  );

  return result;
};
//valid
const spendTransaction = getSpendTransaction(LOCK_UNTIL_BLOCK, 0);
//invalid
const brokenSpendTransaction = getSpendTransaction(LOCK_UNTIL_BLOCK, 0xffffffff);

const result = {
  fromAddress: privKey.toAddress().toString(),
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
