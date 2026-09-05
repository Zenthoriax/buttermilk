import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,

      loginWith: {
        oauth: {
          domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN!,

           scopes: ["openid"],

          redirectSignIn: [
            "http://localhost:3000/callback",
          ],

          redirectSignOut: [
            "http://localhost:3000",
          ],

          responseType: "code",
        },
      },
    },
  },
});