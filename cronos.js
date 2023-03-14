/* Cronos.Cash Sync/Desync
   by @Big Onion#2519 (discord) or @bigonionbots (twitter)

   To use this script, you will need:
     1) install nodejs
     2) install the ethers.js package for nodejs
     3) rename and edit the config.json file with your mnemonic phrase
     4) optionally set up the safe wallet transfer
     5) add to a cron job to be repeated

*/

// This is the javascript package that interacts with EVM compatible chains
// ethers.js v6 should install by default. Earlier versions will not work with this code.
// You can check which version installed by looking at the package.json file.
const ethers = require('ethers');

// Your mnemonic is kept in a separate file.
// Rename config.json.sample to config.json and enter your mnemonic.
// MAKE SURE WHERE YOU ARE INSTALLING THIS SCRIPT IS SECURE.
const config = require('./config.json');

// This block of code is to initialize and process arguments, allowing for:
//    -d for desync
//    -s for sync
const { parseArgs } = require('node:util');
const args = process.argv.slice(2);
const { values: { syncFlag, desyncFlag } } = parseArgs({
        options: {
                syncFlag: { type: "boolean", short: "s" },
                desyncFlag: { type: "boolean", short: "d" }
        }
});

// This array defines the functions used in the contract. 
// syncTKeepers needs an address as an optional argument
const abi = [
		"function syncTKeepers(address ref)",
		"function desyncTime()",
        ];

// You can use any provider, but I find evm.cronos.org to be the most reliable.
const provider = new ethers.JsonRpcProvider("https://evm.cronos.org/");

// Reads the mnemonic from your config.json, establishes signer authority for your wallet with the provider above.
const signer = ethers.Wallet.fromPhrase(config.mnemonic, provider);

// Address of the Cronos.Cash contract
const ccContract = '0x024eAd51db58965CC22bdF5d2794371A69593EE9';
// Address of your referral.
const ccReferral = ''; // address of referral


// Function that will call the syncTKeepers contract function
async function sync() {
	// Declare contract object for signing the transaction.
	const contract = new ethers.Contract(ccContract, abi, signer);

	// Send the signed transaction to the blockchain.
	const tx = await contract.syncTKeepers(ccReferral).catch(e=>console.error(e));
	console.log(`cronos.cash: syncTKeepers submitted in txn ${tx.hash} from ${tx.from} to ${tx.to}`);

	// Wait for the transaction to be submitted, get a receipt that confirms it.
	const receipt = await tx.wait().catch(e=>console.error(e));

	// Use the transaction receipt information to calculate the fee spent on the transaction.
	// NOTE: There are methods to limit gas spent. You can read up on the ethers.js documentation to find out how to do this. 
	const fee = parseInt(receipt.gasUsed) * parseInt(receipt.gasPrice) * Math.pow(10,-18);
	console.log(`cronos.cash: receipt received, confirmed in block ${receipt.blockNumber}, total fee of ${fee.toFixed(8)} CRO`);
}

// Function that will call the desyncTime contract function
async function desync() {
	// Declare contract objects, one for reading and one for signing
	const contract = new ethers.Contract(ccContract, abi, signer);

	// Submit a signed transaction that calls the desyncTime() function from the Cronos.Cash contract.
	const tx = await contract.desyncTime().catch(e=>console.error(e));
	console.log(`cronos.cash: desyncTime submitted in txn ${tx.hash} from ${tx.from} to ${tx.to}`);

	// Wait for the transaction to be submitted, and get a receipt that confirms it.
	const receipt = await tx.wait().catch(e=>console.error(e));

	// Use the receipt information to get gasUsed and gasPrice and convert to CRO to come up with the transaction fee total.
	const fee = parseInt(receipt.gasUsed) * parseInt(receipt.gasPrice) * Math.pow(10,-18);
	console.log(`cronos.cash: receipt received, confirmed in block ${receipt.blockNumber}, total fee of ${fee.toFixed(8)} CRO`);

	// Unfortunately, there is no easy way to see the amount received using information directly from the blockchain since the
	// transactions (three fee amounts and the total amount to your wallet) were made by the contract.
}

async function main() {
	// Check the arguments and act based on which argument received.
	if (args.length == 0) {
		console.log('no arguments. use -d to desync and -s to sync');
	} else  if (args.length > 1) {
		console.log('too many arguments. use -d to desync and -s to sync');
	} else if (args.length ==1 && syncFlag) {
		await sync();
	} else if (args.length ==1 && desyncFlag) {
		await desync();
	} else {
		console.log('error running script');
	}
}

// Run the main function
main();

