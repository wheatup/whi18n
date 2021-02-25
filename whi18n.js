const { get } = require('lodash');

const data = {};
let observer;
let _defaultLang;
let langData, defaultLangData;
let langDict;

const _lang = localStorage.getItem('lang') || 'en-US';

const getLang = lang => {
	if (typeof langDict === 'object') {
		return langDict[lang];
	} else if (typeof langDict === 'function') {
		let result = langDict(lang);
		while (typeof result === 'function') {
			result = result(lang);
		}
		if (result instanceof Promise) {
			return new Promise(resolve => {
				result.then(e => resolve(e));
			})
		}
		return result;
	} else {
		return {};
	}
}

const getText = (key, ...args) => {
	if (key.raw) {
		key = key.reduce((acc, cur, i) => acc + cur + (args[i] || ''), '')
	}
	
	let text = get(langData.texts, key) || get(defaultLangData.texts, key) || key;
	text = text.replace(/\$\{(\d+)\}/g, (_, e) => (args && args[e - 1]) || '');
	return text;
}

const init = (lang = _lang, dict, defaultLang = 'en-US') => {
	if (dict) {
		langDict = dict;
	}
	_defaultLang = defaultLang;

	localStorage.setItem('lang', lang);
	defaultLangData = data[_defaultLang] || getLang(_defaultLang);
	data[_defaultLang] = defaultLangData;
	langData = data[lang] || getLang(lang);
	data[lang] = langData;

	if (observer) return;
	const replace = (_, e, args) => {
		args = args && args.split(',');
		// stupid safari
		// args = args && args.split(/(?<![^\\](\\\\)*\\),/);
		let text = getText(e, lang);
		if (/\$\{(\d+)\}/g[Symbol.match](text)) {
			text = text.replace(/\$\{(\d+)\}/g, (_, e) => (args && args[e - 1]) || '');
		}
		return text;
	};
	const regex = /@\{\s*(.*?)(?::(.*))?}/g;
	const replaceChildren = node => {
		if (node instanceof HTMLElement) {
			[...node.attributes].forEach(attr => {
				if (regex[Symbol.match](attr.name)) {
					attr.name = attr.name.replace(regex, replace);
				}
				if (regex[Symbol.match](attr.value)) {
					attr.value = attr.value.replace(regex, replace);
				}
			});
			[...node.childNodes].forEach(node => {
				replaceChildren(node);
			});

		} else if (regex[Symbol.match](node.textContent)) {
			node.textContent = node.textContent.replace(regex, replace);
		}
	}

	observer = new MutationObserver((list, observer) => {
		list.forEach(mutation => {
			if (mutation.type === 'childList') {
				if (mutation.addedNodes && mutation.addedNodes.length > 0) {
					[...mutation.addedNodes].forEach(node => {
						replaceChildren(node);
					})
				}
			}
			else if (mutation.type === 'attributes') {
				replaceChildren(mutation.target);
			}
		})
	});

	observer.observe(document.getRootNode(), { attributes: true, childList: true, subtree: true });

	const promises = [langData, defaultLangData].filter(d => d instanceof Promise);
	if (promises.length) {
		return new Promise(resolve => Promise.all([langData, defaultLangData]).then(([ld, dld]) => {
			langData = ld;
			defaultLangData = dld;
			replaceChildren(document.body);
			resolve();
		}));
	} else {
		replaceChildren(document.body);
	}
};



if (typeof module !== 'undefined') {
	getText.init = init;
	module.exports = getText;
}