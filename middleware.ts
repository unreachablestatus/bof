import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Korumasız sayfalar (public routes)
const publicRoutes = ["/login"];

// API rotaları ve statik kaynaklar için izin verilecek prefixler
const allowedPrefixes = ["/api/auth", "/_next", "/favicon.ico"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public sayfalar veya izin verilen prefixler ile başlayan URL'ler için koruma uygulamıyoruz
  if (
    publicRoutes.includes(pathname) ||
    allowedPrefixes.some((prefix) => pathname.startsWith(prefix))
  ) {
    return NextResponse.next();
  }

  // JWT token kontrolü (oturum kontrolü)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Oturum yoksa login sayfasına yönlendir
  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // Oturum varsa devam et
  return NextResponse.next();
}

// Hangi URL'lerin middleware tarafından işleneceğini belirt
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
