import { NavLink, Outlet } from 'react-router-dom'
import './Layout.css'

export default function Layout() {
  return (
    <div className="layout">
      <nav className="nav">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/rstp24view">RSTP24</NavLink>
        <NavLink to="/abcd300view">ABCD300</NavLink>
      </nav>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
