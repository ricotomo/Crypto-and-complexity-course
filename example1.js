"use strict";
const LOCK_UNTIL_BLOCK = 150; // pick a block height above the current tip
const bitcore = require("bitcore-lib"); // bitcore-lib should be in the same folder as the js file
bitcore.Networks.defaultNetwork = bitcore.Networks.testnet;
var privateKey = new bitcore.PrivateKey();
var address = privateKey.toAddress();
console.log(privateKey);
console.log(address);
//Just to get started with bitcore-lib
