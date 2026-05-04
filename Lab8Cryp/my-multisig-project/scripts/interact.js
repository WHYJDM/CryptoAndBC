const hre = require("hardhat");
const ethers = require("ethers");

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const accounts = await provider.send("eth_accounts", []);
  
  const owner1 = new ethers.Wallet(accounts[0], provider);
  const owner2 = new ethers.Wallet(accounts[1], provider);
  const addr1 = new ethers.Wallet(accounts[4], provider);
  
  const multiSigAddress = "0x..."; // Replace with deployed address
  const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet", owner1);
  const multiSig = MultiSigWallet.attach(multiSigAddress);
  
  console.log("=== MultiSig Wallet Interaction ===");
  console.log("Owners:", await multiSig.getOwners());
  console.log("Required confirmations:", await multiSig.numConfirmationsRequired());
  
  // Submit transaction
  console.log("\nSubmiting transaction...");
  const tx = await multiSig.submitTransaction(await addr1.getAddress(), ethers.parseEther("1"), "0x");
  await tx.wait();
  console.log("Transaction submitted. TX:", tx.hash);
  
  // Confirm by owner1
  console.log("\nOwner1 confirming...");
  await (await multiSig.confirmTransaction(0)).wait();
  
  // Confirm by owner2
  const multiSigOwner2 = multiSig.connect(owner2);
  console.log("Owner2 confirming...");
  await (await multiSigOwner2.confirmTransaction(0)).wait();
  
  // Execute
  console.log("\nExecuting transaction...");
  await (await multiSig.executeTransaction(0)).wait();
  console.log("Transaction executed!");
  
  console.log("\nBalance of addr1:", ethers.formatEther(await provider.getBalance(await addr1.getAddress())));
}

main().catch(console.error);
