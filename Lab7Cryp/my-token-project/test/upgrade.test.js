import { expect } from "chai";
import hardhat from "hardhat";

const { ethers, upgrades } = hardhat;

describe("ERC20 Upgradeable Token", function () {
  let token;
  let owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    
    const ERC20V1 = await ethers.getContractFactory("ERC20V1");
    token = await upgrades.deployProxy(ERC20V1, [ethers.parseEther("1000000")], {
      initializer: "initialize",
    });
    await token.waitForDeployment();
  });

  it("should mint tokens correctly", async function () {
    await token.mint(addr1.address, ethers.parseEther("100"));
    expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseEther("100"));
  });

  it("should transfer tokens", async function () {
    await token.mint(addr1.address, ethers.parseEther("100"));
    await token.connect(addr1).transfer(owner.address, ethers.parseEther("50"));
    expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseEther("50"));
  });

  it("should upgrade to V2 and call version()", async function () {
    const ERC20V2 = await ethers.getContractFactory("ERC20V2");
    const upgraded = await upgrades.upgradeProxy(await token.getAddress(), ERC20V2);
    
    expect(await upgraded.version()).to.equal("V2");
    expect(await upgraded.balanceOf(owner.address)).to.equal(ethers.parseEther("1000000"));
  });
});
