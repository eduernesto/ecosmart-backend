export default function envelope(req, res, next) {
  const original = res.json.bind(res)
  res.json = (data) => original({ ok: true, data })
  next()
}
