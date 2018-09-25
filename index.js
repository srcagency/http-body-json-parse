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
class BufferError extends Error {
	constructor() {
		super('Buffer exhausted')
		this.name = this.constructor.name
	}
}

parse.ContentTypeError = ContentTypeError
parse.ParsingError = ParsingError
parse.BufferError = BufferError
parse.parsing = parsing
parse.parsed = parsed

module.exports = parse

function parse(request, maxBuffer = Infinity, log = () => {}) {
	if (request[parsing] !== undefined) return request[parsing]
	if (request.headers['content-type'] !== 'application/json') {
		return Promise.reject(new ContentTypeError())
	}

	log('parsing')

	const r = getStream(request, {maxBuffer}).then(
		json => {
			try {
				const data = JSON.parse(json)
				request[parsed] = data
				log({data})
				return data
			} catch (e) {
				return Promise.reject(new ParsingError())
			}
		},
		e => {
			if (e.message !== 'maxBuffer exceeded') return Promise.reject(e)
			return Promise.reject(new BufferError())
		}
	)

	request[parsing] = r

	return r
}
