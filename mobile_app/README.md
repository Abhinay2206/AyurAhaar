# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Connect to your local backend (auto-detect)

The app can automatically discover and connect to a backend server running on your local network.

What it does:
- Detects the device IP using Expo Network
- Scans common IPs on the same subnet and hits `http://IP:PORT/health`
- Caches the working server for faster subsequent calls
- Supports manual IP override and easy rediscovery

How to use:
1. Ensure your backend is running and listening on all interfaces (0.0.0.0) on port 4000.
   - In this repo, the backend exposes `GET /health` and API under `/api/*`.
2. Make sure your device/simulator and your computer are on the same Wi‑Fi/network.
3. Open the app and navigate to `/dev-tools` route to access Dev Tools:
   - In development, you can type the path in the Expo Router dev tools, or link to it from any screen.
4. In Dev Tools:
   - Tap "Test API" to see the current API URL and connection status
   - Tap "Rediscover" to force a new network scan
   - Enter a manual IP (e.g. `192.168.1.23`) and press "Use This IP" to override
   - Press "Clear Manual" to remove override and return to auto-detect

Notes:
- iOS simulator can use `localhost`. Android emulator uses `10.0.2.2`.
- Fallback IP and port are configured in `src/config/api.config.ts`.


## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
