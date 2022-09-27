# udf-i18n

A univeral i18n library.

## Install

```bash
$ npm i udf-i18n
```

## Usage

### How to use

#### Initialize

* Synchronized

```javascript
import { init } from 'udf-i18n';

const langData = {
	"en-US": {
		"version": 1,
		"texts": {
			"marco": "Polo",
			"mail": "You have recieved ${1} mails"
			"foo": {
				"bar": "baz"
			}
		}
	},
	"ja-JP": {
		"version": 1,
		"texts": {
			"marco": "ポロ",
			"mail": "メールが${1}通を受け取りました"
			"foo": {
				"bar": "バズ",
			}
		}
	}
};

init('ja-JP', langData);
```

* Asynchronized
```javascript
import T, { init } from 'udf-i18n';

const getData = async lang => await axios.get(`/lang/${lang}.json`);
// If the data is a function that returns a promise, you need to await it
await init('ja-JP', getData);
```

#### Use in code

```javascript
console.log(T`marco`);		// ポロ
console.log(T`foo.bar`);	// バズ
```

#### Use in HTML:

```html
<!-- <span>ポロ</span>  -->
<span>@{marco}</span>

<!-- use variables -->
<!-- <span>メールが3通を受け取りました</span>  -->
<span>@{mail:3}</span>

<!-- <span title="バズ">Hello, world!</span>  -->
<span title="@{foo.bar}">Hello, world!</span>


```