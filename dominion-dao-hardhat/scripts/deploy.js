// Deploy DominionDAO và tự động cấu hình cho web3-app:
//   - copy ABI sang ../web3-app/src/abis/DominionDAO.json
//   - ghi REACT_APP_CONTRACT_ADDRESS vào ../web3-app/.env
// Chạy: npx hardhat run scripts/deploy.js --network sepolia
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error("Chưa có PRIVATE_KEY trong file .env");
  }
  const bal = await deployer.getBalance();
  console.log("Network  :", hre.network.name);
  console.log("Deployer :", deployer.address);
  console.log("Balance  :", hre.ethers.utils.formatEther(bal), "ETH");

  const DominionDAO = await hre.ethers.getContractFactory("DominionDAO");
  const dao = await DominionDAO.deploy();
  await dao.deployed();

  console.log("\nDominionDAO deployed to:", dao.address);
  if (hre.network.name === "sepolia") {
    console.log("Etherscan: https://sepolia.etherscan.io/address/" + dao.address);
  }

  // Cấu hình frontend (nếu thư mục web3-app nằm cạnh thư mục này)
  const webDir = path.join(__dirname, "..", "..", "web3-app");
  if (fs.existsSync(webDir) && hre.network.name !== "hardhat") {
    const artifact = await hre.artifacts.readArtifact("DominionDAO");
    const abiDir = path.join(webDir, "src", "abis");
    fs.mkdirSync(abiDir, { recursive: true });
    fs.writeFileSync(
      path.join(abiDir, "DominionDAO.json"),
      JSON.stringify(artifact, null, 2)
    );
    fs.writeFileSync(
      path.join(webDir, ".env"),
      `REACT_APP_CONTRACT_ADDRESS=${dao.address}\n`
    );
    console.log("Đã cập nhật web3-app/.env và web3-app/src/abis/DominionDAO.json");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
