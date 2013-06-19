$(function() {

  // Change the height of the rich input textarea based on the current size of the viewport.
  function updateRichInputHeight() {
    var viewport_height = $(window).height();
    var settings_height = $('#textetter-default-settings').height() + parseInt($('#textetter-default-settings').css('padding-top'));
    var controls_height = $('#wmd-button-bar').height();
    var top_and_bottom_padding = parseInt($('#wmd-input').css('padding-top')) + parseInt($('#wmd-input').css('padding-bottom'));
    var new_height = viewport_height - settings_height - controls_height - top_and_bottom_padding;
    console.log(new_height);
    $('#wmd-input').height(new_height);
  }

  // Only run the following content-editor functions if there is a content-editor-form that exists.
  if ($('#textetter-form').length > 0) {
    $(window).ready(function() {
      $(window).bind({
        load: function() {
          updateRichInputHeight();
        },
        resize: function() {
          updateRichInputHeight();
        }
      });
    });

    // Submit editor-form when save-button is clicked.
    $('#save-button').click(function(e) {
      e.preventDefault();
      $('#content-editor-form').submit();
      return false;
    })

    // Additional input fields
    $('#textetter-button-more').click(function(e) {
      e.preventDefault();
      $('#textetter-extra-settings').toggle();
      updateRichInputHeight();
      return false;
    });

    // Mirror preview title with the value of the input title
    $('#textetter-title-input').bind('keyup keypress blur', function() {
      if ($(this).val() === '') {
        if ($(this).hasClass('blog-post-title')) { // Blog Posts use the H2 style and not H1
          $('#textetter-description-preview').html('Post Title');
        } else {
          $('#textetter-title-preview').html('Page Title');
        }
      } else {
        if ($(this).hasClass('blog-post-title')) { // Blog Posts use the H2 style and not H1
          $('#textetter-description-preview').html($(this).val());
        } else {
          $('#textetter-title-preview').html($(this).val());
        }
      }
    });

    // Mirror the description with the value of the input
    $('#wmd-description-input').bind('keyup keypress blur', function() {
      if ($(this).val() === '') {
        $('#wmd-description-preview').html('Page Description');
      } else {
        $('#wmd-description-preview').html($(this).val());
      }
    });

    // Enabled tabs within the wmd-input field (textarea) rather than the default
    // behaviour of skipping ot the next form field.
    $('#wmd-input').keydown(function(e) {
      if(e.keyCode === 9) { // tab was pressed
        // get caret position/selection
        var start = this.selectionStart;
        var end = this.selectionEnd;

        var $this = $(this);
        var value = $this.val();

        // set textarea value to: text before caret + tab + text after caret
        $this.val(value.substring(0, start)
                    + "\t"
                    + value.substring(end));

        // put caret at right position again (add one for the tab)
        this.selectionStart = this.selectionEnd = start + 1;

        // prevent the focus lose
        e.preventDefault();
      }
    });

    // Start up PageDown editor for any editor areas.
    var converter = Markdown.getSanitizingConverter();
    var help = function() { window.open('http://daringfireball.net/projects/markdown/syntax', '_markdown_syntax'); }
    var editor = new Markdown.Editor(converter, '', { handler: help });

    // =============================
    // Start Embeded Images Controls
    // =============================
    editor.hooks.set("insertImageDialog", function (callback) {
      // Expects two data attributes to exist on the #wmd-editor-container tag to pass two paths to javascript:
      var PICTURE_LIST_PATH = $('#wmd-editor-container').attr('data-pictures-path');
      var PICTURE_NEW_FORM_PATH = $('#wmd-editor-container').attr('data-new-picture-path'); // Currently, new images are posted through an iframe form; the form itself renders with the POST path

      // Setup HTML template for embedded images.
      var templateEmbededImagesModal = SMT['content-editor/embeded-images-modal']({ new_image_form_path: PICTURE_NEW_FORM_PATH });
      $('body').append(templateEmbededImagesModal);

      // Save main containers to variables for easier reference.
      var dialog_container = $('#embeded-images-container');
      var dialog = $('#embeded-images');
      var main_content_container = $('#container');
      var nav = $('#embeded-images-nav');
      var section_select = $('#embeded-images-section-select');
      var section_upload = $('#embeded-images-section-upload');
      var section_url = $('#embeded-images-section-url');

      // Initialize embeded images dialog.
      section_select.show();
      section_upload.hide();
      section_url.hide();

      // Setup tab navigation links.
      $('#embeded-images-tab-select').click(function (e) {
        e.preventDefault();
        $('#embeded-images-nav ul li').removeClass('selected');
        $(this).parent().addClass('selected');        
        section_select.show();
        section_upload.hide();
        section_url.hide();        
        load_image_list(); // re-load images

        return false;
      });
      
      $('#embeded-images-tab-upload').click(function (e) {
        e.preventDefault();
        $('#embeded-images-nav ul li').removeClass('selected');
        $(this).parent().addClass('selected');
        section_select.hide();
        section_upload.show();
        section_url.hide();

        return false;
      });

      $('#embeded-images-tab-url').click(function (e) {
        e.preventDefault();
        $('#embeded-images-nav ul li').removeClass('selected');
        $(this).parent().addClass('selected');
        section_select.hide();
        section_upload.hide();
        section_url.show();

        return false;
      });

      // Toggle delete image links.
      $('#embeded-images-delete-toggle').click(function(e) {
        e.preventDefault();
        $('a.embeded-image-delete-button').toggle();

        return false;
      });

      // Return null and close dialog when cancelled.
      $('#embeded-images-tab-cancel').click(function (e) {
        e.preventDefault();
        dialog_container.detach();
        callback(null);

        return false;
      });

      // Return the value of the input text box when the "insert" button
      // is pressed on the "Insert URL" tab.
      $('#embeded-images-url-insert').click(function (e) {
        e.preventDefault();
        callback($('#embeded-images-url-input').val());
        dialog_container.detach();

        return false;
      });

      // Load existing image library (newest to oldest).
      function load_image_list() {        
        $.ajax({
          url: PICTURE_LIST_PATH,
          type: 'GET',
          dataType: 'json',
          processData: false,
          contentType: false,
          cache: false,
          success: function (data) {
            var number_of_images = data.length;
            var images_container = $('#embeded-images-list');
            images_container.html(''); // Make sure there's nothing already in the container.

            for (var i = 0; i < number_of_images; i += 1) { // Ouput links and thumbnails for each image.
              var templateImageDeleteButton = '';
              console.log(data[i]);

              // if (data[i][3] > 0) { // Only include the delete button link for images that are not the post's main banner images (this is edited on the actual post form).
              //   //image_delete_button_markup = Mustache.render($('#template-embeded-images-delete-button').html(), { image_id: data[i][3] });
              //   templateImageDeleteButton = SMT['content-editor/embeded-images-delete-button']({ image_id: data[i][3] });
              // }

              //templateImageDeleteButton = SMT['content-editor/embeded-images-delete-button']({ image_id: data[i]['id'] });

              //templateImageDeleteButton = '<a href="/pictures/' + data[i]['id'] + '/delete" class="embeded-image-delete-button" data-image-id="' + data[i]['id'] + '">X</a>';

              var imageThumbnailData = { 
                image_id: data[i]['id'], 
                image_large_path: data[i]['large_path'], 
                image_thumbnail_path: data[i]['thumbnail_path'],
                image_delete_path: "/pictures/" + data[i]['id']
              };
              //var image_item_markup = Mustache.render($('#template-embeded-images-item').html(), image_item_json);
              var templateImageThumbnail = SMT['content-editor/embeded-images-thumbnail'](imageThumbnailData);

              images_container.prepend(templateImageThumbnail);
            }

            // Capture click event on each image thumbnail to insert it into the page content.
            section_select.find('a.embeded-image-insert').click(function(e) {            
              e.preventDefault();      
              callback($(this).attr('data-image-path'));
              dialog_container.detach();

              return false;
            });

            // Capture click event on each image DELETE button to remove it from the list.
            section_select.find('a.embeded-image-delete-button').click(function(e) {            
              e.preventDefault();              
              if (confirm("Are you sure?")) { // If delete is confirmed, execute, otherwise do nothing.
                var image_id = $(this).attr('data-image-id'); // Putting this in a variable so I can use 'this' in this context.           
                $.ajax({
                  url: this.href.replace(PICTURE_LIST_PATH, ''),
                  type: "POST",                  
                  data: { '_method': 'delete' }, // Using POST + '_method' attribute for better browser compatibility (not all browsers support type 'DELETE')                  
                  success: function(data) {            
                    $("#image-thumb-" + image_id).remove();
                  }
                });
              } 

              return false;
            });
          }
        });
      }

      load_image_list();

      return true; // Tell the editor that we'll take care of getting the image url.
    });
    // ===========================
    // End Embeded Images Controls
    // ===========================

    editor.run();
    updateRichInputHeight();
  }
});