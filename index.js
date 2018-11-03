var http = require('http')
var url = require('url')
var StringDecoder = require('string_decoder').StringDecoder

var httpServer = http.createServer((req, res) => {
  var parsedUrl = url.parse(req.url, true)
  var path = parsedUrl.pathname
  // Extract path only
  var trimmedPath = path.replace(/^\/+|\/+$/, '')

  // then Query string object
  var queryStringObject = parsedUrl.query

  // then request method, GET / POST / ..
  var method = req.method.toLowerCase()

  // then headers
  var headers = req.headers

  var decoder = new StringDecoder('utf-8')
  var buffer = ''
  req.on('data', (data) => {
    buffer += decoder.write(data)
  })

  req.on('end', (data) => {
    buffer += decoder.end()
    var chosenHandler =
      typeof(router[trimmedPath]) !== 'undefined'
      ? router[trimmedPath] : handlers.notFound

    var data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': buffer
    }
    chosenHandler(data, (statusCode, payload) => {
      statusCode = typeof(statusCode) == 'number'
        ? statusCode : 200
      payload = typeof(payload) == 'object' ? payload : {}

      var payloadString = JSON.stringify(payload)
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode)
      res.end(payloadString)
    })
  })

}).listen(3000, () => {
  console.log('Server running on port 3000')
})

var handlers = {}

handlers.hello = (data, callback) => {
  callback(200, {'message': 'Hello my friend'})
}

handlers.notFound = (data, callback) => {
  callback(404)
}

var router = {
  'hello': handlers.hello
}