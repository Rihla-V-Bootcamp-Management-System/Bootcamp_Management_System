const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userRole = String(req.user.role || "")
      .trim()
      .toLowerCase();

    const roles = allowedRoles.map((role) =>
      String(role).trim().toLowerCase()
    );

    console.log("=================================");
    console.log("ROLE AUTHORIZATION");
    console.log("User:", req.user._id);
    console.log("User role:", userRole);
    console.log("Allowed roles:", roles);
    console.log("=================================");

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
        role: userRole,
        allowedRoles: roles,
      });
    }

    next();
  };
};

module.exports = roleMiddleware;