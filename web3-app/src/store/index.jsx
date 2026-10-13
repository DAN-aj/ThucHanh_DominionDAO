import { createGlobalState } from 'react-hooks-global-state'
import moment from 'moment'

const { setGlobalState, useGlobalState, getGlobalState } = createGlobalState({
  createModal: 'scale-0',
  connectedAccount: '',
  contract: null,
  proposals: [],
  isStakeholder: false,
  balance: 0,
  mybalance: 0,
})

const truncate = (text, startChars, endChars, maxLength) => {
  if (!text) return ''
  if (text.length > maxLength) {
    let start = text.substring(0, startChars)
    const end = text.substring(text.length - endChars, text.length)
    while (start.length + end.length < maxLength) {
      start = start + '.'
    }
    return start + end
  }
  return text
}

// duration (giây, unix) -> mili giây
const toMs = (seconds) => Number(seconds) * 1000

const isExpired = (duration) => Date.now() > toMs(duration)

// Hợp đồng chỉ cho vote 5 phút, nên hiển thị cả phút/giây thay vì "0 days"
const daysRemaining = (duration) => {
  if (!duration) return ''
  const diff = moment(toMs(duration)).diff(moment(), 'seconds')
  if (diff <= 0) return 'Expired'
  if (diff < 60) return `${diff} giây`
  if (diff < 3600) return `${Math.ceil(diff / 60)} phút`
  if (diff < 86400) return `${Math.ceil(diff / 3600)} giờ`
  const days = Math.ceil(diff / 86400)
  return days === 1 ? '1 day' : days + ' days'
}

export {
  truncate,
  setGlobalState,
  useGlobalState,
  getGlobalState,
  daysRemaining,
  isExpired,
  toMs,
}
