import { Avatar, SxProps } from '@mui/material';
import React from 'react'
import { Delete as DeleteIcon, Image as ImageIcon } from '@mui/icons-material';
import { Theme } from '@emotion/react';

interface ImageUploaderProps {
    id?: string;
    value: string;
    onChange: (newVal: string) => void;
    onFileUpload: (file: File) => void;
    sx?: SxProps<Theme>;
    variant?: "rounded" | "circular" | "square"
}
const ImageUploader = (props: ImageUploaderProps) => {
    return (
        <>
            <label htmlFor={props.id ?? "imagePicker"}>
                <Avatar
                    sx={{
                        height: 150,
                        width: 150,
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        ...props.sx
                    }}
                    variant={props.variant ?? "rounded"}
                    src={props.value.replace('uc', 'thumbnail') ?? ''}
                >
                    {!props.value && <ImageIcon sx={{ fontSize: 100 }} />}
                </Avatar>
            </label >
            <input
                type="file"
                accept="image/*"
                id={props.id ?? "imagePicker"}
                style={{ display: 'none' }}
                onChange={(e) => {
                    e.preventDefault(); // Prevent the default behavior of the file input

                    if (e.target.files) {
                        console.log('size is', e.target.files[0].size / 1024);
                        if (e.target.files[0].size > 1e6) {
                            // enqueueSnackbar({
                            //     message: 'File size cannot be greater than 1 MB',
                            //     variant: 'error',
                            // });
                        } else {
                            props.onFileUpload(e.target.files[0])
                            const url = URL.createObjectURL(e.target.files[0]);
                            console.log(url);

                            props.onChange(url);
                        }
                    }
                }}
            /></>
    )
}

export default ImageUploader