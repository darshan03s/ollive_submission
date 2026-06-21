'use client'

import { ReactNode, useState } from 'react'
import { ThemeProvider } from './theme-provider'
import { Toaster } from './ui/sonner'
import { TooltipProvider } from './ui/tooltip'
import { SidebarProvider } from './ui/sidebar'
import AppSidebar from './app-sidebar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const Providers = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <SidebarProvider>
          <QueryClientProvider client={queryClient}>
            <AppSidebar />
            {children}
          </QueryClientProvider>
        </SidebarProvider>
      </TooltipProvider>
      <Toaster />
    </ThemeProvider>
  )
}

export default Providers
