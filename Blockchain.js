const { SHA3 } = require('sha3');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction{
    constructor (RecievingFrom, SendingTo, amount){
        this.RecievingFrom = RecievingFrom;
        this.SendingTo = SendingTo;
        this.amount = amount;
    }
    calculateHash(){
        const hashvalue = new SHA3(512);
        hashvalue.update(this.RecievingFrom + this.SendingTo + this.amount).toString();
        return hashvalue.digest('hex');
    }
    signTransaction(signingkey){
        if(signingkey.getPublic('hex') !== this.RecievingFrom){
            throw new Error('Warning: Attempted signing of transaction for non-local wallet!');
        }
        const TransHash = this.calculateHash();
        const ec = signingkey.sign(TransHash, 'base64');
        this.signature = ec.toDER('hex');
    }
    ValidationTest(){
        if(this.RecievingFrom === null) return true;
        if(!this.signature || this.signature.length === 0){
            throw new Error('Warning: Missing signature in this transaction!');
        }
        const publicKey = ec.keyFromPublic(this.RecievingFrom, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}
class Block {
    constructor (timestamp, transactions, previousHash = ''){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }
    calculateHash(){
        const hashvalue = new SHA3(512);
        hashvalue.update(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
        return hashvalue.digest('hex');
    }
    mineBlock(difficulty){
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Blocks mined: " + this.hash);
    }
    hasValidTransactions(){
        for(const Test of this.transactions){
            if(!Test.ValidationTest()){
                return false;
            }
        }
        return true;
    }
}
class Blockchain {
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 3;
        this.pendingTransactions = [];
        this.miningReward = 50;
    }
    createGenesisBlock(){
        return new Block("11.05.2021", "GenesisBlock", "0");
    }
    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }
    minePendingTransactions(miningRewardAddress){
        const TActionReward = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(TActionReward);
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);
        console.log('Block mined successfully!');
        this.chain.push(block);
        this.pendingTransactions = [];
    }
    addTransaction(transaction){
        if(!transaction.RecievingFrom || !transaction.SendingTo){
            throw new Error('Transaction missing sender and reciever wallet');
        }
        if(!transaction.ValidationTest){
            throw new Error('Cannot add invalid transaction to NickChain!');
        }
        this.pendingTransactions.push(transaction);
    }
    getBalanceOfAddress(address){
        let balance = 0;
        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.RecievingFrom === address){
                    balance -= trans.amount;
                }
                if(trans.SendingTo === address){
                    balance += trans.amount;
                }
            }
        }
        return balance;
    }
    isChainValid(){
        for(let i = 1; 1 < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
            if(!currentBlock.hasValidTransactions()){
                return false;
            }
            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }
            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }
        return true;
            }
        }
    }
module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;