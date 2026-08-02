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

    await sendEmail(searchEmail.email, "User created!", `You can now log in!`);

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

    if (user.emailNotifications) {
      await sendEmail(
        searchEmail.email,
        "User updated!",
        `Check your new updates!`,
      );
    }

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

      await sendEmail(
        searchEmail.email,
        "Your login code",
        `Your login code is: ${code}`,
      );

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

    if (user.emailNotifications) {
      await sendEmail(searchEmail.email, "Login!", `You are now logged in!`);
    }

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
    if (user.emailNotifications) {
      await sendEmail(searchEmail.email, "Logout!", `You are now logged out!`);
    }

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

    if (user.emailNotifications) {
      await sendEmail(
        searchEmail.email,
        "Account deleted!",
        `Hope to see you soon again:)!`,
      );
    }

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
    const { userId } = req.body;

    const user = await User.findById(userId);

    const passwordCompare = await comparePassword(
      password,
      searchEmail.password,
    );

    if (!passwordCompare) {
      return res.status(401).json({
        message: "Passwort stimmt nicht!",
      });
    }

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

export async function sendEmail(email, topic, text) {
  await transporter.sendMail({
    from: process.env.GMAIL_UN,
    to: email,
    subject: topic,
    text: text,
  });
}

export const emailAlerts = async (req, res, next) => {
  try {
    const userData = await dataFunction(req, res, next);

    const user = await User.findById(userData.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.emailNotifications = !user.emailNotifications;

    await user.save();

    return res.status(200).json({
      message: `Email notifications ${user.emailNotifications ? "enabled" : "disabled"}`,
      emailNotifications: user.emailNotifications,
    });
  } catch (error) {
    next(error);
  }
};
