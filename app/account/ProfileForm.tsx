'use client';

import {Button, Form, Input} from "@heroui/react";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useLazyQuery} from "@apollo/client";
import {QUERY_USER, UsersPermissionsUser} from "@/lib/graphql";

const LOGIN_URL = '/';

export default function ProfileForm() {
  const router = useRouter();

  const [user, setUser] = useState(undefined as UsersPermissionsUser|undefined);

  const [getUser, { loading, error}] = useLazyQuery<{user: UsersPermissionsUser}>(QUERY_USER);

  useEffect(() => {
    async function loadUser() {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        router.push(LOGIN_URL);
        return;
      }

      const options = { variables: { id: userId } };
      const result = await getUser(options);

      setUser(result.data?.user);
    }

    loadUser();
  }, []);

  function onLogout(event) {
    // there should be logout mutation here, but it does not exist in docs
    localStorage.removeItem('userId');
    localStorage.removeItem('jwt');
    router.push(LOGIN_URL);
  }

  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;

  return (
    <Form
      className="w-full justify-center items-center space-y-4"
      validationBehavior="native"
      onSubmit={null}
    >
      <Input readOnly={true} disabled={true} value={user?.firstName}/>
      <Input readOnly={true} disabled={true} value={user?.lastName}/>

      <Button className="w-full" color="primary" type="button"
              disabled={loading} disableAnimation={loading}
              onPress={onLogout}
      >Logout</Button>
    </Form>
  );
}
