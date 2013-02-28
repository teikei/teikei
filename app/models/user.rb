class User < ActiveRecord::Base

  #
  # Attribute Handlers
  # ---------------------------------------------------------------------------------------
  #
  #
  #
  #

  # Setup accessible (or protected) attributes for your model
  attr_accessible :role_ids, :as => :admin
  attr_accessible :name, :email, :password, :password_confirmation, :remember_me

  #
  # Constants
  # ---------------------------------------------------------------------------------------
  #
  #
  #
  #

  #
  # Settings
  # ---------------------------------------------------------------------------------------
  #
  #
  #
  #

  #
  # Plugins
  # ---------------------------------------------------------------------------------------
  #
  #
  #
  #

  rolify

  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable,
  # :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable,
         :token_authenticatable

  #
  # Scopes
  # ---------------------------------------------------------------------------------------
  #
  #
  #
  #

  #
  # Associations
  # ---------------------------------------------------------------------------------------
  #
  #
  #
  #

  has_many :places

  #
  # Nested Attributes
  # ---------------------------------------------------------------------------------------
  #
  #
  #
  #

  #
  # Validations
  # ---------------------------------------------------------------------------------------
  #
  #
  #
  #

  # validates :name, uniqueness: { case_sensitive: false }
  # validates :email, presence: true, uniqueness: { case_sensitive: false },
  #                   email: true, length: { maximum: 100 }

  # validates :password, presence: true,
  #                      confirmation: true,
  #                      length: { within: 6..40 },
  #                      on: :create
  # validates :password, confirmation: true,
  #                      length: { within: 6..40},
  #                      allow_blank: true,
  #                      on: :update

  # validates :password_confirmation, presence: true
  # validates :remember_me, inclusion: { :in => [true, false] }
  # validates_associated :places

  #
  # Callbacks
  # ---------------------------------------------------------------------------------------
  #
  #
  #
  #

  after_create :add_default_role

  #
  # Instance Methods
  # ---------------------------------------------------------------------------------------
  #
  #
  #
  #

  def add_default_role
    add_role :user
  end

  #
  # Class Methods
  # ---------------------------------------------------------------------------------------
  #
  #
  #
  #

  #
  # Protected
  # ---------------------------------------------------------------------------------------
  #
  #
  #
  #

protected

  #
  # Private
  # ---------------------------------------------------------------------------------------
  #
  #
  #
  #

private


end

