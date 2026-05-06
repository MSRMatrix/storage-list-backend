import { validationResult, body } from "express-validator";

export const validateRequest = (req, res, next) => {
  const result = validationResult(req);
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

export const timelogValidator = [
  
];


export const userUpdateValidator = (fieldsToUpdate) => {
  const validators = [];

  if (fieldsToUpdate.includes("password")) {
    validators.push(
      body("password")
        .if(body("password").exists({ checkFalsy: true }))
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
      body("email")
        .if(body("email").exists({ checkFalsy: true }))
        .trim()
        .isEmail()
        .withMessage("Die angegebene E-Mail-Adresse ist nicht gültig.")
        .normalizeEmail()
        .escape()
    );
  }

  return validators;
};

// export const timeLogUpdateValidator = (fieldsToUpdate) => {
//   const validators = [];

//   return validators;
// };