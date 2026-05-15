const { ethers } = require("hardhat");

const characterMetadataUris = [
  "ipfs://bafybeilab9characters/1.json",
  "ipfs://bafybeilab9characters/2.json",
  "ipfs://bafybeilab9characters/3.json",
  "ipfs://bafybeilab9characters/4.json",
  "ipfs://bafybeilab9characters/5.json",
  "ipfs://bafybeilab9characters/6.json",
  "ipfs://bafybeilab9characters/7.json",
  "ipfs://bafybeilab9characters/8.json",
  "ipfs://bafybeilab9characters/9.json",
  "ipfs://bafybeilab9characters/10.json"
];

async function main() {
  const [deployer, fallbackStudent] = await ethers.getSigners();
  const studentWallet = process.env.STUDENT_WALLET || fallbackStudent.address;

  if (!ethers.isAddress(studentWallet)) {
    throw new Error(
      "Invalid STUDENT_WALLET in .env. Replace it with a real wallet address, for example 0x1234..."
    );
  }

  console.log("Deployer:", deployer.address);
  console.log("Student wallet:", studentWallet);

  const visitCard = await ethers.deployContract("SoulboundVisitCardERC721", [deployer.address]);
  await visitCard.waitForDeployment();
  console.log("SoulboundVisitCardERC721:", await visitCard.getAddress());

  const characters = await ethers.deployContract("GameCharacterCollectionERC1155", [
    deployer.address,
    characterMetadataUris
  ]);
  await characters.waitForDeployment();
  console.log("GameCharacterCollectionERC1155:", await characters.getAddress());

  const mintVisitCardTx = await visitCard.mintVisitCard(
    studentWallet,
    "ipfs://bafybeilab9visitcard/student-visit-card.json",
    "Student Name",
    "STUDENT-001",
    "Cryptography and Blockchain",
    2026
  );
  await mintVisitCardTx.wait();
  console.log("Visit card mint tx:", mintVisitCardTx.hash);

  const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const amounts = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

  const batchMintTx = await characters.mintBatchCharacters(deployer.address, ids, amounts, "0x");
  await batchMintTx.wait();
  console.log("ERC-1155 batch mint tx:", batchMintTx.hash);

  const batchTransferTx = await characters.safeBatchTransferFrom(
    deployer.address,
    studentWallet,
    [1, 2],
    [1, 1],
    "0x"
  );
  await batchTransferTx.wait();
  console.log("ERC-1155 batch transfer tx:", batchTransferTx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
