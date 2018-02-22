'use strict';

/*
    Helper functions.
 */
function log(){
    console.log(...arguments);
}

function warn(){
    console.warn(...arguments);
}

function error(){
    console.error(...arguments);
}

function info(){
    console.info(...arguments);
}

function isArray(o){
    return Object.prototype.toString.call(o) === '[object Array]';
}

function isObject(o){
    return Object.prototype.toString.call(o) === '[object Object]';
}

function array_merge(arr1, arr2){
    return arr1.push.apply(arr1, arr2);
}

function round(number){
    return ~~number;
}

function customSlice(arr, begin, end){
   let cached = [].slice;
   return cached.call(arr, begin, end);
}

function customSplice(arr, index, nb_delete){
    let cached = [].splice;
    return cached.call(arr, index, nb_delete);
}

function flatten(list){
    let cached = [].concat;
    return list.constructor === Array ? cached.apply([], list.map(flatten)) : list;
}



/**
 * Custom getTag function for document fragment.
 * @param  string.
 * @return {object}.
 */
function getTag(name){
    let alldescendants = [];
    const t = document.body.childNodes;
    for(let h = 0; h < t.length; h++){
        if (t[h].nodeType == 1){
            recurseAndAdd(t[h], alldescendants);
        }
    }
function recurseAndAdd(el, descendants) {
  descendants.push(el);
  let children;
  // if it's a document fragment
  if(el.content){
    children = el.content.childNodes;
  }else{
     children = el.childNodes;
  }
    for(let i=0; i < children.length; i++) {
     if (children[i].nodeType == 1) {
         recurseAndAdd(children[i], descendants);
     }
   }
}
    let res = [];
    for(var i = 0; i<alldescendants.length; i++){
        if(alldescendants[i].localName == `${name}`){
             res.push(alldescendants[i]);
        }
    }

    if(res.length == 1){
        return res[0];
    }else{
       error("Unique name required.", "You have: "+res.length+" tags with this name.");
    }
}

/**
 * Recursively find a path in json object.
 * @param  {json object}.
 * @param  string. Path in the json object. Ex. : 'object1.object2.object3'
 * @param  [array]. Ex. : 'object1.object2.object3', return a value for object3.
 * @return [array].
 */
function _find( obj, field, results )
{
    const tokens = field.split( '.' );

    // if this is an array, recursively call for each row in the array
    if( obj instanceof Array )
    {
        obj.forEach( function( row )
        {
            _find( row, field, results );
        } );
    }
    else
    {

        // if obj contains the field
        if( obj[ tokens[ 0 ] ] !== undefined )
        {
            // if we're at the end of the dot path

            if( tokens.length === 1 )
            {
                results.push( obj[ tokens[ 0 ] ] );
            }
            else
            {
                // keep going down the dot path
                _find( obj[ tokens[ 0 ] ], field.substr( field.indexOf( '.' ) + 1 ), results );
            }
        }
    }
}

/**
 * Find object value in nested object.
 * @param  object.
 * @param  string.
 * @return value.
 */
function findVal(object, key) {
    let value;
    Object.keys(object).some(function(k) {
        if (k === key) {
            value = object[k];
            return true;
        }
        if (object[k] && typeof object[k] === 'object') {
            value = findVal(object[k], key);
            return value !== undefined;
        }
    });
    return value;
}

/**
 * Only childs, no parent.
 * @param  string.
 * @return string.
 */
function getStringNextDiv(string){
    return string.slice(string.indexOf(">") + 1, string.lastIndexOf("<")).trim();
}

/**
 * Custom function : object to array.
 * @return [array].
 */
Object.prototype.toArray=function(){
    let arr=[];
    for( let i in this ) {
        if (this.hasOwnProperty(i)){
            arr.push(this[i]);
        }
    }
    return arr;
};

/**
 * Replace any data in {{...}} from a json object.
 * @param  string.
 * @param  object. Json data.
 * @param  data_length.
 * @return string. Replaced data.
 */
function stringReplaceData(string, obj, j){

    const split = string.split(/{{|}}/gi), store = obj, result = [], len = split.length;

    for(let i=0, k=0; i<len;i++){
      if(split[i].indexOf("<") == -1){

       //var str = split[i].substr(split[i].lastIndexOf('.') + 1).trim();
        let str_2 = split[i].substr(split[i].indexOf('.') + 1).trim();

       _find(store[j], str_2, result);
        //split[i] = findVal(store[j], str);

        split[i] = result[k];
        k++;
      }
    }

   return split.join('');
}

/**
 * Constructor.
 * @param JSON
 * @param string.
 */
function DOMrender(data, template){

    IsJsonString(data)? this.data = JSON.parse(data) : error("Not a valid Json format!");
    this.template = template;
};

Object.assign(DOMrender.prototype, {

    /**
     * Generate HTML and replace JSON data.
     * @return DOM new child.
     */
    gen_data_for:function(){

        const tmp = getTag(this.template), content = tmp.innerHTML;
        const data_len = this.data.length, gen_content = [];
        const match = content.match(/for/gi);

        if(match.length == 1){
            if(isArray(this.data)){
                  for(let i=0; i<data_len;i++){
                    gen_content[i] = getStringNextDiv(content);
                    gen_content[i] = stringReplaceData(gen_content[i], this.data, i);
                  }
            }else if(isObject(this.data)){
                let len =  Object.keys(this.data).length;
                for(let k in this.data){
                    gen_content[k] = getStringNextDiv(content);
                    gen_content[k] = stringReplaceData(gen_content[k], this.data, k);
                }
            }
        //TODO : multidim. Il faut une entré dans le DOM afin de garder une trace.
        }else if(match.length == 2){

        }else if(match.length == 3){

        }
            const res = gen_content.join('');
            const frag =  document.createRange().createContextualFragment(res);

            return document.body.replaceChild(frag, tmp);
    }
});

/**
 * Valid Json format.
 * @param string.
 * @return boolean.
 */
function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

/**
 * Create a json collection of users.
 * @param  int.
 * @return [json array].
 */
function generate_json_user(value){
    let data = [];
    for(let i = 0; i<value;i++){
        data[i] = {"user":{"id":unique_id(), "name":unique_id()}};
    }
    return JSON.stringify(data);
}

/**
 * Return a unique id.
 * @return string.
 */
function unique_id(){
            const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwyxz';
            const ID_LENGTH = 15;
            let rtn = '';
            for(let i = 0; i < ID_LENGTH;i++){

              rtn += alpha.charAt(Math.floor(Math.random() * alpha.length));
            }
            return rtn;
}

/*
    Test.

let data =  '[{"ID":2,"0":2,"NAME":"Jean","1":"ok","FORMAT":"","2":"","PATH":"img_ok-1188a2e65b25333.019494154267313a6.png","3":"img_ok-1188a2e65b25333.019494154267313a6.png","TIME_UPLOAD":null,"4":null},{"ID":3,"0":3,"NAME":"Charle","1":"zfez","FORMAT":"","2":"","PATH":"img_zfez-80956467.99903751ae0a320545d84a03.jpg","3":"img_zfez-80956467.99903751ae0a320545d84a03.jpg","TIME_UPLOAD":null,"4":null},{"ID":4,"0":4,"NAME":"Patrick","1":"jy","FORMAT":"","2":"","PATH":"img_jy-55335601619d85a82e.65328ba685249.jpeg","3":"img_jy-55335601619d85a82e.65328ba685249.jpeg","TIME_UPLOAD":null,"4":null}]';
//let data = generate_json_user(20);
//log(data);
let inst = new DOMrender(data, 'template');
inst.gen_data_for();

*/