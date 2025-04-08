Google OAuth Integration in Expo + Next.js App

This project supports Google OAuth login for both the mobile app (Expo) and the web app (Next.js). Below are two different approaches based on how you run the app.


---

Option 1: Built App (Preferred & Simple)

If your Expo app is built (e.g., via expo run:android), follow these steps:

1. Update the Google Console

Add your custom app scheme (myapp:/callback) as a redirect URI.

Example: com.myapp:/oauthredirect



2. Update the Redirect URI in App.js

auth.expoRedirectUri = "your-app-scheme:/callback";


3. Run the app

Tap "Sign in"

Choose Google account

You will be redirected back and logged in to the Next.js backend.




No need for ngrok or extra setup.


---

Option 2: Dev Build (Expo Go - Complex)

If you're running the app in Expo Go (not prebuilt), you need ngrok:

1. Start Your Next.js OAuth Server

npm run dev


2. Expose the local server via ngrok

ngrok http 8081

Example output:

https://abc1234-ngrok-free.app


3. Update the Redirect URI

In Google Console: Add https://abc1234-ngrok-free.app/callback

In the mobile app code:

auth.expoRedirectUri = "https://abc1234-ngrok-free.app/callback";



4. Login Flow

Open https://abc1234-ngrok-free.app in Chrome

Click "Sign in with Google"

Choose account, login

Copy the returned token

Scan QR from expo start using Expo Go

Paste token in app when prompted





---

FCM (Firebase Cloud Messaging)

Web (Next.js): Test push notifications by hitting the FCM API endpoint.

Android App: Not tested yet due to time/resource limits.



---

Notes

Expo Go does not support custom native code, hence ngrok is required.

For real apps, always build the app using expo run:android to avoid this hassle
