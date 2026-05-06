import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout'
import { createFileSystemRoutes } from './router'

const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: createFileSystemRoutes(),
    },
  ],
  { basename: '/se54' },
)

export default function App() {
  return <RouterProvider router={router} />
}
