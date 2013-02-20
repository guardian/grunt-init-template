When you run `grunt build`, the project will be linted/compiled/flattened/minified/whatever, and copied to `build/tmp`.

When you run `grunt zip`, the contents of `build/tmp` are compressed as `build/zip/{%= name %}-{{timestamp}}.zip`.