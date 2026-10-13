import Identicon from 'react-identicons'
import moment from 'moment'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { truncate, useGlobalState } from '../store'
import { listVoters } from '../Blockchain.services'

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

const Voters = () => {
  const { id } = useParams()
  const [proposals] = useGlobalState('proposals')
  const [data, setData] = useState([])
  const [filter, setFilter] = useState('all')

  const timeAgo = (timestamp) => moment(Number(timestamp) * 1000).fromNow()

  // Tải lại danh sách voter mỗi khi proposals thay đổi (vd: sau khi vote)
  useEffect(() => {
    let cancelled = false
    listVoters(id).then((res) => {
      if (!cancelled) setData(res || [])
    })
    return () => {
      cancelled = true
    }
  }, [id, proposals])

  const voters = data.filter((v) => {
    if (filter === 'accepted') return v.choosen
    if (filter === 'rejected') return !v.choosen
    return true
  })

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
        {tab('accepted', 'Acceptees', '')}
        {tab('rejected', 'Rejectees', 'rounded-r-full')}
      </div>

      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
          <div className="h-[calc(100vh_-_20rem)] overflow-y-auto shadow-md rounded-md">
            <table className="min-w-full">
              <thead className="border-b dark:border-gray-500">
                <tr>
                  {['Voter', 'Voted', 'Vote'].map((h) => (
                    <th key={h} scope="col" className="text-sm font-medium px-6 py-4 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {voters.map((voter, i) => (
                  <tr key={i} className="border-b dark:border-gray-500 transition duration-300 ease-in-out">
                    <td className="text-sm font-light px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-row justify-start items-center space-x-3">
                        <Identicon
                          string={voter.voter.toLowerCase()}
                          size={25}
                          className="h-10 w-10 object-contain rounded-full mr-3"
                        />
                        <span>{truncate(voter.voter, 4, 4, 11)}</span>
                      </div>
                    </td>
                    <td className="text-sm font-light px-6 py-4 whitespace-nowrap">
                      {timeAgo(voter.timestamp)}
                    </td>
                    <td className="text-sm font-light px-6 py-4 whitespace-nowrap">
                      {voter.choosen ? (
                        <span className="border-2 rounded-full px-6 py-2.5 border-blue-600 text-blue-600 font-medium text-xs uppercase">
                          Accepted
                        </span>
                      ) : (
                        <span className="border-2 rounded-full px-6 py-2.5 border-red-600 text-red-600 font-medium text-xs uppercase">
                          Rejected
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {voters.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-sm text-center px-6 py-8 opacity-70">
                      Chưa có phiếu bầu
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

export default Voters
