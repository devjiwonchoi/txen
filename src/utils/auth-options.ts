import type { NextAuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'

export function setAuthOptions(): NextAuthOptions {
  if (!process.env.OAUTH_GITHUB_CLIENT_ID) {
    throw new Error('OAUTH_GITHUB_CLIENT_ID is not set')
  }
  if (!process.env.OAUTH_GITHUB_CLIENT_SECRETS) {
    throw new Error('OAUTH_GITHUB_CLIENT_SECRETS is not set')
  }
  return {
    providers: [
      GithubProvider({
        clientId: process.env.OAUTH_GITHUB_CLIENT_ID,
        clientSecret: process.env.OAUTH_GITHUB_CLIENT_SECRETS,
      }),
    ],
    callbacks: {
      signIn({ user }) {
        return user.email === 'devjiwonchoi@gmail.com'
      },
    },
  }
}
