// Mô phỏng đúng kịch bản bài thực hành trên mạng local:
// 3 thành viên góp ETH -> tạo đề xuất cho A -> vote -> sau 5 phút payout -> A nhận tiền.
// Chạy: npx hardhat test
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

const eth = (v) => ethers.utils.parseEther(v);

async function expectRevert(promise, msg) {
  try {
    await promise;
  } catch (e) {
    expect(e.message).to.include(msg);
    return;
  }
  throw new Error(`Expected revert "${msg}"`);
}

describe("DominionDAO - kịch bản nhóm", function () {
  let dao, m1, m2, m3, A, outsider;

  beforeEach(async () => {
    [m1, m2, m3, A, outsider] = await ethers.getSigners();
    const F = await ethers.getContractFactory("DominionDAO");
    dao = await F.deploy();
    await dao.deployed();
  });

  it("góp >= 0.01 ETH thì thành stakeholder", async () => {
    await dao.connect(m1).contribute({ value: eth("0.005") });
    expect(await dao.connect(m1).isStakeholder()).to.equal(false);
    await dao.connect(m1).contribute({ value: eth("0.006") });
    expect(await dao.connect(m1).isStakeholder()).to.equal(true);
    expect((await dao.daoBalance()).toString()).to.equal(eth("0.011").toString());
  });

  it("chỉ stakeholder mới tạo đề xuất được", async () => {
    await expectRevert(
      dao.connect(outsider).createProposal("x", "y", A.address, eth("0.001")),
      "Stakeholders only"
    );
  });

  it("toàn bộ luồng: góp -> đề xuất -> vote -> payout sau 5 phút", async () => {
    for (const m of [m1, m2, m3]) await dao.connect(m).contribute({ value: eth("0.01") });

    await dao
      .connect(m1)
      .createProposal("Build Web3", "Build Web3 for company", A.address, eth("0.005"));

    await dao.connect(m1).performVote(0, true);
    await dao.connect(m2).performVote(0, true);
    await dao.connect(m3).performVote(0, false);
    await expectRevert(dao.connect(m1).performVote(0, true), "Double voting");

    const votes = await dao.getVotesOf(0);
    expect(votes.length).to.equal(3);

    await time.increase(5 * 60 + 1);
    await expectRevert(dao.connect(m2).performVote(0, true), "expired");

    const before = await ethers.provider.getBalance(A.address);
    await dao.connect(m2).payBeneficiary(0);
    const after = await ethers.provider.getBalance(A.address);

    expect(after.sub(before).toString()).to.equal(eth("0.005").toString());
    const p = await dao.getProposal(0);
    expect(p.paid).to.equal(true);
    expect((await dao.daoBalance()).toString()).to.equal(eth("0.025").toString());
    await expectRevert(dao.connect(m2).payBeneficiary(0), "Payment sent before");
  });

  it("đề xuất bị reject (up <= down) thì không payout được", async () => {
    await dao.connect(m1).contribute({ value: eth("0.01") });
    await dao.connect(m2).contribute({ value: eth("0.01") });
    await dao.connect(m1).createProposal("t", "d", A.address, eth("0.001"));
    await dao.connect(m1).performVote(0, true);
    await dao.connect(m2).performVote(0, false);
    await time.increase(301);
    await expectRevert(dao.connect(m1).payBeneficiary(0), "Insufficient votes");
  });
});
