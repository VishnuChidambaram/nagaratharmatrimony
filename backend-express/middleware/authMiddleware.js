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
  
  try {
      let userEmail = req.headers['x-user-email'];
      let sessionId = req.headers['x-session-id'];
      let adminEmail = req.headers['x-admin-email'];
      let adminSessionId = req.headers['x-admin-session-id'];

      // Check Admin via Headers or Cookies
      const currentAdminEmail = adminEmail || req.cookies.adminEmail;
      const currentAdminSessionId = adminSessionId || req.cookies.adminSessionId;

      if (currentAdminEmail && currentAdminSessionId) {
         const admin = await db.AdminLogin.findOne({ where: { email: currentAdminEmail } });
         if (admin && admin.sessionId === currentAdminSessionId) {
            req.user = { email: currentAdminEmail, isAdmin: true };
            return next();
         }
      }

      // Check User via Headers or Cookies
      const currentUserEmail = userEmail || req.cookies.userEmail;
      const currentUserSessionId = sessionId || req.cookies.sessionId;

      if (currentUserEmail && currentUserSessionId) {
         const user = await db.UserDetail.findOne({ where: { email: currentUserEmail } });
         if (user && user.sessionId === currentUserSessionId) {
            req.user = { email: currentUserEmail, isAdmin: false };
            return next();
         }
      }
  } catch (error) {
      console.error("CRITICAL ERROR in sessionAuthMiddleware:", error);
      return res.status(500).json({ success: false, message: "Internal server error during authentication check" });
  }

  return next();
};
