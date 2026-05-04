import "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-verify";

const config = {
  solidity: "0.8.22",
  paths: {
    sources: "./contracts",
    tests: "./test",
  },
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/qntoeeG3NhuI8SOxaSKHi",
      accounts: ["ff2fa79099248235c5d6065140c671e5cf65b7cca90f174ab05c2238ec568dff"],
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
};

export default config;
