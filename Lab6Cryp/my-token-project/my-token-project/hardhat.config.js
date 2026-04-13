import "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import "@nomicfoundation/hardhat-ethers";

const config = {
  solidity: "0.8.20",
  paths: {
    sources: "./contracts",
    tests: "./test",
  },
};

export default config;
