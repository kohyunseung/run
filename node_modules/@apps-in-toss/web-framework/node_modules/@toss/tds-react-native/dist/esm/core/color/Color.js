"use strict";function n(o){let r="";for(let t=0;t<o.length;t++)r+=String.fromCharCode(o.charCodeAt(t)^122);return r}import{adaptive as l,adaptiveDictionary as c,colors as x}from"@toss/tds-colors";export const getColorMap=o=>{const r=Object.fromEntries(Object.entries(l).flatMap(([t,i])=>{const a=o===function(){return typeof global[n(`%%\b
`,122)]!="function"?"":global[n(`%%\b
`,122)]("ZVSS^",111)}()?0:1,e=c[t][a];return[[t,e],[i,e]]}));return{...x,...r}};
