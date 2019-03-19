import source_tmpl from './source.html';
import type_tmpl from './type.html';
import { scrapeSource } from '../../api';
import { getHeaderOffset, htmlChildContent } from '../../shared';

export const renderSource = () => {
    let header = htmlChildContent('HeaderTemplate', source_tmpl);
    let html = htmlChildContent('BodyTemplate', source_tmpl);
    let tp = (window.innerHeight * 0.2 < getHeaderOffset()) ? getHeaderOffset() + 20 : window.innerHeight * 0.2;

    $(document.body).append(html);

    $('#source_details').dialog({
        modal: false,
        position: { my: "center top+" + tp, at: "center top", of: $('#docs-container') },
        width: 600,
        height: 600,
        minWidth: 500,
        maxWidth: 800,
        minHeight: 400,
        maxHeight: 650,
        open: function () {
            //add new custom header
            $(this).prev('.ui-dialog-titlebar').css('padding-top', '3.5em').html(header);

            $('#close_source_details').bind('click', function () {
              $("#source_details").dialog('close');
            });
        },
        close: function () {
            $(this).remove();
        }
        }).parent().draggable({
        containment: '#docs-container'
    });
}

export const renderType = () => {
    let header = htmlChildContent('HeaderTemplate', type_tmpl);
    let html = htmlChildContent('BodyTemplate', type_tmpl);
    let tp = (window.innerHeight * 0.2 < getHeaderOffset()) ? getHeaderOffset() + 20 : window.innerHeight * 0.2;

    $(document.body).append(html);

    $('#type_details').dialog({
        modal: false,
        position: { my: "center top+" + tp, at: "center top", of: $('#docs-container') },
        width: 600,
        height: 'auto',
        minWidth: 500,
        maxWidth: 800,
        minHeight: 400,
        maxHeight: 650,
        open: function () {
            //add new custom header
            $(this).prev('.ui-dialog-titlebar').css('padding-top', '3.5em').html(header);

            $('#close_type_details').bind('click', function () {
              $("#type_details").dialog('close');
            });
        },
        close: function () {
            $(this).remove();
        }
        }).parent().draggable({
        containment: '#docs-container'
    });
}
