const hre = require("hardhat");
const ethers = require("ethers");

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const accounts = await provider.send("eth_accounts", []);
  
  const owner1 = new ethers.Wallet(accounts[0], provider);
  const owner2 = new ethers.Wallet(accounts[1], provider);
  const owner3 = new ethers.Wallet(accounts[2], provider);
  
  const owners = [await owner1.getAddress(), await owner2.getAddress(), await owner3.getAddress()];
  const numConfirmationsRequired = 2;
  
  console.log("Deploying MultiSigWallet with:");
  console.log("Owners:", owners);
  console.log("Required confirmations:", numConfirmationsRequired);
  
  const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet", owner1);
  const multiSig = await MultiSigWallet.deploy(owners, numConfirmationsRequired);
  await multiSig.waitForDeployment();
  
  console.log("MultiSigWallet deployed to:", await multiSig.getAddress());
}

main().catch(console.error);
