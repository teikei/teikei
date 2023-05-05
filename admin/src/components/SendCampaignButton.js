import { useEffect, useState } from 'react'
import {
  Button,
  Confirm,
  LinearProgress,
  useRefresh,
  useUpdate,
} from 'react-admin'
import SendIcon from '@mui/icons-material/Send'
import { useFormContext } from 'react-hook-form'
import { Box } from '@mui/material'

const SendCampaignButton = () => {
  const [open, setOpen] = useState(false)
  const { watch } = useFormContext()

  const handleClick = () => setOpen(true)
  const handleDialogClose = () => setOpen(false)
  const campaignId = watch('id')
  const status = watch('status')
  const refresh = useRefresh()
  const [update, { isLoading }] = useUpdate()
  const handleConfirm = async () => {
    await update('admin/email-campaigns', {
      id: campaignId,
      data: {
        status: 'SENT',
      },
    })
    refresh()
    setOpen(false)
  }
  useEffect(() => {
    refresh()
  }, [isLoading])

  return (
    <>
      {isLoading && <LinearProgress sx={{ marginRight: '16px' }} />}
      <Button
        label="Send Campaign"
        variant="contained"
        onClick={handleClick}
        startIcon={<SendIcon />}
        disabled={!campaignId || status === 'SENT'}
        sx={{ width: '200px' }}
      />
      <Confirm
        isOpen={open}
        loading={false}
        title="Send Email Campaign"
        content={<Box>Are you sure you want to send the email campaign?</Box>}
        onConfirm={handleConfirm}
        onClose={handleDialogClose}
      />
    </>
  )
}

export default SendCampaignButton
