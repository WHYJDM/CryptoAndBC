import { expect } from "chai";
import { ethers } from "@nomicfoundation/hardhat-ethers";

describe("MyToken", function () {
  let token;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const MyToken = await ethers.getContractFactory("MyToken");
    token = await MyToken.deploy(ethers.utils.parseEther("1000000"));
    await token.deployed();
  });

  it("Should deploy with correct initial supply", async function () {
    expect(await token.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("1000000"));
  });

  it("Should have correct name and symbol", async function () {
    expect(await token.name()).to.equal("MyToken");
    expect(await token.symbol()).to.equal("MTK");
  });

  it("Should allow token transfers", async function () {
    await token.transfer(addr1.address, ethers.utils.parseEther("100"));
    expect(await token.balanceOf(addr1.address)).to.equal(ethers.utils.parseEther("100"));
  });

  it("Should revert when transferring more tokens than available balance", async function () {
    await expect(
      token.transfer(addr1.address, ethers.utils.parseEther("1000001"))
    ).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
  });

  it("Should allow owner to mint new tokens", async function () {
    await token.mint(addr1.address, ethers.utils.parseEther("500"));
    expect(await token.balanceOf(addr1.address)).to.equal(ethers.utils.parseEther("500"));
  });

  it("Should revert when non-owner tries to mint", async function () {
    await expect(
      token.connect(addr1).mint(addr1.address, ethers.utils.parseEther("100"))
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should correctly update total supply after minting", async function () {
    const initialSupply = await token.totalSupply();
    await token.mint(addr1.address, ethers.utils.parseEther("500"));
    expect(await token.totalSupply()).to.equal(initialSupply + ethers.utils.parseEther("500"));
  });
});
