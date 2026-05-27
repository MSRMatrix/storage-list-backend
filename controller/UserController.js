import { issueJwt } from "../helpers/jwt";
import { comparePassword, hashPassword } from "../middlewares/hashPassword";
import User from "../models/User";

export const createUser = async (req, res, next) => {
  try {
    const { username, email, password, createdAt, company, currency, deleted } = req.body;

    const newUser = new User({
      username: username || "Nicht verfügbar",
      email: email,
      password: await hashPassword(password),
      createdAt: createdAt,
      company: company || false,
      currency: currency,
      deleted: false,
    });

    await newUser.save();
    
    res.status(200).json({ data: newUser, message: "User created" });
  } catch (error) {
    next(error);
  }
};


export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const searchEmail = await User.findOne({ email });

    if (!searchEmail) {
      const message = "Email-Adresse wurde nicht gefunden!";
      return res.status(404).json({ message });
    }


    const passwordCompare = await comparePassword(
      password,
      searchEmail.password
    );
    if (!passwordCompare) {
      const message = "Passwort stimmt nicht!";
    return  res.status(404).json({ message });
    }

    const token = issueJwt(searchEmail);
    
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

  return  res.status(200).json({ userData: searchEmail, token });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res
      .clearCookie("jwt", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .status(200)
      .send("User logged out");
  } catch (error) {
    next(error);
  }
};

export const getData = async (req, res, next) => {
  try {
    const data = await dataFunction(req, res, next);

    if (!data) {
      const error = new Error("Account not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).send(data);
  } catch (error) {
    next(error);
  }
};
