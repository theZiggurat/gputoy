import { NextApiHandler } from 'next';
import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import Adapters from 'next-auth/adapters';
import prisma from '@database/prisma';

const authHandler: NextApiHandler = (req, res) => NextAuth(req, res, options);
export default authHandler;

const options = {
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  adapter: Adapters.Prisma.Adapter({ prisma }),
  secret: process.env.SECRET,
  callbacks: {
    // async signIn(user, account, profile) { return true },
    async redirect(url, baseUrl) {
      console.log('REDIRECT', url, baseUrl)
      if (url.startsWith(baseUrl)) return url
      // Allows relative callback URLs
      else if (url.startsWith("/")) return new URL(url, baseUrl).toString()
      return baseUrl
    },
    async session(session, user) {
      session.user.id = user.id
      return session
    },
    // async jwt(token, user, account, profile, isNewUser) { return token }
  },
};

