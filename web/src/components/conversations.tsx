'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ConversationType } from 'db/types'
import { SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from './ui/sidebar'
import Link from 'next/link'
import { Ellipsis, Trash } from 'lucide-react'
import { useUserId } from '@/hooks/use-user-id'
import { Spinner } from './kibo-ui/spinner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { useRouter } from 'next/navigation'

const getConversations = async (userId: string): Promise<ConversationType[]> => {
  const res = await fetch('/api/conversations', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId
    }
  })
  return res.json()
}

const deleteConversation = async (userId: string, conversationId: string) => {
  const res = await fetch(`/api/conversations/${conversationId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId
    }
  })

  return res.json()
}

const ConversationDropdown = ({
  children,
  userId,
  conversationId
}: {
  children: React.ReactNode
  userId: string
  conversationId: string
}) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const deleteConversationMutation = useMutation({
    mutationFn: () => deleteConversation(userId, conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      router.refresh()
      router.push('/')
    }
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup className="p-1">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => deleteConversationMutation.mutate()}
          >
            <Trash className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
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
      <div className="flex items-center justify-center h-full">
        <Spinner variant="bars" />
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
    <div className="space-y-2">
      {data?.map((conversation) => (
        <SidebarMenu key={conversation.id}>
          <SidebarMenuItem>
            <Link href={`/conversation/${conversation.id}`}>
              <SidebarMenuButton className="line-clamp-1">{conversation.title}</SidebarMenuButton>
            </Link>
            <ConversationDropdown userId={userId!} conversationId={conversation.id}>
              <SidebarMenuAction>
                <Ellipsis />
              </SidebarMenuAction>
            </ConversationDropdown>
          </SidebarMenuItem>
        </SidebarMenu>
      ))}
    </div>
  )
}
export default Conversations
