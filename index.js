'use strict'

const Promise = require('bluebird')
const concat = require('concat-stream')
const debug = require('debug')('http-body-json-parse')
const {reject} = Promise

parse.ContentTypeError = ContentTypeError
parse.ParsingError = ParsingError

module.exports = parse

function parse(request) {
	if (request.headers['content-type'] !== 'application/json')
		return reject(new ContentTypeError())

	const raw = new Promise((rs, rj) => {
		request.once('error', rj)
		request.pipe(concat(rs))
	})
	const parsed = raw
		.then(JSON.parse)
		.catch(SyntaxError, () => reject(new ParsingError()))

	if (!debug.enabled) return parsed

	debug('parsing')

	return parsed
		.tap(data => debug('parsed to %o', data))
		.tapCatch(e => debug('failed: %s', e.message))
}

function ContentTypeError() {
	this.message = 'Content-Type must be "application/json"'
}
function ParsingError() {
	this.message = 'Unable to parse JSON'
}

ContentTypeError.prototype = Object.create(Error.prototype)
ParsingError.prototype = Object.create(Error.prototype)
