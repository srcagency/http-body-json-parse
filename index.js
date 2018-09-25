'use strict'

const getStream = require('get-stream')
const cache = Symbol()

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

module.exports = parse

function parse(request, log = () => {}) {
	if (request[cache] !== undefined) return request[cache]
	if (request.headers['content-type'] !== 'application/json') {
		return Promise.reject(new ContentTypeError())
	}

	log('parsing')

	const parsed = getStream(request).then(json => {
		try {
			const data = JSON.parse(json)
			log({data})
			return data
		} catch (e) {
			return Promise.reject(new ParsingError())
		}
	})

	request[cache] = parsed

	return parsed
}
