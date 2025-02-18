'use client';

import {Button, Form, Input} from "@heroui/react";
import {useEffect, useState} from "react";
import {useMutation} from "@apollo/client";
import {useRouter} from "next/navigation";
import {MUTATION_LOGIN, UsersPermissionsLoginPayload} from "@/lib/graphql";

const ACCOUNT_URL = '/account';

type LoginFormData = { email: string, password: string };

function validateFormData(formData: LoginFormData): {[name: string]: string} {
  // For the test task standard HTML attributes are enough, but in real application it's usually no so,
  // so I decided to make validation.
  // I made it manually because there is no requirements about this,
  // but in general it should be a validation library which is used in project.

  const errors = {};

  if (!formData.email) {
    errors['email'] = 'Email is required';
  } else if (formData.email.match(/.+@.+/) === null) {
    errors['email'] = 'Email format is incorrect';
  }

  if (!formData.password) {
    errors['password'] = 'Password is required';
  }

  return errors;
}

export default function LoginForm() {
  const router = useRouter();

  const [errors, setErrors] = useState({});

  const [loginMutation, { loading, error }] = useMutation<{login: UsersPermissionsLoginPayload}>(MUTATION_LOGIN);

  useEffect(() => {
    const currentJwt = localStorage.getItem('jwt');
    if (currentJwt) {
      router.push(ACCOUNT_URL);
    }
  }, []);

  async function onSubmit(event) {
    event.preventDefault();

    const formData = Object.fromEntries(new FormData(event.currentTarget)) as LoginFormData;
    const errors = validateFormData(formData);
    setErrors(errors);

    if (Object.values(errors).length > 0) {
      return;
    }

    await performLogin(formData);
    router.push(ACCOUNT_URL);
  }

  async function performLogin(formData: LoginFormData) {
    const options = { variables: { identifier: formData.email, password: formData.password } };
    const result = await loginMutation(options);

    const loginData = result?.data?.login;
    if (!loginData?.jwt) {
      throw new Error('Token not found');
    }

    localStorage.setItem('jwt', loginData.jwt);
    localStorage.setItem('userId', loginData.user.id);
  }

  const mutationErrors = ((error?.cause?.extensions as any)?.exception?.data?.message?.[0]?.messages ?? []).map(messageData => messageData.message);

  return (
    <Form
      className="w-full justify-center items-center space-y-4"
      validationBehavior="native"
      validationErrors={errors}
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-4">
        <Input label="Email" name="email" value="test@freshcells.de"/>
        <Input type="password" label="Password" name="password" value="KTKwXm2grV4wHzW"/>

        <Button className="w-full" color="primary" type="submit"
                disabled={loading} disableAnimation={loading}
        >Login</Button>
      </div>

      <div className="flex flex-col gap-4">
        {mutationErrors.length > 0 &&
          <div className="text-danger-600">
            {mutationErrors.map((msg, index) => <div key={index}>{msg}</div>)}
          </div>
        }
      </div>
    </Form>
  );
}
