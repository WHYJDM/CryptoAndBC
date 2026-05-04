async function main() {
  // hre автоматически доступен при запуске через 'npx hardhat run'
  const ethers = hre.ethers;
  
  const wallet = await ethers.getSigner();
  console.log("Deploying from:", wallet.address);

  const owners = [
    wallet.address, // Owner 1
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Owner 2
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Owner 3
  ];
  const numConfirmationsRequired = 2;

  console.log("Deploying MultiSigWallet with:");
  console.log("Owners:", owners);
  console.log("Required confirmations:", numConfirmationsRequired);

  const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
  const multiSig = await MultiSigWallet.deploy(owners, numConfirmationsRequired);
  await multiSig.waitForDeployment();

  console.log("MultiSigWallet deployed to:", await multiSig.getAddress());
}

main().catch(console.error);
