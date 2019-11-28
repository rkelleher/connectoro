In the interest of getting up and running quickly, we should probably avoid jumping into a message queue / microservice architecture and start by handling events via our HTTP server. This will already handle a reasonable number of jobs. If in the future we need a message queue our best bet is probably ØMQ via zeromqJS.

 - https://github.com/zeromq
 - https://github.com/zeromq/zeromq.js
