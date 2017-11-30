'use strict';

var Promise = require('bluebird');
var concat = require('concat-stream');
var debug = require('debug')('http-body-json-parse');

parse.ContentTypeError = ContentTypeError;
parse.ParsingError = ParsingError;

module.exports = parse;

function parse( request ) {
	if (request.headers['content-type'] !== 'application/json')
		return Promise.reject(new ContentTypeError());

	var parsed = new Promise(function( rslv ){
		request.pipe(concat(rslv));
	})
		.then(JSON.parse)
		.catch(SyntaxError, function(){
			return Promise.reject(new ParsingError());
		});

	if (!debug.enabled)
		return parsed;

	debug('parsing body');

	return parsed
			.tap(function( data ) {
				debug('parsed body to %o', data);
			})
			.catch(function( e ){
				debug('failed to parse body');

				throw e;
			});
}

function ContentTypeError(){
	this.message = 'Content-Type must be "application/json"';
}

ContentTypeError.prototype = Object.create(Error.prototype);

function ParsingError(){
	this.message = 'Unable to parse JSON';
}

ParsingError.prototype = Object.create(Error.prototype);
