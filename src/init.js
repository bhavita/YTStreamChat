let twitchGlobalEmotes = {};
let bttvEmotes = {};
let customEmotes = {};
let settings = {};
let defaultSettings = {
	changeColor : true,
	showProfilePic : false,
	showTimestamp : false,
	showCustomemote : true
};

let UIHelper = {
updateSettingOptions (items){
		settings.changeColor = (items && items.changeColor!= undefined) ? 
													items.changeColor : defaultSettings.changeColor;
		settings.showProfilePic = (items && items.showProfilePic != undefined) ? 
											items.showProfilePic : defaultSettings.showProfilePic;
		settings.showTimestamp = (items && items.showTimestamp != undefined) ? 
											items.showTimestamp : defaultSettings.showTimestamp;
		settings.showCustomemote = (items && items.showCustomemote != undefined) ? 
											items.showCustomemote : defaultSettings.showCustomemote;

},


}

let NTHelper = {
	fetch(...args) {
		return new Promise((resolve, reject) => {
			fetch(...args).then((response) => {
				response.json().then((json) => {
					if (response.status === 200) {
						resolve(json);
					}
					else {
						reject(json);
					}
				});
			});
		});
	},

	querySelectorAsync (selector, doc = document, interval = 100,timeout = 10000) {
  			return new Promise((resolve) => {
    		const expireTime = Date.now() + timeout
    		const timer = setInterval(() => {
      		const e = doc.querySelector(selector)
      			if (e || Date.now() > expireTime) {
        			clearInterval(timer)
        			resolve(e)
      } else {
      	     console.log('querySelectorAsync awaiting '+selector);

      }
    }, interval)
  })
}
}

let chatType = 'Top chat';

