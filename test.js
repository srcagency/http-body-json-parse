'use strict'

const http = require('http')
const test = require('tape')
const request = require('request')
const parse = require('./')

const server = http.createServer((request, response) => {
	response.setHeader('Content-Type', 'application/json')

	parse(request)
		.then(json => response.end(JSON.stringify(json)))
		.catch(parse.ContentTypeError, e => response.end('ContentTypeError: '+e.message))
		.catch(parse.ParsingError, e => response.end('ParsingError: '+e.message))
})
	.listen(0)

test.onFinish(() => server.close())

const host = new Promise(rslv =>
	server.on('listening', () => rslv('http://localhost:'+server.address().port))
)

test(t => {
	t.plan(1)

	const dummy = {
		key: 'value',
		root: {
			leaf: 'value',
		},
	}

	requestMirror(dummy, (err, body) => t.deepEqual(body, dummy))
})

test('Empty object', t => {
	t.plan(1)

	const dummy = {}

	requestMirror(dummy, (err, body) => t.deepEqual(body, dummy))
})

test('Throws on bad content type', t => {
	t.plan(1)

	host.then(host => request({
		method: 'POST',
		uri: host,
		headers: {
			'Content-Type': 'text/json',
		},
		body: '...',
	}, (err, res, body) => t.equal(body, 'ContentTypeError: Content-Type must be "application/json"')))
})

test('Throws on bad JSON', t => {
	t.plan(1)

	host.then(host => request({
		method: 'POST',
		uri: host,
		headers: {
			'Content-Type': 'application/json',
		},
		json: false,
		body: '...',
	}, (err, res, body) => t.equal(body, 'ParsingError: Unable to parse JSON')))
})

function requestMirror(body, cb){
	host.then(
		host => request({
			method: 'POST',
			uri: host,
			json: true,
			body: body,
		},
		(err, res, body) => cb(err, body))
	)
}
