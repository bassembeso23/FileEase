import * as yup from "yup";

export const AuthSchema = (isLogin = true) => {
  if (isLogin) {
    return yup.object().shape({
      email: yup.string().required("Email is required"),
      password: yup.string().required("Password is required")
    });
  }

  return yup.object().shape({
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
      )
      .required("Password is required"),
  });
};
