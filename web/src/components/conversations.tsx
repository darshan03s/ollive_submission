'use client'

import { env } from '@/env'
import { useQuery } from '@tanstack/react-query'
import { ConversationType } from 'db/types'
import { SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from './ui/sidebar'
import Link from 'next/link'
import { Ellipsis } from 'lucide-react'
import { useUserId } from '@/hooks/use-user-id'

const getConversations = async (userId: string): Promise<ConversationType[]> => {
  const res = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/conversations`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId
    }
  })
  return res.json()
}

const Conversations = () => {
  const userId = useUserId()

  const { isLoading, data, error } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => getConversations(userId!),
    enabled: !!userId
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Error: {error.message}
      </div>
    )
  }

  if (data?.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No conversations found
      </div>
    )
  }

  return (
    <div>
      {data?.map((conversation) => (
        <SidebarMenu key={conversation.id}>
          <SidebarMenuItem>
            <Link href={`/conversation/${conversation.id}`}>
              <SidebarMenuButton>{conversation.title}</SidebarMenuButton>
            </Link>
            <SidebarMenuAction>
              <Ellipsis />
            </SidebarMenuAction>
          </SidebarMenuItem>
        </SidebarMenu>
      ))}
    </div>
  )
}
export default Conversations
