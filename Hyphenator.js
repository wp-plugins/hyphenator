var Hyphenator=(function(){var DEBUG=false;var SUPPORTEDLANG={'de':true,'en':true,'fr':true,'nl':true};var LANGUAGEHINT='Deutsch: de\tEnglish: en\tFran%E7ais: fr\tNederlands: nl';var PROMPTERSTRINGS={'de':'Die Sprache dieser Webseite konnte nicht automatisch bestimmt werden. Bitte Sprache angeben: \n\n'+LANGUAGEHINT,'en':'The language of this website could not be determined automatically. Please indicate main language: \n\n'+LANGUAGEHINT,'fr':'La langue de cette site ne pouvait pas %EAtre d%E9termin%E9e automatiquement. Veuillez indiquer une langue: \n\n'+LANGUAGEHINT,'nl':'De taal van deze website kan niet automatisch worden bepaald. Geef de hoofdtaal op: \n\n'+LANGUAGEHINT};var BASEPATH=function(){var s=document.getElementsByTagName('script'),i=0,p,t;while(t=s[i++].src){p=t.indexOf('Hyphenator.js');if(p!=-1){return t.substring(0,p)}}return'http://hyphenator.googlecode.com/svn/trunk/'}();var DONTHYPHENATE={'script':true,'code':true,'pre':true,'img':true,'br':true,'samp':true,'kbd':true,'var':true,'abbr':true,'acronym':true,'sub':true,'sup':true,'button':true,'option':true,'label':true};var hyphenation={};var enableRemoteLoading=true;var displayToggleBox=false;var hyphenateclass='hyphenate';var hyphen=String.fromCharCode(173);var urlhyphen=_createZeroWidthSpace();var min=6;var bookmarklet=false;var patternsloaded={};var preparestate=0;var mainlanguage=null;var url='(\\w*:\/\/)((\\w*:)?(\\w*)@)?([\\w\.]*)?(:\\d*)?(\/[\\w#!:.?+=&%@!\-]*)*';var mail='[\\w-\\.]+@[\\w\\.]+';var urlRE=new RegExp(url,'i');var mailRE=new RegExp(mail,'i');var zerowidthspace='';function _createZeroWidthSpace(){var ua=navigator.userAgent.toLowerCase();if(ua.indexOf('msie 6')==-1&&ua.indexOf('msie 8')==-1){zerowidthspace=String.fromCharCode(8203)}else{zerowidthspace=''}return zerowidthspace};function _checkIfBookmarklet(){var loc=null;var jsArray=document.getElementsByTagName('script');for(var i=0,l=jsArray.length;i<l;i++){if(!!jsArray[i].getAttribute('src')){loc=jsArray[i].getAttribute('src')}if(!loc){continue}else if(loc.indexOf('Hyphenator.js?bm=true')!=-1){bookmarklet=true}}};function _log(msg){if(window.console){window.console.log(msg)}else if(window.opera){window.opera.postError(msg)}else{}};function _autoSetMainLanguage(){var el=document.getElementsByTagName('html')[0];mainlanguage=_getLang(el);if(!mainlanguage){var m=document.getElementsByTagName('meta');for(var i=0;i<m.length;i++){if(!!m[i].getAttribute('http-equiv')&&(m[i].getAttribute('http-equiv')=='content-language')){mainlanguage=m[i].getAttribute('content').substring(0,2)}if(!!m[i].getAttribute('name')&&(m[i].getAttribute('name')=='DC.Language')){mainlanguage=m[i].getAttribute('content').substring(0,2)}if(!!m[i].getAttribute('name')&&(m[i].getAttribute('name')=='language')){mainlanguage=m[i].getAttribute('content').substring(0,2)}}}if(!mainlanguage){var text='';var ul=(navigator.language)?navigator.language:navigator.userLanguage;ul=ul.substring(0,2);if(SUPPORTEDLANG[ul]){text=PROMPTERSTRINGS[ul]}else{text=PROMPTERSTRINGS.en}var lang=window.prompt(unescape(text),ul);if(SUPPORTEDLANG[lang]){mainlanguage=lang}}};function _hideInside(){if(document.getElementsByClassName){var elements=document.getElementsByClassName(hyphenateclass);for(var i=0,l=elements.length;i<l;i++){elements[i].style.visibility='hidden'}}else{var body=document.getElementsByTagName('body')[0];var elements=body.getElementsByTagName('*');for(var i=0,l=elements.length;i<l;i++){if(elements[i].className.indexOf(hyphenateclass)!=-1&&elements[i].className.indexOf('donthyphenate')==-1){elements[i].style.visibility='hidden'}}}};function _switchToggleBox(s){if(s){var bdy=document.getElementsByTagName('body')[0];var myBox=document.createElement('div');var myIdAttribute=document.createAttribute('id');myIdAttribute.nodeValue='HyphenatorToggleBox';var myTextNode=document.createTextNode('Hy-phe-na-ti-on');myBox.appendChild(myTextNode);myBox.setAttributeNode(myIdAttribute);myBox.onclick=Hyphenator.toggleHyphenation;myBox.style.position='absolute';myBox.style.top='0px';myBox.style.right='0px';myBox.style.margin='0';myBox.style.backgroundColor='#AAAAAA';myBox.style.color='#FFFFFF';myBox.style.font='6pt Arial';myBox.style.letterSpacing='0.2em';myBox.style.padding='3px';myBox.style.cursor='pointer';myBox.style.WebkitBorderBottomLeftRadius='4px';myBox.style.MozBorderRadiusBottomleft='4px';bdy.appendChild(myBox)}else{var myBox=document.getElementById('HyphenatorToggleBox');myBox.style.visibility='hidden'}};function _getLang(el,nofallback){if(!!el.getAttribute('lang')){return el.getAttribute('lang').substring(0,2)}try{if(!!el.getAttribute('xml:lang')){return el.getAttribute('xml:lang').substring(0,2)}}catch(ex){}if(!nofallback&&mainlanguage){return mainlanguage}return null};function _loadPatterns(lang){if(DEBUG)_log("load patterns "+lang);if(SUPPORTEDLANG[lang]&&!patternsloaded[lang]){var url=BASEPATH+'patterns/'+lang+'.js'}else{return}if(document.createElement){var head=document.getElementsByTagName('head').item(0);var script=document.createElement('script');script.src=url;script.type='text/javascript';head.appendChild(script)}if(DEBUG)_log('Loading '+url)};function _convertPatternsToObject(){for(var lang in Hyphenator.patterns){var sa=Hyphenator.patterns[lang].split(' ');Hyphenator.patterns[lang]={};var pat,key,i=0;var isdigit=false;while(pat=sa[i++]){key=pat.replace(/\d/g,'');Hyphenator.patterns[lang][key]=pat}}};function _runHyphenation(){var body=document.getElementsByTagName('body')[0];if(Hyphenator.isBookmarklet()){Hyphenator.hyphenateElement(body)}else{if(document.getElementsByClassName){var elements=document.getElementsByClassName(hyphenateclass);for(var i=0,l=elements.length;i<l;i++){Hyphenator.hyphenateElement(elements[i])}}else{var elements=body.getElementsByTagName('*');for(var i=0,l=elements.length;i<l;i++){if(elements[i].className.indexOf(hyphenateclass)!=-1){Hyphenator.hyphenateElement(elements[i])}}}}};function _removeHyphenation(){var body=document.getElementsByTagName('body')[0];if(Hyphenator.isBookmarklet()){Hyphenator.deleteHyphenationInElement(body)}else{if(document.getElementsByClassName){var elements=document.getElementsByClassName(hyphenateclass);for(var i=0,l=elements.length;i<l;i++){Hyphenator.deleteHyphenationInElement(elements[i])}}else{var elements=body.getElementsByTagName('*');for(var i=0,l=elements.length;i<l;i++){if(elements[i].className.indexOf(hyphenateclass)!=-1){Hyphenator.deleteHyphenationInElement(elements[i])}}}}};function _runOnContentLoaded(w,f){var d=w.document,D='DOMContentLoaded',u=w.navigator.userAgent.toLowerCase(),v=parseFloat(u.match(/.+(?:rv|it|ml|ra|ie)[\/: ]([\d.]+)/)[1]);function init(e){if(!document.loaded){document.loaded=true;f((e.type&&e.type==D)?e:{type:D,target:d,eventPhase:0,currentTarget:d,timeStamp:+new Date,eventType:e.type||e})}}if(/webkit\//.test(u)&&v<525.13){(function(){if(/complete|loaded/.test(d.readyState)){init('khtml-poll')}else{setTimeout(arguments.callee,10)}})()}else if(/msie/.test(u)&&!w.opera){d.attachEvent('onreadystatechange',function(e){if(d.readyState=='complete'){d.detachEvent('on'+e.type,arguments.callee);init(e)}});if(w==top){(function(){try{d.documentElement.doScroll('left')}catch(e){setTimeout(arguments.callee,10);return}init('msie-poll')})()}}else if(d.addEventListener&&(/opera\//.test(u)&&v>9)||(/gecko\//.test(u)&&v>=1.8)||(/khtml\//.test(u)&&v>=4.0)||(/webkit\//.test(u)&&v>=525.13)){d.addEventListener(D,function(e){d.removeEventListener(D,arguments.callee,false);init(e)},false)}else{var oldonload=w.onload;w.onload=function(e){init(e||w.event);if(typeof oldonload=='function'){oldonload(e||w.event)}}}};function _autoinit(){for(var lang in SUPPORTEDLANG){patternsloaded[lang]=false}_autoSetMainLanguage();_createZeroWidthSpace();_checkIfBookmarklet()};_autoinit();return{leftmin:{},rightmin:{},shortestPattern:{},longestPattern:{},specialChars:{},patterns:{},run:function(){_runOnContentLoaded(window,function(){_hideInside();Hyphenator.hyphenateDocument();if(displayToggleBox){_switchToggleBox(true)}})},addExceptions:function(words){var w=words.split(',');for(var i=0,l=w.length;i<l;i++){var key=w[i].replace(/-/g,'');if(!hyphenation[key]){hyphenation[key]=w[i]}}},setClassName:function(str){hyphenateclass=str||'hyphenate'},setMinWordLength:function(mymin){min=mymin||6},setHyphenChar:function(str){if(str=='&shy;'){str=String.fromCharCode(173)}hyphen=str||String.fromCharCode(173)},setDisplayToggleBox:function(bool){displayToggleBox=bool||true},setUrlHyphenChar:function(str){urlhyphen=str||_createZeroWidthSpace()},setRemoteLoading:function(bool){enableRemoteLoading=bool},isPatternLoaded:function(lang){return patternsloaded[lang]},updatePatternsLoadState:function(lang,bool){patternsloaded[lang]=bool},isBookmarklet:function(){return bookmarklet},prepare:function(){if(DEBUG)_log("preparing-state: 1 (loading)");preparestate=1;var doclanguages={};doclanguages[mainlanguage]=true;var elements=document.getElementsByTagName('body')[0].getElementsByTagName('*');var lang=null;for(var i=0,l=elements.length;i<l;i++){if(lang=_getLang(elements[i])){if(SUPPORTEDLANG[lang]){doclanguages[lang]=true}else{}}}if(DEBUG){for(var l in doclanguages){_log("language found: "+l)}}if(enableRemoteLoading){for(lang in doclanguages){_loadPatterns(lang)}}interval=window.setInterval(function(){finishedLoading=false;for(lang in doclanguages){if(!patternsloaded[lang]){finishedLoading=false;break}else{finishedLoading=true}}if(finishedLoading){window.clearInterval(interval);preparestate=2;if(DEBUG)_log("preparing-state: 2 (loaded)")}},100)},hyphenateDocument:function(){if(DEBUG)_log("hyphenateDocument");if(preparestate!=2){if(preparestate==0){Hyphenator.prepare()}var interval=window.setInterval(function(){if(preparestate==2){window.clearInterval(interval);_convertPatternsToObject();_runHyphenation()}},10)}else{_runHyphenation()}},hyphenateElement:function(el,lang){if(el.className.indexOf("donthyphenate")!=-1){return}if(DEBUG)_log("hyphenateElement: "+el.tagName+" id: "+el.id);if(!lang){if(DEBUG)_log("lang not set");var lang=_getLang(el);if(DEBUG)_log("set lang to "+lang)}else{if(DEBUG)_log("got lang from parent ("+lang+")");var elemlang=_getLang(el,true);if(elemlang!=null){var lang=elemlang;if(DEBUG)_log("but element has own lang ("+lang+")")}}if(DEBUG)_log("language: "+lang);var wrd='[\\w'+Hyphenator.specialChars[lang]+'@Â­-]{'+min+',}';var wrdRE=new RegExp(wrd,'i');function __hyphenate(word){if(urlRE.test(word)||mailRE.test(word)){return Hyphenator.hyphenateURL(word)}else{return Hyphenator.hyphenateWord(lang,word)}}var genRegExp=new RegExp('('+url+')|('+mail+')|('+wrd+')','gi');for(var i=0;(n=el.childNodes[i]);i++){if(n.nodeType==3&&n.data.length>=min){n.data=n.data.replace(genRegExp,__hyphenate);if(DEBUG)_log("hyphenation done for: "+el.tagName+" id: "+el.id)}else if(n.nodeType==1&&!DONTHYPHENATE[n.nodeName.toLowerCase()]){if(DEBUG)_log("traversing: "+n.nodeName.toLowerCase());Hyphenator.hyphenateElement(n,lang)}}if(el.className.indexOf(hyphenateclass)!=-1){el.style.visibility='visible'}},deleteHyphenationInElement:function(el){var h;switch(hyphen){case'|':h='\\|';break;case'+':h='\\+';break;case'*':h='\\*';break;default:h=hyphen;}for(var i=0;(n=el.childNodes[i]);i++){if(n.nodeType==3){n.data=n.data.replace(new RegExp(h,'g'),'')}else if(n.nodeType==1){Hyphenator.deleteHyphenationInElement(n)}}},hyphenateWord:function(lang,word){if(word==''){return''}if(word.indexOf('Â­')!=-1){return word}if(hyphenation[word]){return hyphenation[word].replace(/-/g,hyphen)}if(word.indexOf('-')!=-1){var parts=word.split('-');for(var i=0,l=parts.length;i<l;i++){parts[i]=Hyphenator.hyphenateWord(lang,parts[i])}return parts.join('-'+zerowidthspace)}var w='_'+word+'_';var wl=w.length;var s=w.split('');w=w.toLowerCase();var hypos=new Array();var p,maxwins,win,pat,patl,i,c,digits,z;var numb3rs={'0':true,'1':true,'2':true,'3':true,'4':true,'5':true,'6':true,'7':true,'8':true,'9':true};for(p=0;p<=(wl-Hyphenator.shortestPattern[lang]);p++){maxwins=Math.min((wl-p),Hyphenator.longestPattern[lang]);for(win=Hyphenator.shortestPattern[lang];win<=maxwins;win++){if(pat=Hyphenator.patterns[lang][w.substr(p,win)]){digits=1;patl=pat.length;for(i=0;i<patl;i++){c=pat.charAt(i);if(numb3rs[c]){if(i==0){z=p-1;if(!hypos[z]||hypos[z]<c){hypos[z]=c}}else{z=p+i-digits;if(!hypos[z]||hypos[z]<c){hypos[z]=c}}digits++}}}}}var inserted=0;for(i=Hyphenator.leftmin[lang];i<(hypos.length-Hyphenator.rightmin[lang]);i++){if(!!(hypos[i]&1)){s.splice(i+inserted+1,0,hyphen);inserted++}}return s.slice(1,-1).join('')},hyphenateURL:function(url){return url.replace(/([:\/\.\?#&_,;!@]+)/gi,'$&'+urlhyphen)},toggleHyphenation:function(){var currentText=document.getElementById('HyphenatorToggleBox').firstChild.nodeValue;if(currentText=='Hy-phe-na-ti-on'){_removeHyphenation();document.getElementById('HyphenatorToggleBox').firstChild.nodeValue='Hyphenation'}else{_runHyphenation();document.getElementById('HyphenatorToggleBox').firstChild.nodeValue='Hy-phe-na-ti-on'}}}})();if(Hyphenator.isBookmarklet()){Hyphenator.hyphenateDocument()}