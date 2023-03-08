import { z } from "zod";

import { User } from "@/types";
import { client } from "@/clients";

export const signInRequestSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

export type SignInRequest = z.infer<typeof signInRequestSchema>;
export type SignInResponse = {
  accessToken: string;
  user: User;
};

export const signIn = async (payload: SignInRequest) =>
  client.authenticate({
    ...payload,
    strategy: "local",
  }) as Promise<SignInResponse>;

export const signUpRequestSchema = z
  .object({
    name: z.string().min(1),
    phone: z.string().optional(),
    email: z.string().min(1),
    password: z.string().min(1),
    passwordConfirmation: z.string().min(1),
  })
  .superRefine(({ password, passwordConfirmation }, ctx) => {
    if (password !== passwordConfirmation) {
      ctx.addIssue({
        code: "custom",
        path: ["passwordConfirmation"],
        message: "The passwords did not match",
      });
    }
  });

export type SignUpRequest = z.infer<typeof signUpRequestSchema>;
export type SignUpResponse = {
  id: string;
  email: string;
  name: string;
  phone: string;
  isVerified: false;
  createdAt: string;
  updatedAt: string;
  adminEmailNotifications: boolean;
  lastLogin: string;
  type: "User";
  link: string;
};

// TODO send baseurl from config in request payload
export const signUp = async (payload: SignUpRequest) =>
  client.service("users").create({
    ...payload,
    baseurl: "TODO",
  }) as Promise<SignUpResponse>;

// reauthenticate logged in user
export const authenticate = () =>
  client
    .authenticate()
    // don't throw when user is not logged in, just report state
    .catch(() => ({
      accessToken: null,
      user: null,
    }));

export const signOut = async () => client.logout();
