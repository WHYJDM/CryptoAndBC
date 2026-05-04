import hardhat from "hardhat";
import * as fs from "fs";

const { ethers, upgrades } = hardhat;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const ERC20V1 = await ethers.getContractFactory("ERC20V1");
  const proxy = await upgrades.deployProxy(ERC20V1, [ethers.parseEther("1000000")], {
    initializer: "initialize",
  });
  await proxy.waitForDeployment();

  const proxyAddress = await proxy.getAddress();
  console.log("Proxy deployed to:", proxyAddress);
  fs.writeFileSync("proxy-address.txt", proxyAddress);

  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("V1 Implementation:", implementationAddress);
}

main().catch(console.error);
