const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Lab9 NFT contracts", function () {
  const characterUris = Array.from({ length: 10 }, (_, index) => `ipfs://characters/${index + 1}.json`);

  async function deployContracts() {
    const [owner, student, receiver] = await ethers.getSigners();

    const visitCard = await ethers.deployContract("SoulboundVisitCardERC721", [owner.address]);
    const characters = await ethers.deployContract("GameCharacterCollectionERC1155", [
      owner.address,
      characterUris
    ]);

    return { owner, student, receiver, visitCard, characters };
  }

  it("mints exactly one soulbound visit card per student", async function () {
    const { student, visitCard } = await deployContracts();

    await visitCard.mintVisitCard(
      student.address,
      "ipfs://visit-card/student.json",
      "Alice Student",
      "S001",
      "Blockchain",
      2026
    );

    expect(await visitCard.ownerOf(1)).to.equal(student.address);
    expect(await visitCard.tokenURI(1)).to.equal("ipfs://visit-card/student.json");
    expect(await visitCard.studentNames(1)).to.equal("Alice Student");
    expect(await visitCard.studentIds(1)).to.equal("S001");
    expect(await visitCard.hasVisitCard(student.address)).to.equal(true);

    await expect(
      visitCard.mintVisitCard(student.address, "ipfs://second.json", "Alice", "S001", "Blockchain", 2026)
    ).to.be.revertedWithCustomError(visitCard, "VisitCardAlreadyMinted");
  });

  it("blocks soulbound transfers and approvals", async function () {
    const { student, receiver, visitCard } = await deployContracts();

    await visitCard.mintVisitCard(
      student.address,
      "ipfs://visit-card/student.json",
      "Alice Student",
      "S001",
      "Blockchain",
      2026
    );

    await expect(visitCard.connect(student).approve(receiver.address, 1)).to.be.revertedWithCustomError(
      visitCard,
      "SoulboundToken"
    );
    await expect(visitCard.connect(student).setApprovalForAll(receiver.address, true)).to.be.revertedWithCustomError(
      visitCard,
      "SoulboundToken"
    );
    await expect(visitCard.connect(student).transferFrom(student.address, receiver.address, 1)).to.be.revertedWithCustomError(
      visitCard,
      "SoulboundToken"
    );
    await expect(
      visitCard.connect(student)["safeTransferFrom(address,address,uint256)"](student.address, receiver.address, 1)
    ).to.be.revertedWithCustomError(visitCard, "SoulboundToken");
  });

  it("batch mints 10 ERC-1155 characters and batch transfers 2 to the student", async function () {
    const { owner, student, characters } = await deployContracts();
    const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const amounts = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

    await characters.mintBatchCharacters(owner.address, ids, amounts, "0x");

    for (const id of ids) {
      expect(await characters.balanceOf(owner.address, id)).to.equal(1);
      expect(await characters.uri(id)).to.equal(`ipfs://characters/${id}.json`);
    }

    await characters.safeBatchTransferFrom(owner.address, student.address, [1, 2], [1, 1], "0x");

    expect(await characters.balanceOf(student.address, 1)).to.equal(1);
    expect(await characters.balanceOf(student.address, 2)).to.equal(1);
    expect(await characters.balanceOf(owner.address, 1)).to.equal(0);
    expect(await characters.balanceOf(owner.address, 2)).to.equal(0);
    expect(await characters.balanceOf(owner.address, 3)).to.equal(1);
  });

  it("restricts minting to the owner", async function () {
    const { student, characters, visitCard } = await deployContracts();

    await expect(
      visitCard.connect(student).mintVisitCard(student.address, "ipfs://x.json", "Name", "ID", "Course", 2026)
    ).to.be.revertedWithCustomError(visitCard, "OwnableUnauthorizedAccount");

    await expect(characters.connect(student).mintCharacter(student.address, 1, 1, "0x")).to.be.revertedWithCustomError(
      characters,
      "OwnableUnauthorizedAccount"
    );
  });
});
