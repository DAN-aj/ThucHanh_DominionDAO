cd "/Users/duonganhngoc/Documents/ThucHanh_DominionDAO"

cat > README.md <<'EOF'
# Thực hành DominionDAO — Smart Contract & React Web3

Ứng dụng DAO mẫu cho phép thành viên góp ETH, tạo đề xuất chi tiền, bỏ phiếu và thanh toán trên mạng thử nghiệm Sepolia.

## Thông tin sinh viên

- **Sinh viên:** Dương Ánh Ngọc
- **Mã sinh viên:** B23DCTC076
- **Đơn vị:** Học viện Công nghệ Bưu chính Viễn thông (PTIT)

## Chức năng

- Thành viên góp tối thiểu **0.01 ETH** để trở thành stakeholder.
- Stakeholder có thể tạo đề xuất thanh toán cho một địa chỉ ví.
- Thành viên bỏ phiếu chấp nhận hoặc từ chối đề xuất.
- Thời gian bỏ phiếu là **5 phút**.
- Đề xuất được thanh toán khi đã đóng và số phiếu chấp nhận lớn hơn số phiếu từ chối.

## Công nghệ

- Solidity 0.8.19
- Hardhat 2
- React
- MetaMask
- Ethereum Sepolia

## Cấu trúc dự án

- `dominion-dao-hardhat/` — hợp đồng Solidity, script triển khai và kiểm thử.
- `web3-app/` — ứng dụng giao diện React kết nối với DAO.
- `HUONG_DAN.md` — tài liệu hướng dẫn thực hành.

## DAO nhóm trên Sepolia

**Contract:** `0x80BF73f6C84D9E9F2dDb0c6b02eEf40f74C231Aa`

[Xem contract trên Sepolia Etherscan](https://sepolia.etherscan.io/address/0x80BF73f6C84D9E9F2dDb0c6b02eEf40f74C231Aa)

## Cài đặt và kiểm thử hợp đồng

```bash
cd dominion-dao-hardhat
npm ci
npx hardhat compile
npx hardhat test
