var hostCommunicator = {
    postMessageAvailable: (window.postMessage ? true : false),
    init: function () {
        var externalHostCommunicator = this;
        this.setHeight();
        this.startWatching();
        if (this.postMessageAvailable) {
            this.setupPostMessage();
        }
    },
    height: 0,
    setupPostMessage: function () {
        window.setInterval(hostCommunicator.sendDataByPostMessage, 32);
    },
    sendDataByPostMessage: function (istatsData) {
        var talker_uid = window.location.pathname,
            message = {
                height:           this.height,
                hostPageCallback: hostCommunicator.hostPageCallback
            };
        window.parent.postMessage(talker_uid + '::' + JSON.stringify(message), '*');
    },
    startWatching: function () {
        window.setInterval(hostCommunicator.setHeight, 32);
    },
    staticHeight: null,
    setStaticHeight: function (newStaticHeight) {
        this.staticHeight = newStaticHeight;
    },
    setHeight: function () {
        var heightValues = [this.staticHeight || 0];
        if ($('.main').length > 0) {
            heightValues.push($('.main')[0].scrollHeight);
        }
        this.height = Math.max.apply(Math, heightValues);
    },
    hostPageCallback: false,
    setHostPageInitialization: function (callback) {
        hostCommunicator.hostPageCallback = callback.toString();
    },
    sendMessageToremoveLoadingImage: function () {
        var message,
            funcToExecute,
            iframeUID = this.getValueFromQueryString('iframeUID');

        funcToExecute = ''; // Use this to pass a value to the host page.

        message = {
            'hostPageCallback' : funcToExecute
        };

        if (this.postMessageAvailable) {
            window.parent.postMessage(window.location.pathname + '::' + JSON.stringify(message), '*');
        }
    },
    getValueFromQueryString: function (name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
            results = regex.exec(location.search);
        return results == null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }
};
