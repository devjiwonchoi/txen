import NextAuth from 'next-auth'
import { setAuthOptions } from '@/utils/auth-options'

const handler = NextAuth(setAuthOptions())

export { handler as GET, handler as POST }
