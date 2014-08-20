# encoding: utf-8

module EOL
  # Uses paperclip to handle logo icons
  module Logos
    def Logos.included?
      has_attached_file :logo,
        # TODO - check if path is deprecated
        path: Rails.configuration.logo_uploads.paperclip_path,
        url: Rails.configuration.logo_uploads.paperclip_url,
        default_url: "/assets/blank.gif"
      validates_attachment_content_type :logo,
        message: I18n.t(:logo_type_error),
        content_type: %w(image/pjpeg image/jpeg image/png image/gif image/x-png)
      validates_attachment_size :logo,
        in: 0..Rails.configuration.logo_uploads.max_size
    
    end

    def logo_url(opts = {})
      if !logo_file_name.blank? &&
         !Rails.configuration.use_content_server_for_thumbnails
        Rails.configuration.logo_uploads.paperclip_url +
          ImageManipulation.local_file_name(self)
      elsif self.logo_cache_url.blank?
        "v2/logos/#{self.class.name.underscore}_default.png"
      else
        link = opts[:linked?] ? $SINGLE_DOMAIN_CONTENT_SERVER : nil
        DataObject.image_cache_path(
          logo_cache_url,
          opts[:size] == :small ? "88_88" : "130_130",
          specified_content_host: link
        )
      end
    end

    # override the logo_url column in the database to construct the
    # path on the content server
    # def logo_url(size = "large", specified_content_host = nil)
    #   if !logo_file_name.blank? && ! Rails.configuration.
    #     use_content_server_for_thumbnails
    #     # TODO - this is failing in some specs; #logo undefined. Why?!
    #     Rails.configuration.logo_uploads.paperclip_url +
    #       ImageManipulation.local_file_name(self)
    #   elsif logo_cache_url.blank?
    #     return "v2/logos/#{self.class.name.underscore}_default.png"
    #   elsif size.to_s == "small"
    #     DataObject.image_cache_path(
    #       logo_cache_url, "88_88",
    #       specified_content_host: specified_content_host
    #     )
    #   else
    #     DataObject.image_cache_path(
    #       logo_cache_url, "130_130",
    #       specified_content_host: specified_content_host
    #     )
    #   end
    # end
  end
end
