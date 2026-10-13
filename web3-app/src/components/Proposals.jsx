import Identicon from 'react-identicons'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { truncate, useGlobalState, daysRemaining, isExpired } from '../store'
import { payoutBeneficiary, errorMessage } from '../Blockchain.services'
import { toast } from 'react-toastify'
import useTick from './useTick'

const deactive = `bg-transparent
  text-blue-600 font-medium text-xs leading-tight
  uppercase hover:bg-blue-700 focus:bg-blue-700
  focus:outline-none focus:ring-0 active:bg-blue-600
  transition duration-150 ease-in-out overflow-hidden
  border border-blue-600 hover:text-white focus:text-white`

const active = `bg-blue-600
  text-white font-medium text-xs leading-tight
  uppercase hover:bg-blue-700 focus:bg-blue-700
  focus:outline-none focus:ring-0 active:bg-blue-800
  transition duration-150 ease-in-out overflow-hidden
  border border-blue-600`

// Tailwind cần tên class đầy đủ (không ghép chuỗi động) để sinh CSS
const pillColors = {
  blue: 'bg-blue-600 dark:border-blue-600 dark:text-blue-600',
  red: 'bg-red-600 dark:border-red-600 dark:text-red-600',
  green: 'bg-green-600 dark:border-green-600 dark:text-green-600',
  yellow: 'bg-yellow-600 dark:border-yellow-600 dark:text-yellow-600',
}
const pill = (color) => `rounded-full px-6 py-2.5 font-medium text-xs leading-tight uppercase
  transition duration-150 ease-in-out text-white dark:border dark:bg-transparent
  disabled:opacity-50 ${pillColors[color]}`

const Proposals = () => {
  const [data] = useGlobalState('proposals')
  const [isStakeholder] = useGlobalState('isStakeholder')
  const [filter, setFilter] = useState('all')
  const [paying, setPaying] = useState(null)
  useTick(5000)

  // Lọc trực tiếp từ global state -> danh sách luôn cập nhật sau mỗi giao dịch
  const proposals = data.filter((p) => {
    if (filter === 'open') return !isExpired(p.duration)
    if (filter === 'closed') return isExpired(p.duration)
    return true
  })

  const handlePayout = async (proposal) => {
    setPaying(proposal.id)
    const pending = toast.loading('Đang giải ngân...')
    try {
      await payoutBeneficiary(proposal.id)
      toast.update(pending, {
        render: `Payout thành công! ${proposal.amount} ETH đã gửi đến ${truncate(
          proposal.beneficiary, 5, 3, 11
        )}`,
        type: 'success',
        isLoading: false,
        autoClose: 6000,
      })
    } catch (error) {
      toast.update(pending, {
        render: errorMessage(error),
        type: 'error',
        isLoading: false,
        autoClose: 5000,
      })
    } finally {
      setPaying(null)
    }
  }

  const renderAction = (proposal) => {
    if (!isExpired(proposal.duration)) return null
    if (proposal.upvotes <= proposal.downvotes) {
      return <span className={pill('red')}>Rejected</span>
    }
    if (proposal.paid) return <span className={pill('green')}>Paid</span>
    if (!isStakeholder) return <span className={pill('yellow')}>Passed</span>
    return (
      <button
        className={pill('red')}
        disabled={paying === proposal.id}
        onClick={() => handlePayout(proposal)}
      >
        {paying === proposal.id ? 'Paying...' : 'Payout'}
      </button>
    )
  }

  const tab = (key, label, extra) => (
    <button
      className={`${extra} px-6 py-2.5 ${filter === key ? active : deactive}`}
      onClick={() => setFilter(key)}
    >
      {label}
    </button>
  )

  return (
    <div className="flex flex-col p-8">
      <div className="flex flex-row justify-center items-center" role="group">
        {tab('all', 'All', 'rounded-l-full')}
        {tab('open', 'Open', '')}
        {tab('closed', 'Closed', 'rounded-r-full')}
      </div>

      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
          <div className="h-[calc(100vh_-_20rem)] overflow-y-auto shadow-md rounded-md">
            <table className="min-w-full">
              <thead className="border-b dark:border-gray-500">
                <tr>
                  {['Created By', 'Title', 'Amount', 'Votes', 'Expires', 'Action'].map((h) => (
                    <th key={h} scope="col" className="text-sm font-medium px-6 py-4 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {proposals.map((proposal) => (
                  <tr key={proposal.id} className="border-b dark:border-gray-500">
                    <td className="text-sm font-light px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-row justify-start items-center space-x-3">
                        <Identicon
                          string={proposal.proposer.toLowerCase()}
                          size={25}
                          className="h-10 w-10 object-contain rounded-full mr-3"
                        />
                        <span>{truncate(proposal.proposer, 4, 4, 11)}</span>
                      </div>
                    </td>
                    <td className="text-sm font-light px-6 py-4 whitespace-nowrap">
                      {proposal.title.length > 40
                        ? proposal.title.substring(0, 40) + '...'
                        : proposal.title}
                    </td>
                    <td className="text-sm font-light px-6 py-4 whitespace-nowrap">
                      {proposal.amount} Eth
                    </td>
                    <td className="text-sm font-light px-6 py-4 whitespace-nowrap">
                      👍 {proposal.upvotes} / 👎 {proposal.downvotes}
                    </td>
                    <td className="text-sm font-light px-6 py-4 whitespace-nowrap">
                      {daysRemaining(proposal.duration)}
                    </td>
                    <td className="flex justify-start items-center space-x-3 text-sm font-light px-6 py-4 whitespace-nowrap">
                      <Link to={'/proposal/' + proposal.id} className={pill('blue')}>
                        View
                      </Link>
                      {renderAction(proposal)}
                    </td>
                  </tr>
                ))}
                {proposals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-sm text-center px-6 py-8 opacity-70">
                      Chưa có đề xuất nào
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Proposals
