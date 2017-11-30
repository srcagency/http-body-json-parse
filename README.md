# http-json-body-parse

Parse the JSON body of an http request.

## Usage

```js
var parseBody = require('http-body-json-parse');

http.createServer(function( request, response ){
	parseBody(request)
		.then(console.log)
		.catch(parseBody.ContentTypeError, e => console.error(e.message))
		.catch(parseBody.ParsingError, e => console.error(e.message);
});
```
