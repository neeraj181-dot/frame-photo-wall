import { AuthProvider } from './context/AuthContext'
import WallPage from './pages/WallPage'

export default function App() {
  return (
    <AuthProvider>
      <WallPage />
    </AuthProvider>
  )
}
