const { expect } = require("chai");
const hre = require("hardhat");
const ethers = require("ethers");

describe("MultiSigWallet Final Test", function () {
  let MultiSigWallet;
  let multiSig;
  let provider;
  let owner1, owner2, owner3;
  let owners;

  beforeEach(async function () {
    provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const accounts = await provider.send("eth_accounts", []);
    
    owner1 = await provider.getSigner(accounts[0]);
    owner2 = await provider.getSigner(accounts[1]);
    owner3 = await provider.getSigner(accounts[2]);
    
    owners = [accounts[0], accounts[1], accounts[2]];
    const numConfirmationsRequired = 2;

    MultiSigWallet = await ethers.getContractFactory("MultiSigWallet", owner1);
    multiSig = await MultiSigWallet.deploy(owners, numConfirmationsRequired);
    await multiSig.waitForDeployment();
  });

  it("should deploy with correct owners", async function () {
    const contractOwners = await multiSig.getOwners();
    expect(contractOwners).to.deep.equal(owners);
  });

  it("should allow owner to submit transaction", async function () {
    const addr1 = (await provider.send("eth_accounts", []))[4];
    await multiSig.connect(owner1).submitTransaction(addr1, ethers.parseEther("1"), "0x");
    
    const txCount = await multiSig.getTransactionCount();
    expect(txCount).to.equal(1);
    
    const tx = await multiSig.getTransaction(0);
    expect(tx[0]).to.equal(addr1);
    expect(tx[3]).to.be.false;
  });

  it("should execute after enough confirmations", async function () {
    const addr1 = (await provider.send("eth_accounts", []))[4];
    await multiSig.connect(owner1).submitTransaction(addr1, ethers.parseEther("1"), "0x");
    
    await multiSig.connect(owner1).confirmTransaction(0);
    await multiSig.connect(owner2).confirmTransaction(0);
    
    const initialBalance = await provider.getBalance(addr1);
    await multiSig.connect(owner1).executeTransaction(0);
    const finalBalance = await provider.getBalance(addr1);
    
    expect(finalBalance - initialBalance).to.equal(ethers.parseEther("1"));
    
    const tx = await multiSig.getTransaction(0);
    expect(tx[3]).to.be.true;
  });
});
