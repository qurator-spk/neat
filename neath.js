
function loadFile(evt, onComplete) {

    var file = evt.target.files[0];

    var urls = null;

    var reader = new FileReader();

    reader.onload =
        function(event) {

            let link_detector = /(https?:\/\/[^\s]+)/g;

            let lines = event.target.result.split(/\r\n|\n/);
            for(var i = 0; i < lines.length; i++){

                let line = lines[i];

                if (!line.startsWith('#')) continue;

                let tmp = line.match(link_detector);

                if (tmp == null) continue;

                if (urls == null) {
                    urls = tmp;
                }
                else {
                    urls.push(tmp[0])
                }
            };
        };

    reader.readAsText(file);

    Papa.parse(file, {
        header: true,
        delimiter: '\t',
        quoteChar: String.fromCharCode(0),
	    escapeChar: String.fromCharCode(0),
        comments: "#",
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: function(results) { onComplete(results, file, urls); }
    });
}

function setupInterface(data, file, urls) {

    let displayRows=30
    let startIndex=0;
    let endIndex=displayRows;

    let has_changes = false;
    var save_timeout = null;

    function notifyChange() {
        if (save_timeout != null) clearTimeout(save_timeout);
        has_changes = true;

        $("#save").attr('disabled', false);
    }

    function resetChanged() {
        if (save_timeout != null) clearTimeout(save_timeout);

        $("#save").attr('disabled', true);
        has_changes = false;
    }

    function checkForSave (csv) {

        if (save_timeout != null) clearTimeout(save_timeout);

        // This is a work-around that checks if the user actually saved the file or if the save dialog was cancelled.
        let counter = 0;
        let checker =
            function() {
                console.log('checker ...', counter);

                if (counter > 20) return;

                let reader = new FileReader();

                reader.onload =
                    function(event) {

                        let content = event.target.result;

                        if (content == csv) { // ok content of the file is actually equal to desired content.
                            console.log('Save success ...');
                            resetChanged();
                            return;
                        }

                        counter++;
                        save_timeout = setTimeout(checker, 3000);
                    };

                reader.readAsText(file);
            };

        save_timeout = setTimeout(checker, 3000);
    };

    // public interface
    var that =
        {
            hasChanges: function () { return has_changes; }
        };

    function updatePreview(nRow) {

        if (urls == null) return;

        let img_url = urls[data.data[nRow]['url_id']];

        if (img_url == "http://empty")
            return

        let left = data.data[nRow]['left'];
        let right = data.data[nRow]['right'];
        let top = data.data[nRow]['top'];
        let bottom = data.data[nRow]['bottom'];

        top = Math.max(0, top - 25);
        bottom = bottom + 25;
        left = Math.max(0, left - 50);
        right = right + 50;

        let width = right - left;
        let height = bottom - top;

        img_url = img_url.replace('left',  left.toString());
        img_url = img_url.replace('right', right.toString());
        img_url = img_url.replace('top',   top.toString());
        img_url = img_url.replace('bottom',bottom.toString());
        img_url = img_url.replace('width', width.toString());
        img_url = img_url.replace('height', height.toString());

        //console.log(img_url)

        $("#preview").attr("src", img_url);

        img_url = urls[data.data[nRow]['url_id']];

        top = Math.max(0, top - 200);
        bottom = bottom + 200;

        left = Math.max(0, left - 400);
        right = right + 400;

        width = right - left;
        height = bottom - top;

        img_url = img_url.replace('left',  left.toString());
        img_url = img_url.replace('right', right.toString());
        img_url = img_url.replace('top',   top.toString());
        img_url = img_url.replace('bottom',bottom.toString());
        img_url = img_url.replace('width', width.toString());
        img_url = img_url.replace('height', height.toString());

        $("#preview-link").attr("href", img_url);
    }

    function gotoLocation(evt) {

        if (urls == null) return;

        let nRow = parseInt($(evt.target).text());

        updatePreview(nRow)
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
        $("#table td:contains('B-CONF')").addClass('ner_conf');
        $("#table td:contains('I-CONF')").addClass('ner_conf');
        $("#table td:contains('B-ART')").addClass('ner_art');
        $("#table td:contains('I-ART')").addClass('ner_art');
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

                        notifyChange();
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

                    notifyChange();
                }
                else if (editingTd.tokenizer_action.includes('split')) {

                    data.data.splice(tableInfo.nRow, 0, JSON.parse(JSON.stringify(data.data[tableInfo.nRow])));
                     data.data[tableInfo.nRow + 1]['No.'] += 1

                    let pos = tableInfo.nRow + 2;
                    while ((pos < data.data.length) && (data.data[pos]['No.'] > 1)) {
                        data.data[pos]['No.']++;
                        pos++;
                    }

                    notifyChange();
                }
                else if (editingTd.tokenizer_action.includes('start-sentence')) {
                    let pos = tableInfo.nRow;
                    let word_pos = 1;
                    while ((pos < data.data.length) && (data.data[pos]['No.'] != 1)) {
                        data.data[pos]['No.'] = word_pos;
                        pos++;
                        word_pos++;
                    }

                    notifyChange();
                }

                editingTd = null;

                updateTable();
            }
        };

        let edit_html = `
            <div class="accordion" id="tokenizer" style="display:block;">
                <section class="accordion-item tokenizer-action">&#8597;&nbsp;&nbsp;split</section>
                <section class="accordion-item tokenizer-action">&#10227;&nbsp;merge</section>
                <section class="accordion-item tokenizer-action">&#9735;&nbsp;sentence</section>
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

                notifyChange();
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
                        <div class="ner_conf type_select">B-CONF</div>
                        <div class="ner_art type_select">B-ART</div>
                        <div class="ner_todo type_select">B-TODO</div>
                    </div>
                </section>
                <section class="accordion-item">I
                    <div class="accordion-item-content">
                        <div class="ner_per type_select">I-PER</div>
                        <div class="ner_loc type_select">I-LOC</div>
                        <div class="ner_org type_select">I-ORG</div>
                        <div class="ner_pub type_select">I-PUB</div>
                        <div class="ner_conf type_select">I-CONF</div>
                        <div class="ner_art type_select">I-ART</div>
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

        let do_not_display = new Set(['url_id', 'left', 'right', 'top', 'bottom']);

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
                  row.append($('<td> <button class="btn btn-link btn-xs py-0 offset" onmouseover="click();">' +
                                      nRow + '</button>  </td>'));

                  $.each(el,
                      function(column, content) {

                          if (do_not_display.has(column)) return

                          var clickAction = function() { console.log('Do something different');}

                          if (column == 'No.')
                            clickAction = makeLineSplitMerge

                          if ((column == 'TOKEN') || (column == 'GND-ID'))
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

        //updatePreview(startIndex)

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
                <th>NE-EMB</th>
                <th>GND-ID<button class="btn btn-link" id="next">>></button></th>
            </tr>
            </thead>
            <tbody id="table-body"></tbody>
        </table>
        <br/>
        <br/>
        `;

    let save_html =
        `<button class="btn btn-primary saveButton" id="save" disabled>Save Changes</button>`

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

        let lines = csv.split(/\r\n|\n/);

        csv = [ lines[0] ];
        let url_id = -1;

        for(var i = 0; i < data.data.length; i++){
            if (data.data[i]['url_id'] > url_id) {

                url_id = data.data[i]['url_id'];

                csv.push("# " + urls[url_id]);
            }
            csv.push(lines[i+1]);
        }

        csv = csv.join('\n');

        openSaveFileDialog (csv, file.name, null);

        checkForSave(csv);
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

    return that;
}


$(document).ready(
    function() {

        $('#tsv-file').change(
            function(evt) {

                loadFile ( evt,
                    function(results, file, urls) {

                        var neath = setupInterface(results, file, urls);

                        $(window).bind("beforeunload",
                            function() {

                                console.log(neath.hasChanges());

                                if (neath.hasChanges())
                                    return confirm("You have unsaved changes. Do you want to save them before leaving?");
                            }
                        );
                    })
            }
        );
    }
);