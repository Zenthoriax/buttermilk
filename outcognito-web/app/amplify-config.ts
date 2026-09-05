import { Amplify } from "aws-amplify";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId:
        process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,

      userPoolClientId:
        process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,

      loginWith: {
        oauth: {
          domain:
            process.env.NEXT_PUBLIC_COGNITO_DOMAIN!,

          scopes: [
            "openid"
          ],

          redirectSignIn: [
            `${appUrl}/callback`
          ],

          redirectSignOut: [
            `${appUrl}/`
          ],

          responseType:
            "code"
        }
      }
    }
  }
});