# http-json-body-parse

Parse the JSON body of an http request.

## Usage

```js
const parse = require('http-body-json-parse')

http.createServer((request, response) => {
  parse(request).then(console.log, e => {
    if (e instanceof parse.ContentTypeError) console.error(e.message)
    else if (e instanceof parse.ParsingError) console.error(e.message)
    else throw e
  })
})
```
