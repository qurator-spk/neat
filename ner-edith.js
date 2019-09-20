var data;

var file = null;

var displayRows=30
var startIndex=0;
var endIndex=displayRows;

function loadFile(evt) {

    let table_html =
        `
        <table id="table">
            <thead>
            <tr>
                <th><button class="btn btn-link" id="back"><<</button>OFFSET</th>
                <th>POSITION</th>
                <th>TOKEN</th>
                <th>NE-TAG</th>
                <th>NE-EMB<button class="btn btn-link" id="next">>></button></th>
            </tr>
            </thead>
            <tbody id="table-body"></tbody>
        </table>
        <br/>
        <br/>
        `;

    let save_html =
        `<button class="btn btn-primary saveButton">Save Changes</button>`

    $("#tableregion").html(table_html)

    $("#btn-region").html(save_html)

    $('.saveButton').on('click', saveFile)

    let editingTd;

    function finishTdEdit(td, isOk) {

        if (isOk) {
            let newValue = $('#edit-area').val();

            $(td).html(newValue);

            let tableInfo = $(td).data('tableInfo');

            data.data[tableInfo.nRow][tableInfo.column] = newValue;
        }
        else {
            $(td).html(editingTd.data);
        }

        editingTd = null;
    }

    function makeTdEditable(td) {

        editingTd = {
            elem: td,
            data: td.innerHTML
        };

        let textArea = document.createElement('textarea');
        textArea.style.width = td.clientWidth + 'px';
        textArea.style.height = td.clientHeight + 'px';
        textArea.id = 'edit-area';

        $(textArea).val($(td).html());
        $(td).html('');
        $(td).append(textArea);
        textArea.focus();

        let edit_html =
            `<div class="edit-controls">
                <button class="btn btn-secondary btn-sm" id="edit-ok">OK</button>
                <button class="btn btn-secondary btn-sm" id="edit-cancel">CANCEL</button>
             </div>`

        td.insertAdjacentHTML("beforeEnd", edit_html);

        $('#edit-ok').on('click',
            function(evt) {
                finishTdEdit(editingTd.elem, true);
            });

        $('#edit-cancel').on('click',
            function(evt) {
                finishTdEdit(editingTd.elem, false);
            });
    }

    $('#table').on('click',
        function(event) {

            let target = event.target.closest('.editable');

            if (editingTd) {

                if (target == editingTd.elem) return;

                finishTdEdit(editingTd.elem, true);
            }

            if (!$.contains($('#table')[0], target)) return

            makeTdEditable(target);
        });

    file = evt.target.files[0];

    // TODO: adapt to streaming with 'chunk' callback for large file support, see https://www.papaparse.com/docs
    Papa.parse(file, {
        header: true,
        delimiter: '\t',
        comments: "#",
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: function(results) {
            //console.log(results);
            data = results;

            updateTable();

            $("#file-region").html('<h3>' + file.name + '</h3>');

            $('#tableregion')[0].addEventListener("wheel",
                function(event) {

                    if (event.deltaY < 0) {

                        if (startIndex <= 0) return;

                        startIndex -= 1;
                        endIndex -= 1;
                    }
                    else {

                        if (endIndex >= data.data.length) return;

                        startIndex += 1;
                        endIndex += 1;
                    }

                    updateTable();
                });

            $('#back').on('click',
                function(evt) {

                    if (startIndex >= displayRows) {
                        startIndex -= displayRows;
                        endIndex -= displayRows;
                    }
                    else {
                        startIndex = 0;
                        endIndex = displayRows;
                    }

                    updateTable();
                }
            );

            $('#next').on('click',
                function(evt) {

                    if (endIndex + displayRows < data.data.length) {
                        endIndex += displayRows;
                        startIndex = endIndex - displayRows;
                    }
                    else {
                        endIndex = data.data.length;
                        startIndex = endIndex - displayRows;
                    }

                    updateTable();
                }
            );
        }
    });
}

function updateTable() {

    let editable_html =
        `
            <td class="editable">
        `;

    $('#table-body').empty();

    $.each(data.data,
                function(nRow, el) {

                    if (nRow < startIndex) return;
                    if (nRow >= endIndex) return;

                    var row = $("<tr/>");
                    row.append($("<td/>").text(nRow));

                    $.each(el,
                        function(column, content) {
                            row.append(
                                $(editable_html).
                                    text(content).
                                    data('tableInfo', { 'nRow': nRow, 'column': column })
                            );
                        });

                    $("#table tbody").append(row);
                });

    $("#table td:contains('B-PER')").addClass('ner_per');
    $("#table td:contains('I-PER')").addClass('ner_per');
    $("#table td:contains('B-LOC')").addClass('ner_loc');
    $("#table td:contains('I-LOC')").addClass('ner_loc');
    $("#table td:contains('B-ORG')").addClass('ner_org');
    $("#table td:contains('I-ORG')").addClass('ner_org');
    $("#table td:contains('B-OTH')").addClass('ner_oth');
    $("#table td:contains('I-OTH')").addClass('ner_oth');
}

function saveFile(evt) {

    let csv =
        Papa.unparse(data,
            {
                header: true,
                delimiter: '\t',
                comments: "#",
                skipEmptyLines: true,
                dynamicTyping: true
            });

    openSaveFileDialog (csv, file.name, null)
}


function openSaveFileDialog (data, filename, mimetype) {

    if (!data) return;

    var blob = data.constructor !== Blob
      ? new Blob([data], {type: mimetype || 'application/octet-stream'})
      : data ;

    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, filename);
      return;
    }

    var lnk = document.createElement('a'),
        url = window.URL,
        objectURL;

    if (mimetype) {
      lnk.type = mimetype;
    }

    lnk.download = filename || 'untitled';
    lnk.href = objectURL = url.createObjectURL(blob);
    lnk.dispatchEvent(new MouseEvent('click'));
    setTimeout(url.revokeObjectURL.bind(url, objectURL));

}

$(document).ready(
    function() {
        $('#tsv-file').change(loadFile);
    }
);