import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { supabase } from "@/lib/supabase"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "管理者ログイン",
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        const inputEmail = credentials?.email as string | undefined
        const inputPassword = credentials?.password as string | undefined
        if (!inputEmail || !inputPassword) return null

        try {
          // settingsテーブルからadmin_emailとadmin_passwordを取得
          const { data: rows, error } = await supabase
            .from("settings")
            .select("key, value")
            .in("key", ["admin_email", "admin_password"])

          if (error || !rows) {
            console.error("[auth] 認証情報の取得に失敗:", error?.message)
            return null
          }

          const adminEmail = rows.find((r) => r.key === "admin_email")?.value
          const adminPasswordHash = rows.find((r) => r.key === "admin_password")?.value

          if (!adminEmail || !adminPasswordHash) {
            console.error("[auth] admin_email または admin_password が未設定です")
            return null
          }

          if (inputEmail !== adminEmail) return null

          const isValid = await bcrypt.compare(inputPassword, adminPasswordHash)
          if (!isValid) return null

          return {
            id: "admin",
            email: adminEmail,
            name: "管理者",
          }
        } catch (err) {
          console.error("[auth] 認証処理でエラー:", err)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24時間
  },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAdminPage = nextUrl.pathname.startsWith("/admin")
      const isLoginPage = nextUrl.pathname === "/admin/login"

      if (isLoginPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/admin", nextUrl))
        }
        return true
      }

      if (isAdminPage) {
        return isLoggedIn
      }

      return true
    },
  },
})
