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
	const contentTypeDirectives = request.headers['content-type']
		?.split(';')
		.map(d => d.trim())
	if (!contentTypeDirectives?.includes('application/json')) {
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
			if (e instanceof getStream.MaxBufferError) {
				return Promise.reject(new BufferError())
			}
			return Promise.reject(e)
		}
	)

	request[parsing] = r

	return r
}
