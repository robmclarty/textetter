module Textetter
  module ActionViewExtensions

    def textetter_form_for(record, *args, &block)
      options = args.extract_options!
      options.merge!({
        :builder => TextetterFormBuilder,
        :html => { :id => 'textetter-form' } # TODO: this overwrites any existing html options passed to the function.
      })
      puts options

      content_tag :div, 
          :id => 'textetter-container',
          'data-pictures-path' => '/path/to/pictures',
          'data-new-picture-path' => '/path/to/new/picture' do
        form_for(record, *(args << options), &block) +
        preview_markup(record)
      end
    end

    def textetter_extra_settings(&block)
      content_tag :div, 
          :id => 'textetter-extra-settings', 
          :class => 'textetter-extra-settings' do
        capture(&block)
      end
    end

    private

    def preview_markup(object)
      content_tag :div, :class => 'textetter-preview-container' do
        content_tag :div, :class => 'textetter-preview-page-container' do
          preview_errors_markup(object) if object.errors.any?
          content_tag :h1, :id => 'textetter-title-preview' do
            object.name.blank? ? 'Title Preview' : object.name
          end.concat(content_tag(:div, '', :id => 'wmd-preview', :class => 'textetter-preview'))
        end
      end
    end

    def preview_errors_markup(object)
      content_tag :div, :id => 'error_explanation' do
        content_tag :h2 do
          pluralize(object.errors.count, 'error') +
          "prohibited this post from being saved:"
        end
        content_tag :ul do
          object.errors.full_messages.each do |msg|
            content_tag :li, msg
          end
        end
      end
    end

  end
end

ActionView::Base.send :include, Textetter::ActionViewExtensions
