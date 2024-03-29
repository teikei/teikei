import { useState } from 'react'
import { Button, Confirm, useCreate, useRefresh } from 'react-admin'
import PreviewIcon from '@mui/icons-material/Preview'
import { useFormContext } from 'react-hook-form'

const SendTestEmailButton = () => {
  const [open, setOpen] = useState(false)
  const { watch } = useFormContext()
  const testEmailUser = watch('testEmailUser')
  const campaignId = watch('id')
  const refresh = useRefresh()
  const [create] = useCreate()

  const handleClick = () => setOpen(true)
  const handleDialogClose = () => setOpen(false)
  const handleConfirm = () => {
    create('admin/email-messages', {
      data: {
        userId: testEmailUser,
        campaignId,
      },
    })
    setOpen(false)
    refresh()
  }

  return (
    <>
      <Button
        label="Send Test Email"
        variant="contained"
        disabled={!testEmailUser || !campaignId}
        onClick={handleClick}
        startIcon={<PreviewIcon />}
        sx={{ width: '200px' }}
      />
      <Confirm
        isOpen={open}
        loading={false}
        title="Send Test Email"
        content="Are you sure you want to send a test email?"
        onConfirm={handleConfirm}
        onClose={handleDialogClose}
      />
    </>
  )
}

export default SendTestEmailButton
