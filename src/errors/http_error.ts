import { HTTPException } from 'hono/http-exception'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

const httpStatusMap = new Map<
  number,
  { title: string; refSection: string; rfc6585?: boolean }
>([
  [
    400,
    {
      title: 'Bad Request',
      refSection: 'section-15.5.1',
    },
  ],
  [
    401,
    {
      title: 'Unauthorized',
      refSection: 'section-15.5.2',
    },
  ],
  [
    404,
    {
      title: 'Not Found',
      refSection: 'section-15.5.5',
    },
  ],
  [
    405,
    {
      title: 'Method Not Allowed',
      refSection: 'section-15.5.6',
    },
  ],
  [
    418,
    {
      title: '(Unused)',
      refSection: 'section-15.5.19',
    },
  ],
  [
    429,
    {
      title: 'Too Many Requests',
      rfc6585: true,
      refSection: 'section-4',
    },
  ],
  [
    500,
    {
      title: 'Internal Server Error',
      refSection: 'section-15.6.1',
    },
  ],
  [
    501,
    {
      title: 'Not Implemented',
      refSection: 'section-15.6.2',
    },
  ],
])

function createRfcHttpError(
  code: ContentfulStatusCode,
  detail: string,
  customHeaders?: Record<string, string>,
): HTTPException {
  const match = httpStatusMap.get(code)

  const title = match?.title ?? 'Unknown Error',
    rfc6585 = match?.rfc6585 ?? false,
    refSection =
      match?.refSection ??
      'Please contact the administrator to resolve this issue.'

  const payload = {
    code,
    title,
    type: rfc6585
      ? `https://datatracker.ietf.org/doc/html/rfc6585#${refSection}`
      : `https://datatracker.ietf.org/doc/html/rfc9110#${refSection}`,
    detail: `${detail} :(`,
  }

  const headers = new Headers({
    'Content-Type': 'application/problem+json; charset=utf-8',
    'Cache-Control': 'max-age=0, no-store, must-revalidate',
    ...customHeaders,
  })

  return new HTTPException(code, {
    res: new Response(JSON.stringify(payload), {
      headers,
    }),
  })
}

export { createRfcHttpError }
