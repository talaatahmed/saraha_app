export const WelcomeService = (req, res, next) => {
  res.status(200).json({ message: "welcome to teto app", success: true });
};
