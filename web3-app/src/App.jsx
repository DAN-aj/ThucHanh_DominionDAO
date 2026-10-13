import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'
import { isWallectConnected, refresh } from './Blockchain.services'
import Header from './components/Header'
import Home from './views/Home'
import Proposal from './views/Proposal'

const App = () => {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // useEffect không được là hàm async -> gọi hàm async bên trong
    const init = async () => {
      await isWallectConnected()
      await refresh() // getInfo + getProposals, đợi xong mới render
      setLoaded(true)
    }
    init()
    // Tự cập nhật mỗi 15 giây để thấy thao tác của các bạn khác trong nhóm
    const timer = setInterval(refresh, 15000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-[#212936] dark:text-gray-300">
      <Header />
      {loaded ? (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/proposal/:id" element={<Proposal />} />
        </Routes>
      ) : (
        <p className="p-8">Đang tải dữ liệu từ blockchain...</p>
      )}
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  )
}

export default App
