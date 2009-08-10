/*!
 *  Hyphenator 2.3.1 - client side hyphenation for webbrowsers
 *  Copyright (C) 2009  Mathias Nater, Zürich (mathias at mnn dot ch)
 *  Project and Source hosted on http://code.google.com/p/hyphenator/
 * 
 *  This JavaScript code is free software: you can redistribute
 *  it and/or modify it under the terms of the GNU Lesser
 *  General Public License (GNU LGPL) as published by the Free Software
 *  Foundation, either version 3 of the License, or (at your option)
 *  any later version.  The code is distributed WITHOUT ANY WARRANTY;
 *  without even the implied warranty of MERCHANTABILITY or FITNESS
 *  FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 *  As additional permission under GNU GPL version 3 section 7, you
 *  may distribute non-source (e.g., minimized or compacted) forms of
 *  that code without the copy of the GNU GPL normally required by
 *  section 4, provided you include this license notice and a URL
 *  through which recipients can access the Corresponding Source.
 */

var Hyphenator=(function(){var languageHint='cs, da, bn, de, en, es, fi, fr, gu, hi, hu, it, kn, ml, nl, or, pa, pl, pt, ru, sv, ta, te, uk',supportedLang=(function(){var k,i=0,a=languageHint.split(', '),r={};while(!!(k=a[i++])){r[k]=true;}return r;}()),prompterStrings={'cs':'Jazyk této internetové stránky nebyl automaticky rozpoznán. Určete prosím její jazyk:','da':'Denne websides sprog kunne ikke bestemmes. Angiv venligst sprog:','de':'Die Sprache dieser Webseite konnte nicht automatisch bestimmt werden. Bitte Sprache angeben:','en':'The language of this website could not be determined automatically. Please indicate the main language:','es':'El idioma del sitio no pudo determinarse autom%E1ticamente. Por favor, indique el idioma principal:','fi':'Sivun kielt%E4 ei tunnistettu automaattisesti. M%E4%E4rit%E4 sivun p%E4%E4kieli:','fr':'La langue de ce site n%u2019a pas pu %EAtre d%E9termin%E9e automatiquement. Veuillez indiquer une langue, s.v.p.%A0:','hu':'A weboldal nyelvét nem sikerült automatikusan megállapítani. Kérem adja meg a nyelvet:','it':'Lingua del sito sconosciuta. Indicare una lingua, per favore:','ml':'ഈ വെ%u0D2C%u0D4D%u200Cസൈറ്റിന്റെ ഭാഷ കണ്ടുപിടിയ്ക്കാ%u0D28%u0D4D%u200D കഴിഞ്ഞില്ല. ഭാഷ ഏതാണെന്നു തിരഞ്ഞെടുക്കുക:','nl':'De taal van deze website kan niet automatisch worden bepaald. Geef de hoofdtaal op:','pt':'A língua deste site não pôde ser determinada automaticamente. Por favor indique a língua principal:','ru':'Язык этого сайта не может быть определен автоматически. Пожалуйста укажите язык:','sv':'Spr%E5ket p%E5 den h%E4r webbplatsen kunde inte avg%F6ras automatiskt. V%E4nligen ange:','uk':'Мова цього веб-сайту не може бути визначена автоматично. Будь ласка, вкажіть головну мову:'},basePath=(function(){var s=document.getElementsByTagName('script'),i=0,p,src,t;while(!!(t=s[i++])){if(!t.src){continue;}src=t.src;p=src.indexOf('Hyphenator.js');if(p!==-1){return src.substring(0,p);}}return'http://hyphenator.googlecode.com/svn/trunk/';}()),isLocal=(function(){var re=false;if(basePath.indexOf(window.location.hostname)!==-1){re=true;}return re;}()),documentLoaded=false,dontHyphenate={'script':true,'code':true,'pre':true,'img':true,'br':true,'samp':true,'kbd':true,'var':true,'abbr':true,'acronym':true,'sub':true,'sup':true,'button':true,'option':true,'label':true,'textarea':true},enableCache=true,useWebWorker=false,enableRemoteLoading=true,displayToggleBox=false,hyphenateClass='hyphenate',dontHyphenateClass='donthyphenate',min=6,isBookmarklet=(function(){var loc=null,re=false,jsArray=document.getElementsByTagName('script'),i,l;for(i=0,l=jsArray.length;i<l;i++){if(!!jsArray[i].getAttribute('src')){loc=jsArray[i].getAttribute('src');}if(!loc){continue;}else if(loc.indexOf('Hyphenator.js?bm=true')!==-1){re=true;}}return re;}()),mainLanguage=null,elements=[],exceptions={},docLanguages={},state=0,url='(\\w*:\/\/)?((\\w*:)?(\\w*)@)?((([\\d]{1,3}\\.){3}([\\d]{1,3}))|(([\\w]*\\.)+([\\w]{2,4})))(:\\d*)?(\/[\\w#!:\\.?\\+=&%@!\\-]*)*',mail='[\\w-\\.]+@[\\w\\.]+',urlOrMailRE=new RegExp('('+url+')|('+mail+')','i'),zeroWidthSpace=(function(){var zws,ua=navigator.userAgent.toLowerCase();if(ua.indexOf('msie 6')===-1){zws=String.fromCharCode(8203);}else{zws='';}return zws;}()),onHyphenationDone=function(){},onError=function(e){alert("Hyphenator.js says:\n\nAn Error ocurred:\n"+e.message);},selectorFunction=function(){var tmp,el=[],i,l;if(document.getElementsByClassName){el=document.getElementsByClassName(hyphenateClass);}else{tmp=document.getElementsByTagName('*');l=tmp.length;for(i=0;i<l;i++){if(tmp[i].className.indexOf(hyphenateClass)!==-1&&tmp[i].className.indexOf(dontHyphenateClass)===-1){el.push(tmp[i]);}}}return el;},intermediateState='hidden',hyphen=String.fromCharCode(173),urlhyphen=zeroWidthSpace,Expando=(function(){var container={},name="HyphenatorExpando_"+Math.random(),uuid=0;return{getDataForElem:function(elem){return container[elem[name]];},setDataForElem:function(elem,data){var id;if(elem[name]&&elem[name]!==''){id=elem[name];}else{id=uuid++;elem[name]=id;}container[id]=data;},appendDataForElem:function(elem,data){var k;for(k in data){if(data.hasOwnProperty(k)){container[elem[name]][k]=data[k];}}},delDataOfElem:function(elem){delete container[elem[name]];}};}()),runOnContentLoaded=function(w,f){var d=w.document,D='DOMContentLoaded',u=w.navigator.userAgent.toLowerCase(),v=parseFloat(u.match(/.+(?:rv|it|ml|ra|ie)[\/: ]([\d.]+)/)[1]),oldonload=w.onload;function init(e){if(!documentLoaded){documentLoaded=true;f((e.type&&e.type===D)?e:{type:D,target:d,eventPhase:0,currentTarget:d,timeStamp:new Date().getTime(),eventType:e.type||e});}}if(/webkit\//.test(u)&&v<525.13){(function(){if(/complete|loaded/.test(d.readyState)){init('khtml-poll');}else{setTimeout(arguments.callee,10);}}());}else if(/msie/.test(u)&&!w.opera){d.attachEvent('onreadystatechange',function(e){if(d.readyState==='complete'){d.detachEvent('on'+e.type,arguments.callee);init(e);}});if(w.self===top){(function(){try{d.documentElement.doScroll('left');}catch(e){setTimeout(arguments.callee,10);return;}init('msie-poll');}());}}else if(d.addEventListener&&(/opera\//.test(u)&&v>9)||(/gecko\//.test(u)&&v>=1.8)||(/khtml\//.test(u)&&v>=4.0)||(/webkit\//.test(u)&&v>=525.13)){d.addEventListener(D,function(e){d.removeEventListener(D,arguments.callee,false);init(e);},false);}else{w.onload=function(e){init(e||w.event);if(typeof oldonload==='function'){oldonload(e||w.event);}};}},getLang=function(el,fallback){if(!!el.getAttribute('lang')){return el.getAttribute('lang').substring(0,2).toLowerCase();}try{if(!!el.getAttribute('xml:lang')){return el.getAttribute('xml:lang').substring(0,2).toLowerCase();}}catch(ex){}if(el.tagName!=='HTML'){return getLang(el.parentNode,true);}if(fallback){return mainLanguage;}return null;},autoSetMainLanguage=function(){var el=document.getElementsByTagName('html')[0],m=document.getElementsByTagName('meta'),i,text,lang,e,ul;mainLanguage=getLang(el);if(!mainLanguage){for(i=0;i<m.length;i++){if(!!m[i].getAttribute('http-equiv')&&(m[i].getAttribute('http-equiv')==='content-language')){mainLanguage=m[i].getAttribute('content').substring(0,2).toLowerCase();}if(!!m[i].getAttribute('name')&&(m[i].getAttribute('name')==='DC.language')){mainLanguage=m[i].getAttribute('content').substring(0,2).toLowerCase();}if(!!m[i].getAttribute('name')&&(m[i].getAttribute('name')==='language')){mainLanguage=m[i].getAttribute('content').substring(0,2).toLowerCase();}}}if(!mainLanguage){text='';ul=navigator.language?navigator.language:navigator.userLanguage;ul=ul.substring(0,2);if(prompterStrings.hasOwnProperty(ul)){text=prompterStrings[ul];}else{text=prompterStrings.en;}text+=' (ISO 639-1)\n\n'+languageHint;lang=window.prompt(unescape(text),ul).toLowerCase();if(supportedLang[lang]){mainLanguage=lang;}else{e=new Error('The language "'+lang+'" is not yet supported.');throw e;}}},gatherDocumentInfos=function(){var elToProcess,tmp,i=0,process=function(el,hide,lang){var n,i=0,hyphenatorSettings={};if(hide&&intermediateState==='hidden'){if(!!el.getAttribute('style')){hyphenatorSettings.hasOwnStyle=true;}else{hyphenatorSettings.hasOwnStyle=false;}hyphenatorSettings.isHidden=true;el.style.visibility='hidden';}if(el.lang){hyphenatorSettings.language=el.lang.toLowerCase();}else if(lang){hyphenatorSettings.language=lang.toLowerCase();}else{hyphenatorSettings.language=getLang(el,true);}lang=hyphenatorSettings.language;if(supportedLang[lang]){docLanguages[lang]=true;}else{onError(new Error('Language '+lang+' is not yet supported.'));}Expando.setDataForElem(el,hyphenatorSettings);elements.push(el);while(!!(n=el.childNodes[i++])){if(n.nodeType===1&&!dontHyphenate[n.nodeName.toLowerCase()]&&n.className.indexOf(dontHyphenateClass)===-1&&!(n in elToProcess)){process(n,false,lang);}}};if(Hyphenator.isBookmarklet()){elToProcess=document.getElementsByTagName('body')[0];process(elToProcess,false,mainLanguage);}else{elToProcess=selectorFunction();while(!!(tmp=elToProcess[i++])){process(tmp,true);}}if(!Hyphenator.languages.hasOwnProperty(mainLanguage)){docLanguages[mainLanguage]=true;}else if(!Hyphenator.languages[mainLanguage].prepared){docLanguages[mainLanguage]=true;}if(elements.length>0){Expando.appendDataForElem(elements[elements.length-1],{isLast:true});}},convertPatterns=function(lang){var plen,anfang,pats,pat,key,tmp={};pats=Hyphenator.languages[lang].patterns;for(plen in pats){if(pats.hasOwnProperty(plen)){plen=parseInt(plen,10);anfang=0;while(!!(pat=pats[plen].substr(anfang,plen))){key=pat.replace(/\d/g,'');tmp[key]=pat;anfang+=plen;}}}Hyphenator.languages[lang].patterns=tmp;Hyphenator.languages[lang].patternsConverted=true;},convertExceptionsToObject=function(exc){var w=exc.split(', '),r={},i,l,key;for(i=0,l=w.length;i<l;i++){key=w[i].replace(/-/g,'');if(!r.hasOwnProperty(key)){r[key]=w[i];}}return r;},loadPatterns=function(lang){var url,xhr,head,script;if(supportedLang[lang]&&!Hyphenator.languages[lang]){url=basePath+'patterns/'+lang+'.js';}else{return;}if(isLocal&&!isBookmarklet){xhr=null;if(typeof XMLHttpRequest!=='undefined'){xhr=new XMLHttpRequest();}if(!xhr){try{xhr=new ActiveXObject("Msxml2.XMLHTTP");}catch(e){xhr=null;}}if(xhr){xhr.open('HEAD',url,false);xhr.setRequestHeader('Cache-Control','no-cache');xhr.send(null);if(xhr.status===404){onError(new Error('Could not load\n'+url));delete docLanguages[lang];return;}}}if(document.createElement){head=document.getElementsByTagName('head').item(0);script=document.createElement('script');script.src=url;script.type='text/javascript';head.appendChild(script);}},prepareLanguagesObj=function(lang){var lo=Hyphenator.languages[lang],wrd;if(!lo.prepared){if(enableCache){lo.cache={};}if(lo.hasOwnProperty('exceptions')){Hyphenator.addExceptions(lang,lo.exceptions);delete lo.exceptions;}if(exceptions.hasOwnProperty('global')){if(exceptions.hasOwnProperty(lang)){exceptions[lang]+=', '+exceptions.global;}else{exceptions[lang]=exceptions.global;}}if(exceptions.hasOwnProperty(lang)){lo.exceptions=convertExceptionsToObject(exceptions[lang]);delete exceptions[lang];}else{lo.exceptions={};}convertPatterns(lang);wrd='[\\w'+lo.specialChars+'@'+String.fromCharCode(173)+'-]{'+min+',}';lo.genRegExp=new RegExp('('+url+')|('+mail+')|('+wrd+')','gi');lo.prepared=true;}},prepare=function(callback){var lang,docLangEmpty=true,interval;if(useWebWorker){callback();return;}if(!enableRemoteLoading){for(lang in Hyphenator.languages){if(Hyphenator.languages.hasOwnProperty(lang)){prepareLanguagesObj(lang);}}state=2;callback();return;}state=1;for(lang in docLanguages){if(docLanguages.hasOwnProperty(lang)){loadPatterns(lang);docLangEmpty=false;}}if(docLangEmpty){state=2;callback();return;}interval=window.setInterval(function(){var finishedLoading=false,lang;for(lang in docLanguages){if(docLanguages.hasOwnProperty(lang)){if(!Hyphenator.languages[lang]){finishedLoading=false;break;}else{finishedLoading=true;delete docLanguages[lang];prepareLanguagesObj(lang);}}}if(finishedLoading){window.clearInterval(interval);state=2;callback();}},100);},toggleBox=function(s){var myBox,bdy,myIdAttribute,myTextNode,myClassAttribute;if(!!(myBox=document.getElementById('HyphenatorToggleBox'))){if(s){myBox.firstChild.data='Hy-phe-na-ti-on';}else{myBox.firstChild.data='Hyphenation';}}else{bdy=document.getElementsByTagName('body')[0];myBox=document.createElement('div');myIdAttribute=document.createAttribute('id');myIdAttribute.nodeValue='HyphenatorToggleBox';myClassAttribute=document.createAttribute('class');myClassAttribute.nodeValue=dontHyphenateClass;myTextNode=document.createTextNode('Hy-phe-na-ti-on');myBox.appendChild(myTextNode);myBox.setAttributeNode(myIdAttribute);myBox.setAttributeNode(myClassAttribute);myBox.onclick=Hyphenator.toggleHyphenation;myBox.style.position='absolute';myBox.style.top='0px';myBox.style.right='0px';myBox.style.margin='0';myBox.style.backgroundColor='#AAAAAA';myBox.style.color='#FFFFFF';myBox.style.font='6pt Arial';myBox.style.letterSpacing='0.2em';myBox.style.padding='3px';myBox.style.cursor='pointer';myBox.style.WebkitBorderBottomLeftRadius='4px';myBox.style.MozBorderRadiusBottomleft='4px';bdy.appendChild(myBox);}},hyphenateWord=function(lang,word){var lo=Hyphenator.languages[lang],parts,i,l,w,wl,s,hypos,p,maxwins,win,pat=false,patk,patl,c,digits,z,numb3rs,n,inserted,hyphenatedword;if(word===''){return'';}if(word.indexOf(hyphen)!==-1){return word;}if(enableCache&&lo.cache.hasOwnProperty(word)){return lo.cache[word];}if(lo.exceptions.hasOwnProperty(word)){return lo.exceptions[word].replace(/-/g,hyphen);}if(word.indexOf('-')!==-1){parts=word.split('-');for(i=0,l=parts.length;i<l;i++){parts[i]=hyphenateWord(lang,parts[i]);}return parts.join('-'+zeroWidthSpace);}w='_'+word+'_';wl=w.length;s=w.split('');w=w.toLowerCase();hypos=[];numb3rs={'0':true,'1':true,'2':true,'3':true,'4':true,'5':true,'6':true,'7':true,'8':true,'9':true};n=wl-lo.shortestPattern;for(p=0;p<=n;p++){maxwins=Math.min((wl-p),lo.longestPattern);for(win=lo.shortestPattern;win<=maxwins;win++){if(lo.patterns.hasOwnProperty(patk=w.substr(p,win))){pat=lo.patterns[patk];}else{continue;}digits=1;patl=pat.length;for(i=0;i<patl;i++){c=pat.charAt(i);if(numb3rs[c]){if(i===0){z=p-1;if(!hypos[z]||hypos[z]<c){hypos[z]=c;}}else{z=p+i-digits;if(!hypos[z]||hypos[z]<c){hypos[z]=c;}}digits++;}}}}inserted=0;for(i=lo.leftmin;i<=(word.length-lo.rightmin);i++){if(!!(hypos[i]&1)){s.splice(i+inserted+1,0,hyphen);inserted++;}}hyphenatedword=s.slice(1,-1).join('');if(enableCache){lo.cache[word]=hyphenatedword;}return hyphenatedword;},hyphenateURL=function(url){return url.replace(/([:\/\.\?#&_,;!@]+)/gi,'$&'+urlhyphen);},hyphenateElement=function(el){if(useWebWorker){hyphenateElementWithWorker(el);return;}var hyphenatorSettings=Expando.getDataForElem(el),lang=hyphenatorSettings.language,hyphenate,n,i=0;if(Hyphenator.languages.hasOwnProperty(lang)){hyphenate=function(word){if(urlOrMailRE.test(word)){return hyphenateURL(word);}else{return hyphenateWord(lang,word);}};i=0;while(!!(n=el.childNodes[i++])){if(n.nodeType===3&&n.data.length>=min){n.data=n.data.replace(Hyphenator.languages[lang].genRegExp,hyphenate);}}}if(hyphenatorSettings.isHidden&&intermediateState==='hidden'){el.style.visibility='visible';if(!hyphenatorSettings.hasOwnStyle){el.setAttribute('style','');el.removeAttribute('style');}else{if(el.style.removeProperty){el.style.removeProperty('visibility');}else if(el.style.removeAttribute){el.style.removeAttribute('visibility');}}}if(hyphenatorSettings.isLast){state=3;onHyphenationDone();}},hyphenateElementWithWorker=function(el){var hyphenatorSettings=Expando.getDataForElem(el),lang=hyphenatorSettings.language,hyphenate,n,i=0,wkr=new Worker(basePath+"Hyphenator_Worker.js");while(!!(n=el.childNodes[i])){if(n.nodeType===3&&n.data.length>=min){wkr.postMessage(lang+','+i+','+n.data);}i++;}wkr.onmessage=function(e){var parts=e.data.split(','),index=parts.shift(),text=parts.join(',');el.childNodes[index].data=text;};if(hyphenatorSettings.isHidden&&intermediateState==='hidden'){el.style.visibility='visible';if(!hyphenatorSettings.hasOwnStyle){el.setAttribute('style','');el.removeAttribute('style');}else{if(el.style.removeProperty){el.style.removeProperty('visibility');}else if(el.style.removeAttribute){el.style.removeAttribute('visibility');}}}if(hyphenatorSettings.isLast){state=3;onHyphenationDone();}},removeHyphenationFromElement=function(el){var h,i=0,n;switch(hyphen){case'|':h='\\|';break;case'+':h='\\+';break;case'*':h='\\*';break;default:h=hyphen;}while(!!(n=el.childNodes[i++])){if(n.nodeType===3){n.data=n.data.replace(new RegExp(h,'g'),'');n.data=n.data.replace(new RegExp(zeroWidthSpace,'g'),'');}else if(n.nodeType===1){removeHyphenationFromElement(n);}}},hyphenateDocument=function(){var i=0,el;while(!!(el=elements[i++])){hyphenateElement(el);}},removeHyphenationFromDocument=function(){var i=0,el;while(!!(el=elements[i++])){removeHyphenationFromElement(el);}state=4;};return{version:'2.0.0',languages:{},config:function(obj){var assert=function(name,type){if(typeof obj[name]===type){return true;}else{onError(new Error('Config onError: '+name+' must be of type '+type));return false;}},key;for(key in obj){if(obj.hasOwnProperty(key)){switch(key){case'classname':if(assert('classname','string')){hyphenateClass=obj.classname;}break;case'donthyphenateclassname':if(assert('donthyphenateclassname','string')){dontHyphenateClass=obj.donthyphenateclassname;}break;case'minwordlength':if(assert('minwordlength','number')){min=obj.minwordlength;}break;case'hyphenchar':if(assert('hyphenchar','string')){if(obj.hyphenchar==='&shy;'){obj.hyphenchar=String.fromCharCode(173);}hyphen=obj.hyphenchar;}break;case'urlhyphenchar':if(obj.hasOwnProperty('urlhyphenchar')){if(assert('urlhyphenchar','string')){urlhyphen=obj.urlhyphenchar;}}break;case'togglebox':if(assert('togglebox','function')){toggleBox=obj.togglebox;}break;case'displaytogglebox':if(assert('displaytogglebox','boolean')){displayToggleBox=obj.displaytogglebox;}break;case'remoteloading':if(assert('remoteloading','boolean')){enableRemoteLoading=obj.remoteloading;}break;case'enablecache':if(assert('enablecache','boolean')){enableCache=obj.enablecache;}break;case'onhyphenationdonecallback':if(assert('onhyphenationdonecallback','function')){onHyphenationDone=obj.onhyphenationdonecallback;}break;case'onerrorhandler':if(assert('onerrorhandler','function')){onError=obj.onerrorhandler;}break;case'intermediatestate':if(assert('intermediatestate','string')){intermediateState=obj.intermediatestate;}break;case'selectorfunction':if(assert('selectorfunction','function')){selectorFunction=obj.selectorfunction;}break;case'removehyphensoncopy':if(assert('removehyphensoncopy','boolean')){removeHyphensOnCopy=obj.removehyphensoncopy;}break;case'usewebworker':if(assert('usewebworker','string')){switch(obj.usewebworker){case'yes':useWebWorker=true;break;case'auto':useWebWorker=(function(){if(Worker){return true;}else{return false;}}());break;case'no':default:useWebWorker=false;}}break;default:onError(new Error('Hyphenator.config: property '+key+' not known.'));}}}},run:function(){var process=function(){try{autoSetMainLanguage();gatherDocumentInfos();prepare(hyphenateDocument);if(displayToggleBox){toggleBox(true);}}catch(e){onError(e);}};if(!documentLoaded){runOnContentLoaded(window,process);}if(Hyphenator.isBookmarklet()||documentLoaded){process();}},addExceptions:function(lang,words){if(lang===''){lang='global';}if(exceptions.hasOwnProperty[lang]){exceptions[lang]+=", "+words;}else{exceptions[lang]=words;}},hyphenate:function(target,lang){var hyphenate,n,i;if(Hyphenator.languages.hasOwnProperty(lang)){if(!Hyphenator.languages[lang].prepared){prepareLanguagesObj(lang);}hyphenate=function(word){if(urlOrMailRE.test(word)){return hyphenateURL(word);}else{return hyphenateWord(lang,word);}};if(typeof target==='string'||target.constructor===String){return target.replace(Hyphenator.languages[lang].genRegExp,hyphenate);}else if(typeof target==='object'){i=0;while(!!(n=target.childNodes[i++])){if(n.nodeType===3&&n.data.length>=min){n.data=n.data.replace(Hyphenator.languages[lang].genRegExp,hyphenate);}else if(n.nodeType===1){Hyphenator.hyphenate(n,lang);}}}}else{onError(new Error('Language "'+lang+'" is not loaded.'));}},isBookmarklet:function(){return isBookmarklet;},toggleHyphenation:function(){switch(state){case 3:removeHyphenationFromDocument();toggleBox(false);break;case 4:hyphenateDocument();toggleBox(true);break;}}};}());if(Hyphenator.isBookmarklet()){Hyphenator.config({displaytogglebox:true,intermediatestate:'visible'});Hyphenator.run();}
