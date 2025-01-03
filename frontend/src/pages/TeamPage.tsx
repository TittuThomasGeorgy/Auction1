import React, { useState } from 'react';
import { Button, Box } from '@mui/material';
import { Add as AddIcon, LocalPolice as TeamIcon, Groups as GroupsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import FloatingButton from '../components/FloatingButton';
import AddTeamDialog from '../components/AddTeamDialog';

const defTeam = {
    _id: '',
    name: '',
    address: '',
    code: '',
    logo: '',
    username: '',
    password: '',
    isAdmin: false,
    manager: {
        img: '',
        name: '',
    }
}

const TeamPage = () => {
    const [open, setOpen] = useState(false)
    return (
        <>
            <div>Team</div>
            <FloatingButton actions={[
                {
                    name: 'Add',
                    icon: <AddIcon />,
                    onChange: () => {
                        setOpen(true);
                    },
                },
            ]} />
            <AddTeamDialog open={open} onClose={() => setOpen(false)}
                action='add'
                onSubmit={(newValue) =>
                    console.log(newValue)

                    // setSchools((schools) => [...schools, newValue])
                }
                value={defTeam}
            />
        </>
    );
};

export default TeamPage;
