import { useContext, useEffect, useState } from "react";
import { Context } from "../../shared/Context";
import { PageLoader } from "../../shared/Loaders";
import { PORT_SERVICE_ROOT, URL_SERVICES } from "../../shared/config";

const { Box, Avatar, Typography } = require("@mui/material");

const ChatSideBar = ({
  chatsLoading,
  selectedChat,
  setSelectedChat,
  setMessages,
  handleDrawerClose,
}) => {
  const currentUserContext = useContext(Context);
  const { currentUser, chats } = currentUserContext;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "300px",
        height: "100%",
        backgroundColor: (theme) => theme.palette.primary.grey[5],
        borderRadius: {
          xl: "12px 0 0 12px",
          lg: "12px 0 0 12px",
          md: "0",
          sm: "0",
          xs: "0",
        },
        border: (theme) => ({
          xl: `1px solid ${theme.palette.primary.grey[3]}`,
          lg: `1px solid ${theme.palette.primary.grey[3]}`,
          md: "none",
          sm: "none",
          xs: "none",
        }),
      }}
    >
      {chatsLoading ? (
        <PageLoader></PageLoader>
      ) : (
        <>
          <Box
            sx={{
              display: {
                xl: "flex",
                lg: "flex",
                md: "none",
                sm: "none",
                xs: "none",
              },
              height: "42px",
              width: "100%",
              borderBottom: (theme) =>
                `1px solid ${theme.palette.primary.grey[3]}`,
            }}
          ></Box>
          {chats.map((chat) => {
            const { _id, sender, recipient, messages } = chat;
            let lastMessage;
            let formattedDate;
            let day;
            let monthName;
            let avatarFullPath =
              sender._id === currentUser._id
                ? `${URL_SERVICES}:${PORT_SERVICE_ROOT}/${recipient.images.avatar}`
                : `${URL_SERVICES}:${PORT_SERVICE_ROOT}/${sender.images.avatar}`;
            if (messages.length) {
              lastMessage = messages.sort(
                (a, b) => new Date(b.date) - new Date(a.date)
              )[0];

              // Дата последнего сообщения
              formattedDate = new Date(messages[0].date);
              day = formattedDate.getDate();
              monthName = formattedDate.toLocaleString("default", {
                month: "short",
              });
            }
            return (
              <Box
                key={`Container + ${_id}`}
                onClick={() => {
                  setSelectedChat(chat);
                  setMessages(chat.messages);
                  handleDrawerClose && handleDrawerClose();
                }}
                sx={{
                  cursor: "pointer",
                  display: "flex",
                  width: "100%",
                  padding: "8px",
                  gap: "8px",
                  backgroundColor: (theme) =>
                    selectedChat?._id === chat._id
                      ? theme.palette.primary.grey[4]
                      : theme.palette.primary.grey[5],
                  "&:hover": {
                    backgroundColor: (theme) => theme.palette.primary.grey[3],
                  },
                  borderBottom: (theme) => ({
                    xl: "none",
                    lg: "none",
                    md: `1px solid ${theme.palette.primary.grey[6]}`,
                    sm: `1px solid ${theme.palette.primary.grey[6]}`,
                    xs: `1px solid ${theme.palette.primary.grey[6]}`,
                  }),
                }}
              >
                <Avatar titie={"user-avatar"} src={avatarFullPath}></Avatar>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    width: "70%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#71aaeb",
                        fontFamily: "Roboto",
                        fontSize: "13px",
                        fontStyle: "normal",
                        fontWeight: 500,
                      }}
                    >
                      {sender._id === currentUser._id
                        ? recipient.primary.name +
                          " " +
                          recipient.primary.surname
                        : sender.primary.name + " " + sender.primary.surname}
                    </Typography>
                    <Typography
                      sx={{
                        color: (theme) => theme.palette.primary.grey[3],
                        fontFamily: "Roboto",
                        fontSize: "12px",
                        fontStyle: "normal",
                      }}
                    >
                      {messages.length ? day + " " + monthName : null}
                    </Typography>
                  </Box>
                  {lastMessage?.sender._id === currentUser._id ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          color: (theme) => theme.palette.primary.grey[3],
                          fontFamily: "Roboto",
                          fontSize: "12px",
                          fontStyle: "normal",
                        }}
                      >
                        You:
                      </Typography>
                      <Typography
                        sx={{
                          width: "100%",
                          color: messages.length
                            ? (theme) => theme.palette.primary.grey[2]
                            : (theme) => theme.palette.primary.grey[3],
                          fontFamily: "Roboto",
                          fontSize: "12px",
                          fontStyle: "normal",
                          fontWeight:
                            lastMessage?.read ||
                            lastMessage?.sender._id === currentUser._id
                              ? 400
                              : 1000,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {messages.length ? lastMessage?.text : "No messages"}{" "}
                      </Typography>
                      {/* {lastMessage.image && (
                        <Typography
                          sx={{
                            fontSize: "12px",
                            color: "#71aaeb",
                          }}
                        >
                          image
                        </Typography>
                      )} */}
                    </Box>
                  ) : (
                    <Typography
                      sx={{
                        width: "100%",
                        color: messages.length
                          ? (theme) => theme.palette.primary.grey[2]
                          : (theme) => theme.palette.primary.grey[3],
                        fontFamily: "Roboto",
                        fontSize: "12px",
                        fontStyle: "normal",
                        fontWeight:
                          lastMessage?.read ||
                          lastMessage?.sender._id === currentUser._id
                            ? 400
                            : 1000,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {messages.length ? lastMessage?.text : "No messages"}
                    </Typography>
                  )}
                  {lastMessage?.image && (
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "#71aaeb",
                      }}
                    >
                      image
                    </Typography>
                  )}
                </Box>
                {lastMessage &&
                  !lastMessage?.read &&
                  lastMessage?.sender._id !== currentUser._id && (
                    <Box // if user have a new message
                      sx={{
                        borderRadius: "50%",
                        backgroundColor: (theme) =>
                          theme.palette.primary.grey[1],
                        width: "8px",
                        height: "8px",
                      }}
                    ></Box>
                  )}
              </Box>
            );
          })}
        </>
      )}
    </Box>
  );
};

export default ChatSideBar;
