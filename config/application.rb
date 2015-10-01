require File.expand_path('../boot', __FILE__)
require 'rails/all'

Bundler.require(*Rails.groups)

module Teikei
  class Application < Rails::Application

    config.generators do |g|

      g.test_framework :rspec, fixture: true
      g.fixture_replacement :factory_girl


      g.view_specs false
      g.helper_specs false
    end

    config.active_record.raise_in_transactional_callbacks = true
    config.autoload_paths += %W(#{config.root}/lib)
    config.autoload_paths += Dir["#{config.root}/lib/**/"]

    config.assets.initialize_on_precompile = true

    config.i18n.default_locale = :de
    I18n.config.enforce_available_locales = true
    I18n.available_locales = [:de, :en]
    I18n.locale = :de

    config.assets.paths << Rails.root.join('node_modules')
  end
end

ActiveSupport::JSON::Encoding.time_precision = 0

