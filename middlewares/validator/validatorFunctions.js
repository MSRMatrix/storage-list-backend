import { validationResult, body } from "express-validator";

export const validateRequest = (req, res, next) => {
  
  const result = validationResult(req.body.user);
  // Überprüfen weil es standartmässig req war und nicht req.body.user (Ein If else einbauen um zwischen parts und user zu unterscheiden)
  if (result.isEmpty()) {
    return next();
  }
  res.status(422).send({ errors: result.array() });
};

export const userValidator = [
  body("password")
    .notEmpty()
    .withMessage("Password is required!")
    .trim()
    .isStrongPassword()
    .withMessage(
      `Password is not strong enough! 
       A capital letter, number and 
        sign must be present!`
    )
    .isLength({ min: 8 })
    .withMessage("Passwort muss mindestens 8 Zeichen lang sein!")
    .escape(),
  body("email")
    .notEmpty()
    .withMessage("Email is required!")
    .trim()
    .isEmail()
    .withMessage("Email must be legit!")
    .normalizeEmail()
    .escape(),
];

export const userUpdateValidator = (fieldsToUpdate) => {
  const validators = [];

  if (fieldsToUpdate.includes("password")) {
    validators.push(
      body("user.password")
        .trim()
        .isStrongPassword()
        .withMessage("Das Passwort ist nicht stark genug.")
        .isLength({ min: 8 })
        .withMessage("Das Passwort muss mindestens 8 Zeichen lang sein.")
        .escape()
    );
  }

  if (fieldsToUpdate.includes("email")) {
    validators.push(
      body("user.email")
        .trim()
        .isEmail()
        .withMessage("Die angegebene E-Mail-Adresse ist nicht gültig.")
        .normalizeEmail()
        .escape()
    );
  }

  if (fieldsToUpdate.includes("username")) {
    validators.push(
      body("user.username")
        .trim()
        .isLength({ min: 3 })
        .withMessage("Der Benutzername muss mindestens 3 Zeichen lang sein.")
        .escape()
    );
  }

  if (fieldsToUpdate.includes("currency")) {
    validators.push(
      body("user.currency")
        .isIn(["Euro", "Dollar"])
        .withMessage("Ungültige Währung.")
    );
  }

  if (fieldsToUpdate.includes("company")) {
    validators.push(
      body("user.company")
        .isBoolean()
        .withMessage("Company muss true oder false sein.")
    );
  }

  return validators;
};

// export const partsUpdateValidator = (fieldsToUpdate) => {
//   const validators = [];

//   return validators;
// };