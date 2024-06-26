import styled from "@emotion/styled";
import "react-image-crop/dist/ReactCrop.css";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import Profile from "./pages/Profile/Profile";
import Header from "./components/Header";
import MainNavigation from "./components/MainNavigation";
import { createRef, useEffect, useState } from "react";
import Feed from "./pages/Feed/Feed";
import EditProfile from "./pages/EditProfile/EditProfile";
import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import { Context } from "./shared/Context.js";
import Friends from "./pages/Friends/Friends.js";
import { getIsValidToken } from "./http/Fetches.js";
import { theme } from "./shared/styles.js";
import { Box, Button, ThemeProvider } from "@mui/material";
import { PageLoader } from "./shared/Loaders.js";

import { closeSnackbar, useSnackbar } from "notistack";

import { connectToSocket } from "./shared/SocketFunctions.js";
import Chat from "./pages/Chat/Chat.js";
import NotifyMessage from "./shared/NotifyMessage.js";

const Container = styled("div")`
  display: flex;
  flex-direction: column;
  background-color: ${(props) => props.theme.palette.primary.grey[6]};
  min-height: 100%;
  width: 100%;
  max-width: 1248px;
`;

const Body = styled("div")`
  display: flex;
  justify-content: center;
  margin-top: ${({ pathname }) =>
    pathname != "/login" && pathname != "/registration" && "64px"};
  gap: 4px;
  margin-bottom: 12px;
  min-height: 100%;
`;

const ContentContainer = styled(Box)`
  width: 70%;
  height: 100%;
`;

const userInit = {
  _id: "",
  primary: {
    name: "",
    surname: "",
    dateOfBirth: "",
    email: "",
    website: "",
    description: "",
  },
  images: {
    avatar: "",
    background: "",
  },
  socialContacts: {
    friends: [],
    followers: [],
    following: [],
  },
  secret: {
    password: "",
    role: "",
  },
};

