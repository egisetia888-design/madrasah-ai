import { Button } from "../../components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"

export function LoginPage() {
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
        <CardContent className="pb-8">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-gray-700" htmlFor="email">Email</label>
              <input 
                id="email" 
                type="email" 
                className="flex h-11 md:h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-base md:text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950" 
                placeholder="nama@contoh.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-gray-700" htmlFor="password">Kata Sandi</label>
              <input 
                id="password" 
                type="password" 
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
