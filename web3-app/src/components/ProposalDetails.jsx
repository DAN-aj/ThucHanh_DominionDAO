import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Legend, Tooltip } from 'recharts'
import { voteOnProposal, errorMessage } from '../Blockchain.services'
import { useGlobalState, daysRemaining, isExpired, truncate } from '../store'
import { btnClass } from './Banner'
import useTick from './useTick'

const ProposalDetails = () => {
  const { id } = useParams()
  const [proposals] = useGlobalState('proposals')
  const [isStakeholder] = useGlobalState('isStakeholder')
  const [loading, setLoading] = useState(false)
  useTick(1000)

  const proposal = proposals.find((p) => String(p.id) === String(id))

  if (!proposal) {
    return <div className="p-8">Không tìm thấy đề xuất #{id}.</div>
  }

  const data = [
    { name: 'Voters', Acceptees: proposal.upvotes, Rejectees: proposal.downvotes },
  ]
  const expired = isExpired(proposal.duration)

  const onVote = async (choice) => {
    if (expired) return toast.warning('Proposal expired!')
    setLoading(true)
    const pending = toast.loading('Đang gửi phiếu bầu...')
    try {
      await voteOnProposal(id, choice)
      toast.update(pending, {
        render: 'Voted successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 4000,
      })
    } catch (error) {
      toast.update(pending, {
        render: errorMessage(error),
        type: 'error',
        isLoading: false,
        autoClose: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h2 className="font-semibold text-3xl mb-5">{proposal.title}</h2>
      <p>
        This proposal is to payout <strong>{proposal.amount} Eth</strong> to{' '}
        <strong title={proposal.beneficiary}>{truncate(proposal.beneficiary, 6, 4, 13)}</strong>{' '}
        and currently has <strong>{proposal.upvotes + proposal.downvotes} votes</strong>.{' '}
        {expired ? (
          <strong>Voting closed.</strong>
        ) : (
          <>
            Voting closes in <strong>{daysRemaining(proposal.duration)}</strong>.
          </>
        )}
      </p>
      <hr className="my-6 border-gray-300" />
      <p>{proposal.description}</p>
      <div className="flex flex-row justify-start items-center w-full mt-4 overflow-auto">
        <BarChart width={730} height={250} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Acceptees" fill="#2563eb" />
          <Bar dataKey="Rejectees" fill="#dc2626" />
        </BarChart>
      </div>
      {isStakeholder && !expired ? (
        <div className="flex flex-row justify-start items-center space-x-3 mt-4" role="group">
          <button type="button" className={btnClass} disabled={loading} onClick={() => onVote(true)}>
            Accept
          </button>
          <button type="button" className={btnClass} disabled={loading} onClick={() => onVote(false)}>
            Reject
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default ProposalDetails
