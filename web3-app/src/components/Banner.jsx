import { useState } from 'react'
import { useGlobalState, setGlobalState, isExpired } from '../store'
import { toast } from 'react-toastify'
import { performContribute, errorMessage } from '../Blockchain.services'

export const btnClass = `inline-block px-6 py-2.5
  bg-blue-600 text-white font-medium text-xs
  leading-tight uppercase shadow-md rounded-full
  hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700
  focus:shadow-lg focus:outline-none focus:ring-0
  active:bg-blue-800 active:shadow-lg transition
  duration-150 ease-in-out dark:text-blue-500
  dark:border dark:border-blue-500 dark:bg-transparent
  disabled:opacity-50 disabled:cursor-not-allowed`

const Banner = () => {
  const [isStakeholder] = useGlobalState('isStakeholder')
  const [proposals] = useGlobalState('proposals')
  const [balance] = useGlobalState('balance')
  const [mybalance] = useGlobalState('mybalance')
  const [connectedAccount] = useGlobalState('connectedAccount')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const onPropose = () => {
    if (!isStakeholder) return
    setGlobalState('createModal', 'scale-100')
  }

  const onContribute = async () => {
    if (!amount || Number(amount) <= 0) return toast.warning('Nhập số ETH muốn góp')
    if (!connectedAccount) return toast.warning('Vui lòng Connect Wallet trước')
    setLoading(true)
    const pending = toast.loading('Đang chờ xác nhận giao dịch...')
    try {
      await performContribute(amount)
      toast.update(pending, {
        render: `Đã góp ${amount} ETH vào quỹ DAO`,
        type: 'success',
        isLoading: false,
        autoClose: 4000,
      })
      setAmount('')
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

  const opened = proposals.filter((p) => !isExpired(p.duration)).length

  return (
    <div className="p-8">
      <h2 className="font-semibold text-3xl mb-5">
        {opened} Proposal{opened === 1 ? '' : 's'} Currently Opened
      </h2>
      <p>
        Current DAO Balance: <strong>{balance} Eth</strong> <br />
        Your contributions:{' '}
        <span>
          <strong>{mybalance} Eth</strong>
          {isStakeholder ? ', and you are now a stakeholder 😊' : null}
        </span>
      </p>
      <hr className="my-6 border-gray-300 dark:border-gray-500" />
      <p>
        {isStakeholder
          ? 'You can now raise proposals on this platform 😆'
          : 'Hey, when you contribute up to 0.01 ether you become a stakeholder 😎'}
      </p>
      <div className="flex flex-row justify-start items-center md:w-1/3 w-full mt-4">
        <input
          type="number"
          min="0"
          step="0.001"
          className="form-control block w-full px-3 py-1.5
            text-base font-normal text-gray-700
            bg-clip-padding border border-solid border-gray-300
            rounded transition ease-in-out m-0 shadow-md
            focus:text-gray-500 focus:outline-none
            dark:border-gray-500 dark:bg-transparent dark:text-gray-300"
          placeholder="e.g 0.01 Eth"
          onChange={(e) => setAmount(e.target.value)}
          value={amount}
          required
        />
      </div>
      <div className="flex flex-row justify-start items-center space-x-3 mt-4" role="group">
        <button type="button" className={btnClass} onClick={onContribute} disabled={loading}>
          {loading ? 'Processing...' : 'Contribute'}
        </button>
        {isStakeholder ? (
          <button type="button" className={btnClass} onClick={onPropose}>
            Propose
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default Banner
