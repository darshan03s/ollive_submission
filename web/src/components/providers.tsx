import { ReactNode } from 'react'
import { ThemeProvider } from './theme-provider'
import { Toaster } from './ui/sonner'
import { TooltipProvider } from './ui/tooltip'

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster />
    </ThemeProvider>
  )
}

export default Providers
