import {expect, test} from 'vitest'
import {validateFormData, LoginFormData} from "@/app/LoginForm";

test('Login form validation', () => {
  const errors = validateFormData({email: '', password: ''} as LoginFormData);

  expect(errors).toEqual({
    email: 'Email is required',
    password: 'Password is required'
  });
});