let YTHelper = {
		defaultColors : ['#FF0000', '#00FF00', '#B22222', '#FF7F50', '#9ACD32', '#FF4500', '#2E8B57', '#DAA520', '#D2691E', '#5F9EA0', '#1E90FF', '#FF69B4', '#8A2BE2', '#00FF7F'],
		hashCod(str) {
			let hash = 0;
				if(str) {
					str = str.toLowerCase().trim();
					for (let i = 0; i < str.length; i++) {
						hash = str.charCodeAt(i) + ((hash << 5) - hash);
					}
				}

			return hash;
		},
		getUserChatColor(str) {
			return this.defaultColors[Math.abs(this.hashCod(str) % this.defaultColors.length)];
	},
  	initTarget(documentElement, target) {
  			console.log('initializing target for yth-listener')
			if (target !== null) {
				this.document = documentElement;

				const observer = new MutationObserver((mutations) => {
					for (let mutation of mutations) {
						for (let node of mutation.addedNodes) {
							this.handleMessage(node);
						}
					}
				});

				for (let element of this.document.querySelectorAll('yt-live-chat-text-message-renderer', documentElement)) {
					this.handleMessage(element);
				}

				const config = { attributes: true, childList: true, characterData: true };
				observer.observe(target, config);
			}
		},

	initHeader : async (documentElement) => {
		console.log('initializing header for yth-listener')
		let header = await NTHelper.querySelectorAsync('#view-selector.yt-live-chat-header-renderer', documentElement, 200, 40000);
		if(header == null){
			console.error('sorry boo, somehow found header empty');
			return;
		} else {
			if (header.getAttribute('yth-listener') !== 'true') {

				header.addEventListener('click', function(){
					console.log('header change');
					//a very hacky way of solving since there are multiple trigger on change 
					var chatTypeOpt = header.querySelector('#label-text.yt-dropdown-menu');
					if(chatTypeOpt){
						var currentChatTypr = chatTypeOpt.innerText;
						if(currentChatTypr!==chatType) {
							chatType = currentChatTypr;
							console.log('header change - reinit again');
							YTHelper.init();
					}
				}
			});

			header.setAttribute('yth-listener', 'true');
		}
	}
},


		//Credit : BetterStreamChat thank you ;_;
	 init : async () => {
		const chatQuerySelector = '#items.yt-live-chat-item-list-renderer';
		let target = await NTHelper.querySelectorAsync(chatQuerySelector);
		// normal stream chat
		if (target === null) {
		
				let chatFrame = await NTHelper.querySelectorAsync('#chatframe', this.document, 200, 40000);
				if (chatFrame) {
					let documentElement = chatFrame.contentDocument;
					YTHelper.initHeader(documentElement);
					target = await NTHelper.querySelectorAsync(chatQuerySelector, documentElement);
					if (target !== null) {
						YTHelper.initTarget(documentElement, target);
					}
				} else {
					console.log('chatFrame not found')
				}
			}
		// popout stream chat
		else {
			YTHelper.initHeader(document);
			YTHelper.initTarget(document, target);
		}
	},

	 replaceText(text) {
			let split = text.split(' ');
			let newText = [];
			for (let word of split) {
				let sword = word.toLowerCase();
				if (bttvEmotes[sword]) {
					word = '<img class="emote-chat emoji yt-formatted-string style-scope yt-live-chat-text-message-renderer" style="vertical-align: middle;	width: 32px; height: 32px;margin: -1px 2px 1px;" src="https://cdn.betterttv.net/emote/' + bttvEmotes[sword] + '/1x" alt="' + word + '" title="' + word + '" />';
				}
				else if (twitchGlobalEmotes[sword]) {
					word = '<img class="emote-chat emoji yt-formatted-string style-scope yt-live-chat-text-message-renderer" style="vertical-align: middle;	width: 32px; height: 32px;margin: -1px 2px 1px;" src="https://static-cdn.jtvnw.net/emoticons/v1/' + twitchGlobalEmotes[sword] + '/1.0" alt="' + word + '" title="' + word + '" />';
				} else if(customEmotes[sword]){
						let customEmote = customEmotes[sword];
						word = '<img class="emote-chat emoji yt-formatted-string style-scope yt-live-chat-text-message-renderer" style="vertical-align: middle;	width: 32px; height: 32px;margin: -1px 2px 1px;" src="https://cdn.jsdelivr.net/gh/bhavita/YTStreamChat/assets/emotes/' + customEmote.cat + "/" +  customEmote.id + "." + customEmote.ext  + '" alt="' + word + '" title="' + word + '" />';
				}

				newText.push(word);
			}

			return newText.join(' ');
		},


	handleMessage(node) {
		if(!settings.showProfilePic){

			let authorPhoto = node.querySelector('#author-photo');
			if(authorPhoto){
				authorPhoto.style.display = 'none';
			}

		}

		if(!settings.showTimestamp) {
			let ts = node.querySelector('#timestamp');
			if(ts) {
				ts.style.display = 'none';
			}
		}


		if(settings.changeColor){
			let author = node.querySelector('#author-name');
			if (author) {
				author.style.color = YTHelper.getUserChatColor(author.innerText);
			}
		}

		if(settings.showCustomemote){
		let message = node.querySelector('#message');
		if (message && message.innerText && message.innerText.length > 0) {
			let prevMsg = message.innerText;
			let rmsg = YTHelper.replaceText(prevMsg);
			if(rmsg && rmsg.length > 0 && rmsg !== prevMsg){
				var span = document.createElement("span");
				span.classList.add('style-scope');
				span.classList.add('yt-live-chat-text-message-renderer');
				span.innerHTML = rmsg;
				message.style.display = 'none';
				message.parentNode.append(span);
			} 
		}
	}

}
};

let SYNC_THRESHOLD = 7200000; //1000*60*60*2

