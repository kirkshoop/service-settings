# settings translation app
This can be used to take the settings from a web.config and translate them to csdef, cscfg, and deployment xml

> this was bootstrapped by the excellent cycle-hot-reloading-example.
> A Cycle.js starter project with hot reloading using browserify and browserify-hmr.
> https://github.com/Widdershin/cycle-hot-reloading-example


##Usage
---

To get set up:

```bash
git clone https://github.com/kirkshoop/service-settings.git
cd service-settings
npm install
npm start
```

##Deployment
---

Deploy to Github pages.

```bash
git checkout gh-pages
git merge master --no-edit
npm run bundle
git add .
git commit -m "Update bundle"
git push origin gh-pages
```
Then visit http://**username**.github.io/**repository**. Your site should be online within 5 minutes or so.

