import { ethers } from "ethers";
import * as fs from "fs";

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);

const artifact = JSON.parse(fs.readFileSync("./artifacts/contracts/MyToken.sol/MyToken.json", "utf8"));

async function main() {
  console.log("Deploying contract with account:", wallet.address);

  const MyToken = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const myToken = await MyToken.deploy(ethers.parseEther("1000000"));
  await myToken.waitForDeployment();

  console.log("MyToken deployed to:", await myToken.getAddress());
}

main().catch(console.error);
