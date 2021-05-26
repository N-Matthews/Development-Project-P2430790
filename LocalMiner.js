const {RNum2, rawnum2} = require('./ExternalMiner');//calls the RNum and rawnum2 class from ExternalMiner.js
const { SHA3 } = require('sha3');//calls the SHA3 hashing function
const EC = require('elliptic').ec;//calls elliptic curve module
const ec = new EC('secp256k1');//hashing method from elliptic is chosen "secp256k1"
let r2 = new rawnum2();//sets r2 with the unhashed decimal value from external miner
let shar2 = new RNum2();//sets shar2 with the hashed value from external miner


class Transaction{//Transaction class is initialized
    constructor (RecievingFrom, SendingTo, amount, randomnum, r1){//used to call the initalised property
        this.RecievingFrom = RecievingFrom;//Initializes RecievingFrom to Transaction class
        this.SendingTo = SendingTo;//Initializes SendingTo to Transaction class
        this.amount = amount;//Initializes amount to Transaction class
        this.numberGenerator1 = this.numberGenerator1;//Initializes numberGenerator1 (host number generator) to Transaction class
        this.randomnum = randomnum;//Initializes randomnum to Transaction class
        this.r1 = r1;//Initializes r1 (hosts unhashed generated number) to Transaction class
    }
    calculateHash(){//method calculateHash is initialized
        let numberGenerator1 = function(array){//sets numberGenerator1 to contain the local miner's array
            if (array.length >= 520) return;//sets the maximum for the array's length
            let ChosenNumber = Math.floor(Math.random() * 520 + 1);//fills array with random numbers within range
            if (array.indexOf(ChosenNumber) < 0){//condition for adding new number to array
            array.push(ChosenNumber);//pushes new number into array
            }
        numberGenerator1(array);//numberGenerator contains array contents
        r1 = (this.numberGenerator).toString();//sets r1 to contain local miner unhashed random number pool
        const shar1 =  new SHA3(512);//creates SHA3 parameter for shar1 
        shar1.update(r1);//provides shar1 random number pool
        shar1.digest('binary');//converts inputs to binary
        const vr2 = new SHA3 (512);//creates SHA3 parameter for vr2 
        vr2.update(r2);//provides vr1 random number pool
        vr2.digest('binary');//converts inputs to binary
        if(vr2 == shar2){//checks if the sha output provided from the external node is the same as the sha output from the locally converted raw number pool
            randomnum = r1 ^ r2//performs an binary XOR operation if the validation check is successfull
        if(vr2 != shar2){//checks if the hashed number from external miner fails to match hashed number made locally from same unhashed number
            return false;//if the validation check fails, returns false
        }
        }
        }
        const hashvalue = new SHA3(512);//const hashvalue is assigned to create an SHA3 512bit digestion of given input(s)
        hashvalue.update(this.randomnum + this.RecievingFrom + this.SendingTo + this.amount).toString();//provides hashvalue with inputs
        return hashvalue.digest('hex');//digests the inputs into making a 512 bit hash
    }
    signTransaction(signingkey){//method signTransaction is initialized
        if(signingkey.getPublic('hex') !== this.RecievingFrom){//Checks if the public hash address is not valid to the blockchain's hash
            throw new Error('Warning: Attempted signing of transaction for non-blockchain wallet!');//halts and prints warning
        }
        const TransHash = this.calculateHash();//assigns const value to call calculateHash method
        const ec = signingkey.sign(TransHash, 'base64');//calculates transaction hash from valid addresses
        this.signature = ec.toDER('hex');//signs signature with transaction SHA256 address hex value
    }
    ValidationTest(){//method ValidationTest is initialized
        if(this.RecievingFrom === null) return true;//Checks to see if there is an signature for the transaction
        if(!this.signature || this.signature.length === 0){//Checks to see if there is NOT an signature for the transaction
            throw new Error('Warning: Missing signature in this transaction!');//halts and prints warning
        }
        const publicKey = ec.keyFromPublic(this.RecievingFrom, 'hex');//publicKey is initialized to contain hash value in hex
        return publicKey.verify(this.calculateHash(), this.signature);//publicKey verifies calculatedHash object with the inherited signature
    }
}
class Block {//Block class is initialized
    constructor (timestamp, transactions, previousHash = ''){//assigns the possible creation of new timestamps, transactions and previoushashes
        this.timestamp = timestamp;//Initializes timestamp to Block class
        this.transactions = transactions;//Initializes transactions to Block class
        this.previousHash = previousHash;//Initializes previousHash to Block class
        this.hash = this.calculateHash();//Initializes hash to Block class with the value made from object calculateHash
        this.nonce = 0;//Initializes nonce to Block class with the value of 0
    }
    calculateHash(){//method calculateHash is initialized

        const hashvalue = new SHA3(512);//const hashvalue is assigned to create an SHA3 512bit digestion of given input(s)
        hashvalue.update(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();//provides hashvalue with inputs
        return hashvalue.digest('hex');//digests the inputs into making a 512 bit hash
    }
    mineBlock(difficulty){//method mineBlock is initialized
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){//generates input for block by looping until the difficulty is equal to that of the array
            this.nonce++;//increases the value of nonce by one
            this.hash = this.calculateHash();//assigns hash with the block's hash value
        }
        console.log("Blocks mined: " + this.hash);//prints the block's hash value
    }
    hasValidTransactions(){//method hasValidTransactions is initialized
        for(const Test of this.transactions){//is called until the transaction signature is existent 
            if(!Test.ValidationTest()){//Checks if the block has a signature
                return false;//returns false to represent the block has no signature
            }
        }
        return true;//returns true to show the block is authentically signed
    }
}
class Blockchain {//Blockchain class is initialized
    constructor(){//assigns no new values for called properties
        this.chain = [this.createGenesisBlock()];//begins the Blockchain with the genesis block
        this.difficulty = 3;//sets value to difficulty (influences times looped *generation time*)
        this.pendingTransactions = [];//assigns empty array - ensures blocks are mined one at a time
        this.miningReward = 50;//reward value given to miner
    }
    createGenesisBlock(){//method createGenesisBlock is initialized
        return new Block("11.05.2021", "GenesisBlock", "0");// defines the GenesisBlock's date of creation, ID and index position
    }
    getLatestBlock(){//method getLatestBlock is initialized
        return this.chain[this.chain.length - 1];//moves the index of the array onto the genesis block (required for first mined block)
    }
    minePendingTransactions(miningRewardAddress){//method minePendingTransactions is initialized
        const TActionReward = new Transaction(null, miningRewardAddress, this.miningReward);//determines the value of TActionReward (transaction reward) to contain the wallet address (hash) and reward 
        this.pendingTransactions.push(TActionReward);//set to wait for the pending transaction for validation by containing the miners public hash and reward
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);//initializes the new block's smart properties (when mined, asigns to awaiting validation (pending transactions) and previous hash value)
        block.mineBlock(this.difficulty);//assigns the loop value for the block to become available to validate
        this.chain.push(block);//inserts block into chain 
        this.pendingTransactions = [];//resets pendingTransactions to be empty
        console.log('Block mined successfully!');//prints to kernel
    }
    addTransaction(transaction){//method addTransaction is initialized
        if(!transaction.RecievingFrom || !transaction.SendingTo){//checks to see if there are allocated addresses
            throw new Error('Transaction missing sender and reciever wallet');//halts and prints warning
        }
        if(!transaction.ValidationTest){//transaction fails to comply with ValidationTest object methods
            throw new Error('Cannot add invalid transaction to NickChain!');//halts and prints warning
        }
        this.pendingTransactions.push(transaction);//adds pending transactions to array
    }
    getBalanceOfAddress(address){//method getBalanceOfAddress is initialized
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
    isChainValid(){//method isChainValid is initialized
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