

let twitchGlobalEmotes = {};
let bttvEmotes = {};
let customEmotes = {};
let settingsDiv = {};

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
	}
}


let YTHelper = {
  initTarget(documentElement, target) {
			if (target !== null) {
				this.document = documentElement;

				const observer = new MutationObserver((mutations) => {
					for (let mutation of mutations) {
						for (let node of mutation.addedNodes) {
							this.handleMessage(node);
						}
					}
				});

				for (let element of this.document.querySelectorAll('yt-live-chat-text-message-renderer')) {
					this.handleMessage(element);
				}

				const config = { attributes: true, childList: true, characterData: true };
				observer.observe(target, config);
			}
		},


		//Credit : BetterStreamChat thank you ;_;
	init() {
		const chatQuerySelector = '#items.yt-live-chat-item-list-renderer';
		let target = document.querySelector(chatQuerySelector);
		// normal stream chat
		if (target === null) {
			let interval = setInterval(() => {
				let chatFrame = document.querySelector('#chatframe');
				if (chatFrame) {
					let documentElement = chatFrame.contentDocument;
					target = documentElement.querySelector(chatQuerySelector);

					if (target !== null) {
						clearInterval(interval);
						YTHelper.initTarget(documentElement, target);
					}
				}
			}, 250);
		}
		// popout stream chat
		else {
			YTHelper.initTarget(document, target);
		}
	},

	 replaceText(text) {
			let split = text.split(' ');
			let newText = [];
			for (let word of split) {
				let sword = word.toLowerCase();
				if (bttvEmotes[sword]) {
					word = '<img style="vertical-align: middle" src="https://cdn.betterttv.net/emote/' + bttvEmotes[sword] + '/1x" alt="' + word + '" title="' + word + '" />';
				}
				else if (twitchGlobalEmotes[sword]) {
					word = '<img style="vertical-align: middle" src="https://static-cdn.jtvnw.net/emoticons/v1/' + twitchGlobalEmotes[sword] + '/1.0" alt="' + word + '" title="' + word + '" />';
				} else if(customEmotes[sword]){
						let customEmote = customEmotes[sword];
						word = '<img style="vertical-align: middle" src="https://cdn.jsdelivr.net/gh/bhavita/YTStreamChat/assets/emotes/' + customEmote.cat + "/" +  customEmote.id + "." + customEmote.ext  + '" alt="' + word + '" title="' + word + '" />';

				}

				newText.push(word);
			}

			return newText.join(' ');
		},


	handleMessage(node) {
		let message = node.querySelector('#message');
		if (message) {
			message.innerHTML = YTHelper.replaceText(message.innerText);
		}
	}
};

let SYNC_THRESHOLD = 604800000;

const Custom = {
	lastUpdate : 0,
	fetchEmotes(items){
		return new Promise((resolve) => {
		customEmotes = items.customEmotes || {};
		if(typeof customEmotes === 'undefined' || customEmotes.length == 0 || Date.now()  - Custom.lastUpdate > SYNC_THRESHOLD){
			NTHelper.fetch('https://raw.githubusercontent.com/bhavita/YTStreamChat/main/assets/dictionary.json').then((data) => {
				Custom.lastUpdate = 0;
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

				chrome.storage.local.set({ globalTwitchEmotes: twitchGlobalEmotes }, () => resolve()); 
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
		isBusy: false,
		updateSettings() {
		//ToDo : Add some additional info here 
		console.log("Updated emoticons");
		},
		loaded() {
			chrome.storage.onChanged.addListener(async function (changes, namespace) {
			  YTHelper.update();
			
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
		update() {
			return new Promise((resolve) => {
				chrome.storage.local.get((items) => {
					Twitch.fetchGlobalEmotes(items).finally(() => {
						this.fetchGlobalEmotes(items).finally(() => {
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

	await BTTV.update();

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


