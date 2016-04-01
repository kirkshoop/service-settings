# settings translation app
This can be used to take the settings from a web.config and translate them to csdef, cscfg, and deployment xml

> this was bootstrapped by the excellent cycle-hot-reloading-example.
> A Cycle.js starter project with hot reloading using browserify and browserify-hmr.
> https://github.com/Widdershin/cycle-hot-reloading-example

##Deployment
---

To get your project online, if you don't need a backend server, you can deploy to Github pages.

Note: if you cloned this repo directly, you will first need to [create a new repo](https://github.com/new). Since you're uploading an existing repo, don't add a README, license or .gitignore. Then follow the instructions to add your new repo as the remote. You will need to `git remote rm origin` beforehand.

To deploy for the first time, we need to set up a `gh-pages` branch:

```bash
git checkout -b gh-pages
npm run bundle
git add .
git commit -m "Add bundled app"
git push origin gh-pages
```

Then visit http://**username**.github.io/**repository**. Your site should be online within 5 minutes or so.

To update your site in future, just checkout back to the branch and repeat the process:
```bash
git checkout gh-pages
git merge master --no-edit
npm run bundle
git add .
git commit -m "Update bundle"
git push origin gh-pages
```

