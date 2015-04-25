# Node.js Database Manager

This is a node.js based MySQL Database Manager. It starts a HTTP Server on any specified port.

#Usage:

To use this, Clone, then run `npm install`

You will need to add your own config file. You can copy it from the example `cp \~config.json config.json`

Once you set the port, run it by using `node index`

#Features:
  - Streams Data to the Client (Activate Slow mode in the config file to see this feature)
  - Allows Multiple Database Connections
  - Tabbed SQL Queries
  - All Data is stored to your session, closing the browser will not lose your Queries / Connections.

#Depends on:
  - Express
  - Cookies
  - Jade
  - Mysql
  - Querystring
  - jQuery / AngularJS
  - Twitter Bootstrap

Forking is Encouraged.

#Licence
The MIT License (MIT)

Copyright (c) 2015 Adam Fowler

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

