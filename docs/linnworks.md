# Linnworks Integration

We'll need to setup an External Application like so:

https://help.linnworks.com/support/solutions/articles/7000007340-setting-up-a-basic-external-application

It's lets us provide a 'PostbackUrl' that Linnworks will send our authentication token to via an http POST.

Then we should be able to authorize as described here: https://apps.linnworks.net/Api

Or if we've setup an 'Application' on Linnworks we should authorize with this instead? https://apps.linnworks.net/Api/Method/Auth-AuthorizeByApplication

We'll be given back a session token and a session server address for future requests.

## Links
 - https://help.linnworks.com/support/solutions/7000000878
