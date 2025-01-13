import { Dialog, DialogTitle, DialogActions, Button } from '@mui/material';
import React from 'react'
interface ConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
}
const ConfirmationDialog = (props: ConfirmationDialogProps) => {
    return (
        <Dialog open={props.open} onClose={() => props.onClose()}>
            <DialogTitle>
                {props.title}
            </DialogTitle>
            <DialogActions>
                <Button onClick={() => props.onClose()} variant='outlined'>
                    Cancel
                </Button>
                <Button onClick={() => { props.onClose(); props.onConfirm() }} variant='contained' color="primary">
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ConfirmationDialog