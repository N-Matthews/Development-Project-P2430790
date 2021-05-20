const {Blockchain, Transaction} = require('./Blockchain');//calls the Blockchain and Transaction classes from Blockchain.js
const EC = require('elliptic').ec;//calls elliptic curve module
const ec = new EC('secp256k1');//hashing method from elliptic is chosen "secp256k1"
const myKey= ec.keyFromPrivate('83ed8e0ffcd4d864106ab773571233f22c7215b2af5d41690ddd6aff0680304c');//private key to be inserted here once generated
const myWalletAddress = myKey.getPublic('hex');//myWalletAddress is assigned the public key hash equivilent 
var cost = 20;//declares PoW user cost for validation checks
let NickChain = new Blockchain();//declares NickChain as a variable to inherit the Blockchain creations
const TAction = new Transaction(myWalletAddress, '046ddac7b630441af36caeb843917a1cf4273230f41530dc9a3bdd8042713a0b3e8260b2e02c9b211cd4f3ae73873ed408c2e0d67fa222530e7ad2245d32f4ac13', cost);//public key to be inserted here once generated
TAction.signTransaction(myKey);//signs the transaction with private key
NickChain.addTransaction(TAction);//adds the signed transaction to the array

const readline = require('readline').createInterface({//initialises an user interface in the kernel
    input: process.stdin,//requires an input following readline being called
    output: process.stdout//allows process to write output
});

readline.question('Type Begin to start mining: ', choice => { //prints the command for the user to initiate the process
    readline.close();//exits the process

    if (choice === 'Begin'){//condition that choice input is exactly "Begin"
        console.log('\n Starting to mine...');//prints in new line
        NickChain.minePendingTransactions(myWalletAddress);//verifies the block with given hashes
        console.log('The validity of NickChain is ' + NickChain.isChainValid());//provides an validity check answer of the entire blockchain for the user
        if (cost === 20){//if cost of Proof of work is equal to the balance of miner is shown
            console.log('\n Balance increase for User:', NickChain.getBalanceOfAddress(myWalletAddress));//prints balance of user wallet
            console.log('The sent funds from the PoW validiation: '+ cost);//displays the proof of work cost from the miner
            return true;//ends the user interface as all operations have been conducted
        }
        if (cost !== 20){//checks proof of work is not equal to 20
            console.log('Proof of work reward modified');//warning to user
            return false//ends user interface after warning message 
        }
    }
    if (choice !== 'Begin'){//will cancel the function if input is not equal to "Begin"
        return false;//ends function
    }
});
