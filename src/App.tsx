import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout'
import { createFileSystemRoutes } from './router'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: createFileSystemRoutes(),
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
