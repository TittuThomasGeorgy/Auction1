import React, { ReactNode, useState } from "react";
import { Fab, SvgIconTypeMap } from "@mui/material";
import {
  KeyboardArrowUp as UpIcon,
  KeyboardArrowDown as DownIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

const FloatingButton = (props: {
  actions: {
    name: string;
    icon: ReactNode;
    onChange: () => void;
  }[]
}) => {
  const [open, setOpen] = useState(false);
  const [extendedFab, setExtendedFab] = useState(-1);
  return (
    <>
      {!open ? (
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: "fixed",
            bottom: 20,
            right: 10,
          }}
          onClick={() => setOpen(true)}
        // variant={extendedFab === 0 ? "extended" : "circular"}
        // onMouseOver={() => setExtendedFab(0)}
        // onMouseOut={() => setExtendedFab(-1)}
        >
          {/* {extendedFab === 0 && "Add "} */}
          <UpIcon />
        </Fab>
      ) : (
        <>
          {props.actions.map((action, index) =>
            <Fab
              color="primary"
              aria-label={action.name}
              sx={{
                position: "fixed",
                bottom: 20 + (index + 1) * 60,
                right: 10,
              }}
              onClick={() => action.onChange()}
              variant={extendedFab === index + 1 ? "extended" : "circular"}
              onMouseOver={() => setExtendedFab(index + 1)}
              onMouseOut={() => setExtendedFab(-1)}
              key={index}
            >
              {extendedFab === index + 1 && action.name}
              {action.icon}
            </Fab>)}
          <Fab
            color="primary"
            aria-label="add"
            sx={{
              position: "fixed",
              bottom: 20,
              right: 10,
            }}
            onClick={() => { setOpen(false); setExtendedFab(-1) }}
            variant={extendedFab === 0 ? "extended" : "circular"}
            onMouseOver={() => setExtendedFab(0)}
            onMouseOut={() => setExtendedFab(-1)}
          >
            {/* {extendedFab === 0 && "Close "} */}
            <DownIcon />
          </Fab>
        </>
      )
      }
    </>
  );
};

export default FloatingButton;
