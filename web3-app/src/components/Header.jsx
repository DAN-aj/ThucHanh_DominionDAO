import { Link } from 'react-router-dom'
import { MdLightMode } from 'react-icons/md'
import { FaMoon } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import { truncate, useGlobalState } from '../store'
import { connectWallet } from '../Blockchain.services'

const btn = `px-4 py-2.5 bg-blue-600 text-white
  font-medium text-xs leading-tight uppercase
  rounded-full shadow-md hover:bg-blue-700 hover:shadow-lg
  focus:bg-blue-700 focus:shadow-lg focus:outline-none
  focus:ring-0 active:bg-blue-800 active:shadow-lg
  transition duration-150 ease-in-out dark:text-blue-500
  dark:border dark:border-blue-500 dark:bg-transparent`

const readTheme = () => {
  try {
    return localStorage.getItem('theme') || 'dark'
  } catch {
    return 'dark'
  }
}

const Header = () => {
  const [theme, setTheme] = useState(readTheme())
  const [connectedAccount] = useGlobalState('connectedAccount')

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove(theme === 'dark' ? 'light' : 'dark')
    root.classList.add(theme)
    try {
      localStorage.setItem('theme', theme)
    } catch {}
  }, [theme])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <header className="sticky top-0 z-40 dark:text-blue-500">
      <nav className="shadow-md py-2 relative flex items-center w-full justify-between bg-white dark:bg-[#212936]">
        <div className="px-6 w-full flex flex-wrap items-center justify-between">
          <div className="grow flex flex-row justify-between items-center p-2">
            <Link to={'/'} className="flex flex-row justify-start items-center space-x-3">
              <img
                src="https://haitrieu.com/wp-content/uploads/2021/10/Logo-Hoc-Vien-Cong-Nghe-Buu-Chinh-Vien-Thong-PTIT-Simple-635x807.png"
                className="w-10 h-10 object-contain"
                alt="logo"
              />
              <span className="invisible md:visible dark:text-gray-300 font-bold text-xl">
                PTIT Dominion
              </span>
            </Link>

            <div className="flex flex-row justify-center items-center space-x-5">
              {theme === 'dark' ? (
                <MdLightMode className="cursor-pointer" size={25} onClick={toggleTheme} />
              ) : (
                <FaMoon className="cursor-pointer" size={25} onClick={toggleTheme} />
              )}
              {connectedAccount ? (
                <button className={btn} title={connectedAccount}>
                  {truncate(connectedAccount, 4, 4, 11)}
                </button>
              ) : (
                <button className={btn} onClick={connectWallet}>
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
