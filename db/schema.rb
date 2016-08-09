# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20160203034215) do

  # These are extensions that must be enabled in order to support this database
  enable_extension 'plpgsql'
  enable_extension 'pg_trgm'

  create_table 'active_admin_comments', id: :bigserial, force: :cascade do |t|
    t.text 'resource_id', null: false
    t.text 'resource_type', null: false
    t.integer 'author_id', limit: 8
    t.text 'author_type'
    t.text 'body'
    t.datetime 'created_at', null: false
    t.datetime 'updated_at', null: false
    t.text 'namespace'
  end

  add_index 'active_admin_comments', %w(author_type author_id), name: 'idx_16563_index_active_admin_comments_on_author_type_and_author', using: :btree
  add_index 'active_admin_comments', ['namespace'], name: 'idx_16563_index_active_admin_comments_on_namespace', using: :btree
  add_index 'active_admin_comments', %w(resource_type resource_id), name: 'idx_16563_index_admin_notes_on_resource_type_and_resource_id', using: :btree

  create_table 'faqs', id: :bigserial, force: :cascade do |t|
    t.text 'question'
    t.text 'answer'
    t.text 'locale'
    t.boolean 'enabled'
    t.integer 'priority', limit: 8
    t.datetime 'created_at'
    t.datetime 'updated_at'
  end

  create_table 'images', id: :bigserial, force: :cascade do |t|
    t.text 'file'
    t.text 'description'
    t.integer 'place_id', limit: 8
    t.datetime 'created_at', null: false
    t.datetime 'updated_at', null: false
  end

  create_table 'ownerships', id: :bigserial, force: :cascade do |t|
    t.integer 'place_id', limit: 8
    t.integer 'user_id', limit: 8
    t.boolean 'contact_by_email', default: false
    t.boolean 'contact_by_phone', default: false
  end

  add_index 'ownerships', %w(place_id user_id), name: 'idx_16590_index_ownerships_on_place_id_and_user_id', using: :btree

  create_table 'place_connections', id: :bigserial, force: :cascade do |t|
    t.integer 'place_a_id', limit: 8, null: false
    t.integer 'place_b_id', limit: 8, null: false
  end

  create_table 'places', id: :bigserial, force: :cascade do |t|
    t.text 'name'
    t.text 'address'
    t.text 'city'
    t.decimal 'latitude', precision: 15, scale: 10
    t.decimal 'longitude', precision: 15, scale: 10
    t.text 'accepts_new_members', default: 'yes'
    t.boolean 'is_established', default: true
    t.text 'description'
    t.integer 'maximum_members', limit: 8
    t.text 'vegetable_products'
    t.text 'participation'
    t.text 'type'
    t.datetime 'created_at', null: false
    t.datetime 'updated_at', null: false
    t.text 'contact_function'
    t.text 'url'
    t.integer 'founded_at_year', limit: 8
    t.integer 'founded_at_month', limit: 8
    t.boolean 'acts_ecological', default: false
    t.text 'economical_behavior'
    t.text 'animal_products'
    t.text 'beverages'
    t.text 'additional_product_information'
    t.text 'delivery_days'
  end

  create_table 'roles', id: :bigserial, force: :cascade do |t|
    t.text 'name'
    t.integer 'resource_id', limit: 8
    t.text 'resource_type'
    t.datetime 'created_at', null: false
    t.datetime 'updated_at', null: false
  end

  add_index 'roles', %w(name resource_type resource_id), name: 'idx_16616_index_roles_on_name_and_resource_type_and_resource_id', using: :btree
  add_index 'roles', ['name'], name: 'idx_16616_index_roles_on_name', using: :btree

  create_table 'text_blocks', id: :bigserial, force: :cascade do |t|
    t.text 'name'
    t.text 'title'
    t.text 'body'
    t.text 'locale'
    t.boolean 'public'
    t.datetime 'created_at', null: false
    t.datetime 'updated_at', null: false
  end

  create_table 'users', id: :bigserial, force: :cascade do |t|
    t.text 'email', default: '', null: false
    t.text 'encrypted_password', default: '', null: false
    t.text 'reset_password_token'
    t.datetime 'reset_password_sent_at'
    t.datetime 'remember_created_at'
    t.integer 'sign_in_count', limit: 8, default: 0
    t.datetime 'current_sign_in_at'
    t.datetime 'last_sign_in_at'
    t.text 'current_sign_in_ip'
    t.text 'last_sign_in_ip'
    t.datetime 'created_at', null: false
    t.datetime 'updated_at', null: false
    t.text 'name', default: '', null: false
    t.text 'confirmation_token'
    t.datetime 'confirmed_at'
    t.datetime 'confirmation_sent_at'
    t.text 'unconfirmed_email'
    t.text 'phone'
  end

  add_index 'users', ['confirmation_token'], name: 'idx_16640_index_users_on_confirmation_token', unique: true, using: :btree
  add_index 'users', ['email'], name: 'idx_16640_index_users_on_email', unique: true, using: :btree
  add_index 'users', ['reset_password_token'], name: 'idx_16640_index_users_on_reset_password_token', unique: true, using: :btree

  create_table 'users_roles', id: false, force: :cascade do |t|
    t.integer 'user_id', limit: 8
    t.integer 'role_id', limit: 8
  end

  add_index 'users_roles', %w(user_id role_id), name: 'idx_16651_index_users_roles_on_user_id_and_role_id', using: :btree

  create_table 'versions', id: :bigserial, force: :cascade do |t|
    t.text 'item_type', null: false
    t.integer 'item_id', limit: 8, null: false
    t.text 'event', null: false
    t.text 'whodunnit'
    t.text 'object'
    t.datetime 'created_at'
  end

  add_index 'versions', %w(item_type item_id), name: 'idx_16656_index_versions_on_item_type_and_item_id', using: :btree

end
