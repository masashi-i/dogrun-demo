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
        const adminEmail = process.env.ADMIN_EMAIL

        if (!adminEmail) {
          console.error("[auth] ADMIN_EMAIL が未設定です")
          return null
        }

        if (credentials?.email !== adminEmail) {
          return null
        }

        const inputPassword = credentials?.password as string | undefined
        if (!inputPassword) return null

        // settingsテーブルからハッシュ化パスワードを取得
        try {
          const { data, error } = await supabase
            .from("settings")
            .select("value")
            .eq("key", "admin_password")
            .single()

          if (error || !data?.value) {
            console.error("[auth] admin_passwordの取得に失敗:", error?.message)
            return null
          }

          const isValid = await bcrypt.compare(inputPassword, data.value)
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
