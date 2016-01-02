(function() {

    window.parseIframeResponse = function() {
        var iframe = document.getElementById('fileIframe');
        if (iframe.contentDocument) {
            iframeBody = iframe.contentDocument.getElementsByTagName('body')[0];
        } else if (iframe.contentWindow) {
            iframeBody = iframe.contentWindow.document.getElementsByTagName('body')[0];
        }

        if (iframeBody.innerHTML == "") {
            return;
        } else {
            var response = iframeBody.innerHTML.split(" ");
            alert(response[0] + "\n" + response[1]);
        }
    }

    function onGetLastMeasureButtonClick(event) {
        var form = document.getElementsByTagName('form')[0];
        form.setAttribute('action', '/last-measure');
        form.setAttribute('target', 'fileIframe');

        return true;
    }

    function onGenerateReportButtonClick(event) {
        var form = document.getElementsByTagName('form')[0];
        form.setAttribute('action', '/report');
        form.setAttribute('target', '');

        return true;
    }


    window.onload = function() {
        document.getElementById('id_last_measure_button').onclick = onGetLastMeasureButtonClick;
        document.getElementById('id_generate_report_button').onclick = onGenerateReportButtonClick;
    }

})();
