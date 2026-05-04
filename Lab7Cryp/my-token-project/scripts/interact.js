import hardhat from "hardhat";
import * as fs from "fs";

const { ethers } = hardhat;

async function main() {
  const [owner] = await ethers.getSigners();
  const proxyAddress = fs.readFileSync("proxy-address.txt", "utf8").trim();

  const ERC20V1 = await ethers.getContractFactory("ERC20V1");
  const token = ERC20V1.attach(proxyAddress);

  console.log("Token:", await token.name(), await token.symbol());
  console.log("Total Supply:", ethers.formatEther(await token.totalSupply()));
  console.log("Owner balance:", ethers.formatEther(await token.balanceOf(owner.address)));

  const testAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  console.log("\nMinting 100 tokens to test account...");
  const mintTx = await token.mint(testAddress, ethers.parseEther("100"));
  await mintTx.wait();

  console.log("Test account balance:", ethers.formatEther(await token.balanceOf(testAddress)));

  console.log("\nTransferring 50 tokens from owner to test account...");
  const transferTx = await token.transfer(testAddress, ethers.parseEther("50"));
  await transferTx.wait();

  console.log("Test account balance after transfer:", ethers.formatEther(await token.balanceOf(testAddress)));
  console.log("Owner balance after transfer:", ethers.formatEther(await token.balanceOf(owner.address)));

  try {
    const version = await token.version();
    console.log("\nVersion:", version);
  } catch (e) {
    console.log("\nVersion function not available (V1)");
  }
}

main().catch(console.error);
