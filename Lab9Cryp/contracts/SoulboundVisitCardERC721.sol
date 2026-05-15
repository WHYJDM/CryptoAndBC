// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SoulboundVisitCardERC721
 * @dev One non-transferable ERC-721 visit card per student wallet.
 */
contract SoulboundVisitCardERC721 is ERC721, Ownable {
    error SoulboundToken();
    error VisitCardAlreadyMinted(address student);

    uint256 private _nextTokenId = 1;

    mapping(address student => bool minted) private _hasVisitCard;
    mapping(uint256 tokenId => string tokenUri) private _tokenURIs;
    mapping(uint256 tokenId => string studentName) public studentNames;
    mapping(uint256 tokenId => string studentId) public studentIds;
    mapping(uint256 tokenId => string course) public courses;
    mapping(uint256 tokenId => uint16 year) public studentYears;

    constructor(address initialOwner) ERC721("Soulbound Student Visit Card", "SSVC") Ownable(initialOwner) {}

    function mintVisitCard(
        address student,
        string calldata metadataUri,
        string calldata studentName,
        string calldata studentId,
        string calldata course,
        uint16 year
    ) external onlyOwner returns (uint256 tokenId) {
        if (_hasVisitCard[student]) {
            revert VisitCardAlreadyMinted(student);
        }

        tokenId = _nextTokenId++;
        _hasVisitCard[student] = true;
        _tokenURIs[tokenId] = metadataUri;
        studentNames[tokenId] = studentName;
        studentIds[tokenId] = studentId;
        courses[tokenId] = course;
        studentYears[tokenId] = year;

        _safeMint(student, tokenId);
    }

    function hasVisitCard(address student) external view returns (bool) {
        return _hasVisitCard[student];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURIs[tokenId];
    }

    function approve(address, uint256) public pure override {
        revert SoulboundToken();
    }

    function setApprovalForAll(address, bool) public pure override {
        revert SoulboundToken();
    }

    function transferFrom(address, address, uint256) public pure override {
        revert SoulboundToken();
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert SoulboundToken();
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address previousOwner) {
        previousOwner = _ownerOf(tokenId);

        if (previousOwner != address(0) && to != address(0)) {
            revert SoulboundToken();
        }

        return super._update(to, tokenId, auth);
    }
}
