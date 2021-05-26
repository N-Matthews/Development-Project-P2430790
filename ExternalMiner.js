//Imitates connecting node for decentralized random number generation
const { SHA3 } = require('sha3');//calls the SHA3 hashing function

class RNum2 {//RNum2 class is initialized - generates random number pool
    numb(numberGenerator){//numb method is initalized for creating an unique random number
        var numberGenerator = function(array){//sets variable to contain array 
            if (array.length >= 520) return;//sets the maximum for the array's length
            let ChosenNumber = Math.floor(Math.random() * 520 + 1);//fills array with random numbers within range
            if (array.indexOf(ChosenNumber) < 0){//condition for adding new number to array
            array.push(ChosenNumber);//pushes new number into array
            }
        }
    numberGenerator(array);//numberGenerator contains array contents
    }
    hashing(shar2){//hashing method is initalized 
        shar2 = new SHA3(512);//creates SHA3 parameter for shar2 
        shar2.update(this.numberGenerator).toString();//provides shar2 random number pool
        shar2.digest('binary');//converts inputs to binary
    }
}
class rawnum2 {//rawnum2 class is created for directly sending the unhashed contents to the Local miner 
    r2(){//r2 method is created
    r2 = (numberGenerator);//r2 gains the value from the external miner's unhashed random number pool
    }
}

module.exports.RNum2 = RNum2;//exports RNum class to LocalMiner
module.exports.rawnum2 = rawnum2;//exports rawnum2 class to LocalMiner