
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
        dynamicTyping: false,
        complete: function(results) { onComplete(results, file, urls); }
    });
}

function setupInterface(data, file, urls) {

    if (data.data.length <= 0)  return null;

    // private variables of app

    let displayRows=15
    let startIndex=0;
    let endIndex=displayRows;

    let do_not_display = new Set(['url_id', 'left', 'right', 'top', 'bottom', 'ocrconf', 'conf']);
    let tagClasses = 'ner_per ner_loc ner_org ner_work ner_conf ner_evt ner_todo';

    let has_changes = false;

    let save_timeout = null;

    let listener_defaults = { prevent_repeat  : true };

    let editingTd;

    let wnd_listener = new window.keypress.Listener();
    let slider_pos = data.data.length - startIndex;
    let slider_min = displayRows;
    let slider_max = data.data.length;

    let min_left = 1000000000
    let max_right = 0
    let min_top = 1000000000
    let max_bottom = 0

    // private functions of app

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

        let raw_left = parseInt(data.data[nRow]['left']);
        let raw_right = parseInt(data.data[nRow]['right']);
        let raw_top = parseInt(data.data[nRow]['top']);
        let raw_bottom = parseInt(data.data[nRow]['bottom']);

        let left = raw_left;
        let right = raw_right;
        let top = raw_top;
        let bottom = raw_bottom;

        let raw_width = right - left;
        let raw_height = bottom - top;


        top = Math.max(0, top - 25);
        bottom = Math.min(max_bottom, bottom + 25);

        left = Math.max(0, left - 50);
        right = Math.min(max_right, right + 50);

        width = right - left;
        height = bottom - top;

        img_url = img_url.replace('left',  left.toString());
        img_url = img_url.replace('right', right.toString());
        img_url = img_url.replace('top',   top.toString());
        img_url = img_url.replace('bottom',bottom.toString());
        img_url = img_url.replace('width', width.toString());
        img_url = img_url.replace('height', height.toString());

        let offscreen= document.createElement('canvas');
        offscreen.width= width;
        offscreen.height= height;

        $("#preview").attr("src", offscreen.toDataURL());

        let ctx = offscreen.getContext("2d");
        let img = new Image();
        img.crossOrigin = "anonymous";

        (function(left,top) {
            img.onload = function() {
                    ctx.drawImage(img, 0, 0);
                    ctx.beginPath();
                    ctx.lineWidth = "1";
                    ctx.strokeStyle = "red";
                    ctx.rect(raw_left - left, raw_top - top, raw_width, raw_height);
                    ctx.stroke();

                    $("#preview").attr("src", offscreen.toDataURL());
                };
        })(left, top);

        img.src = img_url;

        enlarge_img_url = urls[data.data[nRow]['url_id']];

        top = Math.max(0, top - 200);
        bottom = Math.min(max_bottom, bottom + 200);

        left = Math.max(0, left - 400);
        right = Math.min(max_right, right + 400);

        width = right - left;
        height = bottom - top;

        enlarge_img_url = enlarge_img_url.replace('left',  left.toString());
        enlarge_img_url = enlarge_img_url.replace('right', right.toString());
        enlarge_img_url = enlarge_img_url.replace('top',   top.toString());
        enlarge_img_url = enlarge_img_url.replace('bottom',bottom.toString());
        enlarge_img_url = enlarge_img_url.replace('width', width.toString());
        enlarge_img_url = enlarge_img_url.replace('height', height.toString());

        if ($('#enlarge-page-link').length == 0) {
            $('#preview-rgn').append($('<a href="" id="enlarge-page-link"><small>enlarge</small> </a>'));
        }

        $("#preview-link").attr("href", enlarge_img_url);
        $("#enlarge-page-link").attr("href", enlarge_img_url);

        full_img_url = urls[data.data[nRow]['url_id']];

        width = max_right - min_left;
        height = max_bottom - min_top;

        full_img_url = full_img_url.replace("left,top,width,height", "full")
        full_img_url = full_img_url.replace("left,right,top,bottom", "full")
        full_img_url = full_img_url.replace("left,top,right,bottom", "full")

        full_img_url = full_img_url.replace('left',  min_left.toString());
        full_img_url = full_img_url.replace('right', max_right.toString());
        full_img_url = full_img_url.replace('top',   min_top.toString());
        full_img_url = full_img_url.replace('bottom', max_bottom.toString());
        full_img_url = full_img_url.replace('width', width.toString());
        full_img_url = full_img_url.replace('height', height.toString());

        if ($('#full-page-link').length == 0) {
            $('#preview-rgn').append($('<small>| </small><a href="" id="full-page-link"><small>full</small> </a>'));
        }

        $("#full-page-link").attr("href", full_img_url);
    }

    function colorCodeNETag() {
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

    function makeTdEditable(td, content) {

        $(td).removeClass('editable');

        let tableInfo = $(td).data('tableInfo');

        editingTd = {
            finish:
                function (isOk) {
                    $(td).addClass('editable');
                    keyboard_listener.reset();
                    listener.reset();

                    if (isOk) {
                        let newValue = $('#edit-area').val();

                        data.data[tableInfo.nRow][tableInfo.column] = newValue;

                        sanitizeData();
                        notifyChange();
                        updateTable();
                    }

                    tableInfo.fillAction($(td));
                    editingTd = null;

                    $(".simple-keyboard").html("");

                    $(td).focus();
                }
        };

        let textArea = document.createElement('textarea');
        textArea.style.width = td.clientWidth + 'px';
        textArea.style.height = td.clientHeight + 'px';
        textArea.className = "input"
        textArea.id = 'edit-area';

        $(textArea).val(data.data[tableInfo.nRow][tableInfo.column]);
        $(td).html('');
        $(td).append(textArea);
        textArea.focus();

        let edit_html =
            `<div>
                <button class="btn btn-secondary btn-sm" id="edit-ok">OK</button>
                <button class="btn btn-secondary btn-sm" id="edit-cancel">CANCEL</button>
                <!--<button class="btn btn-secondary btn-sm" id="keyboard">Toggle Keyboard</button>
                <div class="simple-keyboard"></div>-->
             </div>`;

        td.insertAdjacentHTML("beforeEnd", edit_html);

        $('#edit-ok').on('click',
            function(evt) {
                editingTd.finish(true);
            });

        $('#edit-cancel').on('click',
            function(evt) {
                editingTd.finish(false);
            });

        let listener = new window.keypress.Listener($('#edit-area'), listener_defaults);

        listener.simple_combo('enter', function() { $('#edit-ok').click(); } );
        listener.simple_combo('esc', function() { $('#edit-cancel').click(); } );
        listener.simple_combo('ctrl', function() { toggleLayout(); } );

        let keyboard_listener = new window.keypress.Listener($('#simple-keyboard'), listener_defaults);

        keyboard_listener.simple_combo('enter', function() { $('#edit-ok').click(); } );
        keyboard_listener.simple_combo('esc', function() { $('#edit-cancel').click(); } );
        keyboard_listener.simple_combo('ctrl', function() { toggleLayout(); } );

        let Keyboard = window.SimpleKeyboard.default;

        function onChange(input) {
            document.querySelector("#edit-area").value = input;
        }

        function toggleLayout() {
            let currentLayout = keyboard.options.layoutName;
            let layoutToggle = currentLayout === "default" ? "layout1" : "default";

            keyboard.setOptions({ layoutName: layoutToggle});
        }

        let keyboard =
            new Keyboard(
                {   onChange: input => onChange(input),
                    layout: {
                        'default': [
                                "\uF1AC \u00AD \u00AC \u00BD \u00C0 \u00C3 \u00C4 \u00C6 \u00E0 \u00E3 \u00E4 \u00E6 \u0101 \u023A \u2C65 \uE42C",
				"\uEFA1 \uF500 \uF532 \u0253 \uF524 \u00C7 \u00E7 \u0107 \uEEC4 \uEEC5 \uF501 \uF502 \uF517 \uF520 \uF522 \uF531",
				"\uF50A \uF51B \u00C8 \u00C9 \u00CB \u00E8 \u00E9 \u00EB \u0113 \u0118 \u0119 \u0256 \u0247 \u1EBD \u204A \uE4E1",
				"\uF158 \uF219 \uF515 \uFB00 \uFB01 \uFB02 \uFB03 \uA7A0 \uA7A1 \uF504 \uF505 \uF506 \uF521 \uF525 \u00CD \u00ED",
				"\u00EF \u0129 \u012B \u0133 \uA76D \uF220 \uF533 \uEBE3 \uA742 \uA743 \uA7A2 \uA7A3 \u0141 \u0142 \uF4F9 \uF50B",
				"\uE5B8 \uF519 \u00D1 \u00F1 \uA7A4 \uA7A5 \uE1DC \uE5DC \u00D2 \u00D5 \u00D6 \u00D8 \u00F2 \u00F5 \u00F6 {bksp}"
                              ],
                        'layout1': [
                                "\u00F8 \u014D \u0153 \uE644 \uA750 \uA751 \uA752 \uA753 \uE665 \uEED6 \uEED7 \uF51F \uF526 \uF529 \uA756 \uA757",
				"\uA759 \uE282 \uE681 \uE682 \uE68B \uE8BF \uF508 \uF509 \uF50C \uF50D \uF50E \uF50F \uF51A \uF523 \uF52F \uF535",
				"\u211F \uA75C \uA75D \uA7A6 \uA7A7 \uF510 \uF518 \uF536 \u00DF \u017F \u1E9C \u1E9E \uEADA \uEBA2 \uEBA3 \uEBA6",
				"\uEBA7 \uEBAC \uF4FC \uF4FF \uF511 \uF51E \uF528 \uF52C \uFB06 \uE6E2 \uEEDC \uF512 \uF537 \u00D9 \u00DC \u00F9",
				"\u00FC \u0169 \u016B \u016D \u016E \u016F \uA770 \uE72B \uF1A5 \uF1A6 \uF534 \uE73A \uE8BA \uF513 \uF527 \uF514",
				"\u1EF9 \uE781 \uF52A \uF52B \u017C \u017D \u017E \uF516 \uF51D \u1F51 \u2042 \u2184 \u2234 \u261c \u261E \u2767",
				"\u2010 \u2011 \u2E17 \uF161 \uF51C \uF52D \uF538 \uFFFD {bksp}"]
                    }
                });

        keyboard.setInput($(textArea).val());

        $(textArea).on('input', function() {
            keyboard.setInput($(textArea).val());
        });
    }

    function sanitizeData() {
        word_pos = 1;
        for(let i = 0; i < data.data.length; i++){

            min_left = (parseInt(data.data[i]['left']) < min_left) ? parseInt(data.data[i]['left']) : min_left;
            max_right= (parseInt(data.data[i]['right']) > max_right) ? parseInt(data.data[i]['right']) : max_right;

            min_top = (parseInt(data.data[i]['top']) < min_top) ? parseInt(data.data[i]['top']) : min_top;
            max_bottom = (parseInt(data.data[i]['bottom']) > max_bottom) ? parseInt(data.data[i]['bottom']) : max_bottom;

            let token_col = "TOKEN";
            if (data.meta.fields.includes('TEXT')) {
                token_col = "TEXT";
            }

            if ((data.data[i][token_col] == null) || (data.data[i][token_col].toString().length == 0)){
                word_pos = 0;
            }

            if (data.meta.fields.includes('No.')) {
                data.data[i]['No.'] = word_pos;
            }

            if (data.data[i][token_col] == null) data.data[i][token_col] = '';
            data.data[i][token_col] = data.data[i][token_col].toString().replace(/(\r\n|\n|\r)/gm, "");

            if (data.meta.fields.includes('NE-TAG')) {
                if (data.data[i]['ID'] == null) data.data[i]['ID'] = '';
                if (data.data[i]['NE-TAG'] == null) data.data[i]['NE-TAG'] = '';
                if (data.data[i]['NE-EMB'] == null) data.data[i]['NE-EMB'] = '';

                data.data[i]['ID'] = data.data[i]['ID'].toString().replace(/(\r\n|\n|\r)/gm, "");
                data.data[i]['NE-TAG'] = data.data[i]['NE-TAG'].toString().replace(/(\r\n|\n|\r)/gm, "");
                data.data[i]['NE-EMB'] = data.data[i]['NE-EMB'].toString().replace(/(\r\n|\n|\r)/gm, "");
            }

            word_pos++;
        }
    }

    function tableEditAction(nRow, action) {

        if (editingTd != null) return;

        if (action == null) return;

        if (data.data[nRow]['TOKEN'] == null) data.data[nRow]['TOKEN'] = '';

        if (action.includes('merge')) {

            if (nRow < 1) return;

            if (data.data[nRow - 1]['TOKEN'] == null) data.data[nRow - 1]['TOKEN'] = '';

            data.data[nRow - 1]['TOKEN'] =
                data.data[nRow - 1]['TOKEN'].toString() + data.data[nRow]['TOKEN'].toString();

            data.data.splice(nRow, 1);
        }
        else if (action.includes('split')) {

            data.data.splice(nRow, 0, JSON.parse(JSON.stringify(data.data[nRow])));
        }
        else if (action.includes('delete')) {
            data.data.splice(nRow, 1);
        }
        else if (action.includes('sentence')) {

            let new_line = JSON.parse(JSON.stringify(data.data[nRow]));
            new_line['TOKEN'] = '';
            new_line['NE-TAG'] = 'O';
            new_line['NE-EMB'] = 'O';
            new_line['ID'] = '';

            data.data.splice(nRow, 0, new_line);
        }

        sanitizeData();
        notifyChange();
        updateTable();
    }

    function makeLineSplitMerge(td) {

        let tableInfo = $(td).data('tableInfo');

        editingTd = {
            data: data.data[tableInfo.nRow][tableInfo.column],
            finish: function(action, isOk) {

                $(td).html(editingTd.data);
                $(td).addClass('editable');

                editingTd = null;

                tableEditAction(tableInfo.nRow, action)

                $(td).focus();
            }
        };

        let edit_html = `
            <div class="accordion" id="tokenizer" style="display:block;">
                <section class="accordion-item tokenizer-action">&#8597;&nbsp;&nbsp;split</section>
                <section class="accordion-item tokenizer-action">&#10227;&nbsp;merge</section>
                <section class="accordion-item tokenizer-action">&#9735;&nbsp;sentence</section>
                <section class="accordion-item tokenizer-action">&#9447;&nbsp;delete</section>
            </div>`;

        $(td).removeClass('editable');
        $(td).html(edit_html);

        $('#tokenizer').mouseleave( function(event) { editingTd.finish(null, false); });

        $('.tokenizer-action').click(function(event) { editingTd.finish($(event.target).text(), true); });
    }

    function makeTagEdit(td) {

        let tableInfo = $(td).data('tableInfo');

        editingTd = {
            data: data.data[tableInfo.nRow][tableInfo.column],
            finish: function(isOk) {
                tableInfo.fillAction($(td))

                $(td).addClass('editable');

                editingTd = null;

                colorCodeNETag();

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
        $('#tagger').mouseleave( function(event) { editingTd.finish(false); });

        $('.type_select').click(
            function(event) {
                 data.data[tableInfo.nRow][tableInfo.column] = $(event.target).text().trim();

                editingTd.finish(true);
            });
    }

    function createTable() {

        sanitizeData();

        let editable_html =`<td class="editable hover">`;

        $.each(data.data,
              function(nRow, el) {

                  if (nRow < startIndex) return;
                  if (nRow >= endIndex) return;

                  let row = $("<tr/>").data('tableInfo', { 'nRow': nRow });

                  row.focusin(
                    function() {
                        updatePreview(row.data('tableInfo').nRow);

                        $('#preview-rgn').css('transform', 'translate(0,' + (row.position().top + row.height()/2) + 'px)'
                                                        + ' translate(0%,-50%)');
                    });

                  row.append($('<td class="hover"/>').
                                text(nRow).
                                data('tableInfo', { 'nRow': nRow })
                            );

                  let row_listener = new window.keypress.Listener(row, listener_defaults);

                  row_listener.register_many(
                    [
                      {
                        keys: 's t',
                        on_keydown:
                            function() {
                              if (editingTd != null) return true;

                              tableEditAction(row.data('tableInfo').nRow, 'sentence');
                          },
                        is_sequence: true,
                        is_solitary: true,
                        is_exclusive: true
                      },

                      {
                        keys: 's p',
                        on_keydown:
                            function() {
                              if (editingTd != null) return true;

                              tableEditAction(row.data('tableInfo').nRow, 'split');
                          },
                        is_sequence: true,
                        is_solitary: true,
                        is_exclusive: true
                      },

                      {
                        keys: 'm e',
                        on_keydown:
                            function() {
                              if (editingTd != null) return true;

                              tableEditAction(row.data('tableInfo').nRow, 'merge');
                          },
                        is_sequence: true,
                        is_solitary: true,
                        is_exclusive: true
                      },

                      {
                        keys: 'd l',
                        on_keydown:
                            function() {
                              if (editingTd != null) return true;

                              tableEditAction(row.data('tableInfo').nRow, 'delete');
                          },
                        is_sequence: true,
                        is_solitary: true,
                        is_exclusive: true
                      }
                    ]
                  );

                  $.each(el,
                      function(column, content) {

                          let td = $(editable_html)

                          let listener = new window.keypress.Listener(td, listener_defaults);

                          if (do_not_display.has(column)) return

                          let clickAction = function() { console.log('Do something different');}

                          let fillAction = (function(column) {
                            return function(td) {
                                let tableInfo = $(td).data('tableInfo');

                                let content = data.data[tableInfo.nRow][tableInfo.column];

                                td.text(content);

                                if (    ((column == 'TEXT') || (column == 'TOKEN'))
                                    && (data.meta.fields.includes('ocrconf'))) {

                                    td.css('background-color', data.data[tableInfo.nRow]['ocrconf']);
                                }

                            }; })(column);

                          let head_html = `
                            <th id="${column}">
                                <div class="d-flex align-items-center" ><div class="flex-grow-1">${column}</div></div>
                            </th>`;

                          if (!($("th#" + column.replace(/\./g, "\\.")).length)) {
                            $("#tablehead").append(head_html);
                          }

                          if (column == 'No.') {
                            clickAction = makeLineSplitMerge;
                          }
                          else if ((column == 'TEXT') || (column == 'TOKEN') || (column == 'ID'))  {

                            clickAction = makeTdEditable;

                            listener.simple_combo('enter', function() { $(td).click(); });

                            if (column == 'ID') {
                                fillAction =
                                    function(td) {

                                        let tableInfo = $(td).data('tableInfo');

                                        let content = data.data[tableInfo.nRow]['ID'];

                                        if (String(content).match(/^Q[0-9]+.*/g) == null) {
                                            td.text(content);
                                        }
                                        else {
                                            td.html("");

                                            var reg = /.*?(Q[0-9]+).*?/g;
                                            var result;
                                            let count = 0;
                                            while((element = reg.exec(content)) !== null) {

                                                if (count > 2) break;

                                                console.log(element);
                                                let link = $('<a href="https://www.wikidata.org/wiki/' + element[1] + '">' +
                                                        element[1] + "</a>")
                                                link.click(
                                                    function(event) {
                                                        event.stopPropagation();
                                                    }
                                                );

                                                td.append(link);
                                                td.append($("<br>"))
                                                count++;
                                            }
                                        }
                                    };
                            }
                          }
                          else if ((column == 'NE-TAG') || (column == 'NE-EMB')) {
                            clickAction = makeTagEdit;

                            function tagAction(tag) {

                                tableInfo = $(td).data('tableInfo');

                                data.data[tableInfo.nRow][tableInfo.column] = tag;

                                td.html(tag);
                                colorCodeNETag();
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
                             data('tableInfo',
                                    {'nRow': nRow,
                                     'column': column ,
                                     'clickAction': clickAction,
                                     'fillAction': fillAction
                                    });

                          fillAction(td);

                          row.append(td);
                      });

                  $("#table tbody").append(row);
              });

        colorCodeNETag();

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

                          if (do_not_display.has(column_name)) return;

                          let td = $(columns[pColumn]);

                          tableInfo = td.data('tableInfo');

                          tableInfo.nRow = nRow;

                          td.data('tableInfo', tableInfo);

                          tableInfo.fillAction(td);

                          pColumn++;
                      });

                   pRow++;
              });

        colorCodeNETag();

        if ($("#docpos").val() != startIndex) {

            $("#docpos").val(data.data.length - startIndex);
        }

        if ($(':focus').data('tableInfo'))
            updatePreview($(':focus').data('tableInfo').nRow);
    }

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

    function init() {

        $("#tableregion").empty();

        $("#btn-region").empty();

        $("#file-region").empty();

        $("#region-right").empty();

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
                <tr id="tablehead">
                    <th style="width: 15%">
                        <div class="d-flex align-items-center" id="location">LOCATION</div>
                    </th>
                </tr>
                </thead>
                <tbody id="table-body"></tbody>
            </table>
            <br/>
            <br/>
            `;

        let save_html =
            `<button class="btn btn-primary saveButton" id="save" disabled tabindex="-1">Save Changes</button>`;

        $("#tableregion").html(table_html);

        $("#btn-region").html(save_html);

        $("#save").attr('disabled', !has_changes);

        let parts = file.name.split(/(?=[\.|\-|_])/);

        let heading = parts.join("&shy;")

        $("#file-region").html('<h3>' + heading + '</h3>');

        $('.saveButton').on('click', saveFile);

        $('#table').on('click',
            function(event) {

                let target = event.target.closest('.editable');

                if (target == null) return;

                if (editingTd) {

                    if (target == $(':focus')) return;
                    if ($.contains($(':focus')[0], target)) return;
                    if ($.contains(target, $(':focus')[0])) return;
                    if ($.contains($('.simple-keyboard')[0], event.target)) return;

                    let refocus = $(':focus');

                    editingTd.finish(true);

                    refocus.focus();

                }

                if (!$.contains($('#table')[0], target)) return

                $(target).data('tableInfo').clickAction(target);
            });


        createTable();

        let prev_button_html=`
            <button class="btn btn-link float-left algin-middle" id="back" tabindex="-1"><<</button>
        `;

        let next_button_html= `
            <button class="btn btn-link float-right align-middle" id="next" tabindex="-1">>></button>
        `;

        $("#location").prepend(prev_button_html);
        $("#tablehead").children().last().children().last().append(next_button_html);

        $('#back').on('click', function() { stepsBackward(displayRows); } );
        $('#next').on('click', function() { stepsForward(displayRows); } );

    }

    $('#tableregion')[0].addEventListener("wheel",
        function(event) {

            if (editingTd != null) return true;

            if (event.deltaY < 0) stepsBackward(1);
            else stepsForward(1);
        });

    wnd_listener.simple_combo('tab',
        function () {
            if (editingTd != null)
                return false; // If we are in editing mode, we do not want to propagate the TAB event.
            else return true; // In non-editing mode, we want to get the "normal" tab behaviour.
        });

    wnd_listener.simple_combo('pageup',
        function() {
            if (editingTd != null) return true;

            $('#back').click();
        });

    wnd_listener.simple_combo('pagedown',
        function() {
            if (editingTd != null) return true;

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

     wnd_listener.register_combo(
        {
            keys: 'meta up',
            on_keydown:
                function() {
                    if (editingTd != null) return true;

                    stepsBackward(1);
                },
            is_solitary: true
        }
    );

     wnd_listener.register_combo(
        {
            keys: 'up',

            on_keydown:
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
                },
            is_solitary : true
        });

    wnd_listener.register_combo(
        {
            keys: 'meta down',

            on_keydown: function() {
                if (editingTd != null) return true;

                stepsForward(1);
            },
            is_solitary: true
        }
    );

    wnd_listener.register_combo(
        {
        keys : 'down',
        on_keydown:
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
            },
        is_solitary: true,
        }
    );


    wnd_listener.sequence_combo('l a',
        function() {

            if (editingTd != null) return true;

            displayRows++;

            endIndex = startIndex + displayRows;

            if (endIndex >= data.data.length) {
                startIndex = data.data.length - displayRows;
                endIndex = data.data.length;
            }

            slider_min = displayRows;
            slider_max = data.data.length;

            init();
        });

    wnd_listener.sequence_combo('l r',
        function() {

            if (editingTd != null) return true;

            if (displayRows > 5) displayRows--;

            endIndex = startIndex + displayRows;
            slider_min = displayRows;
            slider_max = data.data.length;

            init();
        });

    // public interface
    let that =
        {
            hasChanges: function () { return has_changes; }
        };

    init();

    return that;
}


$(document).ready(
    function() {

        $('#tsv-file').change(
            function(evt) {

                loadFile ( evt,
                    function(results, file, urls) {

                        let neat = setupInterface(results, file, urls);

                        $(window).bind("beforeunload",
                            function() {

                                console.log(neat.hasChanges());

                                if (neat.hasChanges())
                                    return confirm("You have unsaved changes. Do you want to save them before leaving?");
                            }
                        );
                    })
            }
        );
    }
);
