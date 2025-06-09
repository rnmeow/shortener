import { Hono } from "hono"
import { RegExpRouter } from "hono/router/reg-exp-router"

import { handlers as slugHandlers } from "./handlers"

const routes = new Hono({ router: new RegExpRouter() })

routes.get("/:slug{[a-zA-Z0-9_-]{3,64}}", ...slugHandlers)

export { routes }
