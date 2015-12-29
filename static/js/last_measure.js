(function($) {

    function onGetLastMeasureSuccess(data, textStatus, jqXHR) {
        alert(data.msg);
    }

    function onGetLastMeasureError(jqXHR, textStatus, errorThrown) {
        alert('Ошибка: ' + textStatus);
    }

    function onGetLastMeasureButtonClick(event) {
        var reportInput = $('#id_report_input'),
            reportFiles = reportInput.prop('files');

        if (!reportFiles || reportFiles.length == 0) {
            alert("Ой, а файл с отчетом не выбран");
            return;
        }

        var data = new FormData();
        data.append('report', reportFiles[0]);

        $.ajax({
            url: '/last-measure',
            type: 'POST',
            data: data,
            cached: false,
            dataType: 'json',
            processData: false,
            contentType: false,
            success: onGetLastMeasureSuccess,
            error: onGetLastMeasureError
        });

    }

    $(document).ready(function() {
        $('#id_last_measure_button').click(onGetLastMeasureButtonClick);
    });

})(jQuery);
