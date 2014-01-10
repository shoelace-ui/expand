
debug:
	@DEBUG=shoelace* ./node_modules/.bin/mocha test/ \
		--require should \
		--watch

test:
	@./node_modules/.bin/mocha test/ \
		--require should \
		--bail \
		--watch

.PHONY: test
