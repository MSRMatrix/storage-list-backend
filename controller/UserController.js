import { dataFunction } from "../helpers/dataFunction";
import { issueJwt } from "../helpers/jwt";
import { comparePassword, hashPassword } from "../middlewares/hashPassword";
import Part from "../models/Part";
import User from "../models/User";

export const getData = async (req, res, next) => {
  try {
    const data = await dataFunction(req, res, next);
    if (!data) {
      return res.status(404).json({ message: "Data not found" });
    }
    return res.status(200).json({
      user: data.user,
      parts: data.parts,
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const partsData = req.body.parts || [];
    const { username, email, password, createdAt, company, currency, deleted } =
      req.body.user;

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

    if (partsData.length > 0) {
      await Part.insertMany(
        partsData.map((part) => ({
          ...part,
          userId: newUser._id,
        })),
      );
    }

    return res.status(200).json({
      data: newUser,
      message: "User created",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const editUser = async (req, res, next) => {
  try {
    const userData = await dataFunction(req, res, next);

    const { username, email, password, company, currency } = req.body.user;

    const updateData = {};

    if (username) {
      updateData.username = username;
    }

    if (email) {
      updateData.email = email;
    }

    if (password) {
      updateData.password = await hashPassword(password);
    }

    if (typeof company === "boolean") {
      updateData.company = company;
    }

    if (currency) {
      updateData.currency = currency;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userData.user._id,
      updateData,
      { new: true },
    );

    return res.status(200).json({
      data: updatedUser,
      message: "User updated",
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const searchEmail = await User.findOne({ email });

    if (!searchEmail) {
      return res.status(404).json({
        message: "Email-Adresse wurde nicht gefunden!",
      });
    }

    const passwordCompare = await comparePassword(
      password,
      searchEmail.password,
    );

    if (!passwordCompare) {
      return res.status(401).json({
        message: "Passwort stimmt nicht!",
      });
    }

    // Prüfen ob Zwei-Faktor aktiviert ist
    if (searchEmail.twoFactorEnabled) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      searchEmail.twoFactorCode = code;
      searchEmail.twoFactorExpires = Date.now() + 10 * 60 * 1000;

      await searchEmail.save();

      await sendTwoFactorMail(searchEmail.email, code);

      return res.status(200).json({
        message: "Two factor code sent",
        twoFactorRequired: true,
        userId: searchEmail._id,
      });
    }

    // Normaler Login ohne 2FA

    const token = issueJwt(searchEmail);

    // const data = await dataFunction(req, res, next);
    // Function um falls bestehende Teile zu löschen die keine User ID haben

    // return res.status(200).json({ data: data, token });

    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    return res.status(200).json({
      message: "Login successful",
      twoFactorRequired: false,
    });
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

export const deleteAccount = async (req, res, next) => {
  try {
    const userData = await dataFunction(req, res, next);

    // If-else einbauen um zu checken ob der User sein Passwort selbst eingeben kann

    await Part.deleteMany({
      userId: userData.user._id,
    });

    await User.findByIdAndDelete(userData.user._id);

    return res
      .clearCookie("jwt", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .status(200)
      .json({
        message: "Account deleted successfully",
      });
  } catch (error) {
    next(error);
  }
};

export const twoFactor = async (req, res, next) => {
  try {
    const { userId, code } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.twoFactorCode !== code || user.twoFactorExpires < Date.now()) {
      return res.status(401).json({
        message: "Invalid code",
      });
    }

    // Code löschen
    user.twoFactorCode = null;
    user.twoFactorExpires = null;

    await user.save();

    // Jetzt erst Login erlauben

    const token = issueJwt(user);

    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    return res.status(200).json({
      message: "Login successful",
    });
  } catch (error) {
    next(error);
  }
};

export async function sendTwoFactorMail(email, code) {
  await transporter.sendMail({
    from: process.env.GMAIL_UN,
    to: email,
    subject: "Your login code",
    text: `Your login code is: ${code}`,
  });
}
