const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    // ==========================================
    // CHECK AUTHENTICATION
    // ==========================================

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // ==========================================
    // GET USER ROLE
    // ==========================================

    const userRole = String(req.user.role || "")
      .trim()
      .toLowerCase();

    // ==========================================
    // NORMALIZE ALLOWED ROLES
    // ==========================================

    const normalizedRoles = allowedRoles.map((role) =>
      String(role).trim().toLowerCase()
    );

    // ==========================================
    // DEBUG
    // ==========================================

    console.log("Role authorization:", {
      userRole,
      allowedRoles: normalizedRoles,
    });

    // ==========================================
    // CHECK ROLE
    // ==========================================

    if (!userRole) {
      return res.status(403).json({
        success: false,
        message: "User role not found",
      });
    }

    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied for role: ${userRole}`,
      });
    }

    // ==========================================
    // AUTHORIZED
    // ==========================================

    next();
  };
};

module.exports = roleMiddleware;