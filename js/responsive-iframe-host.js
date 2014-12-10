var IframeWatcher = function (linkId) {
    this.createIframe(linkId);
    this.updateSizeWhenWindowResizes();
};

IframeWatcher.prototype = {
    updateSizeWhenWindowResizes: function () {
        var iframeWatcher = this;

        this.onEvent(window, 'resize', function () {
            iframeWatcher.setDimensions();
        });
    },
    onEvent: function (domElement, eventName, callback, useCapture) {
        if (useCapture === undefined) {
            useCapture = false;
        }

        if (domElement.addEventListener) {
            domElement.addEventListener(eventName, callback, useCapture);
        } else {
            domElement.attachEvent('on' + eventName, callback);
        }
    },
    data: {},
    updateFrequency: 32,
    createIframe: function (linkId) {

        var link          = document.getElementById(linkId),
            href          = link.href,
            token         = link.parentNode.className,
            iframeWatcher = this,
            hostId        = this.getWindowLocationOrigin(),
            urlParams     = window.location.hash || '',
            hostUrl       = window.location.href.replace(urlParams, '');
        
        this.staticHeight = link.getAttribute('data-static-iframe-height');

        this.elm = document.createElement('iframe');
        this.elm.className = 'responsive-iframe';
        this.elm.style.width = '100%';
        this.elm.scrolling = 'no';
        this.elm.allowfullscreen = true;
        this.elm.frameBorder = '0';

        this.decideHowToTalkToIframe(href);

        this.elm.src = href + '?hostid=' + hostId.split('//')[1] + '&hostUrl=' + hostUrl + '&iframeUID=' + linkId + urlParams;

        link.parentNode.appendChild(this.elm);
        link.parentNode.removeChild(link);

        this.lastRecordedHeight = this.elm.height;
        this.iframeInstructionsRan = false;

        this.handleIframeLoad(function startIframing() {
            iframeWatcher.getAnyInstructionsFromIframe();
            iframeWatcher.setDimensions();
        });
    },
    handleIframeLoad: function (startIframing) {
        // IMPORTANT: Had to make this an onload because the 
        // polyfilling and jquery on one page causes issues
        this.onEvent(window, 'load', function () {
            startIframing();
        }, true);

        if (this.elm.onload) {
            this.elm.onload = startIframing;
        }
        // Bug in IE7 means onload doesn't fire when an iframe 
        // loads, but the event will fire if you attach it correctly
        else if ('attachEvent' in this.elm) {
            this.elm.attachEvent('onload', startIframing);
        }
    },
    decideHowToTalkToIframe: function (href) {
        if (window.postMessage) { // if window.postMessage is supported, then support for JSON is assumed
            var uidForPostMessage = this.getPath(href);
            this.uidForPostMessage = this.getPath(href);
            this.setupPostMessage(uidForPostMessage);
        }
        else {
            this.data.height = this.staticHeight;
            this.elm.scrolling = 'yes';
        }
    },
    setupPostMessage: function (uid) {
        var iframeWatcher = this;
        this.onEvent(window, 'message', function (e) {
            iframeWatcher.postMessageCallback(e.data);
        });
    },
    postMessageCallback: function (data) {
        if (this.postBackMessageForThisIframe(data)) {
            this.processCommunicationFromIframe(
                this.getObjectNotationFromDataString(data)
            );
        }
    },
    postBackMessageForThisIframe: function (data) {
        return data && (data.split('::')[0] === this.uidForPostMessage);
    },
    getObjectNotationFromDataString: function (data) {
        return JSON.parse(data.split('::')[1]);
    },
    processCommunicationFromIframe: function (data) {
        this.data = data;
        this.setDimensions();
        this.getAnyInstructionsFromIframe();
    },
    getIframeContentHeight: function () {
        if (this.data.height) {
            this.lastRecordedHeight = this.data.height;
        }
        return this.lastRecordedHeight;
    },
    setDimensions: function () {
        this.elm.width  = this.elm.parentNode.clientWidth;
        this.elm.height = this.getIframeContentHeight();
    },
    getAnyInstructionsFromIframe: function () {
        if (
            this.data.hostPageCallback &&
            (!this.iframeInstructionsRan)
        ) {
            /* jshint evil:true */
            (new Function(this.data.hostPageCallback)());
            this.iframeInstructionsRan = true;
        }
    },
    getPath: function (url) {
        var urlMinusProtocol = url.replace('http://', '');
        return urlMinusProtocol.substring(urlMinusProtocol.indexOf('/')).split('?')[0];
    },
    getWindowLocationOrigin: function () {
        if (window.location.origin) {
            return window.location.origin;
        }
        else {
            return window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
        }
    },
};

function cutsTheMustard() {
    
    var modernDevice =
            document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1') &&
            'querySelector' in document &&
            'localStorage' in window &&
            'addEventListener' in window,
        atLeastIE8   = !!(document.documentMode && (document.documentMode >= 8));

    return modernDevice || atLeastIE8;
}