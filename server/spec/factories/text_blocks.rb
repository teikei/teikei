# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryBot.define do
  factory :text_block do
    name 'MyString'
    title 'MyString'
    body 'MyText'
    locale 'MyString'
    body_format 'haml'
    public false
  end
end
