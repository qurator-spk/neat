
function loadFile(evt, onComplete) {

    let file = evt.target.files[0];

    let urls = null;

    let reader = new FileReader();

    reader.onload =
        function(event) {

            let link_detector = /(https?:\/\/[^\s]+)/g;

            let lines = event.target.result.split(/\r\n|\n/);
            for(let i = 0; i < lines.length; i++){

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

    let displayRows=15
    let startIndex=0;
    let endIndex=displayRows;

    let do_not_display = new Set(['url_id', 'left', 'right', 'top', 'bottom']);
    let tagClasses = 'ner_per ner_loc ner_org ner_work ner_conf ner_evt ner_todo';

    let has_changes = false;

    let save_timeout = null;

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

    function colorCode() {
        $(".editable").removeClass(tagClasses);

        $("#table td:contains('B-PER')").addClass('ner_per');
        $("#table td:contains('I-PER')").addClass('ner_per');
        $("#table td:contains('B-LOC')").addClass('ner_loc');
        $("#table td:contains('I-LOC')").addClass('ner_loc');
        $("#table td:contains('B-ORG')").addClass('ner_org');
        $("#table td:contains('I-ORG')").addClass('ner_org');
        $("#table td:contains('B-WORK')").addClass('ner_work');
        $("#table td:contains('I-WORK')").addClass('ner_work');
        $("#table td:contains('B-CONF')").addClass('ner_conf');
        $("#table td:contains('I-CONF')").addClass('ner_conf');
        $("#table td:contains('B-EVT')").addClass('ner_evt');
        $("#table td:contains('I-EVT')").addClass('ner_evt');
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

                    let listener = new window.keypress.Listener(td);

                    listener.simple_combo("enter", function() { td.click(); });

                    editingTd = null;
                    $(td).focus();
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

        let listener = new window.keypress.Listener(td);

        listener.simple_combo('enter', function() { $('#edit-ok').click(); } );
        listener.simple_combo('esc', function() { $('#edit-cancel').click(); } );
    }

    function tableEditAction(nRow, action) {

        if (action == null) return;

        if (action.includes('merge')) {

            if (nRow < 1) return;

            let pos = nRow + 1;
            word_pos = data.data[nRow - 1]['No.'] + 1
            while((pos < data.data.length) && (data.data[pos]['No.'] > 1)) {
                data.data[pos]['No.'] = word_pos;
                pos++;
                word_pos++;
            }

            data.data[nRow - 1]['TOKEN'] += data.data[nRow]['TOKEN'];

            data.data.splice(nRow, 1);

            notifyChange();
        }
        else if (action.includes('split')) {

            data.data.splice(nRow, 0, JSON.parse(JSON.stringify(data.data[nRow])));
            data.data[nRow + 1]['No.'] += 1;

            let pos = nRow + 2;
            while ((pos < data.data.length) && (data.data[pos]['No.'] > 1)) {
                data.data[pos]['No.']++;
                pos++;
            }

            notifyChange();
        }
        else if (action.includes('sentence')) {

            let pos = nRow;

            let new_row = JSON.parse(JSON.stringify(data.data[pos]))

            console.log(new_row)

            data.data.splice(pos, 0, new_row);
            data.data[pos]['No.'] = 0
            data.data[pos]['TOKEN'] = ''
            pos += 1

            let word_pos = 1;
            while ((pos < data.data.length) && (data.data[pos]['No.'] != 1) && (data.data[pos]['TOKEN'] != '') ) {
                data.data[pos]['No.'] = word_pos;
                pos++;
                word_pos++;
            }

            notifyChange();
        }

        updateTable();
    }

    function makeLineSplitMerge(td) {

        editingTd = {
            elem: td,
            data: td.innerHTML,
            tokenizer_action: null,
            finish: function(td, isOk) {
                $(td).html(editingTd.data);
                $(td).addClass('editable');

                let tableInfo = $(td).data('tableInfo');

                tableEditAction(tableInfo.nRow, editingTd.tokenizer_action)

                editingTd = null;
            }
        };

        let edit_html = `
            <div class="accordion" id="tokenizer" style="display:block;">
                <section class="accordion-item tokenizer-action">&#8597;&nbsp;&nbsp;split</section>
                <section class="accordion-item tokenizer-action">&#10227;&nbsp;merge</section>
                <section class="accordion-item tokenizer-action">&#9735;&nbsp;sentence</section>
            </div>`;

        $(td).removeClass('editable');
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
                        <div class="ner_work type_select">B-WORK</div>
                        <div class="ner_conf type_select">B-CONF</div>
                        <div class="ner_evt type_select">B-EVT</div>
                        <div class="ner_todo type_select">B-TODO</div>
                    </div>
                </section>
                <section class="accordion-item">I
                    <div class="accordion-item-content">
                        <div class="ner_per type_select">I-PER</div>
                        <div class="ner_loc type_select">I-LOC</div>
                        <div class="ner_org type_select">I-ORG</div>
                        <div class="ner_work type_select">I-WORK</div>
                        <div class="ner_conf type_select">I-CONF</div>
                        <div class="ner_evt type_select">I-EVT</div>
                        <div class="ner_todo type_select">I-TODO</div>
                    </div>
                </section>
            </div>
        `;

        $(td).removeClass('editable');
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

    function createTable() {

        editingTd = null;

        let editable_html =`<td class="editable hover">`;

        $('#table-body').empty();

        $.each(data.data,
              function(nRow, el) {

                  if (nRow < startIndex) return;
                  if (nRow >= endIndex) return;

                  let row = $("<tr/>").data('tableInfo', { 'nRow': nRow });

                  row.focusin(function() { updatePreview(row.data('tableInfo').nRow); });

                  row.append($('<td class="hover"/>').
                                text(nRow).
                                data('tableInfo', { 'nRow': nRow })
                            );

                  let row_listener = new window.keypress.Listener(row);

                  row_listener.sequence_combo('0',
                      function() {

                          data.data[row.data('tableInfo').nRow]['No.'] = 0;

                          row.children('.editable').first().html('0');

                          notifyChange();
                      });

                  row_listener.sequence_combo('s t', function() {
                      tableEditAction(row.data('tableInfo').nRow, 'sentence');
                  });

                  row_listener.sequence_combo('s p', function() {
                      tableEditAction(row.data('tableInfo').nRow, 'split');
                  });

                  row_listener.sequence_combo('m e', function() {
                      tableEditAction(row.data('tableInfo').nRow, 'merge');
                  });

                  $.each(el,
                      function(column, content) {

                          let td = $(editable_html)

                          let listener = new window.keypress.Listener(td);

                          if (do_not_display.has(column)) return

                          let clickAction = function() { console.log('Do something different');}

                          if (column == 'No.') {

                            clickAction = makeLineSplitMerge
                          }

                          if ((column == 'TOKEN') || (column == 'GND-ID')) {
                            clickAction = makeTdEditable

                            listener.simple_combo("enter", function() {
                                td.click();
                            });
                          }

                          if ((column == 'NE-TAG') || (column == 'NE-EMB')) {
                            clickAction = makeTagEdit

                            let tagAction = function(tag) {
                                   data.data[$(td).data('tableInfo').nRow][column] = tag;

                                   $(td).html(tag);
                                   colorCode();
                                   notifyChange();
                                };

                            listener.sequence_combo('b p', function() { tagAction('B-PER'); });
                            listener.sequence_combo('b l', function() { tagAction('B-LOC'); });
                            listener.sequence_combo('b o', function() { tagAction('B-ORG'); });
                            listener.sequence_combo('b w', function() { tagAction('B-WORK'); });
                            listener.sequence_combo('b c', function() { tagAction('B-CONF'); });
                            listener.sequence_combo('b e', function() { tagAction('B-EVT'); });
                            listener.sequence_combo('b t', function() { tagAction('B-TODO'); });

                            listener.sequence_combo('i p', function() { tagAction('I-PER'); });
                            listener.sequence_combo('i l', function() { tagAction('I-LOC'); });
                            listener.sequence_combo('i o', function() { tagAction('I-ORG'); });
                            listener.sequence_combo('i w', function() { tagAction('I-WORK'); });
                            listener.sequence_combo('i c', function() { tagAction('I-CONF'); });
                            listener.sequence_combo('i e', function() { tagAction('I-EVT'); });
                            listener.sequence_combo('i t', function() { tagAction('I-TODO'); });

                            listener.sequence_combo('backspace', function() { tagAction('O'); });
                          }

                          td.attr('tabindex', 0).
                             text(content).
                             data('tableInfo', { 'nRow': nRow, 'column': column , 'clickAction': clickAction })

                          row.append(td);
                      });

                  $("#table tbody").append(row);
              });

        colorCode();

        $(".hover").on('mouseover',
            function (evt) {

                if (editingTd != null) return;

                $(evt.target).focus();
            }
        );

        if ($("#docpos").val() != startIndex) {

            $("#docpos").val(data.data.length - startIndex);
        }
    }

    function updateTable() {

        editingTd = null;

        let rows = $('tbody').children('tr');

        let pRow = 0;

        $.each(data.data,
              function(nRow, el) {

                  if (nRow < startIndex) return;
                  if (nRow >= endIndex) return;


                  let row = $(rows[pRow]);
                  let tableInfo = row.data('tableInfo');

                  tableInfo.nRow = nRow;

                  row.data('tableInfo', tableInfo);

                  let loc = $(row.children('td').first());
                  loc.data('tableInfo', tableInfo);
                  loc.text(nRow);

                  let columns = $(rows[pRow]).children('.editable');
                  let pColumn = 0;

                  $.each(el,
                      function(column_name, content) {

                          if (do_not_display.has(column_name)) return

                          let td = $(columns[pColumn]);

                          tableInfo = td.data('tableInfo');

                          tableInfo.nRow = nRow;

                          td.text(content).data('tableInfo', tableInfo);

                          pColumn++;
                      });

                   pRow++;
              });

        colorCode();

        if ($("#docpos").val() != startIndex) {

            $("#docpos").val(data.data.length - startIndex);
        }

        if ($(':focus').data('tableInfo'))
            updatePreview($(':focus').data('tableInfo').nRow);
    }

    let wnd_listener = new window.keypress.Listener();

    wnd_listener.simple_combo('tab',
        function () {
            if (editingTd != null)
                return false; // If we are in editing mode, we do not want to propagate the TAB event.
            else return true; // In non-editing mode, we want to get the "normal" tab behaviour.
        });

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
                <th><button class="btn btn-link" id="back" tabindex="-1"><<</button>LOCATION</th>
                <th>POSITION</th>
                <th>TOKEN</th>
                <th>NE-TAG</th>
                <th>NE-EMB</th>
                <th>GND-ID<button class="btn btn-link" id="next" tabindex="-1">>></button></th>
            </tr>
            </thead>
            <tbody id="table-body"></tbody>
        </table>
        <br/>
        <br/>
        `;

    let save_html =
        `<button class="btn btn-primary saveButton" id="save" disabled tabindex="-1">Save Changes</button>`

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

        for(let i = 0; i < data.data.length; i++){
            if (data.data[i]['url_id'] > url_id) {

                url_id = data.data[i]['url_id'];

                if (urls != null)
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

        let blob = data.constructor !== Blob
          ? new Blob([data], {type: mimetype || 'application/octet-stream'})
          : data ;

        if (navigator.msSaveBlob) {
          navigator.msSaveBlob(blob, filename);
          return;
        }

        let lnk = document.createElement('a'),
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

    createTable();

    function stepsBackward (nrows) {

        if (startIndex >= nrows) {
            startIndex -= nrows;
            endIndex -= nrows;
        }
        else {
            startIndex = 0;
            endIndex = displayRows;
        }

        updateTable();
    }

    function stepsForward(nrows) {
        if (endIndex + nrows < data.data.length) {
            endIndex += nrows;
            startIndex = endIndex - displayRows;
        }
        else {
            endIndex = data.data.length;
            startIndex = endIndex - displayRows;
        }

        updateTable();
    }

    $('#tableregion')[0].addEventListener("wheel",
        function(event) {

            if (editingTd != null) return;

            if (event.deltaY < 0) stepsBackward(1);
            else stepsForward(1);
        });

    $('#back').on('click', function() { stepsBackward(displayRows); } );

    $('#next').on('click', function() { stepsForward(displayRows); } );

    wnd_listener.simple_combo('pageup',
        function() {
            if (editingTd != null) return;

            $('#back').click();
        });

    wnd_listener.simple_combo('pagedown',
        function() {
            if (editingTd != null) return;

            $('#next').click();
        });

    wnd_listener.simple_combo('left',
        function() {
            if (editingTd != null) return true;

            let prev = $(':focus').prev('.editable')

            if (prev.length==0) {
                $(':focus').closest('tr').prev('tr').children('.editable').last().focus();
            }
            else {
                prev.focus();
            }
        });
    wnd_listener.simple_combo('right',
        function() {
            if (editingTd != null) return true;

            let next = $(':focus').next('.editable')

            if (next.length==0) {
                $(':focus').closest('tr').next('tr').children('.editable').first().focus();
            }
            else {
                next.focus();
            }
        });

     wnd_listener.simple_combo('up',
        function() {
            if (editingTd != null) return true;

            let prev = $(':focus').closest('tr').prev('tr')

            let pos = $(':focus').closest('tr').children('.editable').index($(':focus'))

            if (prev.length==0) {
                stepsBackward(1);
            }
            else {
                prev.children('.editable')[pos].focus();
            }
        });

    wnd_listener.simple_combo('down',
        function() {
            if (editingTd != null) return true;

            let next = $(':focus').closest('tr').next('tr')

            let pos = $(':focus').closest('tr').children('.editable').index($(':focus'))

            if (next.length==0) {
                stepsForward(1);
            }
            else {
                next.children('.editable')[pos].focus();
            }
        });

    // public interface
    let that =
        {
            hasChanges: function () { return has_changes; }
        };

    return that;
}


$(document).ready(
    function() {

        $('#tsv-file').change(
            function(evt) {

                loadFile ( evt,
                    function(results, file, urls) {

                        let neath = setupInterface(results, file, urls);

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
