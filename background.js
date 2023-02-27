let url = ""

async function checkUrl() {
    const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    url = tabs[0].url.toLowerCase();

    const haaretzUrl = "https://www.haaretz.co.il/";
    const theMarkerUrl = "https://www.themarker.com/";
    const theSecret = "tmr";

    // not Haaretz group's site
    if (!url.startsWith(haaretzUrl) && !url.startsWith(theMarkerUrl)) {
        chrome.action.disable();
        chrome.action.setTitle({title: 'Free Haaretz - Unavailable'});
        return false;
    }

    // already opened
    if (
        url.startsWith(`${haaretzUrl}${theSecret}`) ||
        url.startsWith(`${theMarkerUrl}${theSecret}`)
    ) {
        chrome.action.disable();
        chrome.action.setTitle({title: 'You are Free!'});
        return false;
    }

    // behind the paywall
    chrome.action.enable()
    chrome.action.setTitle({title: 'Click here To be a free people in our Haaretz!'});
    return true;
}

async function unlock() {
    const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    url = tabs[0].url.toLowerCase();

    if (!checkUrl()) { return; }

    const regexp = RegExp("[\\d\\w]+-[\\d\\w]+-[\\d\\w]+-[\\d\\w]+-[\\d\\w]+");
    const result = regexp.exec(url);
    if (!result) {
        console.log('Black!');
        return;
    }

    const prefix = url.slice(0, url.indexOf("/", 15));
    const suffix = url.slice(result.index);
    const newUrl = `${prefix}/tmr/${suffix}`;
    // console.log({ prefix, suffix, newUrl });
    chrome.tabs.update({ url: newUrl });
}

chrome.tabs.onActivated.addListener(checkUrl);
chrome.action.onClicked.addListener(unlock);

