import hardhat from "hardhat";

const { ethers } = hardhat;
import * as fs from "fs";

async function main() {
  const [owner] = await ethers.getSigners();
  const proxyAddress = fs.readFileSync("proxy-address.txt", "utf8").trim();

  const ERC20V2 = await ethers.getContractFactory("ERC20V2");
  const token = ERC20V2.attach(proxyAddress);

  console.log("Token:", await token.name(), await token.symbol());
  console.log("Total Supply:", ethers.formatEther(await token.totalSupply()));
  console.log("Owner balance:", ethers.formatEther(await token.balanceOf(owner.address)));

  const testWallet = (await ethers.getSigners())[1];
  console.log("\nMinting 100 tokens to test account...");
  const mintTx = await token.mint(testWallet.address, ethers.parseEther("100"));
  await mintTx.wait();

  console.log("Test account balance:", ethers.formatEther(await token.balanceOf(testWallet.address)));

  console.log("\nTransferring 50 tokens from test account to owner...");
  await token.connect(testWallet).transfer(owner.address, ethers.parseEther("50"));

  console.log("Test account balance after transfer:", ethers.formatEther(await token.balanceOf(testWallet.address)));
  console.log("Owner balance after transfer:", ethers.formatEther(await token.balanceOf(owner.address)));

  console.log("\nVersion:", await token.version());
}

main().catch(console.error);
