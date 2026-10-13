// Xem nhanh trạng thái DAO trên Sepolia (dùng ở bước "Kiểm tra A đã nhận tiền chưa").
// Chạy: CONTRACT=0x... npx hardhat run scripts/status.js --network sepolia
// (Windows PowerShell: $env:CONTRACT="0x..."; npx hardhat run scripts/status.js --network sepolia)
const hre = require("hardhat");

async function main() {
  const address = process.env.CONTRACT;
  if (!address) throw new Error("Thiếu biến CONTRACT=<địa chỉ contract>");
  const { ethers } = hre;
  const dao = await ethers.getContractAt("DominionDAO", address);

  console.log("DAO balance:", ethers.utils.formatEther(await dao.daoBalance()), "ETH");
  const proposals = await dao.getProposals();
  for (const p of proposals) {
    const ben = await ethers.provider.getBalance(p.beneficiary);
    console.log(
      `\n#${p.id} ${p.title}` +
        `\n  amount     : ${ethers.utils.formatEther(p.amount)} ETH` +
        `\n  votes      : ${p.upvotes} up / ${p.downvotes} down` +
        `\n  expires    : ${new Date(p.duration.toNumber() * 1000).toLocaleString()}` +
        `\n  paid       : ${p.paid}` +
        `\n  beneficiary: ${p.beneficiary} (số dư hiện tại ${ethers.utils.formatEther(ben)} ETH)`
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
