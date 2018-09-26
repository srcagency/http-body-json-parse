# http-json-body-parse

Parse the JSON body of an http request.

## Usage

```js
parse(
  request, // like the one from Node.js http

  /*
  The maximum buffer size (bytes) before throwing a `parse.BufferError`.
  This is optional but probably a good idea and defaults to `Infinity`.
  */
  maxBufferBytes,

  console.log // Optional logging function defaults to a no-op
)
```

```js
const parse = require('http-body-json-parse')

http.createServer((request, response) => {
  parse(request, 50).then(console.log, e => {
    if (e instanceof parse.ContentTypeError) console.error(e.message)
    else if (e instanceof parse.ParsingError) console.error(e.message)
    else if (e instanceof parse.BufferError) console.error(e.message)
    else throw e
  })

  // introspection, great for post mortem
  request[parse.parsing] // equal to parse(request)
  request[parse.parsed] // equal to resolved parse(request)
})
```
