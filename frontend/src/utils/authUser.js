export const getCurrentUser = () => {
  try {
    const user =
      JSON.parse(localStorage.getItem("user")) || {};

    return user;
  } catch (error) {
    console.error("Failed to read user:", error);
    return {};
  }
};

export const getCurrentUserId = () => {
  const user = getCurrentUser();

  return (
    user._id ||
    user.id ||
    localStorage.getItem("userId") ||
    localStorage.getItem("user_id") ||
    localStorage.getItem("mentorId") ||
    localStorage.getItem("studentId") ||
    null
  );
};

export const getCurrentRole = () => {
  const user = getCurrentUser();

  return (
    user.role ||
    localStorage.getItem("role") ||
    ""
  ).toLowerCase();
};