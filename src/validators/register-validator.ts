import { checkSchema } from 'express-validator';

export default checkSchema({
  email: {
    errorMessage: 'Email is required!',
    notEmpty: true,
    trim: true,
    isEmail: true,
  },
  firstName: {
    errorMessage: 'First name is required!',
    notEmpty: true,
  },
  lastName: {
    errorMessage: 'Last name is required!',
    notEmpty: true,
  },
  password: {
    errorMessage: 'Password is required!',
    notEmpty: true,
    isLength: {
      options: { max: 15 },
      errorMessage: 'Password should be at least 8 chars',
    },
  },
});
