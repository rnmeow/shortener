import { AppConfig } from "@/types/app_config"

const config = (isLocal: boolean): AppConfig => ({
  baseUrl: new URL(isLocal ? "http://127.0.0.1:8787/" : "https://a-ma.zip/"),
  randSlugSize: 5,
  hostnamesBanned: new Set(["s.shopee.tw", "localhost", "loopback"]),
})

export { config }
