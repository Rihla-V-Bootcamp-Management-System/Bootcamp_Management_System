const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const userRole = String(req.user.role || "").toLowerCase();

      const normalizedAllowedRoles = allowedRoles.map((role) =>
        String(role).toLowerCase()
      );

      if (!normalizedAllowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied for role: ${userRole}`,
        });
      }

      next();
    } catch (error) {
      console.error("ROLE MIDDLEWARE ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Role authorization failed",
      });
    }
  };
};

module.exports = roleMiddleware;