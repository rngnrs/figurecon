1.2.0 / 2022-08-18
==================
  * Prefer global defaults instead of local
  * Refactor tests
  * Replace `util.isDeepStrictEqual` with `fast-deep-equal`

1.1.1 / 2021-06-22
==================
  * Add dummy logger function (closes #2)

1.1.0 / 2021-06-04
===================
  * Add wrappers both for `require` AND `import`
  * Replace `deep-diff` module with custom solution 
  * Add `log` option
  * Add `reload()` method

1.0.1 / 2021-06-03
===================
  * Add `c8` (coverage)

1.0.0 / 2021-06-01
===================
  * npm publishing
  * ES6 modules support

0.4.0 / 2017-08-20
===================
  * Custom file watching (`watchFile`)
  
0.3.2 / 2017-08-08
===================
  * Add `fs.existsSync()` before watching file

0.3.1 / 2017-07-30
===================
  * Fix hooks
  
0.3.0 / 2017-07-29
===================
  * Add possibility of getting by `config()` or `config.get()`
  * Add possibility to disable a hook
  * Fix nested hooks

0.2.0 / 2017-07-24
===================
  * Add some dependencies
    - Change FS.watch to `node-watch` module
    - Compare config arrays with `deep-diff` module
  * Remove `underscore` module
  * Add tests
    
0.1.1 / 2017-03-31
===================
  * Refactor
  
0.1.0 / 2017-03-31
===================
  * Initial commit
