# vitiligotheme

Custom theme of donation/membership forms. Note that this extension is
hard-coded to specific forms; if they change this extension will probably need
updating.

## Requirements

- PHP v7.0+
- CiviCRM 5.13+

## Installing

The source package includes built assets, which means you can just install this repo in the extensions directory, then enable it through the Manage Extensions page.

The following files/directories can optionally be deleted (they are not needed in production)

- `js-src/`
- `sass/`
- `gulpfile.js`
- `package.json`
- `package-lock.json`
- `node_modules/` - this is not in the repo but will be there if you do a manual build.

### Building

You need a nodejs environment. Clone the repo and enter the dir and type `npm i` to download the node modules.

Single build:

```
./node_modules/gulp-cli/bin/gulp.js
```

Watch files for change and rebuild when they change
```
./node_modules/gulp-cli/bin/gulp.js watch
```


## Author, License

This was written by Rich Lott / Artful Robot.

The extension is licensed under [AGPL-3.0](LICENSE.txt).

