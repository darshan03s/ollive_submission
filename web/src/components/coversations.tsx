'use client'

import { useUser } from '@clerk/nextjs'

const Coversations = () => {
  const { isSignedIn } = useUser()

  if (!isSignedIn) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
        Sign in to see your conversations
      </div>
    )
  }

  return <div>Coversations</div>
}

export default Coversations
