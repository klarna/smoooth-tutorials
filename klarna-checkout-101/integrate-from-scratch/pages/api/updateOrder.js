export default async (req, res) => {
  const reqData = JSON.parse(req.body)

  const orderLinesToCookie = reqData.orderLines
    .filter((orderLine) => orderLine.quantity)
    .reduce((acc, orderLine) => {
      acc[orderLine.reference] = orderLine.quantity
      return acc
    }, {})
  let response = {}

  res.setHeader('Set-Cookie', [
    `merchantCart=${JSON.stringify(orderLinesToCookie)}; path=/;`,
  ])
  res.statusCode = 200
  res.json(response)
}
