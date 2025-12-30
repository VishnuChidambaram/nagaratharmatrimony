export const getAuthHeaders = () => {
  if (typeof window === "undefined") return {};
  
  return {
    'x-user-email': sessionStorage.getItem("userEmail") || "",
    'x-session-id': sessionStorage.getItem("sessionId") || "",
    'x-admin-email': sessionStorage.getItem("adminEmail") || "",
    'x-admin-session-id': sessionStorage.getItem("adminSessionId") || ""
  };
};
