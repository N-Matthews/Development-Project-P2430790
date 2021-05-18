const {Blockchain, Transaction} = require('./Blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const myKey= ec.keyFromPrivate('e5027ddb8d7aeadd0d4de83f9f5eb4dcb599ed4e1fbee49ce754cdc7f08de333');
const myWalletAddress = myKey.getPublic('hex');
let NickChain = new Blockchain();
const TAction = new Transaction(myWalletAddress, 'public key goes here', 10);
TAction.signTransaction(myKey);
NickChain.addTransaction(TAction);

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question('Type Begin to start mining: ', choice => { 
    readline.close();

    if (choice === 'Begin'){
        console.log('\n Starting to mine...');
        NickChain.minePendingTransactions(myWalletAddress);
        console.log('\n Balance increase for UserOne:', NickChain.getBalanceOfAddress(myWalletAddress));
        console.log('The validity of NickChain is ' + NickChain.isChainValid());
    }
    if (choice !== 'Begin'){
        return false;
    }
});


