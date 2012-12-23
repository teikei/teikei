FactoryGirl.define do

  # this user has the default role :user
  factory :user do
    name 'Test User'
    email 'example@example.com'
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
          user.add_role(:superadmin)
        end
    end
  end
end
