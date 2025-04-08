import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './index.css'
import Login from './components/dashboard/login'
import Driver from './components/dashboard/user'
import Admin from './components/dashboard/admin'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>

    <Login/>
    {/* <Driver/> */}
    {/* <Admin/> */}
    </>
  )
}

export default App
