import React, { useEffect, useState } from 'react';
import {
    Container,
    Grid2 as Grid,
    TextField,
    Button,
    Typography,
    IconButton,
    InputAdornment,
    Paper,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/Authenticate';
import useClub from '../services/ClubService';

const LoginPage: React.FC = () => {
    const { club, setClub } = useAuth();
    const navigate = useNavigate();

    const clubServ = useClub();
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const validateUsername = (username: string) => {
        // Example: Username should be at least 4 characters long
        if (username.length < 4) {
            return "Username must be at least 4 characters long";
        }
        return '';
    };

    const validatePassword = (password: string) => {
        // Example: Password should have at least 8 characters, including letters and numbers
        if (password.length < 8) {
            return "Password must be at least 8 characters long";
        }
        if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
            return "Password must contain both letters and numbers";
        }
        return '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const userError = validateUsername(username);
        const passError = validatePassword(password);

        setUsernameError(userError);
        setPasswordError(passError);

        if (!userError && !passError) {
            // If there are no errors, proceed with the login
            const res = await clubServ.login(username, password);
            localStorage.setItem('curClub', JSON.stringify(res.data));
            if (res.success) {
                setClub(res.data);
            }
        }
    };
    useEffect(() => {
        if (club) {
            navigate('/');
        }
    }, [club]);

    return (
        <Container maxWidth="xs" >
            <form onSubmit={async (e) => {
                e.preventDefault();
                handleSubmit(e);
            }}>
                <Paper elevation={3} style={{ backgroundColor: 'rgba(24, 24, 24, 0.75)', color: 'white', padding: '2rem', marginTop: "50%" }}>
                    <Typography
                        variant="h6"
                        align="center"
                        gutterBottom
                        style={{
                            color: '#1e88e5',
                            fontWeight: 'bold',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            marginBottom: '1rem'
                        }}
                    >
                        AUCTION
                    </Typography>

                    <Typography
                        variant="h4"
                        align="center"
                        gutterBottom
                        style={{
                            fontWeight: '700',
                            marginBottom: '1rem',
                            textTransform: 'uppercase',
                            fontFamily: 'Roboto, sans-serif'
                        }}
                    >
                        Login
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={12}>
                            <TextField
                                label="Username"
                                variant="outlined"
                                fullWidth
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                error={!!usernameError}
                                helperText={usernameError}
                                sx={{ bgcolor: 'white', borderRadius: 1 }}

                            />
                        </Grid>
                        <Grid size={12}>
                            <TextField
                                label="Password"
                                variant="outlined"
                                fullWidth
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                slotProps={{
                                    input: {
                                        endAdornment:  <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>,
                                    }
                                }}
                                sx={{ bgcolor: 'white', borderRadius: 1 }}
                                error={!!passwordError}
                                helperText={passwordError}
                            />
                        </Grid>
                        <Grid size={12}>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                type='submit'
                            >
                                Login
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </form>

        </Container>
    );
};

export default LoginPage;
