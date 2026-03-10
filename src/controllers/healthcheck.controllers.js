// Har project mein ek '/' healthcheck route hona hi chahiye.
// Reason : Yeh healthcheck route yeh bata ta hai ki server up & running hai ya nhi. Jabh AWS jaisi service par hum apna project daalege toh yehi woh cheez hai joh AWS ko batayegi ki humara ek system down hogaya hai please dusra system up kardo. Basically used for Service monitoring,Diagnostics (checks for DB connection, Cache Availability, etc).
// AWS mein kuch aisi service hoti hai joh humare route ko har 3 or 5 minutes mein hit karti hai & it expects a response from it. For that reason a special route is made "healthcheck"
// Output Looks something like :
// {
//   "status": "ok",
//   "uptime": "10234s",
//   "database": "connected",
//   "redis": "connected",
//   "version": "1.0.3"
// }

import { ApiResponse } from "../utils/api-response.js"
export const healthCheck = (req, res) => {
  res.status(200).json(
    new ApiResponse(200, { message: "Server is running" })
  )
}