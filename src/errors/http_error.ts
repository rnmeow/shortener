import { HTTPException } from 'hono/http-exception'
import type { StatusCode } from 'hono/utils/http-status'

export function genHttpException(
  status: StatusCode,
  detail: string,
): HTTPException {
  let title: string
  let refDocSect: string

  switch (status) {
    case 400:
      title = 'Bad Request'
      refDocSect = 'name-400-bad-request'
      break

    case 404:
      title = 'Not Found'
      refDocSect = 'name-404-not-found'
      break

    case 500:
      title = 'Internal Server Error'
      refDocSect = 'name-500-internal-server-error'
      break

    case 501:
      title = 'Not Implemented'
      refDocSect = 'name-501-not-implemented'
      break

    default:
      title = 'UNKNOWN ERROR'
      refDocSect = ''
  }

  return new HTTPException(status, {
    res: new Response(
      JSON.stringify({
        status,
        title,
        type: `https://datatracker.ietf.org/doc/html/rfc9110#${refDocSect}`,
        detail: `${detail} :(`,
      }),
      {
        headers: {
          'Content-Type': 'application/problem+json; charset=utf-8',
          'Cache-Control': 'max-age=0, no-store, must-revalidate',
        },
      },
    ),
  })
}
