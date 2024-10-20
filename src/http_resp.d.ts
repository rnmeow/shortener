export type JsonResp = {
  apiVersion: number
  env: 'production' | 'development'
  status: string
  message?: string
}

export type TextResp = string
