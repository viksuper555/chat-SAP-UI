import { gql } from 'apollo-angular';

export const GET_ROOMS = gql`
  query getRooms($userId: ID!) {
    getRooms(userId: $userId) {
      id,
      name,
      users{
        id,
        name
      },
      messages {
        id,
        userId,
        text,
        date
      }
    }
  }
`;

export const GET_USERS = gql`
  query {
    getUsers {
      id
      name
    }
  }
`;

export const CREATE_ROOM = gql`
  mutation CreateRoom($input: NewRoom!) {
    createRoom(input: $input){
      id,
      name,
      users{
        id,
        name
      }
    }
  }
`;
