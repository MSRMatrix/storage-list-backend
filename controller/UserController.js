import User from "../models/User";

export const createUser = async (req, res, next) => {
  try {
    const { username, email, password, createdAt, company, currency, deleted } =
      req.body;

    const newUser = new User({
      username: username || "Nicht verfügbar",
      email: email,
      password: password,
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
      res.status(404).json({ message });
    }

    const token = issueJwt(searchEmail);
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    res.status(200).json({ searchEmail, token });
  } catch (error) {
    next(error);
  }
};
