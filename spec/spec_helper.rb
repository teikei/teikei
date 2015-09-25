require 'coveralls'
Coveralls.wear!

RSpec.configure do |config|

  begin
    config.filter_run :focus
    config.run_all_when_everything_filtered = true

    config.disable_monkey_patching!

    if config.files_to_run.one?
      config.default_formatter = 'doc'
    end

    config.profile_examples = 10
    config.order = :random

    Kernel.srand config.seed
  end
end
