/**
 * This file can be used as a wrapper for your data source for getting user data
 */


import { Roles } from "../types"

export const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    password: "secret",
    role: Roles.SUPERUSER,
  },
  {
    id: 2,
    name: "Jane Doe",
    email: "jane.doe@example.com",
    password: "secret",
    role: Roles.ADMIN,
  },
  {
    id: 3,
    name: "Bob Smith",
    email: "bob.smith@example.com",
    password: "secret",
    role: Roles.USER,
  },
];

/**
 * Validates user credentials
 * 
 * @param {string} email
 * @param {string} password
 * @returns {any} The user object
 */
export const validateCredentials = (email: string, password: string) => {
  return users.find(
    (user) => user.email === email && user.password === password
  );
};