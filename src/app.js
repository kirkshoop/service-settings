import {h2, span, textarea, input, div} from '@cycle/dom';

import {Observable} from 'rx';

function view (model) {
  return (
    div('.configsettings', [
      div('.from', [span('.label', "config settings"), textarea('.config')]),
      div('.deployprefix', [span('.label', "deploy prefix"), input('.deployprefix')]),
      div('.results', [
        h2('.label', "Results"),
        div('.tocsdef', [span('.label', "csdef settings"), textarea('.csdef', {value: model.csdef})]),
        div('.tocscfg', [span('.label', "cscfg settings"), textarea('.cscfg', {value: model.cscfg})]),
        div('.todeploymap', [span('.label', "deploy settings map"), textarea('.deploymap', {value: model.deploymap})]),
        div('.todeploy', [span('.label', "deploy settings"), textarea('.deploy', {value: model.deploy})]),
        div('.todeployvalues', [span('.label', "deploy settings w/values"), textarea('.deployvalues', {value: model.deployvalues})])
      ])
    ])
  );
}

function parseXml(text) {
    var parser = new DOMParser(),
        doc = parser.parseFromString("<rootforparse>"+ text +"</rootforparse>", "text/xml");
    return Array.prototype.slice.call(doc.getElementsByTagName("rootforparse")[0].childNodes)
        .map(child => ({
            tag: child.nodeName,
            value: child.nodeValue,
            attributes: Array.prototype.slice.call(child.attributes)
                .map(attribute => ({
                    name: attribute.name, 
                    value: attribute.value
                }))
        })
    );
}

export default function App ({DOM}) {
  const input$ = DOM
    .select('.config')
    .events('input')
    .map(ev => ev.target.value);

  const prefix$ = DOM
    .select('.deployprefix')
    .events('input')
    .map(ev => ev.target.value);

  const model$ = input$.startWith("")
    .combineLatest(prefix$.startWith(""), (l, r) => ({input: l, prefix: r}))
    .map(actions => ({from: parseXml(actions.input), prefix: actions.prefix}))
    .scan((model, update) => {
            let settings = update.from;
            //model.deploy = JSON.stringify(settings);

            model.csdef = settings
                .filter(setting => setting.tag === "add")
                .map(setting => "<Setting " + 
                    setting.attributes
                        .filter(attribute => attribute.name === "key")
                        .map(attribute => "name=\"" + attribute.value + "\"")
                        .join(' ') + 
                    " />")
                .join(' '); 

            model.cscfg = settings
                .filter(setting => setting.tag === "add")
                .map(setting => "<Setting " + 
                    setting.attributes
                        .filter(attribute => attribute.name === "key")
                        .map(attribute => "name=\"" + attribute.value + "\"")
                        .concat(setting.attributes
                            .filter(attribute => attribute.name === "value")
                            .map(attribute => "value=\"" + attribute.value + "\""))
                        .join(' ') + 
                    " />")
                .join(' '); 

            model.deploymap = settings
                .filter(setting => setting.tag === "add")
                .map(setting => {
                    let tag = setting.attributes
                        .filter(attribute => attribute.name === "key")
                        .map(attribute => attribute.value)
                        .join('');
                    return "<Setting Name=\"" + tag + "\">$(" + update.prefix + tag.split('.').pop(-1) + ")</Setting>";
                })
                .join(' '); 

            model.deploy = settings
                .filter(setting => setting.tag === "add")
                .map(setting => {
                    let tag = setting.attributes
                        .filter(attribute => attribute.name === "key")
                        .map(attribute => attribute.value)
                        .join('');
                    let mapped = update.prefix + tag.split('.').pop(-1);
                    return "<Setting Name=\"" + mapped + "\"></Setting>";
                })
                .join(' '); 

            model.deployvalues = settings
                .filter(setting => setting.tag === "add")
                .map(setting => {
                    let tag = setting.attributes
                        .filter(attribute => attribute.name === "key")
                        .map(attribute => attribute.value)
                        .join('');
                    let value = setting.attributes
                        .filter(attribute => attribute.name === "value")
                        .map(attribute => attribute.value)
                        .join('');
                    let mapped = update.prefix + tag.split('.').pop(-1);
                    return "<Setting Name=\"" + mapped + "\">" + value + "</Setting>";
                })
                .join(' '); 

            return model;
        }, 
        {
            csdef: "", 
            cscfg: "", 
            deploy: "",
            deploymap: "",
            deployvalues: ""
        });

  return {
    DOM: model$.map(view)
  };
}
