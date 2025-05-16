"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!username || !password) {
      setError("Lütfen kullanıcı adı ve şifre girin");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await signIn("credentials", {
        redirect: false,
        username,
        password
      });

      if (result?.ok) {
        router.push("/");
      } else {
        setError("Kullanıcı adı veya şifre hatalı");
      }
    } catch (error) {
      setError("Giriş yapılırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Giriş Yap</h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-100 p-3 text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border p-2"
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium">
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border p-2"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-primary p-2 text-white"
            disabled={loading}
          >
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Test hesabı: admin / admin123</p>
        </div>
      </div>
    </div>
  );
}
