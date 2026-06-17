import User from "../models/User";
import Part from "../models/Part";

export const dataFunction = async (userId) => {
  const user = await User.findById(userId);
  const parts = await Part.find({ userId });

  if (!user) return null;

  return { user, parts };
};