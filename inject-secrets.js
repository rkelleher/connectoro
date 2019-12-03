const fs = require('fs');
const ejs = require('ejs');

const template = fs.readFileSync('server/app.template.yaml').toString();
const secrets = JSON.parse(fs.readFileSync('server/secrets/secret.prod.env.json'));
const content = ejs.render(template, secrets);

fs.writeFileSync('server/app.yaml', content);