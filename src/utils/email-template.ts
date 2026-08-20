export function htmlEmail({
  title,
  body,
}: {
  title: string
  body: string
}): string {
  return `<!DOCTYPE html>
<html>
  <body style="font-family: sans-serif; color: #111; line-height: 1.5;">
    <h1 style="font-size: 20px;">${title}</h1>
    ${body}
  </body>
</html>`
}
