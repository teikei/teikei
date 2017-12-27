# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryBot.define do
  factory :faq do
    question 'MyString'
    answer 'MyString'
    locale 'MyString'
    enabled false
    priority 1
  end
end
