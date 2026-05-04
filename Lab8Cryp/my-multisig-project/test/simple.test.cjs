const { expect } = require("chai");
const hre = require("hardhat");
const ethers = require("ethers");

describe("MultiSigWallet Simple Test", function () {
  it("should deploy and set owners", async function () {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const accounts = await provider.send("eth_accounts", []);
    
    const owners = [accounts[0], accounts[1], accounts[2]];
    const numConfirmationsRequired = 2;
    
    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet", 
      new ethers.Wallet(accounts[0], provider));
    const multiSig = await MultiSigWallet.deploy(owners, numConfirmationsRequired);
    await multiSig.waitForDeployment();
    
    const contractOwners = await multiSig.getOwners();
    expect(contractOwners).to.deep.equal(owners);
    
    const threshold = await multiSig.numConfirmationsRequired();
    expect(threshold).to.equal(2);
    
    console.log("Contract deployed at:", await multiSig.getAddress());
  });
});
