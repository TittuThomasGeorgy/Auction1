import React from "react";
import { Menu, MenuItem, Tooltip, IconButton, SxProps, Theme } from "@mui/material";
import OptionIcon from "@mui/icons-material/MoreVert"; // Replace with your icon if needed

type MenuItemType = {
    label: string;
    onClick: () => void;
};

type MenuButtonProps = {
    title?: string; // Tooltip title
    menuItems: MenuItemType[];
    sx?: SxProps<Theme>;
    selected: string;
};

const MenuButton: React.FC<MenuButtonProps> = ({ title = "Options", menuItems, selected, sx }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <Tooltip title={title}>
                <IconButton onClick={handleOpen} sx={sx}>
                    <OptionIcon color="primary" />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                {menuItems.map((item, index) => (
                    <MenuItem
                        key={index}
                        onClick={() => {
                            item.onClick();
                            handleClose();
                        }}
                        selected={item.label == selected}
                    >
                        {item.label}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default MenuButton;
