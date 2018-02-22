
Copy/paste this in your html index.

```html
<script type="text/javascript" src="generateDOM.js"></script>
```

Then, wrap your data in one div with a for attribute. Like so :
```html
<template>
 <div for="">
	Dont forget curly brackets : {{data.user.name}}
 </div>
</template>
```

Example: 

```js
let example = new DOMrender(data, 'template'); //data = your json data, template = your html tag(<template></template>).
example.gen_data_for();
```
