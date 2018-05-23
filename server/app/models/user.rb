class User < ActiveRecord::Base
  attr_accessible :role_ids, :as => :admin
  attr_accessible :name, :email, :phone, :password, :password_confirmation
  attr_accessible :remember_me, :origin, :baseurl

  rolify

  devise :database_authenticatable, :registerable,
         :recoverable, :confirmable

  has_paper_trail

  has_many :ownerships, dependent: :destroy
  has_many :places, through: :ownerships

  validates :name, presence: true, length: { maximum: 100 }
  validates :email, presence: true, uniqueness: { case_sensitive: false },
                    email: true, length: { maximum: 100 }
  validates :phone, format: { with: /\A(\+\d)?[\d\s\/-]+\Z/ }, allow_blank: true, length: { maximum: 100 }

  validates :password, presence: true,
                       confirmation: true,
                       length: { within: 6..100 },
                       on: :create
  validates :password, confirmation: true,
                       length: { within: 6..100},
                       allow_blank: true,
                       on: :update

  validates :password_confirmation, presence: true, on: :create
  validates :baseurl, presence: true
  validates_associated :places

  after_create :add_default_role

  def add_default_role
    add_role :user
  end
end
