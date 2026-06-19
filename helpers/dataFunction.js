import jwt from "jsonwebtoken";
import User from "../models/User";
import Part from "../models/Part";
const secretKey = process.env.JWT_SECRET;

export async function dataFunction(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) {
    const error = new Error("Token not found");
    error.statusCode = 401;
    throw error;
  }
  const decodedToken = jwt.verify(token, secretKey);

  const userId = decodedToken.id;
  
  const user = await User.findById(userId);

  if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
  const parts = await Part.find({ userId });

  if (!user) return null;

  return { user, parts };
}
