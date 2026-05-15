// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GameCharacterCollectionERC1155
 * @dev ERC-1155 collection with 10 predefined character metadata URIs.
 */
contract GameCharacterCollectionERC1155 is ERC1155, Ownable {
    error InvalidCharacterId(uint256 id);
    error ArrayLengthMismatch();

    uint256 public constant CHARACTER_COUNT = 10;

    mapping(uint256 id => string tokenUri) private _tokenURIs;
    mapping(uint256 id => string name) public characterNames;
    mapping(uint256 id => string rarity) public rarities;
    mapping(uint256 id => uint16 speed) public speeds;
    mapping(uint256 id => uint16 strength) public strengths;

    constructor(address initialOwner, string[] memory metadataUris) ERC1155("") Ownable(initialOwner) {
        if (metadataUris.length != CHARACTER_COUNT) {
            revert ArrayLengthMismatch();
        }

        string[10] memory names = [
            "Astra Knight",
            "Blaze Archer",
            "Frost Mage",
            "Terra Guardian",
            "Volt Rogue",
            "Lunar Priest",
            "Solar Paladin",
            "Shadow Assassin",
            "Ocean Ranger",
            "Crystal Golem"
        ];

        string[10] memory rarityValues = [
            "Common",
            "Common",
            "Rare",
            "Rare",
            "Epic",
            "Epic",
            "Legendary",
            "Legendary",
            "Rare",
            "Epic"
        ];

        uint16[10] memory speedValues = [uint16(45), 70, 52, 35, 88, 50, 58, 94, 63, 28];
        uint16[10] memory strengthValues = [uint16(70), 55, 64, 90, 48, 42, 82, 60, 67, 96];

        for (uint256 index = 0; index < CHARACTER_COUNT; index++) {
            uint256 id = index + 1;
            _tokenURIs[id] = metadataUris[index];
            characterNames[id] = names[index];
            rarities[id] = rarityValues[index];
            speeds[id] = speedValues[index];
            strengths[id] = strengthValues[index];
        }
    }

    function uri(uint256 id) public view override returns (string memory) {
        _validateCharacterId(id);
        return _tokenURIs[id];
    }

    function mintCharacter(address to, uint256 id, uint256 amount, bytes calldata data) external onlyOwner {
        _validateCharacterId(id);
        _mint(to, id, amount, data);
    }

    function mintBatchCharacters(
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts,
        bytes calldata data
    ) external onlyOwner {
        if (ids.length != amounts.length) {
            revert ArrayLengthMismatch();
        }

        for (uint256 index = 0; index < ids.length; index++) {
            _validateCharacterId(ids[index]);
        }

        _mintBatch(to, ids, amounts, data);
    }

    function _validateCharacterId(uint256 id) internal pure {
        if (id == 0 || id > CHARACTER_COUNT) {
            revert InvalidCharacterId(id);
        }
    }
}
