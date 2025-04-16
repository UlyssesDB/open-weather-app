This application uses Next.js's App Router to create a React app, most of the code is written in TypeScript.

Future improvements:

- make the app mobile-first in order that it can be used on mobile web browsers
- if this application were to be deployed in production it would require a backend server from which the API calls would be made and the API keys stored

## INSTRUCTIONS

This application requires access to:

1. an OpenWeatherMap API key (https://home.openweathermap.org/api_keys), and
2. a Google Maps API key (https://console.cloud.google.com/google/maps-apis/credentials)

\*\*\* the Google Maps API key must have "Maps JavaScript API" and "Places API" and "Geocoding API" enabled (https://console.cloud.google.com/google/maps-apis/api-list)

Download the repository.

Create a '.env.local' file in the root directory with the following variables (see 'env.example' for sample file):

- NEXT_PUBLIC_WEATHER_API_KEY=<API_KEY>
- NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<API_KEY>

Open a terminal window and navigate to the root directory of the project.

Then run the following commands:

- $ npm install
- $ npm run dev

The app runs on http://localhost:3000

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
