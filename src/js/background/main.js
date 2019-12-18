
(function (ctx) {
    chrome.browserAction.onClicked.addListener(function (tab) {
        chrome.runtime.openOptionsPage();
    });
})(RedmineDecorator);
