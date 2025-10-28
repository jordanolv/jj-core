"use client"

import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut, UserCircle, ArrowLeft, Settings } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  profile: string
  title?: string
  description?: string
  showBack?: boolean
  backHref?: string
  actions?: React.ReactNode
}

export default function Header({ profile, title, description, showBack, backHref = "/dashboard", actions }: HeaderProps) {
  const router = useRouter()

  const handleChangeProfile = () => {
    // Enlever seulement le profil, garder la session active
    localStorage.removeItem("currentProfile")
    router.push("/")
  }

  const handleLogout = async () => {
    // Déconnexion complète
    localStorage.removeItem("currentProfile")
    await signOut({ redirect: false })
    router.push("/")
  }

  return (
    <header className="bg-white/50 backdrop-blur-md shadow-sm border-b border-white/60">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {showBack && (
            <Button variant="ghost" size="icon" onClick={() => router.push(backHref)} className="hover:bg-white/60 flex-shrink-0">
              <ArrowLeft className="h-5 w-5 text-slate-700" />
            </Button>
          )}
          {title ? (
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">{title}</h1>
              {description && <p className="text-sm text-slate-500 hidden sm:block">{description}</p>}
            </div>
          ) : (
            <>
              <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                <span className="text-base font-bold text-white">
                  {profile === "jordan" ? "J" : "J"}
                </span>
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <p className="text-sm text-slate-600 leading-tight truncate">
                  Bienvenue {profile === "jordan" ? "Jordan" : "Juliette"} ✨
                </p>
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {actions}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-white/50 hover:bg-white/80 border-slate-300">
                <UserCircle className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Profil</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white backdrop-blur-sm border border-slate-200 shadow-lg">
              <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleChangeProfile} className="cursor-pointer">
                <UserCircle className="mr-2 h-4 w-4" />
                Changer de profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

