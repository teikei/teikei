import { useEffect, useState } from 'react'
import {
  Button,
  Confirm,
  LinearProgress,
  useRefresh,
  useCreate,
} from 'react-admin'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import { useFormContext } from 'react-hook-form'
import { Box } from '@mui/material'

const UserReactivationButton = () => {
  const [open, setOpen] = useState(false)
  const { watch } = useFormContext()

  const handleClick = () => setOpen(true)
  const handleDialogClose = () => setOpen(false)
  const id = watch('id')
  const state = watch('state')
  const refresh = useRefresh()
  const [create, { isLoading }] = useCreate()
  const handleConfirm = async () => {
    await create('admin/user-reactivation', {
      data: { id },
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
        label="Reactivate User"
        variant="contained"
        onClick={handleClick}
        startIcon={<AutorenewIcon />}
        disabled={state === 'RECENT_LOGIN'}
        sx={{ width: '200px' }}
      />
      <Confirm
        isOpen={open}
        loading={false}
        title="Reactivate User"
        content={
          <Box>Are you sure you want to reactivate the user account?</Box>
        }
        onConfirm={handleConfirm}
        onClose={handleDialogClose}
      />
    </>
  )
}

export default UserReactivationButton
