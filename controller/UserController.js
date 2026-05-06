import User from "../models/User";

export const createUser = async (req, res, next) => {
  try {
    const { username, email, password, createdAt, company, currency, deleted } =
      req.body;

   if (await User.findOne({ email: email })) {
      return res.status(404).json({ message: "Email already exist!" });
    }

    const newUser = new User({
      username: username,
      email: email,
      password: password,
      createdAt: createdAt,
      company: company,
      currency: currency,
      deleted: false,
    });
    res.status(200).json({ data: newUser, message: "User created" });
  } catch (error) {
    next(error);
  }
};
