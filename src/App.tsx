import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom'
import { AccessProvider } from './access/AccessContext'
import { AuthProvider } from './auth/AuthContext'
import { CartProvider } from './cart/CartContext'
import { CoursesProvider } from './courses/CoursesContext'
import { AppBoot } from './components/AppBoot'
import { BottomNav } from './components/BottomNav'
import { Header } from './components/Header'
import { CartPage } from './pages/CartPage'
import { CoursePage } from './pages/CoursePage'
import { CoursesPage } from './pages/CoursesPage'
import { Home } from './pages/Home'
import { AdminPage } from './pages/AdminPage'
import { LoginPage } from './pages/LoginPage'
import { Profile } from './pages/Profile'
import { SignupPage } from './pages/SignupPage'
import { TransferPage } from './pages/TransferPage'
import { WishlistPage } from './pages/WishlistPage'
import { WishlistProvider } from './wishlist/WishlistContext'

function CardToTransferRedirect() {
  const { slug } = useParams()
  return <Navigate to={slug ? `/transfer/${slug}` : '/transfer'} replace />
}

function Shell() {
  const { pathname } = useLocation()
  const onCourseDetail = /^\/surgalt\/.+/.test(pathname)
  const onPay =
    pathname === '/transfer' || pathname.startsWith('/transfer/')
  const onAuth = pathname === '/login' || pathname === '/signup'
  const onAdmin = pathname.startsWith('/admin')
  const hideChrome = onCourseDetail || onPay || onAuth || onAdmin

  return (
    <div className={`app-shell${hideChrome ? ' app-shell--course' : ''}${onAdmin ? ' app-shell--admin' : ''}`}>
      {!onAdmin && <Header />}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/surgalt" element={<CoursesPage />} />
          <Route path="/surgalt/:slug" element={<CoursePage />} />
          <Route path="/sags" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/transfer" element={<TransferPage />} />
          <Route path="/transfer/:slug" element={<TransferPage />} />
          <Route path="/card" element={<Navigate to="/transfer" replace />} />
          <Route path="/card/:slug" element={<CardToTransferRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      {!hideChrome && <BottomNav />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AccessProvider>
          <CoursesProvider>
            <CartProvider>
              <WishlistProvider>
                <AppBoot>
                  <Shell />
                </AppBoot>
              </WishlistProvider>
            </CartProvider>
          </CoursesProvider>
        </AccessProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
