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

const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row items-center justify-between">
        <SidebarTrigger />
        <Brand />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="h-full">
          <SidebarGroupLabel>Conversations</SidebarGroupLabel>
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
