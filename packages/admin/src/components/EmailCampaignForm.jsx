/* eslint-disable react/jsx-handler-names */
import {
  AutocompleteInput,
  DateInput,
  Form,
  ListButton,
  ReferenceInput,
  required,
  SaveButton,
  SelectInput,
  TextInput,
  useRecordContext,
} from "react-admin"
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Toolbar,
  Typography,
} from "@mui/material"
import TwoElementRow from "./TwoElementRow"
import Spacer from "./Spacer"
import SendCampaignButton from "./SendCampaignButton"
import SendTestEmailButton from "./SendTestEmailButton"
import { useWatch } from "react-hook-form"

const PreviewEmailCard = () => {
  const record = useRecordContext()
  const id = record ? record.id : undefined

  return (
    <Card sx={{ backgroundColor: "#fffcf9", borderRadius: 0 }}>
      <CardContent sx={{ padding: "8px" }}>
        <h3 style={{ margin: "0" }}>Preview</h3>
        {!id && (
          <Box sx={{ marginTop: "8px" }}>
            Campaign must be saved before preview can be sent.
          </Box>
        )}
        {id && (
          <ReferenceInput reference="admin/users" source="userId">
            <AutocompleteInput
              translateChoice={false}
              optionText="email"
              variant="standard"
              label="Test Email Recipient"
              name="testEmailUser"
            />
          </ReferenceInput>
        )}
      </CardContent>
      <CardActions sx={{ display: "flex", justifyContent: "flex-end" }}>
        <SendTestEmailButton />
      </CardActions>
    </Card>
  )
}

const CampaignMessagesCard = () => {
  const id = useWatch({ name: "id" })

  return (
    <Card
      sx={{
        backgroundColor: "#fffcf9",
        borderRadius: 0,
        marginTop: "16px",
      }}
    >
      <CardContent sx={{ padding: "8px" }}>
        <h3 style={{ margin: "0" }}>Send</h3>
        {!id && <div>Campaign must be saved before it can be sent.</div>}
        {id && (
          <div>
            <br />
            <a
              href={`#/admin/email-messages?filter=${JSON.stringify({
                campaignId: id,
              })}&perPage=10&sort=id&order=ASC&page=1`}
              style={{ color: "#266050", textDecoration: "none" }}
            >
              Go to campaign messages
            </a>
          </div>
        )}
      </CardContent>
      <CardActions sx={{ display: "flex", justifyContent: "flex-end" }}>
        <SendCampaignButton />
      </CardActions>
    </Card>
  )
}

const EmailCampaignForm = (props) => (
  <Form {...props}>
    <Box p="1em">
      <Box display="flex">
        {/*main*/}
        <Box flex={80} mr="2rem">
          <TwoElementRow
            left={
              <TextInput
                label="id"
                fullWidth
                variant="standard"
                source="id"
                margin="none"
                disabled
              />
            }
            right={
              <TextInput
                label="Name"
                margin="none"
                variant="standard"
                fullWidth
                source="name"
                validate={required()}
              />
            }
            ratio={20}
          />
          <Spacer />
          <TwoElementRow
            left={
              <SelectInput
                margin="none"
                label="Email Template"
                variant="standard"
                fullWidth
                source="template"
                validate={required()}
                translateChoice={false}
                defaultValue="bio_certification_update"
                choices={[
                  {
                    id: "bio_certification_update",
                    name: "Bio Certification Update",
                  },
                  {
                    id: "inactive_users_reminder",
                    name: "Remind inactive users to log in",
                  },
                ]}
              />
            }
            right={
              <SelectInput
                variant="standard"
                fullWidth
                disabled
                margin="none"
                source="status"
                translateChoice={false}
                choices={[
                  { id: "CREATED", name: "Created" },
                  { id: "SENT", name: "Sent" },
                ]}
              />
            }
            ratio={80}
          />
          <PreviewEmailCard />
          <CampaignMessagesCard />
        </Box>
        {/*admin*/}
        <Box flex={20} ml="2rem">
          <Typography variant="h6" gutterBottom>
            Admin
          </Typography>
          <DateInput
            variant="standard"
            fullWidth
            disabled
            margin="none"
            label="Created"
            source="createdAt"
          />
          <DateInput
            variant="standard"
            fullWidth
            disabled
            margin="none"
            label="Updated"
            source="updatedAt"
          />
        </Box>
      </Box>
    </Box>
    <Toolbar>
      <Box display="flex" width="100%" justifyContent="flex-end">
        <ListButton
          label="Cancel"
          icon={null}
          variant="filled"
          style={{ marginRight: "2rem" }}
        />
        <SaveButton saving={props.saving} />
      </Box>
    </Toolbar>
  </Form>
)

export default EmailCampaignForm
