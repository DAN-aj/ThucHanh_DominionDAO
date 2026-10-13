import { useEffect, useState } from 'react'

// Re-render định kỳ để đồng hồ đếm ngược và trạng thái Expired tự cập nhật
const useTick = (ms = 5000) => {
  const [, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(t)
  }, [ms])
}

export default useTick
