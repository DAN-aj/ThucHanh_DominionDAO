import Web3 from 'web3'
import { setGlobalState, getGlobalState } from './store'
import abi from './abis/DominionDAO.json'

const { ethereum } = window
const SEPOLIA_CHAIN_ID = '0xaa36a7' // 11155111

if (ethereum) window.web3 = new Web3(ethereum)

// Đảm bảo MetaMask đang ở mạng Sepolia (tự hỏi để chuyển mạng)
const ensureSepolia = async () => {
  const chainId = await ethereum.request({ method: 'eth_chainId' })
  if (chainId === SEPOLIA_CHAIN_ID) return true
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    })
    return true
  } catch (error) {
    alert('Vui lòng chuyển MetaMask sang mạng Sepolia')
    return false
  }
}

const connectWallet = async () => {
  try {
    if (!ethereum) return alert('Vui lòng cài MetaMask')
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
    await ensureSepolia()
    setGlobalState('connectedAccount', accounts[0].toLowerCase())
    window.location.reload()
  } catch (error) {
    reportError(error)
  }
}

const isWallectConnected = async () => {
  try {
    if (!ethereum) return alert('Vui lòng cài MetaMask')
    const accounts = await ethereum.request({ method: 'eth_accounts' })

    ethereum.on('chainChanged', () => window.location.reload())
    ethereum.on('accountsChanged', () => window.location.reload())

    if (accounts.length) {
      setGlobalState('connectedAccount', accounts[0].toLowerCase())
      await ensureSepolia()
    } else {
      console.log('No accounts found.')
    }
  } catch (error) {
    reportError(error)
  }
}

const getEtheriumContract = () => {
  let contract = getGlobalState('contract')
  if (contract) return contract
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS
  if (!contractAddress) {
    alert('Chưa cấu hình REACT_APP_CONTRACT_ADDRESS trong file .env')
    return null
  }
  contract = new window.web3.eth.Contract(abi.abi, contractAddress)
  setGlobalState('contract', contract)
  return contract
}

const requireAccount = () => {
  const account = getGlobalState('connectedAccount')
  if (!account) throw new Error('Vui lòng Connect Wallet trước')
  return account
}

const performContribute = async (amount) => {
  const account = requireAccount()
  const value = window.web3.utils.toWei(amount.toString(), 'ether')
  const contract = getEtheriumContract()
  await contract.methods.contribute().send({ from: account, value })
  await refresh()
}

const getInfo = async () => {
  try {
    if (!ethereum) return
    const contract = getEtheriumContract()
    if (!contract) return
    const connectedAccount = getGlobalState('connectedAccount')
    const balance = await contract.methods.daoBalance().call()
    setGlobalState('balance', window.web3.utils.fromWei(balance))

    if (connectedAccount) {
      const isStakeholder = await contract.methods
        .isStakeholder()
        .call({ from: connectedAccount })
      const mybalance = await contract.methods
        .getBalance()
        .call({ from: connectedAccount })
      setGlobalState('mybalance', window.web3.utils.fromWei(mybalance))
      setGlobalState('isStakeholder', isStakeholder)
    }
  } catch (error) {
    reportError(error)
  }
}

const raiseProposal = async ({ title, description, beneficiary, amount }) => {
  const account = requireAccount()
  if (!window.web3.utils.isAddress(beneficiary)) {
    throw new Error('Địa chỉ beneficiary không hợp lệ')
  }
  amount = window.web3.utils.toWei(amount.toString(), 'ether')
  const contract = getEtheriumContract()
  await contract.methods
    .createProposal(title, description, beneficiary, amount)
    .send({ from: account })
  await refresh()
}

const getProposals = async () => {
  try {
    if (!ethereum) return
    const contract = getEtheriumContract()
    if (!contract) return
    const proposals = await contract.methods.getProposals().call()
    setGlobalState('proposals', structuredProposals(proposals))
  } catch (error) {
    reportError(error)
  }
}

const structuredProposals = (proposals) =>
  proposals
    .map((proposal) => ({
      id: proposal.id,
      amount: window.web3.utils.fromWei(proposal.amount),
      title: proposal.title,
      description: proposal.description,
      paid: proposal.paid,
      passed: proposal.passed,
      proposer: proposal.proposer,
      upvotes: Number(proposal.upvotes),
      downvotes: Number(proposal.downvotes),
      beneficiary: proposal.beneficiary,
      executor: proposal.executor,
      duration: proposal.duration,
    }))
    .reverse()

const getProposal = async (id) => {
  const proposals = getGlobalState('proposals')
  return proposals.find((proposal) => String(proposal.id) === String(id))
}

const voteOnProposal = async (proposalId, supported) => {
  const account = requireAccount()
  const contract = getEtheriumContract()
  await contract.methods.performVote(proposalId, supported).send({ from: account })
  await refresh()
}

const listVoters = async (id) => {
  try {
    const contract = getEtheriumContract()
    if (!contract) return []
    return await contract.methods.getVotesOf(id).call()
  } catch (error) {
    reportError(error)
    return []
  }
}

const payoutBeneficiary = async (id) => {
  const account = requireAccount()
  const contract = getEtheriumContract()
  await contract.methods.payBeneficiary(id).send({ from: account })
  await refresh()
}

const refresh = async () => {
  await Promise.all([getInfo(), getProposals()])
}

// Lấy thông báo lỗi dễ đọc (revert reason / user từ chối giao dịch)
const errorMessage = (error) => {
  if (!error) return 'Có lỗi xảy ra'
  if (error.code === 4001) return 'Bạn đã từ chối giao dịch'
  const msg = error.message || String(error)
  const m = msg.match(/reverted with reason string '([^']+)'|execution reverted: ([^"\n]+)/)
  if (m) return m[1] || m[2]
  return msg.length > 160 ? msg.slice(0, 160) + '...' : msg
}

const reportError = (error) => {
  console.error(error)
}

export {
  isWallectConnected,
  connectWallet,
  performContribute,
  getInfo,
  raiseProposal,
  getProposals,
  getProposal,
  voteOnProposal,
  listVoters,
  payoutBeneficiary,
  refresh,
  errorMessage,
}
