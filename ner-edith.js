
function loadFile(evt, onComplete) {

    var file = evt.target.files[0];

    Papa.parse(file, {
        header: true,
        delimiter: '\t',
        quoteChar: String.fromCharCode(0),
	    escapeChar: String.fromCharCode(0),
        comments: "#",
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: function(results) { onComplete(results, file) }
    });
}


var displayRows=30
var startIndex=0;
var endIndex=displayRows;
var urls = null;

function setupInterface(data, file) {

    function updatePreview(nRow) {

        if (urls == null) return;

        let img_url = urls.data[data.data[nRow]['url_id']]['url']

        console.log(img_url);

        $("#preview").attr("src", img_url);
        $("#preview-link").attr("href", img_url);
    }

    function gotoLocation(evt) {

        if (urls != null) {

            let nRow = parseInt($(evt.target).text());

            updatePreview(nRow)
        }
        else {
            let url_mapping_html =
                `
                <br/>
                <br/>
                <br/>
                <input type="file" id="url-mapping-tsv-file" style="visibility: hidden; width: 1px; height: 1px"/>
                Please
                <a href="" onclick="$('#url-mapping-tsv-file').click(); return false">upload a url mapping file</a>
                 or<button class="btn btn-link" id="goback">go back to edit mode.</button>
                `;

            $("#tableregion").html(url_mapping_html);
            $("#btn-region").empty();
            $("#region-right").empty();

            $('#goback').on('click',
                function(evt) {
                    setupInterface(data, file);
                 }
            );

            $('#url-mapping-tsv-file').change(
                function(evt) {
                    loadFile(evt,
                        function(results, url_mapping_file) {
                            urls = results;

                            setupInterface(data, file);
                        });
                }
            );
        }
    }

    function colorCode() {
        $("#table td:contains('B-PER')").addClass('ner_per');
        $("#table td:contains('I-PER')").addClass('ner_per');
        $("#table td:contains('B-LOC')").addClass('ner_loc');
        $("#table td:contains('I-LOC')").addClass('ner_loc');
        $("#table td:contains('B-ORG')").addClass('ner_org');
        $("#table td:contains('I-ORG')").addClass('ner_org');
        $("#table td:contains('B-PUB')").addClass('ner_pub');
        $("#table td:contains('I-PUB')").addClass('ner_pub');
        $("#table td:contains('B-TODO')").addClass('ner_todo');
        $("#table td:contains('I-TODO')").addClass('ner_todo');
    }

    let editingTd;

    function makeTdEditable(td) {

        editingTd = {
            elem: td,
            data: td.innerHTML,
            finish:
                function (td, isOk) {

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
                editingTd.finish(editingTd.elem, true);
            });

        $('#edit-cancel').on('click',
            function(evt) {
                editingTd.finish(editingTd.elem, false);
            });
    }

    function makeLineSplitMerge(td) {

        editingTd = {
            elem: td,
            data: td.innerHTML,
            tokenizer_action: null,
            finish: function(td, isOk) {
                $(td).html(editingTd.data);
                $(td).addClass('editable');

                if (editingTd.tokenizer_action == null) {
                    editingTd = null;
                    return;
                }

                let tableInfo = $(td).data('tableInfo');

                if (editingTd.tokenizer_action.includes('merge')) {

                    if (tableInfo.nRow < 1) {
                        editingTd = null;
                        return;
                    }

                    let pos = tableInfo.nRow + 1;
                    word_pos = data.data[tableInfo.nRow - 1]['No.'] + 1
                    while((pos < data.data.length) && (data.data[pos]['No.'] > 1)) {
                        data.data[pos]['No.'] = word_pos;
                        pos++;
                        word_pos++;
                    }

                    data.data[tableInfo.nRow - 1]['TOKEN'] += data.data[tableInfo.nRow]['TOKEN'];

                    data.data.splice(tableInfo.nRow, 1);
                }
                else if (editingTd.tokenizer_action.includes('split')) {

                    data.data.splice(tableInfo.nRow, 0, JSON.parse(JSON.stringify(data.data[tableInfo.nRow])));
                     data.data[tableInfo.nRow + 1]['No.'] += 1

                    let pos = tableInfo.nRow + 2;
                    while ((pos < data.data.length) && (data.data[pos]['No.'] > 1)) {
                        data.data[pos]['No.']++;
                        pos++;
                    }
                }
                else if (editingTd.tokenizer_action.includes('start-sentence')) {
                    let pos = tableInfo.nRow;
                    let word_pos = 1;
                    while ((pos < data.data.length) && (data.data[pos]['No.'] != 1)) {
                        data.data[pos]['No.'] = word_pos;
                        pos++;
                        word_pos++;
                    }
                }

                editingTd = null;

                updateTable();
            }
        };

        let edit_html = `
            <div class="accordion" id="tokenizer" style="display:block;">
                <section class="accordion-item tokenizer-action">&#8597;&nbsp;&nbsp;split</section>
                <section class="accordion-item tokenizer-action">&#10227;&nbsp;merge-above</section>
                <section class="accordion-item tokenizer-action">start-sentence</section>
            </div>
        `;

        $(td).removeClass();
        $(td).html(edit_html);
        $('#tokenizer').mouseleave(
            function(event) {
                editingTd.finish(editingTd.elem, false);
            });

        $('.tokenizer-action').click(
            function(event) {
                editingTd.tokenizer_action = $(event.target).text();
            });
    }

    function makeTagEdit(td) {

        editingTd = {
            elem: td,
            data: td.innerHTML,
            finish: function(td, isOk) {

                let tableInfo = $(td).data('tableInfo');

                data.data[tableInfo.nRow][tableInfo.column] = editingTd.data;

                $(td).html(editingTd.data);
                $(td).addClass('editable');

                editingTd = null;

                colorCode();
            }
        };

        let edit_html = `
            <div class="accordion" id="tagger" style="display:block;">
                <section class="accordion-item type_select">O
                </section>
                <section class="accordion-item">B
                    <div class="accordion-item-content">
                        <div class="ner_per type_select">B-PER</div>
                        <div class="ner_loc type_select">B-LOC</div>
                        <div class="ner_org type_select">B-ORG</div>
                        <div class="ner_pub type_select">B-PUB</div>
                        <div class="ner_todo type_select">B-TODO</div>
                    </div>
                </section>
                <section class="accordion-item">I
                    <div class="accordion-item-content">
                        <div class="ner_per type_select">I-PER</div>
                        <div class="ner_loc type_select">I-LOC</div>
                        <div class="ner_org type_select">I-ORG</div>
                        <div class="ner_pub type_select">I-PUB</div>
                        <div class="ner_todo type_select">I-TODO</div>
                    </div>
                </section>
            </div>
        `;

        $(td).removeClass();
        $(td).html(edit_html);
        $('#tagger').mouseleave(
            function(event) {
                editingTd.finish(editingTd.elem, false);
            });

        $('.type_select').click(
            function(event) {
                editingTd.data = $(event.target).text();
            });
    }

    function updateTable() {

        editingTd = null;

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
                  row.append($('<td> <button class="btn btn-link btn-xs py-0 offset">' +
                                      nRow + '</button>  </td>'));

                  $.each(el,
                      function(column, content) {

                          if (column == 'url_id') return

                          var clickAction = function() { console.log('Do something different');}

                          if (column == 'No.')
                            clickAction = makeLineSplitMerge

                          if (column == 'TOKEN')
                            clickAction = makeTdEditable

                          if ((column == 'NE-TAG') || (column == 'NE-EMB'))
                            clickAction = makeTagEdit

                          row.append(
                              $(editable_html).
                                  text(content).
                                  data('tableInfo', { 'nRow': nRow, 'column': column , 'clickAction': clickAction })
                          );
                      });

                  $("#table tbody").append(row);
              });

        colorCode();

        $(".offset").on('click', gotoLocation);

        updatePreview(startIndex)

        if ($("#docpos").val() != startIndex) {

            $("#docpos").val(data.data.length - startIndex);
        }
    }

    let slider_pos = data.data.length - startIndex;
    let slider_min = displayRows;
    let slider_max = data.data.length;

    let range_html =
            `
            <input type="range" orient="vertical" class="form-control-range"
                style="-webkit-appearance: slider-vertical;height:100%;outline: 0 none !important;"
                min="${slider_min}" max="${slider_max}" value="${slider_pos}" id="docpos" />
            `;

    $("#region-right").html(range_html)

    $("#docpos").change(
        function(evt) {

            if (startIndex == data.data.length - this.value) return;

            startIndex = data.data.length - this.value;
            endIndex = startIndex + displayRows;

            updateTable();
        });

    $('#docpos').slider();

     let table_html =
        `
        <table id="table">
            <thead>
            <tr>
                <th><button class="btn btn-link" id="back"><<</button>LOCATION</th>
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

    $("#file-region").html('<h3>' + file.name + '</h3>');

    function saveFile(evt) {

        let csv =
            Papa.unparse(data,
                {
                    header: true,
                    delimiter: '\t',
                    comments: "#",
                    quoteChar: String.fromCharCode(0),
                    escapeChar: String.fromCharCode(0),
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

    $('.saveButton').on('click', saveFile)

    $('#table').on('click',
        function(event) {

            let target = event.target.closest('.editable');

            if (editingTd) {

                if (target == editingTd.elem) return;

                editingTd.finish(editingTd.elem, true);
            }

            if (!$.contains($('#table')[0], target)) return

            $(target).data('tableInfo').clickAction(target);

            //makeTdEditable(target);
        });

    updateTable();

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


$(document).ready(
    function() {
        $('#tsv-file').change(
            function(evt) {

                loadFile ( evt,
                    function(results, file) {

                        setupInterface(results, file);
                    })
            }
        );
    }
);