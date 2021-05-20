const { SHA3 } = require('sha3');//calls the SHA3 hashing function
const EC = require('elliptic').ec;//calls elliptic curve module
const ec = new EC('secp256k1');//hashing method from elliptic is chosen "secp256k1"

class Transaction{//Transaction class is initialised
    constructor (RecievingFrom, SendingTo, amount){//used to call the initalised property
        this.RecievingFrom = RecievingFrom;//Initialises RecievingFrom to Transaction class
        this.SendingTo = SendingTo;//Initialises SendingTo to Transaction class
        this.amount = amount;//Initialises amount to Transaction class
    }
    calculateHash(){//object calculateHash is initialised
        const hashvalue = new SHA3(512);//const hashvalue is assigned to create an SHA3 512bit digestion of given input(s)
        hashvalue.update(this.RecievingFrom + this.SendingTo + this.amount).toString();//provides hashvalue with inputs
        return hashvalue.digest('hex');//digests the inputs into making a 512 bit hash
    }
    signTransaction(signingkey){//object signTransaction is initialised
        if(signingkey.getPublic('hex') !== this.RecievingFrom){//Checks if the public hash address is not valid to the blockchain's hash
            throw new Error('Warning: Attempted signing of transaction for non-blockchain wallet!');//halts and prints warning
        }
        const TransHash = this.calculateHash();//assigns const value to call calculateHash method
        const ec = signingkey.sign(TransHash, 'base64');//calculates transaction hash from valid addresses
        this.signature = ec.toDER('hex');//signs signature with transaction SHA256 address hex value
    }
    ValidationTest(){//object ValidationTest is initialised
        if(this.RecievingFrom === null) return true;//Checks to see if there is an signature for the transaction
        if(!this.signature || this.signature.length === 0){//Checks to see if there is NOT an signature for the transaction
            throw new Error('Warning: Missing signature in this transaction!');//halts and prints warning
        }
        const publicKey = ec.keyFromPublic(this.RecievingFrom, 'hex');//publicKey is initialised to contain hash value in hex
        return publicKey.verify(this.calculateHash(), this.signature);//publicKey verifies calculatedHash object with the inherited signature
    }
}
class Block {//Block class is initialised
    constructor (timestamp, transactions, previousHash = ''){//assigns the possible creation of new timestamps, transactions and previoushashes
        this.timestamp = timestamp;//Initialises timestamp to Block class
        this.transactions = transactions;//Initialises transactions to Block class
        this.previousHash = previousHash;//Initialises previousHash to Block class
        this.hash = this.calculateHash();//Initialises hash to Block class with the value made from object calculateHash
        this.nonce = 0;//Initialises nonce to Block class with the value of 0
    }
    calculateHash(){//object calculateHash is initialised
        const hashvalue = new SHA3(512);//const hashvalue is assigned to create an SHA3 512bit digestion of given input(s)
        hashvalue.update(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();//provides hashvalue with inputs
        return hashvalue.digest('hex');//digests the inputs into making a 512 bit hash
    }
    mineBlock(difficulty){//object mineBlock is initialised
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){//generates input for block by looping until the difficulty is equal to that of the array
            this.nonce++;//increases the value of nonce by one
            this.hash = this.calculateHash();//assigns hash with the block's hash value
        }
        console.log("Blocks mined: " + this.hash);//prints the block's hash value
    }
    hasValidTransactions(){//object hasValidTransactions is initialised
        for(const Test of this.transactions){//is called until the transaction signature is existent 
            if(!Test.ValidationTest()){//Checks if the block has a signature
                return false;//returns false to represent the block has no signature
            }
        }
        return true;//returns true to show the block is authentically signed
    }
}
class Blockchain {//Blockchain class is initialised
    constructor(){//assigns no new values for called properties
        this.chain = [this.createGenesisBlock()];//begins the Blockchain with the genesis block
        this.difficulty = 3;//sets value to difficulty (influences times looped *generation time*)
        this.pendingTransactions = [];//assigns empty array - ensures blocks are mined one at a time
        this.miningReward = 50;//reward value given to miner
    }
    createGenesisBlock(){//object createGenesisBlock is initialised
        return new Block("11.05.2021", "GenesisBlock", "0");// defines the GenesisBlock's date of creation, ID and index position
    }
    getLatestBlock(){//object getLatestBlock is initialised
        return this.chain[this.chain.length - 1];//moves the index of the array onto the genesis block (required for first mined block)
    }
    minePendingTransactions(miningRewardAddress){//object minePendingTransactions is initialised
        const TActionReward = new Transaction(null, miningRewardAddress, this.miningReward);//determines the value of TActionReward (transaction reward) to contain the wallet address (hash) and reward 
        this.pendingTransactions.push(TActionReward);//set to wait for the pending transaction for validation by containing the miners public hash and reward
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);//initialises the new block's smart properties (when mined, asigns to awaiting validation (pending transactions) and previous hash value)
        block.mineBlock(this.difficulty);//assigns the loop value for the block to become available to validate
        this.chain.push(block);//inserts block into chain 
        this.pendingTransactions = [];//resets pendingTransactions to be empty
        console.log('Block mined successfully!');//prints to kernel
    }
    addTransaction(transaction){//object addTransaction is initialised
        if(!transaction.RecievingFrom || !transaction.SendingTo){//checks to see if there are allocated addresses
            throw new Error('Transaction missing sender and reciever wallet');//halts and prints warning
        }
        if(!transaction.ValidationTest){//transaction fails to comply with ValidationTest object methods
            throw new Error('Cannot add invalid transaction to NickChain!');//halts and prints warning
        }
        this.pendingTransactions.push(transaction);//adds pending transactions to array
    }
    getBalanceOfAddress(address){//object getBalanceOfAddress is initialised
        let balance = 0;//declares balance with the value of 0 only usable within the getBalanceOfAddress object
        for(const block of this.chain){//views properties of the chain
            for(const trans of block.transactions){//continues once checked against addTransaction object 
                if(trans.RecievingFrom === address){//compares value of RecievingFrom to address
                    balance -= trans.amount;//balance value is decreased for validator
                }
                if(trans.SendingTo === address){//compares value of validator 
                    balance += trans.amount;//balance value is increased for miner
                }
            }
        }
        return balance;//updates balance
    }
    isChainValid(){//object isChainValid is initialised
        for(let i = 1; 1 < this.chain.length; i++){//moves through the chain until i (index position) is equal to the length
            const currentBlock = this.chain[i];//assigns block from blockchain value of i
            const previousBlock = this.chain[i - 1];//assigns block prior to the current block selected
            if(!currentBlock.hasValidTransactions()){//checks if the current block selected has failed to meet hasValidTransaction object methods
                return false;//prints false
            }
            if(currentBlock.hash !== currentBlock.calculateHash()){//checks if the current block hash is not equal to current block being ran through calculateHash
                return false;//prints false
            }
            if(currentBlock.previousHash !== previousBlock.hash){//checks if the current block selected has failed to meet hasValidTransaction object methods
                return false;//prints false
            }
        return true;//prints true
            }
        }
    }
module.exports.Blockchain = Blockchain;//exports Blockchain class
module.exports.Transaction = Transaction;//exports Transaction class
