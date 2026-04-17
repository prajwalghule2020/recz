'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

interface ThemeSwitchProps {
  className?: string
}

export function ThemeSwitch({ className = '' }: ThemeSwitchProps) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const activeTheme = (resolvedTheme ?? theme ?? 'light') as 'light' | 'dark'

  const toggleTheme = React.useCallback(() => {
    const newTheme = activeTheme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }, [activeTheme, setTheme])

  if (!mounted) {
    return (
      <button
        aria-label='Toggle theme'
        className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-opacity overflow-hidden ${className}`}
      />
    )
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label='Toggle dark mode'
      title={activeTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative flex h-8 w-8 items-center justify-center rounded-full text-[var(--nav-text)] hover:opacity-80 transition-opacity overflow-hidden ${className}`}
    >
      <Sun
        className={`absolute h-5 w-5 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          activeTheme === 'light' 
            ? 'scale-100 translate-y-0 opacity-100' 
            : 'scale-50 translate-y-5 opacity-0'
        }`}
      />
      <Moon
        className={`absolute h-5 w-5 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          activeTheme === 'dark' 
            ? 'scale-100 translate-y-0 opacity-100' 
            : 'scale-50 translate-y-5 opacity-0'
        }`}
      />
    </button>
  )
}