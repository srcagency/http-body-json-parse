'use strict';

var http = require('http');
var test = require('tape');
var request = require('request');
var parseBody = require('./');

var server = http.createServer(function( request, response ){
	response.setHeader('Content-Type', 'application/json');

	parseBody(request)
		.then(json => response.end(JSON.stringify(json)))
		.catch(parseBody.ContentTypeError, e => response.end('ContentTypeError: '+e.message))
		.catch(parseBody.ParsingError, e => response.end('ParsingError: '+e.message));
})
	.listen(0);

test.onFinish(function(){
	server.close();
});

var host = new Promise(function( rslv ){
	server.on('listening', () => rslv('http://localhost:'+server.address().port));
});

test(function( t ){
	t.plan(1);

	var dummy = {
		key: 'value',
		root: {
			leaf: 'value',
		},
	};

	requestMirror(dummy, ( err, body ) => t.deepEqual(body, dummy));
});

test('Empty object', function( t ){
	t.plan(1);

	var dummy = {};

	requestMirror(dummy, ( err, body ) => t.deepEqual(body, dummy));
});

test('Throws on bad content type', function( t ){
	t.plan(1);

	host.then(host => request({
		method: 'POST',
		uri: host,
		headers: {
			'Content-Type': 'text/json',
		},
		body: '...',
	}, ( err, res, body ) => t.equal(body, 'ContentTypeError: Content-Type must be "application/json"')));
});

test('Throws on bad JSON', function( t ){
	t.plan(1);

	host.then(host => request({
		method: 'POST',
		uri: host,
		headers: {
			'Content-Type': 'application/json',
		},
		json: false,
		body: '...',
	}, ( err, res, body ) => t.equal(body, 'ParsingError: Unable to parse JSON')));
});

function requestMirror( body, cb ){
	host.then(host => request({
		method: 'POST',
		uri: host,
		json: true,
		body: body,
	}, ( err, res, body ) => cb(err, body)));
}
