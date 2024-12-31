import { ThemeProvider } from "@emotion/react";
import { setupIonicReact, IonApp } from "@ionic/react";
import { createTheme, CssBaseline } from "@mui/material";
import axios from "axios";
import { useMemo, useEffect } from "react";
import CommonServices from "./services/CommonServices";
import { useLoader } from "./hooks/Loader";
import { enqueueSnackbar, SnackbarProvider } from "notistack";
import Router from "./services/CommonRouter";

// Initialize Ionic
setupIonicReact();

// Configure Axios
const serverURL = import.meta.env.VITE_SERVER_URL || `http://192.168.1.7:8005`;
axios.defaults.baseURL = serverURL;
console.log("Server URL:", serverURL);

const App: React.FC = () => {
  // Set up common services
  CommonServices.setLoader(useLoader());
  CommonServices.setEnqueueSnackbar(enqueueSnackbar);


  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          background: {
            default: '#000000'
          },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundImage: 'url(/bg.jpg)', // Add your image URL
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundAttachment: 'fixed', // Optional for fixed background
                backgroundPosition: 'center',
                color: '#fff', // Default text color set to white
              }, // No changes for light mode
              
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: '#1b253d',
              },
            },
          },
          MuiCard: {
            defaultProps: {
              elevation: 3,
            },
            styleOverrides: {
              root: {
                backgroundColor: '#1b253d',
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
          // MuiInputBase: {
          //   styleOverrides: {
          //     root: {
          //       color: 'white', // Text color
          //       backgroundColor: '#424242', // Background color
          //       '&::placeholder': {
          //         color: 'lightgrey', // Placeholder color
          //       },
          //       '&.Mui-disabled': {
          //         color: '#757575', // Disabled text color
          //         backgroundColor: '#303030', // Disabled background color
          //       },
          //     },
          //   },
          // },
          MuiButton: {
            styleOverrides: {
              root: {
                background: 'linear-gradient(45deg, #009688, #2196f3)', // Gradient from light green to blue
                color: '#ffffff', // White text color
                marginBottom: 4,
                '&:hover': {
                  background: 'linear-gradient(45deg, #00796b, #1976d2)', // Darker gradient for hover effect
                },
              },
            },
          },
        },
      }),
    [] );



  // WebSocket setup
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8006"); // Example WebSocket server

    socket.onopen = () => console.log("WebSocket connected");
    socket.onerror = (error) => console.error("WebSocket error:", error);
    socket.onclose = () => console.log("WebSocket disconnected");

    // Clean up the WebSocket connection on unmount
    return () => socket.close();
  }, []);

  return (
    <IonApp>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>
          <Router />
          {/* <div>hi</div> */}
        </SnackbarProvider>
      </ThemeProvider>
    </IonApp>
  );
};

export default App;
