# http-json-body-parse

Parse the JSON body of an http request.

## Usage

```js
const parse = require('http-body-json-parse')

http.createServer((request, response) => {
	parse(request)
		.then(console.log)
		.catch(parse.ContentTypeError, e => console.error(e.message))
		.catch(parse.ParsingError, e => console.error(e.message)
})
```
