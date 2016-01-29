ActiveAdmin.register_page "Dashboard" do

  menu :priority => 1, :label => proc{ I18n.t("active_admin.dashboard") }

  content :title => proc{ I18n.t("active_admin.dashboard") } do
    panel "Teikei" do
      if Rails.env.development?
        para %(Currently deployed: #{link_to(`git rev-parse --short HEAD`, "https://github.com/teikei/teikei/commit/#{`git rev-parse HEAD`}")}).html_safe
      else
        para %(Currently deployed: #{link_to(`echo REVISION`, "https://github.com/teikei/teikei/commit/#{`echo REVISION`}")}).html_safe
      end

    end
    columns do
      column do
        panel "Statistics" do
          para " There are #{Place.count} places: #{Depot.count} depots, #{Farm.count} farms"
        end
      end
      column do
        panel "Most recent Farm activity" do
          ul do
            Farm.order("updated_at desc").limit(10).find_each do |farm|
              li link_to(farm.name, admin_farm_path(farm))
            end
          end
        end
      end
      column do
        panel "Most recent Depot activity" do
          ul do
            Depot.order("updated_at desc").limit(10).find_each do |depot|
              li link_to(depot.name, admin_depot_path(depot))
            end
          end
        end
      end
    end
  end
end
