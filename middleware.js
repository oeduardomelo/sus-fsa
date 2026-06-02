import { NextResponse } from 'next/server';

export function middleware(request) {
  // O Middleware lê o cookie que o Login vai criar
  const token = request.cookies.get('auth_token');
  const { pathname } = request.nextUrl;

  // Rota de login para evitar redirecionamento infinito
  const isLoginPage = pathname === '/login';
  const isDashboardPage = pathname.startsWith('/dashboard');

  // Se NÃO tem token e tenta acessar o dashboard -> Vai pro Login
  if (!token && isDashboardPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se JÁ TEM token e tenta acessar o login -> Vai pro Dashboard
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configuração para o Middleware ignorar arquivos internos e imagens
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};