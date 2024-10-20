import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { config, connectToDB, closeConnection } from "@/utils/database";
const sql = require("mssql");

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          await connectToDB();
          const { username, password } = credentials;

          const pool = await sql.connect(config);
          const result = await pool
            .request()
            .input("UserName", sql.VarChar, username)
            .input("UserPassword", sql.VarChar, password)
            .execute("User_mst_CheckLogin");

          const user = result.recordset[0];
          await closeConnection();

          if (user) {
            console.log(user);
            return {
              id: user.UserId,
              name: user.UserName,
              email: user.Email,
              image: user.ProfilePhoto,
              fullName: user.FullName,
              companyName: user.CompanyName,
              companyCode: user.CompanyCode,
              companyAddress: user.CompanyAddress,
              phone: user.Phone,
              roleId: user.RoleId,
              isActive: user.IsActive,
              dateOfBirth: user.DateOfBirth,
              companyId: user.CompanyId,
            };
          } else {
            return null;
          }
        } catch (err) {
          console.error(err);
          await closeConnection();
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    jwt: true,
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
        token.fullName = user.fullName;
        token.companyName = user.companyName;
        token.companyCode = user.companyCode;
        token.companyAddress = user.companyAddress;
        token.phone = user.phone;
        token.roleId = user.roleId;
        token.isActive = user.isActive;
        token.dateOfBirth = user.dateOfBirth;
        token.companyId = user.companyId;
      }

      if (trigger === "update") {
        return { ...token, ...session.user };
      }
      return { ...token, ...user };
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.image = token.image;
      session.user.fullName = token.fullName;
      session.user.companyName = token.companyName;
      session.user.companyCode = token.companyCode;
      session.user.companyAddress = token.companyAddress;
      session.user.phone = token.phone;
      session.user.roleId = token.roleId;
      session.user.isActive = token.isActive;
      session.user.dateOfBirth = token.dateOfBirth;
      session.user.companyId = token.companyId;

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as POST, handler as GET };
