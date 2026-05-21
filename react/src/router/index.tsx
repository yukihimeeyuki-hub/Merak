import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from '@/App'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <div>页面未找到</div>,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

export default router
