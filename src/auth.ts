// Chanking for authentication
export async function isAuthenticated(ctx: any, next: any) {
    if (!ctx.session.isLoggedIn) {
        ctx.throw(403, 'Authentication required.');
    }
    await next();
}
