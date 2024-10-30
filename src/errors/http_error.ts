import { HTTPException } from 'hono/http-exception'
import type { StatusCode } from 'hono/utils/http-status'

const httpStatusList = [
  {
    code: 400,
    title: 'Bad Request',
    refDocSect: 'section-15.5.1',
  },
  {
    code: 404,
    title: 'Not Found',
    refDocSect: 'section-15.5.5',
  },
  {
    code: 418,
    title: '(Unused)',
    refDocSect: 'section-15.5.19',
  },
  {
    code: 500,
    title: 'Internal Server Error',
    refDocSect: 'section-15.6.1',
  },
  {
    code: 501,
    title: 'Not Implemented',
    refDocSect: 'section-15.6.2',
  },
]

export function genHttpException(
  code: StatusCode,
  detail: string,
): HTTPException {
  const match = httpStatusList.find((i) => code === i.code)

  const title = match?.title ?? 'UNKNOWN ERROR'
  const refDocSect = match?.refDocSect ?? ''

  return new HTTPException(code, {
    res: new Response(
      JSON.stringify({
        code,
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
