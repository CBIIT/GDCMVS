import source_tmpl from './source.html';
import type_tmpl from './type.html';
import { scrapeSource } from '../../api';
import { getHeaderOffset, htmlChildContent } from '../../shared';

export const renderSource = () => {
    let header_template = htmlChildContent('HeaderTemplate', source_tmpl);
    let body_template = htmlChildContent('BodyTemplate', source_tmpl);
    let tp = (window.innerHeight * 0.2 < getHeaderOffset()) ? getHeaderOffset() + 20 : window.innerHeight * 0.2;
    let header = $.templates(header_template).render();
    let html = $.templates(body_template).render();

    $(document.body).append(html);

    $('#source_details').dialog({
        modal: false,
        position: { my: "center top+" + tp, at: "center top", of: $('#docs-container') },
        width: 600,
        height: 450,
        minWidth: 420,
        maxWidth: 800,
        minHeight: 350,
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
    let header_template = htmlChildContent('HeaderTemplate', type_tmpl);
    let body_template = htmlChildContent('BodyTemplate', type_tmpl);
    let tp = (window.innerHeight * 0.2 < getHeaderOffset()) ? getHeaderOffset() + 20 : window.innerHeight * 0.2;
    let header = $.templates(header_template).render();
    let html = $.templates(body_template).render();

    $(document.body).append(html);

    $('#type_details').dialog({
        modal: false,
        position: { my: "center top+" + tp, at: "center top", of: $('#docs-container') },
        width: 600,
        height: 450,
        minWidth: 420,
        maxWidth: 800,
        minHeight: 350,
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