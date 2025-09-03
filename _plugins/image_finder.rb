module Jekyll
  module ImageFinder
    def find_images_by_prefix(input, prefix)
      return [] unless prefix
      
      # Get the site instance
      site = @context.registers[:site]
      assets_dir = File.join(site.source, 'assets')
      
      # Find all files in assets directory that start with the prefix
      images = []
      if Dir.exist?(assets_dir)
        Dir.glob(File.join(assets_dir, "#{prefix}*")).each do |file|
          filename = File.basename(file)
          # Only include image files
          if filename.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)
            images << filename
          end
        end
      end
      
      # Sort the images naturally (handles numeric ordering like asroth1, asroth2, etc.)
      images.sort_by { |name| [name[/\A[^\d]*/, 0], name[/\d+/].to_i] }
    end
  end
end

Liquid::Template.register_filter(Jekyll::ImageFinder)
