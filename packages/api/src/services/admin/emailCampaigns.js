import createService from "feathers-objection";

import EmailCampaign from "../../models/emailCampaigns";
import { setCreatedAt, setUpdatedAt } from "../../hooks/audit";
import BaseModel from "../../models/base";
import { disallowIfCampaignsDisabled } from "../../hooks/email";

const BROADCAST_ALLOWED_TEMPLATES = ["bio_certification_update"];

const addEmailMessagesForAllUsersToQueue = async (campaignId) => {
  await BaseModel.knex().raw(
    `insert into email_messages (user_id, campaign_id)
    select id, ${campaignId} from users
    where is_verified = true
    and state in ('RECENT_LOGIN', 'REMINDER_SENT', 'SECOND_REMINDER_SENT)`,
  );
};

export default (app) => {
  const service = createService({
    model: EmailCampaign,
    whitelist: ["$ilike"],
    paginate: {
      default: 50,
    },
  });
  app.use("/admin/email-campaigns", service);

  app.service("/admin/email-campaigns").hooks({
    before: {
      create: [
        disallowIfCampaignsDisabled(app),
        setCreatedAt,
        (ctx) => {
          ctx.params.status = ctx.params.status || "CREATED";
          return ctx;
        },
      ],
      find: [],
      get: [],
      update: [disallowIfCampaignsDisabled(app), setUpdatedAt],
      patch: [
        disallowIfCampaignsDisabled(app),
        setUpdatedAt,
        async (ctx) => {
          const previousCampaignData = await EmailCampaign.query().findById(
            ctx.id,
          );
          if (
            previousCampaignData.status === "CREATED" &&
            BROADCAST_ALLOWED_TEMPLATES.includes(
              previousCampaignData.template,
            ) &&
            ctx.data.status === "SENT"
          ) {
            await addEmailMessagesForAllUsersToQueue(ctx.id);
          }
        },
      ],
      remove: [disallowIfCampaignsDisabled(app)],
    },
    after: {
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: [],
    },
  });
};
