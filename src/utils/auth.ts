import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
  callbacks: {
    signIn: async ({ user }) => {
      return user.email === 'devjiwonchoi@gmail.com'
    },
  },
})
