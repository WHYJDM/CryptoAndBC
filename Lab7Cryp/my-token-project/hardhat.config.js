import "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import "@openzeppelin/hardhat-upgrades";

const config = {
  solidity: "0.8.22",
  paths: {
    sources: "./contracts",
    tests: "./test",
  },
};

export default config;
