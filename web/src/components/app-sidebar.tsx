import Link from 'next/link'
import Brand from './brand'
import Conversations from './conversations'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarTrigger
} from './ui/sidebar'
import { Plus } from 'lucide-react'

const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row items-center justify-between">
        <SidebarTrigger />
        <Brand />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="h-full">
          <SidebarGroupLabel className="flex items-center justify-between px-0">
            Conversations
            <Link href="/" className="p-1 hover:bg-muted rounded-full">
              <Plus className="size-3" />
            </Link>
          </SidebarGroupLabel>
          <SidebarGroupContent className="h-full">
            <Conversations />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
export default AppSidebar
