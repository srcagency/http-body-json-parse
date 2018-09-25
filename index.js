'use strict'

const getStream = require('get-stream')
const parsing = Symbol()
const parsed = Symbol()

class ContentTypeError extends Error {
	constructor() {
		super('Content-Type must be "application/json"')
		this.name = this.constructor.name
	}
}
class ParsingError extends Error {
	constructor() {
		super('Unable to parse JSON')
		this.name = this.constructor.name
	}
}

parse.ContentTypeError = ContentTypeError
parse.ParsingError = ParsingError
parse.parsing = parsing
parse.parsed = parsed

module.exports = parse

function parse(request, log = () => {}) {
	if (request[parsing] !== undefined) return request[parsing]
	if (request.headers['content-type'] !== 'application/json') {
		return Promise.reject(new ContentTypeError())
	}

	log('parsing')

	const r = getStream(request).then(json => {
		try {
			const data = JSON.parse(json)
			request[parsed] = data
			log({data})
			return data
		} catch (e) {
			return Promise.reject(new ParsingError())
		}
	})

	request[parsing] = r

	return r
}
