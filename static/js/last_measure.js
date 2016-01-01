function parseIframeResponse() {
    var response = $('#fileIframe').contents().find('body').text();
    if (response == "") {
        return;
    }

    alert(response);
}
