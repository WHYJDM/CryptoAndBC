import hardhat from "hardhat";
import * as fs from "fs";

const { ethers } = hardhat;

async function main() {
  const [owner] = await ethers.getSigners();
  const proxyAddress = fs.readFileSync("proxy-address.txt", "utf8").trim();

  const ERC20V2 = await ethers.getContractFactory("ERC20V2");
  const token = ERC20V2.attach(proxyAddress);

  console.log("=== After Upgrade on Sepolia ===");
  console.log("Token:", await token.name(), await token.symbol());
  
  const totalSupply = await token.totalSupply();
  console.log("Total Supply:", ethers.formatEther(totalSupply));
  
  const ownerBalance = await token.balanceOf(owner.address);
  console.log("Owner balance:", ethers.formatEther(ownerBalance));

  const testAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  console.log("Test account balance:", ethers.formatEther(await token.balanceOf(testAddress)));

  console.log("\nVersion:", await token.version());
}

main().catch(console.error);
