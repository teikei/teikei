class TextBlock < ActiveRecord::Base

  attr_accessible :name, :title, :body, :body_format, :locale, :public

  validates :name, :presence   => true,
                   :format     => { :with => /\A[a-z0-9_\-]+\z/}
  validates :locale, :presence => true
  validates :body_format, :presence => true

  def self.block_for(name, locale)

    [ locale, nil, '', 'de', 'en' ].uniq.each do |loc|
      r = TextBlock.where(:name => name, :public => true, :locale => loc)
                   .order("updated_at DESC").first
      return r if r
    end

    nil
  end

end

