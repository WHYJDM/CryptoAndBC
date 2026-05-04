const { expect } = require("chai");
const hre = require("hardhat");
const ethers = require("ethers");

describe("MultiSigWallet", function () {
  let MultiSigWallet;
  let multiSig;
  let owner1, owner2, owner3, nonOwner, addr1;
  let owners;

  beforeEach(async function () {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    owner1 = await provider.getSigner(0);
    owner2 = await provider.getSigner(1);
    owner3 = await provider.getSigner(2);
    nonOwner = await provider.getSigner(3);
    addr1 = await provider.getSigner(4);
    
    owners = [await owner1.getAddress(), await owner2.getAddress(), await owner3.getAddress()];
    const numConfirmationsRequired = 2;

    MultiSigWallet = await ethers.getContractFactory("MultiSigWallet", owner1);
    multiSig = await MultiSigWallet.deploy(owners, numConfirmationsRequired);
    await multiSig.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set the correct owners", async function () {
      const contractOwners = await multiSig.getOwners();
      expect(contractOwners).to.deep.equal(owners);
    });

    it("should set the correct number of required confirmations", async function () {
      expect(await multiSig.numConfirmationsRequired()).to.equal(2);
    });
  });

  describe("Transaction Submission", function () {
    it("should allow an owner to submit a transaction", async function () {
      await multiSig.connect(owner1).submitTransaction(await addr1.getAddress(), ethers.parseEther("1"), "0x");
      const txCount = await multiSig.getTransactionCount();
      expect(txCount).to.equal(1);

      const tx = await multiSig.getTransaction(0);
      expect(tx[0]).to.equal(await addr1.getAddress());
      expect(tx[1]).to.equal(ethers.parseEther("1"));
      expect(tx[3]).to.be.false;
      expect(tx[4]).to.equal(0);
    });

    it("should emit SubmitTransaction event", async function () {
      await expect(multiSig.connect(owner1).submitTransaction(await addr1.getAddress(), ethers.parseEther("1"), "0x"))
        .to.emit(multiSig, "SubmitTransaction")
        .withArgs(await owner1.getAddress(), 0, await addr1.getAddress(), ethers.parseEther("1"), "0x");
    });

    it("should not allow a non-owner to submit a transaction", async function () {
      await expect(
        multiSig.connect(nonOwner).submitTransaction(await addr1.getAddress(), ethers.parseEther("1"), "0x")
      ).to.be.revertedWith("not owner");
    });
  });

  describe("Transaction Confirmation", function () {
    beforeEach(async function () {
      await multiSig.connect(owner1).submitTransaction(await addr1.getAddress(), ethers.parseEther("1"), "0x");
    });

    it("should allow an owner to confirm a transaction", async function () {
      await multiSig.connect(owner1).confirmTransaction(0);
      const tx = await multiSig.getTransaction(0);
      expect(tx[4]).to.equal(1);
      expect(await multiSig.isConfirmed(0, await owner1.getAddress())).to.be.true;
    });

    it("should emit ConfirmTransaction event", async function () {
      await expect(multiSig.connect(owner1).confirmTransaction(0))
        .to.emit(multiSig, "ConfirmTransaction")
        .withArgs(await owner1.getAddress(), 0);
    });

    it("should not allow duplicate confirmation", async function () {
      await multiSig.connect(owner1).confirmTransaction(0);
      await expect(multiSig.connect(owner1).confirmTransaction(0)).to.be.revertedWith("tx already confirmed");
    });

    it("should not allow a non-owner to confirm", async function () {
      await expect(multiSig.connect(nonOwner).confirmTransaction(0)).to.be.revertedWith("not owner");
    });
  });

  describe("Transaction Execution", function () {
    beforeEach(async function () {
      await multiSig.connect(owner1).submitTransaction(await addr1.getAddress(), ethers.parseEther("1"), "0x");
    });

    it("should execute transaction after required confirmations", async function () {
      await multiSig.connect(owner1).confirmTransaction(0);
      await multiSig.connect(owner2).confirmTransaction(0);

      const initialBalance = await ethers.provider.getBalance(await addr1.getAddress());
      await multiSig.connect(owner1).executeTransaction(0);
      const finalBalance = await ethers.provider.getBalance(await addr1.getAddress());

      expect(finalBalance - initialBalance).to.equal(ethers.parseEther("1"));

      const tx = await multiSig.getTransaction(0);
      expect(tx[3]).to.be.true;
    });

    it("should emit ExecuteTransaction event", async function () {
      await multiSig.connect(owner1).confirmTransaction(0);
      await multiSig.connect(owner2).confirmTransaction(0);
      await expect(multiSig.connect(owner1).executeTransaction(0))
        .to.emit(multiSig, "ExecuteTransaction")
        .withArgs(await owner1.getAddress(), 0);
    });

    it("should not execute without enough confirmations", async function () {
      await multiSig.connect(owner1).confirmTransaction(0);
      await expect(multiSig.connect(owner1).executeTransaction(0)).to.be.revertedWith("cannot execute tx");
    });

    it("should not execute already executed transaction", async function () {
      await multiSig.connect(owner1).confirmTransaction(0);
      await multiSig.connect(owner2).confirmTransaction(0);
      await multiSig.connect(owner1).executeTransaction(0);
      await expect(multiSig.connect(owner1).executeTransaction(0)).to.be.revertedWith("tx already executed");
    });
  });

  describe("Revoke Confirmation", function () {
    beforeEach(async function () {
      await multiSig.connect(owner1).submitTransaction(await addr1.getAddress(), ethers.parseEther("1"), "0x");
      await multiSig.connect(owner1).confirmTransaction(0);
    });

    it("should allow an owner to revoke confirmation", async function () {
      await multiSig.connect(owner1).revokeConfirmation(0);
      const tx = await multiSig.getTransaction(0);
      expect(tx[4]).to.equal(0);
      expect(await multiSig.isConfirmed(0, await owner1.getAddress())).to.be.false;
    });

    it("should emit RevokeConfirmation event", async function () {
      await expect(multiSig.connect(owner1).revokeConfirmation(0))
        .to.emit(multiSig, "RevokeConfirmation")
        .withArgs(await owner1.getAddress(), 0);
    });

    it("should not allow revoking if not confirmed", async function () {
      await expect(multiSig.connect(owner2).revokeConfirmation(0)).to.be.revertedWith("tx not confirmed");
    });
  });

  describe("Deposit", function () {
    it("should accept Ether deposits", async function () {
      const depositAmount = ethers.parseEther("2");
      await owner1.sendTransaction({ to: await multiSig.getAddress(), value: depositAmount });
      expect(await ethers.provider.getBalance(await multiSig.getAddress())).to.equal(depositAmount);
    });

    it("should emit Deposit event on Ether receipt", async function () {
      const depositAmount = ethers.parseEther("1");
      await expect(owner1.sendTransaction({ to: await multiSig.getAddress(), value: depositAmount }))
        .to.emit(multiSig, "Deposit")
        .withArgs(await owner1.getAddress(), depositAmount, depositAmount);
    });
  });
});
