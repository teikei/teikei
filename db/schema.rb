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

ActiveRecord::Schema.define(version: 20150409211519) do

  create_table "active_admin_comments", force: :cascade do |t|
    t.string   "resource_id",   limit: 255,   null: false
    t.string   "resource_type", limit: 255,   null: false
    t.integer  "author_id",     limit: 4
    t.string   "author_type",   limit: 255
    t.text     "body",          limit: 65535
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "namespace",     limit: 255
  end

  add_index "active_admin_comments", ["author_type", "author_id"], name: "index_active_admin_comments_on_author_type_and_author_id", using: :btree
  add_index "active_admin_comments", ["namespace"], name: "index_active_admin_comments_on_namespace", using: :btree
  add_index "active_admin_comments", ["resource_type", "resource_id"], name: "index_active_admin_comments_on_resource_type_and_resource_id", using: :btree

  create_table "faqs", force: :cascade do |t|
    t.string   "question",   limit: 255
    t.string   "answer",     limit: 255
    t.string   "locale",     limit: 255
    t.boolean  "enabled"
    t.integer  "priority",   limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "images", force: :cascade do |t|
    t.string   "file",        limit: 255
    t.string   "description", limit: 255
    t.integer  "place_id",    limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "ownerships", force: :cascade do |t|
    t.integer "place_id",         limit: 4
    t.integer "user_id",          limit: 4
    t.boolean "contact_by_email",           default: false
    t.boolean "contact_by_phone",           default: false
  end

  add_index "ownerships", ["place_id", "user_id"], name: "index_ownerships_on_place_id_and_user_id", using: :btree

  create_table "place_connections", force: :cascade do |t|
    t.integer "place_a_id", limit: 4, null: false
    t.integer "place_b_id", limit: 4, null: false
  end

  create_table "places", force: :cascade do |t|
    t.string   "name",                           limit: 255
    t.string   "address",                        limit: 255
    t.string   "city",                           limit: 255
    t.decimal  "latitude",                                     precision: 15, scale: 10
    t.decimal  "longitude",                                    precision: 15, scale: 10
    t.string   "accepts_new_members",            limit: 255,                             default: "yes"
    t.boolean  "is_established",                                                         default: true
    t.text     "description",                    limit: 65535
    t.integer  "maximum_members",                limit: 4
    t.text     "vegetable_products",             limit: 65535
    t.text     "participation",                  limit: 65535
    t.string   "type",                           limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "contact_function",               limit: 255
    t.string   "url",                            limit: 255
    t.integer  "founded_at_year",                limit: 4
    t.integer  "founded_at_month",               limit: 4
    t.boolean  "acts_ecological",                                                        default: false
    t.string   "economical_behavior",            limit: 255
    t.string   "animal_products",                limit: 255
    t.string   "beverages",                      limit: 255
    t.text     "additional_product_information", limit: 65535
    t.text     "delivery_days",                  limit: 65535
  end

  create_table "roles", force: :cascade do |t|
    t.string   "name",          limit: 255
    t.integer  "resource_id",   limit: 4
    t.string   "resource_type", limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "roles", ["name", "resource_type", "resource_id"], name: "index_roles_on_name_and_resource_type_and_resource_id", using: :btree
  add_index "roles", ["name"], name: "index_roles_on_name", using: :btree

  create_table "text_blocks", force: :cascade do |t|
    t.string   "name",       limit: 255
    t.string   "title",      limit: 255
    t.text     "body",       limit: 65535
    t.string   "locale",     limit: 255
    t.boolean  "public"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "users", force: :cascade do |t|
    t.string   "email",                  limit: 255, default: "", null: false
    t.string   "encrypted_password",     limit: 255, default: "", null: false
    t.string   "reset_password_token",   limit: 255
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          limit: 4,   default: 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip",     limit: 255
    t.string   "last_sign_in_ip",        limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "name",                   limit: 255, default: "", null: false
    t.string   "confirmation_token",     limit: 255
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string   "unconfirmed_email",      limit: 255
    t.string   "phone",                  limit: 255
  end

  add_index "users", ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true, using: :btree
  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree

  create_table "users_roles", id: false, force: :cascade do |t|
    t.integer "user_id", limit: 4
    t.integer "role_id", limit: 4
  end

  add_index "users_roles", ["user_id", "role_id"], name: "index_users_roles_on_user_id_and_role_id", using: :btree

  create_table "versions", force: :cascade do |t|
    t.string   "item_type",  limit: 255,   null: false
    t.integer  "item_id",    limit: 4,     null: false
    t.string   "event",      limit: 255,   null: false
    t.string   "whodunnit",  limit: 255
    t.text     "object",     limit: 65535
    t.datetime "created_at"
  end

  add_index "versions", ["item_type", "item_id"], name: "index_versions_on_item_type_and_item_id", using: :btree

end
