# Hogia Import Product

## Getting started

### Requirements

1. Node.js 20.x or higher
1. mariadb 10.4 or higher

### Installing the template

```shell
npm install
```

#### Local Development

```shell
npm run dev
```

>If you got an error about the prisma client, you can try to run the following command:
>
>```shell
>npm run prisma generate
>```

Open the URL generated in your console. Once you grant permission to the app, you can start development.

## Deployment

### Application Storage

### Build

The frontend is a single page app. It requires the `SHOPIFY_API_KEY`, which you can find on the page for your app in your partners dashboard. Paste your app’s key in the command for the package manager of your choice:

Using npm:

```shell
cd web/frontend/ && SHOPIFY_API_KEY=REPLACE_ME npm run build
```

You do not need to build the backend.

## Hosting

When you're ready to set up your app in production, you can follow [our deployment documentation](https://shopify.dev/docs/apps/deployment/web) to host your app on a cloud provider like [Heroku](https://www.heroku.com/) or [Fly.io](https://fly.io/).

When you reach the step for [setting up environment variables](https://shopify.dev/docs/apps/deployment/web#set-env-vars), you also need to set the variable `NODE_ENV=production`.

## Known issues

### Hot module replacement and Firefox

When running the app with the CLI in development mode on Firefox, you might see your app constantly reloading when you access it.
That happened in previous versions of the CLI, because of the way HMR websocket requests work.

We fixed this issue with v3.4.0 of the CLI, so after updating it, you can make the following changes to your app's `web/frontend/vite.config.js` file:

1. Change the definition `hmrConfig` object to be:

   ```js
   const host = process.env.HOST
     ? process.env.HOST.replace(/https?:\/\//, "")
     : "localhost";

   let hmrConfig;
   if (host === "localhost") {
     hmrConfig = {
       protocol: "ws",
       host: "localhost",
       port: 64999,
       clientPort: 64999,
     };
   } else {
     hmrConfig = {
       protocol: "wss",
       host: host,
       port: process.env.FRONTEND_PORT,
       clientPort: 443,
     };
   }
   ```

1. Change the `server.host` setting in the configs to `"localhost"`:

   ```js
   server: {
     host: "localhost",
     ...
   ```

### I can't get past the ngrok "Visit site" page

When you’re previewing your app or extension, you might see an ngrok interstitial page with a warning:

```text
You are about to visit <id>.ngrok.io: Visit Site
```

If you click the `Visit Site` button, but continue to see this page, then you should run dev using an alternate tunnel URL that you run using tunneling software.
We've validated that [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/run-tunnel/trycloudflare/) works with this template.

To do that, you can [install the `cloudflared` CLI tool](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/), and run:

```shell
# Note that you can also use a different port
cloudflared tunnel --url http://localhost:3000
```

Out of the logs produced by cloudflare you will notice a https URL where the domain ends with `trycloudflare.com`. This is your tunnel URL. You need to copy this URL as you will need it in the next step.

```shell
2022-11-11T19:57:55Z INF Requesting new quick Tunnel on trycloudflare.com...
2022-11-11T19:57:58Z INF +--------------------------------------------------------------------------------------------+
2022-11-11T19:57:58Z INF |  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):  |
2022-11-11T19:57:58Z INF |  https://randomly-generated-hostname.trycloudflare.com                                     |
2022-11-11T19:57:58Z INF +--------------------------------------------------------------------------------------------+
```

Below you would replace `randomly-generated-hostname` with what you have copied from the terminal. In a different terminal window, navigate to your app's root and with the URL from above you would call:

```shell
# Using yarn
yarn dev --tunnel-url https://randomly-generated-hostname.trycloudflare.com:3000
# or using npm
npm run dev --tunnel-url https://randomly-generated-hostname.trycloudflare.com:3000
# or using pnpm
pnpm dev --tunnel-url https://randomly-generated-hostname.trycloudflare.com:3000
```

## Developer resources

- [Introduction to Shopify apps](https://shopify.dev/docs/apps/getting-started)
- [App authentication](https://shopify.dev/docs/apps/auth)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- [Shopify API Library documentation](https://github.com/Shopify/shopify-api-js#readme)
- [Getting started with internationalizing your app](https://shopify.dev/docs/apps/best-practices/internationalization/getting-started)
  - [i18next](https://www.i18next.com/)
    - [Configuration options](https://www.i18next.com/overview/configuration-options)
  - [react-i18next](https://react.i18next.com/)
    - [`useTranslation` hook](https://react.i18next.com/latest/usetranslation-hook)
    - [`Trans` component usage with components array](https://react.i18next.com/latest/trans-component#alternative-usage-components-array)
  - [i18n-ally VS Code extension](https://marketplace.visualstudio.com/items?itemName=Lokalise.i18n-ally)
