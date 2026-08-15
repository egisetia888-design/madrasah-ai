import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { useAuthStore } from "../../store/authStore"

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore(state => state.login)
  const loginWithGoogle = useAuthStore(state => state.loginWithGoogle)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login()
    navigate("/")
  }

  const handleGoogleLogin = async () => {
    await loginWithGoogle()
    navigate("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-4 pt-8">
          <div className="w-12 h-12 bg-gray-900 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <CardTitle className="text-xl">Selamat Datang di Madrasah</CardTitle>
          <p className="text-sm text-gray-500 mt-2">Sistem Operasi Pengetahuan Pribadi</p>
        </CardHeader>
        <CardContent className="pb-8 space-y-4">
          <Button 
            type="button" 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2 border-gray-200"
            onClick={handleGoogleLogin}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Masuk dengan Google
          </Button>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-gray-200 w-full" />
            <span className="bg-white px-2 text-xs text-gray-400 absolute">atau</span>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-gray-700" htmlFor="email">Email</label>
              <input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex h-11 md:h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-base md:text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950" 
                placeholder="nama@contoh.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-gray-700" htmlFor="password">Kata Sandi</label>
              <input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex h-11 md:h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-base md:text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950" 
                placeholder="••••••••"
              />
            </div>
            <Button className="w-full mt-2" type="submit">
              Masuk
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

