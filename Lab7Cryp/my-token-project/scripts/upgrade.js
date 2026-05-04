import hardhat from "hardhat";

const { ethers, upgrades } = hardhat;
import * as fs from "fs";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Upgrading with account:", deployer.address);

  const proxyAddress = fs.readFileSync("proxy-address.txt", "utf8").trim();
  console.log("Upgrading proxy at:", proxyAddress);

  const ERC20V2 = await ethers.getContractFactory("ERC20V2");
  const upgraded = await upgrades.upgradeProxy(proxyAddress, ERC20V2);
  await upgraded.waitForDeployment();

  console.log("Proxy upgraded to V2!");

  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("V2 Implementation:", implementationAddress);
}

main().catch(console.error);
