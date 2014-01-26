FactoryGirl.define do
  factory :depot, parent: :place, class: :depot do
    delivery_days "Monday and Friday"

    factory :orphan_depot do
      after(:create) do |depot|
        user = create(:user).reload
        depot.user = user
        user.destroy
        depot.save
      end
    end
  end
end
