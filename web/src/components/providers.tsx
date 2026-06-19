'use client'

import { ReactNode } from 'react'
import { ThemeProvider } from './theme-provider'
import { Toaster } from './ui/sonner'
import { TooltipProvider } from './ui/tooltip'
import { SidebarProvider } from './ui/sidebar'
import { AppSidebar } from './app-sidebar'

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
          {children}
        </SidebarProvider>
      </TooltipProvider>
      <Toaster />
    </ThemeProvider>
  )
}

export default Providers
