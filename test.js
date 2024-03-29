'use strict'

const http = require('http')
const {Readable} = require('stream')
const test = require('tape')
const request = require('request')
const parse = require('./')

const server = http
	.createServer((request, response) => {
		response.setHeader('Content-Type', 'application/json')

		parse(request)
			.then(json => response.end(JSON.stringify(json)))
			.catch(e => response.end(e.name + ': ' + e.message))
	})
	.listen(0)

test.onFinish(() => server.close())

const host = new Promise(rslv =>
	server.on('listening', () =>
		rslv('http://localhost:' + server.address().port)
	)
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

	host.then(host =>
		request(
			{
				method: 'POST',
				uri: host,
				headers: {
					'Content-Type': 'text/json',
				},
				body: '...',
			},
			(err, res, body) =>
				t.equal(
					body,
					'ContentTypeError: Content-Type must be "application/json"'
				)
		)
	)
})

test('Throws on missing content type header', t => {
	t.plan(1)

	host.then(host =>
		request(
			{
				method: 'POST',
				uri: host,
				headers: {},
				body: '...',
			},
			(err, res, body) =>
				t.equal(
					body,
					'ContentTypeError: Content-Type must be "application/json"'
				)
		)
	)
})

test('Support content type directives', t => {
	t.plan(1)

	const dummy = {
		key: 'value',
		root: {
			leaf: 'value',
		},
	}

	host.then(host =>
		request(
			{
				method: 'POST',
				uri: host,
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
				},
				json: true,
				body: dummy,
			},
			(err, res, body) => t.deepEqual(body, dummy)
		)
	)
})

test('Throws on bad JSON', t => {
	t.plan(1)

	host.then(host =>
		request(
			{
				method: 'POST',
				uri: host,
				headers: {
					'Content-Type': 'application/json',
				},
				json: false,
				body: '...',
			},
			(err, res, body) =>
				t.equal(body, 'ParsingError: Unable to parse JSON')
		)
	)
})

test('Forwards request stream errors', t => {
	t.plan(1)

	const fakeRequest = Object.assign(failingStream(), {
		headers: {
			'content-type': 'application/json',
		},
	})

	parse(fakeRequest).then(
		() => t.fail(),
		err => t.equal(err.message, 'Deliberate error')
	)
})

test('Introspection', t => {
	t.plan(2)
	let i = 0
	const request = new Readable({
		read() {
			if (i++) return this.push(null)
			return this.push(Buffer.from('{"a":"b"}'))
		},
	})
	request.headers = {'content-type': 'application/json'}
	const parsed = parse(request)
	t.equal(request[parse.parsing], parsed)

	parsed.then(() => t.deepEqual(request[parse.parsed], {a: 'b'}))
})

test('Max buffer', t => {
	t.plan(3)
	let i = 0
	const request = new Readable({
		read() {
			if (i++) return this.push(null)
			return this.push(Buffer.from('{"a":"b"}'))
		},
	})
	request.headers = {'content-type': 'application/json'}

	parse(request, 2).then(
		() => t.fail(),
		e => {
			t.ok(e instanceof parse.BufferError)
			t.equal(e.name, 'BufferError')
			t.equal(e.message, 'Buffer exhausted')
		}
	)
})

function requestMirror(body, cb) {
	host.then(host =>
		request(
			{
				method: 'POST',
				uri: host,
				json: true,
				body: body,
			},
			(err, res, body) => cb(err, body)
		)
	)
}

function failingStream() {
	let i = 0
	return new Readable({
		read() {
			if (i++ === 0) return this.push(Buffer.from('abc', 'ascii'))
			process.nextTick(() =>
				this.emit('error', new Error('Deliberate error'))
			)
		},
	})
}
