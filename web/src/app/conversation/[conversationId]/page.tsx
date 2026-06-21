import ChatPage from '@/components/chat-page'

const ConversationPage = async ({ params }: { params: Promise<{ conversationId: string }> }) => {
  const { conversationId } = await params

  return <ChatPage conversationId={conversationId} />
}

export default ConversationPage
