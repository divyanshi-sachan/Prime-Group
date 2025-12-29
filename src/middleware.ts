import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
 
const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)',  '/sign-up(.*)', '/contact-us' , '/blog', '/faqs' , '/packages(.*)' ,'/api/webhooks(.*)', '/api/checkMongo', '/api/booking(.*)', '/api/verify(.*)'])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};