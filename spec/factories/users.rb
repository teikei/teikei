FactoryGirl.define do

  # this user has the default role :user
  factory :user do
    name 'Test User'
    sequence(:email) {|n| "example#{n}@example.com" }
    phone "+49 30 1234567"
    password 'please'
    password_confirmation 'please'

    factory :admin do
      after(:create) do |user|
        user.remove_role(:user)
        user.add_role(:admin)
      end
    end

    factory :superadmin do
      after(:create) do |user|
        user.remove_role(:user)
        user.add_role(:admin)
        user.add_role(:superadmin)
      end
    end

    after(:create) do |user|
      user.confirm
    end
  end
end
