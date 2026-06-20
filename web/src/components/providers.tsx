import { ReactNode } from 'react'
import { ThemeProvider } from './theme-provider'
import { Toaster } from './ui/sonner'
import { TooltipProvider } from './ui/tooltip'
import { SidebarProvider } from './ui/sidebar'
import { AppSidebar } from './app-sidebar'
import { ClerkProvider } from '@clerk/nextjs'

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <ClerkProvider>
          <SidebarProvider>
            <AppSidebar />
            {children}
          </SidebarProvider>
        </ClerkProvider>
      </TooltipProvider>
      <Toaster />
    </ThemeProvider>
  )
}

export default Providers
