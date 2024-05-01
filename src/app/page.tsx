import { Chat } from '@/components/chat'
import { SignIn } from '@/components/sign-in'
import { auth } from '@/utils/auth'

export default async function Home() {
  const session = await auth()
  if (!session) return <SignIn />
  return <Chat />
}
