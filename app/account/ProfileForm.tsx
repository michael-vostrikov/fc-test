'use client';

import {Button, Form, Input} from "@heroui/react";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useLazyQuery} from "@apollo/client";
import {QUERY_USER, UsersPermissionsUser} from "@/lib/graphql";
import {useTranslations} from "next-intl";

const LOGIN_URL = '/';

export default function ProfileForm() {
  const router = useRouter();

  const [user, setUser] = useState(undefined as UsersPermissionsUser|undefined);

  const [getUser, { loading, error}] = useLazyQuery<{user: UsersPermissionsUser}>(QUERY_USER);

  const t = useTranslations('app');

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

  if (loading) return t('Loading');
  if (error) return t(`Error: {message}`, {message: error.message});

  return (
    <Form
      className="w-full justify-center items-center space-y-4"
      validationBehavior="native"
      onSubmit={null}
    >
      <div className="flex flex-col gap-4">
        <Input label={t('First name')} labelPlacement="outside" readOnly={true} disabled={true}
               value={user?.firstName}/>
      </div>

      <div className="flex flex-col gap-4">
        <Input label={t('Last name')} labelPlacement="outside" readOnly={true} disabled={true} value={user?.lastName}/>
      </div>

      <Button className="w-full" color="primary" type="button"
              disabled={loading} disableAnimation={loading}
              onPress={onLogout}
      >{t('Logout')}</Button>
    </Form>
);
}
