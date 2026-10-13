require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

// Private key và RPC lấy từ file .env (KHÔNG ghi thẳng private key vào code,
// KHÔNG commit file .env lên GitHub).
const PRIVATE_KEY = (process.env.PRIVATE_KEY || "").trim();
const SEPOLIA_RPC_URL =
  process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

const accounts = PRIVATE_KEY
  ? [PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : `0x${PRIVATE_KEY}`]
  : [];

task("accounts", "In danh sách tài khoản", async (_, hre) => {
  const signers = await hre.ethers.getSigners();
  for (const s of signers) console.log(s.address);
});

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      chainId: 11155111,
      accounts,
    },
  },
};
