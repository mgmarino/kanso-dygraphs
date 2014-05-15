kanso-dygraphs
==============

Wrapping of the dygraphs javascript library for use in kan.so

The dygraphs javascript library is available at http://dygraphs.com, or at
https://github.com/danvk/dygraphs 

The current version wrapped is 1.0.1;

Usage:
-----

    var dygraphs = require("dygraph-combined");
    var new_plot = dygraphs.Dygraph( ... );

More information concerning the API for dygraphs is found on their webpage.

Wrapping:
---------

`node wrap_dygraph.js > dygraph-combined.js`
