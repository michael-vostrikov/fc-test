'use client';

import {Button, Form, Input} from "@heroui/react";
import {useState} from "react";
import {gql, useMutation} from "@apollo/client";
import {useRouter} from "next/navigation";

type LoginFormData = {email: string, password: string};

const LOGIN_MUTATION = gql`
  mutation ($identifier: String!, $password: String!) {
    login (input: {identifier: $identifier, password: $password}) {
      jwt
      user {
        id
        username
        email
      }
    }
  }
`;

type LoginMutationResult = {
  login: UsersPermissionsLoginPayload,
}

type UsersPermissionsLoginPayload = {
  jwt: string;
}

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
  const [loginMutation, { loading, error }] = useMutation<LoginMutationResult>(LOGIN_MUTATION);

  async function onSubmit(event) {
    event.preventDefault();

    const formData = Object.fromEntries(new FormData(event.currentTarget)) as LoginFormData;
    const errors = validateFormData(formData);
    setErrors(errors);

    if (Object.values(errors).length > 0) {
      return;
    }

    await performLogin(formData);
    router.push('/account');
  }

  async function performLogin(formData: LoginFormData) {
    const variables = { variables: { identifier: formData.email, password: formData.password } };
    const result = await loginMutation(variables);

    const jwt = result?.data?.login?.jwt;
    if (!jwt) {
      throw new Error('Token not found');
    }

    localStorage.setItem('jwt', jwt);
  }

  const mutationErrors = (error?.cause?.extensions?.exception?.data?.message?.[0]?.messages ?? []).map(messageData => messageData.message);

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
