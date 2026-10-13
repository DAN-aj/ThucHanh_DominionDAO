import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { setGlobalState, useGlobalState } from '../store'
import { raiseProposal, errorMessage } from '../Blockchain.services'
import { toast } from 'react-toastify'

const inputWrap =
  'flex flex-row justify-between items-center border border-gray-500 dark:border-gray-500 rounded-xl mt-5'
const inputClass =
  'block w-full text-sm bg-transparent border-0 focus:outline-none focus:ring-0 rounded-xl'

const CreateProposal = () => {
  const [createModal] = useGlobalState('createModal')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [beneficiary, setBeneficiary] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title || !description || !beneficiary || !amount) {
      return toast.warning('Vui lòng điền đủ thông tin')
    }
    setLoading(true)
    const pending = toast.loading('Đang tạo đề xuất...')
    try {
      await raiseProposal({ title, description, beneficiary: beneficiary.trim(), amount })
      toast.update(pending, {
        render: 'Proposal created!',
        type: 'success',
        isLoading: false,
        autoClose: 4000,
      })
      closeModal()
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

  const closeModal = () => {
    setGlobalState('createModal', 'scale-0')
    setTitle('')
    setAmount('')
    setBeneficiary('')
    setDescription('')
  }

  return (
    <div
      className={`fixed top-0 left-0 w-screen h-screen flex items-center
        justify-center bg-black bg-opacity-50 transform z-50
        transition-transform duration-300 ${createModal}`}
    >
      <div className="bg-white dark:bg-[#212936] shadow-xl shadow-[#122643] dark:shadow-gray-500 rounded-xl w-11/12 md:w-2/5 p-6">
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <div className="flex flex-row justify-between items-center">
            <p className="font-semibold">Raise Proposal</p>
            <button
              type="button"
              onClick={closeModal}
              className="border-0 bg-transparent focus:outline-none"
            >
              <FaTimes />
            </button>
          </div>

          <div className={inputWrap}>
            <input
              className={inputClass}
              type="text"
              placeholder="Title"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              required
            />
          </div>
          <div className={inputWrap}>
            <input
              className={inputClass}
              type="number"
              min="0"
              step="0.001"
              placeholder="e.g 0.005 Eth"
              onChange={(e) => setAmount(e.target.value)}
              value={amount}
              required
            />
          </div>
          <div className={inputWrap}>
            <input
              className={inputClass}
              type="text"
              placeholder="Beneficiary Address (ví của bạn A)"
              onChange={(e) => setBeneficiary(e.target.value)}
              value={beneficiary}
              required
            />
          </div>
          <div className={inputWrap}>
            <textarea
              className={`${inputClass} resize-none h-20`}
              placeholder="Description"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              required
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg px-6 py-2.5 bg-blue-600
              text-white font-medium text-xs leading-tight
              uppercase hover:bg-blue-700 focus:bg-blue-700
              focus:outline-none focus:ring-0 active:bg-blue-800
              transition duration-150 ease-in-out mt-5 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Submit Proposal'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateProposal
