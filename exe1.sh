#!/bin/bash
#Setup
REGTEST_DIR=~/.bitcoin;
BITCOIN_D=~/Bitcoin/bitcoin-0.20.1/bin/bitcoind;
BITCOIN_CLI=~/Bitcoin/bitcoin-0.20.1/bin/bitcoin-cli;
NODEJS=nodejs;

#Exercise 1
A=$($BITCOIN_CLI -regtest  getnewaddress);
echo $A;
B=$($BITCOIN_CLI -regtest  getnewaddress);
echo $B;
$BITCOIN_CLI -regtest generatetoaddress 101 $A;
$BITCOIN_CLI  -regtest sendtoaddress $B 10 true;
$BITCOIN_CLI -regtest generatetoaddress 101 $A;
#echo $($BITCOIN_CLI -regtest getreceivedbyaddress $B);
#echo $($BITCOIN_CLI -regtest getbalances);
$BITCOIN_CLI -regtest listaddressgroupings;

#Exercise 2
#A=$($BITCOIN_CLI -regtest  getnewaddress);
#B=$($BITCOIN_CLI -regtest  getnewaddress);
#$BITCOIN_CLI -regtest generatetoaddress 101 $A;
OUTPUT=$($BITCOIN_CLI -regtest listunspent 6 9999999 "[\"$A\"]")
#3.3.4.a
UNSPENT=$(echo $OUTPUT|python3 -c '
import json,sys;
obj=json.loads(sys.stdin.read());
print(obj[0]);
');
echo $UNSPENT;
#3.3.4.b
TXID=$(echo $OUTPUT|python3 -c '
import json,sys;
obj=json.loads(sys.stdin.read());
print(obj[0]["txid"]);
');
echo $TXID;
#3.3.4.c
VOUT=$(echo $OUTPUT|python3 -c '
import json,sys;
obj=json.loads(sys.stdin.read());
print(obj[0]["vout"]);
');
echo $VOUT;

#3.3.4.d
PUBKEY=$(echo $OUTPUT|python3 -c '
import json,sys;
obj=json.loads(sys.stdin.read());
print(obj[0]["scriptPubKey"]);
');
echo $PUBKEY;
