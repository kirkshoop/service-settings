import {h1, h2, label, textarea, input, div} from '@cycle/dom';

import {Observable} from 'rx';

function view (model) {
  return (
    div('.form-horizontal .configsettings', [
      h1("Azure Settings"),
      div("take the settings from a web.config and translate them to csdef, cscfg, and deployment xml"),
      div('.inputs', [
        h2(null, "Inputs"),
        div('.form-group .from', [
            label('.col-sm-2 .control-label', {"htmlFor": "config" }, "config settings"), 
            div('.col-sm-10', textarea('.form-control .config', {id: "config", placeholder: '<add key="My.Application.Location" value="http://localhost:8000"/>'}))
        ]),
        div('.form-group .deployprefix', [
            label('.col-sm-2 .control-label', {"htmlFor": "config" }, "deploy prefix"), 
            div('.col-sm-10', input('.form-control .deployprefix', {id: "config", placeholder: 'MyApplication'}))
        ]),
        div('.form-group .deploysuffix', [
            label('.col-sm-2 .control-label', {"htmlFor": "config" }, "deploy suffix"), 
            div('.col-sm-10', input('.form-control .deploysuffix', {id: "config"}))
        ])
      ]),
      div('.results', [
        h2(null, "Results"),
        div('.form-group .tocsdef', [
            label('.col-sm-2 .control-label', {"htmlFor": "config" }, "csdef settings"), 
            div('.col-sm-10', textarea('.form-control .csdef', {id: "config", value: model.csdef}))
        ]),
        div('.form-group .tocscfg', [
            label('.col-sm-2 .control-label', {"htmlFor": "config" }, "cscfg settings"), 
            div('.col-sm-10', textarea('.form-control .cscfg', {id: "config", value: model.cscfg}))
        ]),
        div('.form-group .todeploymap', [
            label('.col-sm-2 .control-label', {"htmlFor": "config" }, "deploy settings map"), 
            div('.col-sm-10', textarea('.form-control .deploymap', {id: "config", value: model.deploymap}))
        ]),
        div('.form-group .todeploy', [
            label('.col-sm-2 .control-label', {"htmlFor": "config" }, "deploy settings"), 
            div('.col-sm-10', textarea('.form-control .deploy', {id: "config", value: model.deploy}))
        ]),
        div('.form-group .todeployvalues', [
            label('.col-sm-2 .control-label', {"htmlFor": "config" }, "deploy settings w/values"), 
            div('.col-sm-10', textarea('.form-control .deployvalues', {id: "config", value: model.deployvalues}))
        ]),
        div('.form-group .toconfigts', [
            label('.col-sm-2 .control-label', {"htmlFor": "config" }, "config.ts settings"), 
            div('.col-sm-10', textarea('.form-control .configts', {id: "config", value: model.configts}))
        ])
      ])
    ])
  );
}

function toArray(list) {
    if (!list) return [];
    return Array.prototype.slice.call(list);
}

function parseXml(text) {
    var parser = new DOMParser(),
        doc = parser.parseFromString("<rootforparse>"+ text +"</rootforparse>", "text/xml");
    return toArray(doc.getElementsByTagName("rootforparse")[0].childNodes)
        .map(child => ({
            tag: child.nodeName,
            value: child.nodeValue,
            attributes: toArray(child.attributes)
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


  const suffix$ = DOM
    .select('.deploysuffix')
    .events('input')
    .map(ev => ev.target.value);

  const model$ = input$.startWith("")
    .combineLatest(prefix$.startWith(""), suffix$.startWith(""), (i, p, s) => ({input: i, prefix: p, suffix: s}))
    .map(actions => ({from: parseXml(actions.input), prefix: actions.prefix, suffix: actions.suffix}))
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
                .join('\n'); 

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
                .join('\n'); 

            model.deploymap = settings
                .filter(setting => setting.tag === "add")
                .map(setting => {
                    let tag = setting.attributes
                        .filter(attribute => attribute.name === "key")
                        .map(attribute => attribute.value)
                        .join('');
                    return "<Setting Name=\"" + tag + "\">$(" + update.prefix + tag.split('.').pop(-1) + update.suffix + ")</Setting>";
                })
                .join('\n'); 

            model.deploy = settings
                .filter(setting => setting.tag === "add")
                .map(setting => {
                    let tag = setting.attributes
                        .filter(attribute => attribute.name === "key")
                        .map(attribute => attribute.value)
                        .join('');
                    let mapped = update.prefix + tag.split('.').pop(-1) + update.suffix;
                    return "<Setting Name=\"" + mapped + "\"></Setting>";
                })
                .join('\n'); 

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
                    let mapped = update.prefix + tag.split('.').pop(-1) + update.suffix;
                    return "<Setting Name=\"" + mapped + "\">" + value + "</Setting>";
                })
                .join('\n'); 

            model.configts = settings
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
                    let mapped = tag.split('.').pop(-1);
                    return mapped + ": UXConfiguration[\"" + tag + "\"],";
                })
                .join('\n'); 

            return model;
        }, 
        {
            csdef: "", 
            cscfg: "", 
            deploy: "",
            deploymap: "",
            deployvalues: "",
            configts: ""
        });

  return {
    DOM: model$.map(view)
  };
}
