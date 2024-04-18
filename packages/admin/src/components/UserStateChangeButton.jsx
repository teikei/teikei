import { useEffect, useState } from "react";
import {
  Button,
  Confirm,
  LinearProgress,
  useRefresh,
  useCreate,
} from "react-admin";
import DangerousIcon from "@mui/icons-material/Dangerous";
import ReplayIcon from "@mui/icons-material/Replay";
import { useWatch } from "react-hook-form";
import { Box } from "@mui/material";

const UserStateChangeButton = ({ onStateChanged }) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => setOpen(true);
  const handleDialogClose = () => setOpen(false);
  const id = useWatch({ name: "id" });
  const active = useWatch({ name: "active" });
  const refresh = useRefresh();
  const [create, { isLoading }] = useCreate();
  const handleConfirm = async () => {
    await create("admin/user-account-state-change", {
      data: { id, active: !active },
    });
    refresh();
    setOpen(false);
    onStateChanged();
  };
  useEffect(() => {
    refresh();
  }, [isLoading]);

  return (
    <>
      {isLoading && <LinearProgress sx={{ marginRight: "16px" }} />}
      <Button
        label={active ? "Deactivate" : "Activate"}
        variant="contained"
        onClick={handleClick}
        startIcon={active ? <DangerousIcon /> : <ReplayIcon />}
        sx={{ width: "200px" }}
      />
      <Confirm
        isOpen={open}
        loading={false}
        title={`${active ? "Deactivate" : "Reactivate"} User`}
        content={
          <Box>
            Are you sure you want to {active ? "deactivate" : "reactivate"} the
            user account and all of its entries?
          </Box>
        }
        onConfirm={handleConfirm}
        onClose={handleDialogClose}
      />
    </>
  );
};

export default UserStateChangeButton;
