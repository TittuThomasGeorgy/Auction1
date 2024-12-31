import {  Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

import { ThemeProvider, createTheme, useMediaQuery } from '@mui/material';

/* Theme variables */
import './theme/variables.css';
import { io } from 'socket.io-client';
import CommonServices from './services/CommonServices';
import { useLoader } from './hooks/Loader';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import { useMemo } from 'react';
import Router from './services/CommonRouter';

setupIonicReact();

const socket = io('http://localhost:5000');
socket.on('connect', () => console.log('Connected to server:', socket.id));

const App: React.FC = () => {
  CommonServices.setLoader(useLoader())
  CommonServices.setEnqueueSnackbar(enqueueSnackbar)


  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
          background: {
            default: prefersDarkMode ? '#121212' : '#f7f7f7 ',
          },
          primary: {
            main: '#009688',
          },
        },
        components: {
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: prefersDarkMode ? '#1b253d' : '#FFFFFF',
              },
            },
          },
          MuiCard: {
            defaultProps: {
              elevation: 3,
            },
            styleOverrides: {
              root: {
                backgroundColor: prefersDarkMode ? '#1b253d' : '#FFFFFF',
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: '#009688',
              },
            },
          },

          MuiInputBase: {
            styleOverrides: {
              root: {
                color: prefersDarkMode ? 'white' : 'black',  // Text color based on mode
                backgroundColor: prefersDarkMode ? '#424242' : '#f4f5f4',  // Background color based on mode
                '&::placeholder': {
                  color: prefersDarkMode ? 'lightgrey' : 'grey',  // Placeholder color based on mode
                },
                '&.Mui-disabled': {
                  color: prefersDarkMode ? '#757575' : '#C0C0C0',  // Disabled text color based on mode
                  backgroundColor: prefersDarkMode ? '#303030' : '#F8F9FA',  // Disabled background color
                },
              },
            },
          },

          MuiAutocomplete: {
            styleOverrides: {
              root: {
                color: prefersDarkMode ? 'white' : 'black',  // Text color based on mode
                backgroundColor: prefersDarkMode ? '#424242' : '#f4f5f4',  // Background color based on mode
                borderRadius: 50,
                padding: 1,
                '& .MuiOutlinedInput-root': {
                  paddingLeft: '12px',
                  '& fieldset': {
                    borderColor: prefersDarkMode ? '#616161' : '#ccc',
                  },
                  '&:hover fieldset': {
                    borderColor: prefersDarkMode ? '#757575' : '#888',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: prefersDarkMode ? '#90caf9' : '#1976d2',
                  },
                  '&.Mui-disabled': {
                    color: prefersDarkMode ? '#757575' : '#C0C0C0',  // Disabled text color
                    backgroundColor: prefersDarkMode ? '#303030' : '#F8F9FA',  // Disabled background color
                  },
                },
              },
              inputRoot: {
                color: prefersDarkMode ? 'white' : 'black',  // Text color based on mode
                backgroundColor: prefersDarkMode ? '#424242' : '#f4f5f4',  // Background color
                '& .MuiInputBase-input': {
                  color: prefersDarkMode ? '#fff' : '#000',
                  '&::placeholder': {
                    color: prefersDarkMode ? 'lightgrey' : '#909190',  // Placeholder color
                  },
                  '&.Mui-disabled': {
                    color: prefersDarkMode ? '#757575' : '#C0C0C0',  // Disabled text color
                    backgroundColor: prefersDarkMode ? '#303030' : '#F8F9FA',  // Disabled background color
                  },
                },
              },
              paper: {
                backgroundColor: prefersDarkMode ? '#424242' : '#f4f5f4',
                // borderRadius: 10,
              },
              option: {
                backgroundColor: prefersDarkMode ? '#424242' : '#fff',
                '&[aria-selected="true"]': {
                  backgroundColor: prefersDarkMode ? '#616161' : '#f4f5f4',
                },
                '&:hover': {
                  backgroundColor: prefersDarkMode ? '#757575' : '#e0e0e0',
                },
                '&.Mui-disabled': {
                  color: prefersDarkMode ? '#757575' : '#C0C0C0',  // Disabled option text color
                  backgroundColor: prefersDarkMode ? '#303030' : '#F8F9FA',  // Disabled option background color
                },
              },
            },
          },

        },
      }),
    [prefersDarkMode]
  );

  return (
    <IonApp>
      <ThemeProvider theme={theme}>
        {/* <LoaderProvider> */}
        <SnackbarProvider>
          <Router />
        </SnackbarProvider>
        {/* </LoaderProvider> */}
      </ThemeProvider>
    </IonApp>
  );
};
export default App;
