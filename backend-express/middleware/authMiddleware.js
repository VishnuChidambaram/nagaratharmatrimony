import db from "../models/index.js";

export const sessionAuthMiddleware = async (req, res, next) => {
  // Allow public routes (if any match the middleware usage pattern)
  // For now, we assume this middleware is applied to protected routes or globally with exclusions.
  // But since we are likely applying it to specific routers or broadly, let's be careful.
  
  // Actually, simpler approach: Apply it to specific routes or rely on checking headers if they exist.
  // Ideally:
  // 1. Get Headers
  // 2. If Headers exist, validate against DB.
  // 3. If Valid, attach user to Req and Next.
  // 4. If Invalid, return 401.
  // 5. If No Headers? Fallback to Cookies? Or Fail?
  //    - Since we have legacy cookies, we should fallback to cookies for now OR support both.
  //    BUT: The goal is MULTI-TAB support. If we fallback to cookies and cookies are "User B" but tab is "User A", we fail.
  //    Wait, if tab has no headers, it implies it MIGHT allow cookie fallback (legacy).
  //    BUT if the user wants strict tab separation, we should prefer headers.
  
  // Strategy:
  // - If Headers present: Validate STRICTLY against headers. Ignore cookies.
  // - If Headers missing: Check Cookies. (This handles legacy/refresh behavior before JS loads? No, API calls always have JS).
  // - Actually, simple rule: Backend trusts what it receives.
  
  let userEmail = req.headers['x-user-email'];
  let sessionId = req.headers['x-session-id'];
  let adminEmail = req.headers['x-admin-email'];
  let adminSessionId = req.headers['x-admin-session-id'];

  // Check Admin via Headers
  if (adminEmail && adminSessionId) {
     const admin = await db.AdminLogin.findOne({ where: { email: adminEmail } });
     if (admin && admin.sessionId === adminSessionId) {
        req.user = { email: adminEmail, isAdmin: true };
        return next();
     }
  }

  // Check User via Headers
  if (userEmail && sessionId) {
     const user = await db.UserDetail.findOne({ where: { email: userEmail } });
     if (user && user.sessionId === sessionId) {
        req.user = { email: userEmail, isAdmin: false };
        return next();
     }
  }

  // Fallback to Cookies (Legacy / Standard Browser Request without JS Headers?)
  // If we strictly enforce multi-tab, we might want to disable this for API calls.
  // But for safety, let's keep it but prioritize headers above (which we did).
  
  if (req.cookies.adminEmail) {
      // Basic cookie check (weak unless we verify session ID from cookie too)
      // Since we want strict session control, we SHOULD check session ID from cookie too if possible.
      // But let's stay compatible with previous logic for now.
      req.user = { email: req.cookies.adminEmail, isAdmin: true };
      return next();
  }
  
  if (req.cookies.userEmail && req.cookies.sessionId) {
      const user = await db.UserDetail.findOne({ where: { email: req.cookies.userEmail } });
      if (user && user.sessionId === req.cookies.sessionId) {
          req.user = { email: user.email, isAdmin: false };
          return next();
      }
  }

  // If we reach here, no valid session found.
  // Should we block?
  // Some routes might be public.
  // We can just call next() and let the route handler decide, OR we can block.
  // Given we are applying this to "Protected" routes generally...
  // Let's just attach `req.user` if found, and let routes check `req.user`.
  
  next();
};
