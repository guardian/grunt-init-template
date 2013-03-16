# styles

tl;dr - run `grunt watch`, and do your CSS in this folder ('styles'). Grunt will take it from there.

What is this?
=============

Sass stands for Syntactically Awesome Stylesheets. It is a more efficient way to write CSS, with a bunch of useful features like nesting, variables, and mixins. You can find documentation [here][1] - it is well worth the modest learning curve.

But you don't need to know any of that if you don't want, because Sass is also a superset of CSS - which means that you can carry on writing CSS as before.


How do these styles get into my project?
----------------------------------------

The `grunt sass` task is configured to compile the contents of this folder to `generated/v/x/min.css` during development, and `build/version/min.css` in the pre-deployment build step. (The `boot.js` file refers to it as `<%= projectUrl %>/<%= versionDir %>/min.css`).

If you run `grunt watch` this process will happen automatically every time you modify one of your .scss files or add a new one. You don't need to include a <link> tag for each one or anything like that - it will just get included.


How do I debug my CSS if it's minified?
---------------------------------------

During development (i.e. until you run `grunt build`), the .css files are compiled with debugging info. At the time of writing, the best way to debug Sass is to install the [Sass Inspector Chrome extension][2].

(Bonus points: if you run [this package][3] (OS X only), you can open the Sass Inspector links in Sublime Text 2, if that's what you're using. It will even skip you to the right line!)



[1]: http://sass-lang.com/
[2]: https://chrome.google.com/webstore/detail/sass-inspector/lkofmbmllpgfbnonmnenkiakimpgoamn
[3]: https://github.com/mobify/sass-sleuth/raw/master/Open%20Textmate%20Links%20in%20Sublime.zip?raw=true