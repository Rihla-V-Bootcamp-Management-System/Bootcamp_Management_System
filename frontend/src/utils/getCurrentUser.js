export const getCurrentUser = () => {
  try {
    const userId = localStorage.getItem("userId");

    if (userId) {
      return {
        _id: userId,
      };
    }

    const storedUser =
      localStorage.getItem("user");

    if (storedUser) {
      const user = JSON.parse(storedUser);

      return user;
    }

    const userData =
      localStorage.getItem("userData");

    if (userData) {
      const user = JSON.parse(userData);

      return user;
    }

    return null;
  } catch (error) {
    console.error(
      "Failed to get current user:",
      error
    );

    return null;
  }
};

export const getCurrentUserId = () => {
  const user = getCurrentUser();

  return (
    user?._id ||
    user?.id ||
    user?.userId ||
    null
  );
};