function App() {
  const { enqueueSnackbar } = useSnackbar();

  const location = useLocation();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(userInit);
  const [usersFromSearch, setUsersFromSearch] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for notification
  const [notifData, setNotifData] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);

  // All posts arr
  const [posts, setPosts] = useState([]);

  // All user chats arr
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  // Socket connect state, obj socket
  const [socketConnectState, setSocketConnectState] = useState(null);

  // All connected users arr
  const [connectedUsers, setConnectedUsers] = useState([]);

  // Effects
  useEffect(() => {
    const tokenLS = JSON.parse(localStorage.getItem("token"));

    if (!tokenLS) {
      localStorage.setItem("token", JSON.stringify({ value: "0" }));
      setCurrentUser(userInit);
      navigate("/login");
      setLoading(false);
      return;
    }

    if (tokenLS.value === "0") {
      setCurrentUser(userInit);
      navigate("/login");
      setLoading(false);
      return;
    }

    if (tokenLS && tokenLS.value !== "0") {
      const fetchUserData = async () => {
        try {
          const res = await getIsValidToken(tokenLS);
          if (res) {
            const { data } = res;
            const { success } = data;
            if (!success) {
              const { message } = data;
              console.log(message);
              alert(message);
              setCurrentUser(userInit);
              localStorage.setItem("token", JSON.stringify({ value: "0" }));
              setLoading(false);
              navigate("/login");
              return;
            }
            // if success
            const { foundUser } = data;
            setCurrentUser(foundUser);
            setLoading(false);
            const socket = connectToSocket(foundUser._id);
            console.log("connected");
            setSocketConnectState(socket);
            socket.on("get-is-connected-user", (data) => {
              setConnectedUsers(data);
              console.log(data);
            });
            if (
              location.pathname === "/login" ||
              location.pathname === "/register"
            ) {
              navigate(`/profile/${foundUser._id}`);
            }
          } else {
            // Обработка ошибки
            console.log("Token error");
            localStorage.setItem("token", JSON.stringify({ value: "0" }));
            navigate("/login");
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setCurrentUser(userInit);
          navigate("/login");
          setLoading(false);
          return;
        }
      };
      fetchUserData();
    }
  }, []);

  //Notifications

  useEffect(() => {
    if (socketConnectState) {
      socketConnectState.on(
        "last-message-for-notification",
        ({ senderData, lastMessageData }) => {
          const action = (key) => (
            <Button onClick={() => closeSnackbar(key)}>x</Button>
          );

          enqueueSnackbar(
            <NotifyMessage
              notifData={{
                senderData,
                messageData: lastMessageData,
                type: "default",
              }}
            />,
            {
              action,
              style: {
                padding: 0,
                border: (theme) => `2px solid ${theme.palette.primary.grey[1]}`,
                borderRadius: "8px",
              },
            }
          );
        }
      );
    }
  }, [socketConnectState]);

  useEffect(() => {
    if (socketConnectState) {
      socketConnectState.on(
        "social-contacts-change",
        ({ senderData, messageData }) => {
          enqueueSnackbar(
            <NotifyMessage
              notifData={{ senderData, messageData, type: "technical" }}
            />,
            {
              style: {
                padding: 0,
                border: (theme) => `1px solid ${theme.palette.primary.grey[1]}`,
                borderRadius: "8px",
              },
            }
          );
        }
      );
    }
  }, [socketConnectState]);

  // First receiving chats
  useEffect(() => {
    if (currentUser && currentUser._id && socketConnectState) {
      socketConnectState.emit("get-all-user-chats", currentUser._id);
      socketConnectState.on("get-all-user-chats", (chats) => {
        setChats(chats);
      });
    }
  }, [currentUser]);

  if (loading) {
    return <PageLoader></PageLoader>;
  } else {
    return (
      <Context.Provider
        value={{
          currentUser,
          setCurrentUser,
          userInit,
          usersFromSearch,
          setUsersFromSearch,
          posts,
          setPosts,
          socketConnectState,
          setSocketConnectState,
          connectedUsers,
          setConnectedUsers,
          chats,
          setChats,
          selectedChat,
          setSelectedChat,
        }}
      >
        <ThemeProvider theme={theme}>
          {location.pathname !== "/login" &&
            location.pathname !== "/registration" && <Header></Header>}
          <Container>
            <Body pathname={location.pathname}>
              {location.pathname !== "/login" &&
                location.pathname !== "/registration" && (
                  <MainNavigation></MainNavigation>
                )}
              <ContentContainer
                sx={{
                  width: {
                    xl: "75%",
                    lg: "75%",
                    md: "75%",
                    sm: "90%",
                    xs: "90%",
                  },
                }}
              >
                <Routes>
                  <Route
                    path="/profile/:_id"
                    element={<Profile></Profile>}
                  ></Route>
                  <Route path="/feed" element={<Feed></Feed>}></Route>
                  <Route
                    path="/edit/:_id"
                    element={<EditProfile></EditProfile>}
                  ></Route>
                  {currentUser && currentUser._id && !loading && (
                    <Route path="/chat/:_id" element={<Chat></Chat>}></Route>
                  )}
                  <Route path="/login" element={<Login></Login>}></Route>
                  <Route path="/friends" element={<Friends></Friends>}></Route>
                  <Route
                    path="/registration"
                    element={<SignUp></SignUp>}
                  ></Route>
                  <Route
                    path="*"
                    element={
                      currentUser && currentUser._id && !loading ? (
                        <Navigate to={`profile/${currentUser._id}`} replace />
                      ) : (
                        <Navigate
                          to={
                            currentUser._id
                              ? `profile/${currentUser._id}`
                              : "/login"
                          }
                          replace
                        />
                      )
                    }
                  />
                </Routes>
              </ContentContainer>
            </Body>
          </Container>
        </ThemeProvider>
      </Context.Provider>
    );
  }
}

export default App;
