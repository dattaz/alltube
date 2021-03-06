/*global chrome*/
/*jslint devel: true, browser: true */
var launchBtn, disabledBtn, stopBtn;
var session, currentMedia;

function receiverListener(e) {
    'use strict';
    console.log('receiverListener', e);
}

function onMediaDiscovered(how, media) {
    'use strict';
    console.log('onMediaDiscovered', how);
    currentMedia = media;
    if (launchBtn) {
        stopBtn.classList.remove('cast_hidden');
        launchBtn.classList.add('cast_hidden');
    }
}

function sessionListener(e) {
    'use strict';
    session = e;
    session.addMediaListener(onMediaDiscovered.bind(this, 'addMediaListener'));
    if (session.media.length !== 0) {
        onMediaDiscovered('onRequestSessionSuccess', session.media[0]);
    }
}

function onStopCast() {
    'use strict';
    stopBtn.classList.add('cast_hidden');
    launchBtn.classList.remove('cast_hidden');
}

function stopCast() {
    'use strict';
    session.stop(onStopCast);
}

function onMediaError() {
    'use strict';
    console.log('onMediaError');
    stopCast();
}

function onRequestSessionSuccess(e) {
    'use strict';
    session = e;
    var videoLink = document.getElementById('video_link'), videoURL = videoLink.dataset.video, mediaInfo = new chrome.cast.media.MediaInfo(videoURL, 'video/' + videoLink.dataset.ext), request = new chrome.cast.media.LoadRequest(mediaInfo);
    session.loadMedia(request, onMediaDiscovered.bind(this, 'loadMedia'), onMediaError);
}

function onLaunchError(e) {
    'use strict';
    console.log('onLaunchError', e.description);
}

function launchCast() {
    'use strict';
    chrome.cast.requestSession(onRequestSessionSuccess, onLaunchError);
}

function onInitSuccess() {
    'use strict';
    launchBtn = document.getElementById('cast_btn_launch');
    disabledBtn = document.getElementById('cast_disabled');
    stopBtn = document.getElementById('cast_btn_stop');
    if (launchBtn) {
        disabledBtn.classList.add('cast_hidden');
        launchBtn.classList.remove('cast_hidden');
        launchBtn.addEventListener('click', launchCast, false);
        stopBtn.addEventListener('click', stopCast, false);
    }
}

function onError() {
    'use strict';
    console.log('onError');
}

function initializeCastApi() {
    'use strict';
    var sessionRequest = new chrome.cast.SessionRequest(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID), apiConfig = new chrome.cast.ApiConfig(sessionRequest, sessionListener, receiverListener, chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED);
    chrome.cast.initialize(apiConfig, onInitSuccess, onError);
}

function loadCastApi(loaded, errorInfo) {
    'use strict';
    if (loaded) {
        initializeCastApi();
    } else {
        console.log(errorInfo);
    }
}

window['__onGCastApiAvailable'] = loadCastApi;
