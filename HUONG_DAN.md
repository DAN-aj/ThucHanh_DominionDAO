# Hướng dẫn hoàn thành bài thực hành DominionDAO (Bài 1 + Bài 2)

Thư mục gồm 2 dự án:

| Thư mục | Dùng cho | Nội dung |
|---|---|---|
| `dominion-dao-hardhat/` | Bài 1 – Deploy Smartcontract DominionDAO | Contract, script deploy, test mô phỏng cả kịch bản nhóm |
| `web3-app/` | Bài 2 – Tạo Web3 | Web React kết nối MetaMask + contract |

Yêu cầu: **Node.js 18 trở lên** (kiểm tra `node -v`), MetaMask đã chọn mạng **Sepolia** và có ít nhất ~0.05 SepoliaETH (lấy ở faucet trong tài liệu).

---

## Phần 1 – Deploy DominionDAO lên Sepolia (chỉ 1 người trong nhóm làm)

```bash
cd dominion-dao-hardhat
npm install
```

1. Copy file `.env.example` thành `.env`, điền private key ví test:
   ```
   PRIVATE_KEY=abc123...   # MetaMask → Account details → Show private key
   ```
   > ⚠️ Chỉ dùng ví test. Không ghi private key vào `hardhat.config.js`, không đẩy `.env` lên GitHub (đã có `.gitignore`).

2. Biên dịch và chạy test (mô phỏng toàn bộ kịch bản nhóm trên máy, không tốn ETH):
   ```bash
   npx hardhat compile
   npx hardhat test
   ```
   Kết quả mong đợi: `4 passing`.

3. Deploy lên Sepolia:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```
   Kết quả:
   ```
   DominionDAO deployed to: 0x....
   Etherscan: https://sepolia.etherscan.io/address/0x....
   Đã cập nhật web3-app/.env và web3-app/src/abis/DominionDAO.json
   ```
   Script tự copy ABI và ghi địa chỉ contract vào `web3-app`, không cần copy tay như tài liệu.

4. **Gửi địa chỉ contract cho cả nhóm** — mọi người dùng CHUNG địa chỉ này.

---

## Phần 2 – Chạy web Web3 (mỗi thành viên đều làm)

```bash
cd web3-app
npm install
```

- Người deploy: file `.env` đã được tạo sẵn.
- Các bạn khác: copy `.env.example` thành `.env` và dán địa chỉ chung:
  ```
  REACT_APP_CONTRACT_ADDRESS=0x...địa_chỉ_nhóm
  ```
  (File `src/abis/DominionDAO.json` đã có sẵn, khớp với contract.)

```bash
npm start
```
Mở http://localhost:3000 → bấm **Connect Wallet** → chọn tài khoản trong MetaMask. Web sẽ tự yêu cầu chuyển sang Sepolia nếu đang ở mạng khác.

> Sửa file `.env` xong phải tắt `npm start` (Ctrl+C) và chạy lại thì mới nhận.

---

## Phần 3 – Kịch bản nhóm (3–5 người)

Ghi lại địa chỉ ví từng người. Chọn một bạn làm **A** (người nhận tiền).

| Bước | Ai làm | Thao tác trên web | Kết quả cần chụp màn hình |
|---|---|---|---|
| 1 | Mọi người | Nhập `0.01` → **Contribute** → xác nhận MetaMask | Dòng "you are now a stakeholder 😊", DAO Balance tăng |
| 2 | 1 bạn (khác A càng tốt) | **Propose** → Title, Amount `0.005`, Beneficiary = **ví của A**, Description → Submit | Đề xuất xuất hiện trong bảng, cột Expires ~5 phút |
| 3 | Mọi người | **View** đề xuất → **Accept** (có thể 1 bạn Reject để thử) | Biểu đồ Acceptees/Rejectees, bảng Voters |
| 4 | — | Đợi hết 5 phút (đề xuất chuyển sang tab **Closed**) | Cột Expires = Expired |
| 5 | 1 stakeholder bất kỳ | Bấm **Payout** → xác nhận | Thông báo "Payout thành công! 0.005 ETH đã gửi đến ..." và nút chuyển **Paid** |
| 6 | A | Kiểm tra tiền | Xem bên dưới |

Lưu ý quan trọng:
- **Phải vote xong trong 5 phút** kể từ lúc tạo đề xuất; quá hạn contract sẽ báo `Proposal duration expired`.
- Mỗi người chỉ vote 1 lần (`Double voting not allowed`).
- Chỉ Payout được khi **Accept > Reject** và quỹ đủ tiền.
- Web tự làm mới mỗi 15 giây để thấy thao tác của bạn khác; muốn xem ngay thì F5.

### Kiểm tra A đã nhận tiền chưa
Cách 1 – Etherscan: mở `https://sepolia.etherscan.io/address/<ví A>` → tab **Internal Transactions** sẽ có giao dịch 0.005 ETH từ địa chỉ contract. (Tiền gửi từ contract là "internal transaction" nên **không** hiện ở tab Transactions thường.)

