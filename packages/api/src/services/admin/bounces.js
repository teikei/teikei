import BaseModel from "../../models/base";

export default (app) => {
  const service = {
    find: async () => {
      const bounces = await BaseModel.knex().raw(`
      SELECT id, email, name, bounce_type, bounce_name from users
      where bounce_type is not null
      or bounce_name is not null
      order by id
      `);
      return bounces.rows.map((b) => ({
        id: b.id,
        name: b.name,
        email: b.email,
        bounceType: b.bounce_type,
        bounceName: b.bounce_name,
      }));
    },
  };

  app.use("/admin/bounces", service);
};
