# GridJS

GridJS is a distributed JavaScript processor.

You provide data, a map and a reduce function. GridJS then takes care of distributing it to all other opened GridJS pages.

# To run manually locally

0. Install node.js
1. Clone this repo
2. cd app
3. npm install
4. node main.js

# To deploy manually to CloudBees

1. cd app
2. zip -r ../app.zip
3. bees app:deploy -t nodejs -RPLUGIN.SRC.nodejs=https://s3.amazonaws.com/clickstacks/admin/nodejs-plugin-0.10.5.zip ../app.zip

# The node.js clickstack
See here if you want to change how it work: https://github.com/CloudBees-community/node-clickstack
The node-clickstack makes this possible - if you want to tweak how the node.js container works
fork that repo, change it, and use it for the -RPLUGIN.SRC.nodejs url above.

Otherwise - fork this ! 


