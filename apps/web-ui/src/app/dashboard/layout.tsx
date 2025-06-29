"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, LogOut, FileText, Users, CreditCard, Settings, Building } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { FEATURE_FLAGS } from "@/lib/feature-flags"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [userEmail] = useState("user@example.com") // TODO: Get from auth context

  const handleLogout = () => {
    // TODO: Implement logout
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <Image src="/logo.png" alt="Rustforms Logo" width={32} height={32} className="object-contain" />
            </div>
            <span className="text-xl font-bold text-white">Rustforms</span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 text-white hover:bg-gray-900">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{userEmail}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-black border-gray-800">
              <DropdownMenuItem onClick={handleLogout} className="text-white hover:bg-gray-900">
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Sidebar */}
      <div className="flex">
        <aside className="w-64 min-h-[calc(100vh-73px)] bg-black border-r border-gray-800 p-4">
          <nav className="space-y-2">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-900">
                <FileText className="w-4 h-4 mr-2" />
                Forms
              </Button>
            </Link>
            <Link href="/dashboard/team">
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-900">
                <Users className="w-4 h-4 mr-2" />
                Team Members
                {FEATURE_FLAGS.TEAM_MEMBERS && (
                  <Badge variant="secondary" className="ml-auto bg-gray-800 text-xs">
                    Pro
                  </Badge>
                )}
              </Button>
            </Link>
            <Link href="/dashboard/billing">
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-900">
                <CreditCard className="w-4 h-4 mr-2" />
                Billing
                {FEATURE_FLAGS.BILLING && (
                  <Badge variant="secondary" className="ml-auto bg-gray-800 text-xs">
                    Pro
                  </Badge>
                )}
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-900">
                <Settings className="w-4 h-4 mr-2" />
                Account Settings
              </Button>
            </Link>
            <Link href="/dashboard/organization">
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-900">
                <Building className="w-4 h-4 mr-2" />
                Organization
                {FEATURE_FLAGS.ORGANIZATION && (
                  <Badge variant="secondary" className="ml-auto bg-gray-800 text-xs">
                    Pro
                  </Badge>
                )}
              </Button>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-black">{children}</main>
      </div>
    </div>
  )
}
