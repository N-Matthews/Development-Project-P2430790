const EC = require('elliptic').ec;//calls elliptic curve module
const ec = new EC('secp256k1');//hashing method from elliptic is chosen "secp256k1"
const key = ec.genKeyPair();//const key calls upon a method to generating keys in a sha256 format
const pubkey = key.getPublic('hex');//const pubkey is assigned an sha256hex public key value
const privkey = key.getPrivate('hex');//const privkey is assigned an sha256hex private key value
console.log('Private key : ', privkey);//prints into the kernel the private key value 
console.log('Public key : ', pubkey);//prints into the kernel the public key value

//Once installed on a machine, run Keyforging.js
//Replace the following lines with the output provided

//Private key :  83ed8e0ffcd4d864106ab773571233f22c7215b2af5d41690ddd6aff0680304c
//Public key :  046ddac7b630441af36caeb843917a1cf4273230f41530dc9a3bdd8042713a0b3e8260b2e02c9b211cd4f3ae73873ed408c2e0d67fa222530e7ad2245d32f4ac13