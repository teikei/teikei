FactoryBot.define do
  factory :depot, parent: :place, class: :depot do
    delivery_days 'Monday and Friday'

    factory :orphan_depot do
      after(:create) do |depot|
        depot.users = []
      end
    end
  end
end
