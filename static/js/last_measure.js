(function($) {

    function onGetLastMeasureSuccess(data, textStatus, jqXHR) {
        alert(data.msg);
    }

    function onGetLastMeasureError(jqXHR, textStatus, errorThrown) {
        alert('Ошибка: ' + textStatus);
    }

    function onGetLastMeasureButtonClick(event) {
        var files = document.getElementById('id_report_input').files;

        if (!files || files.length == 0) {
            alert("Ой, а файл с отчетом не выбран");
            return;
        }

        $('#report-form').ajaxSubmit({
            url: '/last-measure',
            dataType: 'json',
            type: 'POST',
            error: onGetLastMeasureError,
            success: onGetLastMeasureSuccess
        });
    }

    $(document).ready(function() {
        $('#id_last_measure_button').click(onGetLastMeasureButtonClick);
    });

})(jQuery);