Cách 2 – MetaMask của A: số dư SepoliaETH tăng 0.005.

Cách 3 – Script (trong `dominion-dao-hardhat`):
```bash
# macOS / Linux
CONTRACT=0x...địa_chỉ_nhóm npx hardhat run scripts/status.js --network sepolia
# Windows PowerShell
$env:CONTRACT="0x...địa_chỉ_nhóm"; npx hardhat run scripts/status.js --network sepolia
```
In ra từng đề xuất: số phiếu, `paid: true`, số dư hiện tại của beneficiary.

---

## Những lỗi trong tài liệu gốc đã được sửa

| Vấn đề trong tài liệu | Đã sửa |
|---|---|
| Private key ghi thẳng trong `hardhat.config.js`, thiếu `url` RPC cho Sepolia nên không deploy được | Đọc từ `.env`, có RPC Sepolia mặc định |
| `hardhat@^2.0.0` + `hardhat-waffle` + `chai` mới (bản 5/6 là ESM) gây lỗi khi cài | Dùng bộ phiên bản đã chạy thử thành công |
| `App.jsx` không đợi `getProposals()` xong và `Proposals.jsx` copy dữ liệu vào state một lần → bảng đề xuất thường **trống** | Đợi tải xong, bảng đọc thẳng từ global state |
| `useEffect(async () => …)` (React cảnh báo) | Gọi hàm async bên trong effect |
| Đề xuất chỉ mở 5 phút nhưng hiển thị "0 days" | Hiển thị giây/phút còn lại, tự đếm ngược |
| Banner ghi "góp 1 ether để thành stakeholder" nhưng contract là 0.01 ETH | Sửa chữ cho đúng |
| Nút Payout hiện cho cả người không phải stakeholder (bấm sẽ lỗi) | Chỉ stakeholder thấy Payout, người khác thấy "Passed" |
| Không báo lỗi khi giao dịch thất bại; báo "thành công" kể cả khi bị từ chối | Toast hiển thị lý do lỗi từ contract (hết hạn, vote trùng…) |
| Không kiểm tra mạng | Tự yêu cầu chuyển MetaMask sang Sepolia |
| Class Tailwind ghép động không sinh CSS | Dùng tên class đầy đủ |
| Thiếu `public/index.html`, nhiều package thừa (cometchat, babel-preset…) | Bổ sung / lược bớt |

## Lỗi thường gặp

| Lỗi | Cách xử lý |
|---|---|
| `insufficient funds` khi deploy | Ví chưa có SepoliaETH → lấy thêm ở faucet |
| `Chưa có PRIVATE_KEY` | Chưa tạo file `.env` trong `dominion-dao-hardhat` |
| Lỗi kết nối RPC / timeout | Đổi `SEPOLIA_RPC_URL` trong `.env` (vd `https://sepolia.gateway.tenderly.co` hoặc RPC Infura/Alchemy) |
| Web báo "Chưa cấu hình REACT_APP_CONTRACT_ADDRESS" | Tạo `web3-app/.env` rồi chạy lại `npm start` |
| Không thấy số dư / đề xuất | MetaMask đang ở mạng khác Sepolia, hoặc địa chỉ contract sai |
| `Proposal duration expired` | Đã quá 5 phút → tạo đề xuất mới và vote nhanh hơn |
| `Insufficient votes` khi Payout | Số Accept chưa lớn hơn Reject |
| `npm install` lỗi trên Node cũ | Cài Node 18/20/22 LTS |
