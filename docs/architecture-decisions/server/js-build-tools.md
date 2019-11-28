On the server, let's start with [rollup](https://github.com/rollup/rollup). It's simpler than other tools and it will help us keep deployments small and fast using its tree-shaking system.

If restarting the server on changes gets annoying we can try [nodemon](https://nodemon.io/), [this article](https://medium.com/@binyamin/get-nodemon-to-restart-after-webpack-re-build-8746db80548e) might help. The gist seems to be ignoring changes to `/src`, only watching for changes to `/dist`. That way rollup gets to do its thing first.
