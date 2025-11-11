// lib/auth.js
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/db';
import User from '@/models/User';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          await connectDB();

          const user = await User.findOne({ email: credentials.email }).select(
            '+password +isVerified'
          );

          if (!user) {
            throw new Error('Credenciales incorrectas');
          }

          // Verificar si el usuario está verificado
          if (!user.isVerified && !user.googleAuth) {
            throw new Error(
              'Tu cuenta no está verificada. Por favor, revisa tu correo y verifica tu cuenta.'
            );
          }

          const isPasswordValid = await user.comparePassword(
            credentials.password
          );

          if (!isPasswordValid) {
            throw new Error('Credenciales incorrectas');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          };
        } catch (error) {
          console.error('Error en authorize:', error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Solo procesar para Google OAuth
        if (account?.provider === 'google') {
          await connectDB();

          // Buscar usuario por email o googleId
          let dbUser = await User.findOne({
            $or: [{ email: profile.email }, { googleId: profile.sub }],
          });

          if (dbUser) {
            // Usuario existe
            // Actualizar googleId si no está presente
            if (!dbUser.googleId) {
              dbUser.googleId = profile.sub;
              dbUser.googleAuth = true;
              // Si el usuario no tiene imagen, usar la de Google
              if (!dbUser.image && profile.picture) {
                dbUser.image = profile.picture;
              }
              await dbUser.save();
            }
          } else {
            // Crear nuevo usuario con Google
            dbUser = await User.create({
              email: profile.email,
              name: profile.name || profile.email.split('@')[0],
              googleId: profile.sub,
              googleAuth: true,
              image: profile.picture || '',
              role: 'user',
              isVerified: true, // Los usuarios de Google están automáticamente verificados
            });
          }

          // Guardar el ID del usuario en el objeto user para usarlo en el callback session
          user.id = dbUser._id.toString();
          user.role = dbUser.role;
        }

        return true;
      } catch (error) {
        console.error('Error en signIn callback:', error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      // Cuando el usuario inicia sesión por primera vez
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      // Para Google OAuth, asegurarnos de tener el role
      if (account?.provider === 'google' && token.email) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error('Error al obtener role del usuario:', error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }

      // Asegurarnos de que el usuario tenga la información actualizada
      if (session.user.email) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: session.user.email });
          if (dbUser) {
            session.user.id = dbUser._id.toString();
            session.user.role = dbUser.role;
            session.user.name = dbUser.name;
            session.user.image = dbUser.image;
          }
        } catch (error) {
          console.error('Error al actualizar sesión:', error);
        }
      }

      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
