(function($) {

    window.parseIframeResponse = function() {
        var response = $('#fileIframe').contents().find('body').text();
        if (response == "") {
            return;
        } else {
            alert(response);
        }
    }

    function onGetLastMeasureButtonClick(event) {
        $('form').attr('action', '/last-measure').attr('target', 'fileIframe');
        return true;
    }

    function onGenerateReportButtonClick(event) {
        $('form').attr('action', '/report').attr('target', '');
        return true;
    }


    $(document).ready(function() {
        $('#id_last_measure_button').click(onGetLastMeasureButtonClick);
        $('#id_generate_report_button').click(onGenerateReportButtonClick);
    });

})(jQuery);
