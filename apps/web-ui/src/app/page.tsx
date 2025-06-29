import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Shield, Zap, Github, Globe } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <Image src="/logo.png" alt="Rustforms Logo" width={32} height={32} className="object-contain" />
            </div>
            <span className="text-xl font-bold text-white">Rustforms</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="https://github.com/rustforms/rustforms" target="_blank">
              <Button variant="ghost" className="text-white hover:bg-gray-900">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:bg-gray-900">
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-white text-black hover:bg-gray-200">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4 bg-gray-800 text-white">
            Free & Open Source
          </Badge>
          <h1 className="text-5xl font-bold mb-6 gradient-text">The Open-Source Form Backend for Developers</h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Create forms and receive submissions directly to your email. Self-hostable, secure, and built for developers
            who value simplicity and control.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 bg-white text-black hover:bg-gray-200">
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="https://github.com/rustforms/rustforms" target="_blank">
              <Button variant="outline" size="lg" className="text-lg px-8 border-gray-600 text-white hover:bg-gray-900">
                <Github className="mr-2 w-4 h-4" />
                View on GitHub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-950">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-white">Why Choose Rustforms?</h2>
            <p className="text-gray-400 text-lg">Built for developers who want simple, reliable form handling</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-gray-800 bg-black">
              <CardHeader>
                <Zap className="w-8 h-8 text-white mb-2" />
                <CardTitle className="text-white">Lightning Fast</CardTitle>
                <CardDescription className="text-gray-400">
                  Built with Rust for maximum performance and reliability
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-gray-800 bg-black">
              <CardHeader>
                <Shield className="w-8 h-8 text-white mb-2" />
                <CardTitle className="text-white">Secure by Default</CardTitle>
                <CardDescription className="text-gray-400">
                  Enterprise-grade security with spam protection and validation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-gray-800 bg-black">
              <CardHeader>
                <Globe className="w-8 h-8 text-white mb-2" />
                <CardTitle className="text-white">Self-Hostable</CardTitle>
                <CardDescription className="text-gray-400">
                  Deploy on your own infrastructure for complete control
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-white">Simple, Transparent Pricing</h2>
            <p className="text-gray-400 text-lg">Start free, scale as you grow</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-gray-800 bg-black">
              <CardHeader>
                <CardTitle className="text-white">Free</CardTitle>
                <CardDescription className="text-gray-400">Perfect for personal projects</CardDescription>
                <div className="text-3xl font-bold text-white mt-4">$0</div>
              </CardHeader>
            </Card>

            <Card className="border-gray-800 bg-black relative">
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-white text-black">Popular</Badge>
              <CardHeader>
                <CardTitle className="text-white">Pro</CardTitle>
                <CardDescription className="text-gray-400">For growing businesses</CardDescription>
                <div className="text-3xl font-bold text-white mt-4">
                  $9<span className="text-lg text-gray-400">/mo</span>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-gray-800 bg-black">
              <CardHeader>
                <CardTitle className="text-white">Enterprise</CardTitle>
                <CardDescription className="text-gray-400">For large organizations</CardDescription>
                <div className="text-3xl font-bold text-white mt-4">Custom</div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 rounded flex items-center justify-center">
              <Image src="/logo.png" alt="Rustforms Logo" width={24} height={24} className="object-contain" />
            </div>
            <span className="font-semibold text-white">Rustforms</span>
          </div>
          <div className="flex justify-center space-x-8 mb-4">
            <Link href="/docs" className="text-gray-400 hover:text-white">
              Documentation
            </Link>
            <Link href="/contact" className="text-gray-400 hover:text-white">
              Contact
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-white">
              Privacy Policy
            </Link>
          </div>
          <p className="text-gray-400 text-sm text-center">
            © 2025 Rustforms. Open-source form backend for developers.
          </p>
        </div>
      </footer>
    </div>
  )
}
