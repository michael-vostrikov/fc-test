import {gql} from "@apollo/client";

export const MUTATION_LOGIN = gql`
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

export type UsersPermissionsLoginPayload = {
  jwt: string;
  user: {
    id: string;
  }
}


export const QUERY_USER = gql`
  query ($id: ID!) {
    user (id: $id) {
      id
      firstName
      lastName
    }
  }
`;

export type UsersPermissionsUser = {
  id: string;
  firstName: string;
  lastName: string;
}
