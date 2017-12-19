class CreateTableGoals < ActiveRecord::Migration
  def change
    create_table :goals do |t|
      t.integer :key
      t.string :description
    end
    Goal.create(key: 0, description: 'Wir suchen Land oder Hof')
    Goal.create(key: 1, description: 'Wir suchen GärtnerInnnen oder LandwirtInnen')
    Goal.create(key: 2, description: 'Wir suchen Mitglieder für unser Organisationsteam')
    Goal.create(key: 3, description: 'Wir suchen KonsumentInnen')
  end
end