const Custom = {
	lastUpdate : 0,
	fetchEmotes(items){
		return new Promise((resolve) => {
		customEmotes = items.customEmotes || {};
		if(typeof customEmotes === 'undefined' || customEmotes.length == 0 || Date.now()  - Custom.lastUpdate > SYNC_THRESHOLD){
			NTHelper.fetch('https://raw.githubusercontent.com/bhavita/YTStreamChat/main/assets/dictionary.json').then((data) => {
				Custom.lastUpdate = Date.now();
				if(data && data.emotes){
					for(let emote of data.emotes){
						let w = {
							"id" :  emote.id,
							"ext" : emote.ext,
							"cat" : emote.cat
						}

						customEmotes[emote.code.toLowerCase()] = w;
					}
				}	

				chrome.storage.local.set({ customEmotes: customEmotes}, () => resolve()); 
			}).catch(resolve);
		} else{
			resolve();
		}
		});
	}
}
 
 const Twitch = {
 		lastUpdate : 0,
		fetchGlobalEmotes(items) {
			return new Promise((resolve) => {
				twitchGlobalEmotes = items.globalTwitchEmotes || {};
				if (typeof items.globalTwitchEmotes === 'undefined' || items.globalTwitchEmotes === null || Date.now() - Twitch.lastUpdate > 604800000) {
					NTHelper.fetch('https://api.twitchemotes.com/api/v4/channels/0').then((data) => {
						Twitch.lastUpdate = Date.now();
						for (let emote of data.emotes) {
							if (emote.code.match(/^[a-zA-Z0-9]+$/)) {
								twitchGlobalEmotes[emote.code.toLowerCase()] = emote.id;
							}
						}
						chrome.storage.local.set({ globalTwitchEmotes: twitchGlobalEmotes }, () => resolve());
					}).catch(resolve);
				}
				else {
					resolve();
				}
			});
		}
	};

const BTTV = {
		lastUpdate : 0,
		lastUpdateTopEmotes : 0,
		isBusy: false,
		updateSettings() {
		//ToDo : Add some additional info here 
		console.log("Updated emoticons");
		},
		loaded() {
			chrome.storage.onChanged.addListener(async function (changes, namespace) {
				YTHelper.getStorageItems.then(items => YTHelper.update(items)).catch(console.error('failed to update from storage'))
			
		});
	},
		fetchTopEmotes(items) {
			return new Promise((resolve) => {
				var noBttv = typeof bttvEmotes === 'undefined' || bttvEmotes.length == 0;
				if(noBttv){
					bttvEmotes = items.bttvEmotes || {};
				}

				if (noBttv || Date.now() - BTTV.lastUpdateTopEmotes > SYNC_THRESHOLD) {
					return NTHelper.fetch('https://api.betterttv.net/3/emotes/shared/top?offset=0&limit=100').
						then((data) => {
						for (let d of data) {
							let emote = d.emote;
							bttvEmotes[emote.code.toLowerCase()] = emote.id;
						}
					}).finally(() => {
						BTTV.lastUpdateTopEmotes = Date.now();
						chrome.storage.local.set({bttvEmotes :  bttvEmotes }, () => resolve());
					});
				}
				else {
					resolve();
				}
			});
		},

	fetchGlobalEmotes(items) {
			return new Promise((resolve) => {
				bttvEmotes = items.bttvEmotes || {};
				if (typeof bttvEmotes === 'undefined' || bttvEmotes.length == 0 || Date.now() - BTTV.lastUpdate > 604800000) {
					return NTHelper.fetch('https://api.betterttv.net/3/cached/emotes/global').
						then((data) => {
						for (let emote of data) {
							bttvEmotes[emote.code.toLowerCase()] = emote.id;
						}
					}).finally(() => {
						BTTV.lastUpdate = Date.now();
						chrome.storage.local.set({bttvEmotes :  bttvEmotes }, () => resolve());
					});
				}
				else {
					resolve();
				}
			});
		},

		getStorageItems() {
				 return new Promise(function(resolve, reject) {
    					chrome.storage.local.get((items) => {
    				 if (chrome.runtime.lastError) {
        				console.error(chrome.runtime.lastError.message);
        				reject(chrome.runtime.lastError.message);
      						} else {
        					resolve(items);
     					 	}
    					})
    				});
		},
		update(items) {
			return new Promise((resolve) => {
					Twitch.fetchGlobalEmotes(items).finally(() => {
						this.fetchGlobalEmotes(items).finally(() => {
								this.fetchTopEmotes(items).finally(() => {
									Custom.fetchEmotes(items).finally(() => {
										this.updateSettings();
										resolve();
							});
						});

					});
				});
			});
		},

	};
	

// initialization
let initialize = async () => {

	let items = await BTTV.getStorageItems()

	UIHelper.updateSettingOptions(items);	

	await BTTV.update(items);

	if (location.hostname.toLowerCase().includes('youtube.com')) {
		YTHelper.init();
	} else {
		console.log('Only supported on youtube currently')
	}	
};


if (document.readyState == 'loading') {
	document.addEventListener('DOMContentLoaded', initialize);
}
else {
	initialize();
}



