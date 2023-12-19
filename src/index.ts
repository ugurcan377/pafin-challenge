import { getServer } from "./server"

const app = getServer()

app.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
})
