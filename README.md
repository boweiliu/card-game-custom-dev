# SETUP

`npm i`

# DEV

```bash
PORT=4321 npm run dev # both FE and BE, BE operates on localhost:43210

PORT=9009 npm run dev:fe # just webpack, proxies to localhost:3003
PORT=3003 npm run dev:be # just backend at 3000
```

# PROD

`npm run build` ... ?

# PRE-COMMIT

```bash
npm run format
```

```bash
npm run format:check
```

## License

This project is licensed under the MIT License.
