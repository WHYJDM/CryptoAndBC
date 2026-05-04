const { expect } = require("chai");
const hre = require("hardhat");
const ethers = hre.ethers;

describe("MultiSigWallet", function () {
  let MultiSigWallet;
  let multiSig;
  let owner1, owner2, owner3, nonOwner, addr1;
  let owners;

  beforeEach(async function () {
    [owner1, owner2, owner3, nonOwner, addr1] = await ethers.getSigners();
    owners = [owner1.address, owner2.address, owner3.address];
    const numConfirmationsRequired = 2;

    MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
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
      await multiSig.connect(owner1).submitTransaction(addr1.address, ethers.parseEther("1"), "0x");
      const txCount = await multiSig.getTransactionCount();
      expect(txCount).to.equal(1);

      const tx = await multiSig.getTransaction(0);
      expect(tx[0]).to.equal(addr1.address);
      expect(tx[1]).to.equal(ethers.parseEther("1"));
      expect(tx[3]).to.be.false;
      expect(tx[4]).to.equal(0);
    });

    it("should not allow a non-owner to submit a transaction", async function () {
      await expect(
        multiSig.connect(nonOwner).submitTransaction(addr1.address, ethers.parseEther("1"), "0x")
      ).to.be.revertedWith("not owner");
    });
  });

  describe("Transaction Confirmation", function () {
    beforeEach(async function () {
      await multiSig.connect(owner1).submitTransaction(addr1.address, ethers.parseEther("1"), "0x");
    });

    it("should allow an owner to confirm a transaction", async function () {
      await multiSig.connect(owner1).confirmTransaction(0);
      const tx = await multiSig.getTransaction(0);
      expect(tx[4]).to.equal(1);
      expect(await multiSig.isConfirmed(0, owner1.address)).to.be.true;
    });

    it("should not allow duplicate confirmation", async function () {
      await multiSig.connect(owner1).confirmTransaction(0);
      await expect(multiSig.connect(owner1).confirmTransaction(0)).to.be.revertedWith("tx already confirmed");
    });
  });

  describe("Transaction Execution", function () {
    beforeEach(async function () {
      await multiSig.connect(owner1).submitTransaction(addr1.address, ethers.parseEther("1"), "0x");
    });

    it("should execute transaction after required confirmations", async function () {
      await multiSig.connect(owner1).confirmTransaction(0);
      await multiSig.connect(owner2).confirmTransaction(0);

      const initialBalance = await ethers.provider.getBalance(addr1.address);
      await multiSig.connect(owner1).executeTransaction(0);
      const finalBalance = await ethers.provider.getBalance(addr1.address);

      expect(finalBalance - initialBalance).to.equal(ethers.parseEther("1"));

      const tx = await multiSig.getTransaction(0);
      expect(tx[3]).to.be.true;
    });

    it("should not execute without enough confirmations", async function () {
      await multiSig.connect(owner1).confirmTransaction(0);
      await expect(multiSig.connect(owner1).executeTransaction(0)).to.be.revertedWith("cannot execute tx");
    });
  });

  describe("Revoke Confirmation", function () {
    beforeEach(async function () {
      await multiSig.connect(owner1).submitTransaction(addr1.address, ethers.parseEther("1"), "0x");
      await multiSig.connect(owner1).confirmTransaction(0);
    });

    it("should allow an owner to revoke confirmation", async function () {
      await multiSig.connect(owner1).revokeConfirmation(0);
      const tx = await multiSig.getTransaction(0);
      expect(tx[4]).to.equal(0);
      expect(await multiSig.isConfirmed(0, owner1.address)).to.be.false;
    });
  });

  describe("Deposit", function () {
    it("should accept Ether deposits", async function () {
      const depositAmount = ethers.parseEther("2");
      await owner1.sendTransaction({ to: multiSig.getAddress(), value: depositAmount });
      expect(await ethers.provider.getBalance(multiSig.getAddress())).to.equal(depositAmount);
    });
  });
});
