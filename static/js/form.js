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

    function getLastMeasureOnFrontend() {
        var reader = new FileReader();

        reader.onload = function() {
            var lines = reader.result.split('\n'),
                lastLine = lines[lines.length-2],
                elements = lastLine.split('\t'),
                value = elements[3] || elements[4],
                date = elements[1].split(' ')[1];

            alert(value + '\n' + date);
        }

        reader.onerror = function() {
            alert('Ошибка чтения файла');
        }

        var inputEl = document.getElementById('id_report_input');
        reader.readAsText(inputEl.files[0]);
    }

    function getLastMeasureOnBackend() {
        var form = document.getElementsByTagName('form')[0];
        form.setAttribute('action', '/last-measure');
        form.setAttribute('target', 'fileIframe');
    }


    // handlers

    function onGetLastMeasureButtonClick(event) {
        if (window.FileReader) {
            getLastMeasureOnFrontend();
            return false;
        } else {
            getLastMeasureOnBackend();
            return true;
        }
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
