// Saves options to chrome.storage
function saveOptions() {

  var changeColor = document.getElementById('changeColor').checked;
  var showProfilePic = document.getElementById('showProfilePic').checked;
  var showTimestamp = document.getElementById('showTimestamp').checked;
  var showCustomemote = document.getElementById('showCustomemote').checked;
  var keywords = document.getElementById('keywords').value;
  var btn = document.getElementById('save');


  chrome.storage.local.set({
    changeColor: changeColor,
    showProfilePic: showProfilePic,
    showTimestamp : showTimestamp,
    showCustomemote : showCustomemote,
    keywords : keywords
  }, function() {  
      btn.classList.toggle("is_active");
  });
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.local.get({
    changeColor: true,
    showProfilePic: false,
    showTimestamp : false,
    showCustomemote : true,
    keywords : ''
  }, function(items) {
    document.getElementById('changeColor').checked = items.changeColor;
    document.getElementById('showProfilePic').checked = items.showProfilePic;
    document.getElementById('showTimestamp').checked = items.showTimestamp;
    document.getElementById('showCustomemote').checked = items.showCustomemote;
    document.getElementById('keywords').value = items.keywords;

  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click',saveOptions);

