class TextetterFormBuilder < ActionView::Helpers::FormBuilder
  
  def textetter_title(label, *args)
    options = args.extract_options!
    options.merge!({ 
      :id => 'textetter-title-input', 
      :class => 'textetter-title-input'
    })

    @template.content_tag :div, 
        :class => 'textetter-default-settings',
        :id => 'textetter-default-settings' do
      text_field(label, *(args << options)) +
      @template.link_to('More', '#',
        :class => 'textetter-button more', 
        :id => 'textetter-button-more', 
        :title => 'More Settings')
    end
  end

  # Wrap regular text area in additional markup and include custom classes.
  def textetter_body(label, *args)
    options = args.extract_options!
    options.merge!({ 
      :id => 'wmd-input', 
      :class => 'wmd-input'
    })

    @template.content_tag :div, :class => 'textetter-body-container' do
      @template.content_tag(:div, '',
          :class => 'textetter-controls',
          :id => 'wmd-button-bar') +
      text_area(label, *(args << options))
    end
  end

  # Create some javascript markup that will submit the form based on a 
  # click event of any DOM object with an id of `button_id`.
  def textetter_js_submit(button_id)
    #
  end

end
