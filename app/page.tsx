"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Email ou mot de passe incorrect")
    } else {
      setIsAuthenticated(true)
    }
  }

  const selectProfile = (profile: "jordan" | "juliette") => {
    localStorage.setItem("currentProfile", profile)
    router.push("/dashboard")
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 via-rose-50 to-blue-50 p-4">
        <Card className="w-full max-w-md bg-white/50 backdrop-blur-sm border border-white/60 shadow-xl rounded-2xl">
          <CardHeader className="space-y-4 text-center pb-6 pt-8">
            <div className="mx-auto w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-rose-400 to-pink-400 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl md:text-3xl font-bold text-white">J&J</span>
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold text-slate-800">
              Notre Espace
            </CardTitle>
            <CardDescription className="text-sm md:text-base text-slate-600">
              Bienvenue dans notre petit cocon numérique
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 md:px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <Input
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 bg-white/80 border-slate-200 focus:border-rose-400 focus:ring-rose-400/20 transition-all rounded-lg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Mot de passe</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 bg-white/80 border-slate-200 focus:border-rose-400 focus:ring-rose-400/20 transition-all rounded-lg"
                    required
                  />
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
              </div>
              <Button
                type="submit"
                className="w-full h-11 md:h-12 bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white border-0 transition-all shadow-md hover:shadow-lg rounded-lg font-medium"
              >
                Se connecter
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 via-rose-50 to-blue-50 p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-slate-800">
          Qui êtes-vous aujourd&apos;hui ?
        </h1>
        <p className="text-center text-slate-600 mb-12 text-base md:text-lg">
          Choisissez votre profil pour continuer
        </p>
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <Card
            className="relative cursor-pointer bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 group rounded-2xl overflow-hidden"
            onClick={() => selectProfile("jordan")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <CardHeader className="relative text-center py-12">
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-5xl md:text-6xl font-bold">J</span>
              </div>
              <CardTitle className="text-3xl md:text-4xl text-blue-900">Jordan</CardTitle>
              <p className="text-sm text-blue-700 mt-2 font-medium">Cuisine & Abonnements</p>
            </CardHeader>
          </Card>

          <Card
            className="relative cursor-pointer bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 group rounded-2xl overflow-hidden"
            onClick={() => selectProfile("juliette")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-400/10 to-pink-400/10 opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <CardHeader className="relative text-center py-12">
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-5xl md:text-6xl font-bold">J</span>
              </div>
              <CardTitle className="text-3xl md:text-4xl text-rose-900">Juliette</CardTitle>
              <p className="text-sm text-rose-700 mt-2 font-medium">Pet-sitting & Animaux</p>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}
