export { default } from "next-auth/middleware"

export const config = {
  matcher: ["/dashboard/:path*", "/cuisine/:path*", "/argent/:path*", "/animaux/:path*"],
}
