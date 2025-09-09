// SignUpSchema = {
//   body: Joi.object({
//     firstName: Joi.string().required(),
//     lastName: Joi.string().required(),
//     email: Joi.string().required(),
//     password: Joi.string().required(),
//     age: Joi.number().required(),
//     gender: Joi.string().required(),
//     phoneNumber: Joi.string().required(),
//   })

const reqKey = ["body", "params", "query", "headers"];

export const vlidationMiddeware = (schema) => {
  return (req, res, next) => {
    const validationErrors = [];

    for (const key of reqKey) {
      console.log({ key });

      if (schema[key]) {
        const { error } = schema[key].validate(req[key], { abortEarly: false });
        if (error) {
          validationErrors.push(...error.details);
        }
      }
    }
    if (validationErrors.length) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: validationErrors });
    }
    next();
  };
};
