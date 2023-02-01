import { useState } from 'react'
import { Button, Confirm } from 'react-admin'
import SendIcon from '@mui/icons-material/Send'

const SendCampaignButton = () => {
  const [open, setOpen] = useState(false)

  const handleClick = () => setOpen(true)
  const handleDialogClose = () => setOpen(false)
  const handleConfirm = () => {
    // TODO do it!
    setOpen(false)
  }

  return (
    <>
      <Button
        label="Send Campaign"
        variant="contained"
        onClick={handleClick}
        startIcon={<SendIcon />}
        sx={{ width: '200px' }}
      />
      <Confirm
        isOpen={open}
        loading={false}
        title="Send Email Campaign"
        content="Are you sure you want to send the email campaign?"
        onConfirm={handleConfirm}
        onClose={handleDialogClose}
      />
    </>
  )
}

export default SendCampaignButton
