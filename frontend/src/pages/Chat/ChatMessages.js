import { useContext, useEffect, useState } from "react";
import { PageLoader } from "../../shared/Loaders";
import { Context } from "../../shared/Context";
import MenuIcon from "@mui/icons-material/Menu";
import EmojiPicker from "emoji-picker-react";
import emojiPickerImg from "../../images/icons/emoji-picker.png";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { postUploadImage } from "../../http/Fetches";
import { useNavigate } from "react-router-dom";
import { PORT_SERVICE_ROOT, URL_SERVICES } from "../../shared/config";
import Message from "../../shared/Message";

import replyIcon from "../../images/icons/reply.png";
import crossMarkIcon from "../../images/icons/cross-mark.png";

const {
  Box,
  Typography,
  Input,
  Button,
  Avatar,
  styled,
  Modal,
  FormControl,
  IconButton,
} = require("@mui/material");

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const FormForMsg = styled("form")`
  display: flex;
  gap: 8px;
  width: 100%;
`;

const ChatMessages = ({
  chatsLoading,
  selectedChat,
  setSelectedChat,
  messages,
  setMessages,
  replyMessage,
  setReplyMessage,
  msgSendStatusText,
  setMsgSendStatusText,
  handleDrawerOpen,
  openDrawer,
}) => {
  const currentUserContext = useContext(Context);
  const { currentUser, socketConnectState, chats, setChats } =
    currentUserContext;

  const navigate = useNavigate();

  const [inputMessageText, setInputMessageText] = useState("");
  const [isValidText, setIsValidText] = useState(false);

  const [isOpenPicker, setIsOpenPicker] = useState(false);

  const [imageForPreviewMsg, setImageForPreviewMsg] = useState(null);
  const [imageForMessage, setImageForMessage] = useState(null);

  const [openModalMsg, setOpenModalMsg] = useState(false);

  function handleChangeImgForMsg(e) {
    setImageForPreviewMsg(URL.createObjectURL(e.target.files[0]));
    setImageForMessage(e.target.files[0]);
    setOpenModalMsg(true);
    setIsValidText(true);
  }

  const handleOpen = () => setOpenModalMsg(true);
  const handleClose = () => {
    setOpenModalMsg(false);
    setImageForMessage(null);
    setImageForPreviewMsg(null);
  };

  function validateMessage(message) {
    const regex = /^[\S\s]*\S+[\S\s]*$/;
    if (regex.test(message)) {
      setIsValidText(true);
    } else {
      setIsValidText(false);
    }
  }

  const handlePaste = (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let index in items) {
      const item = items[index];
      if (item.kind === "file") {
        const blob = item.getAsFile();

        setImageForPreviewMsg(URL.createObjectURL(blob));
        setImageForMessage(blob);
        setOpenModalMsg(true);
        setIsValidText(true);
      }
    }
  };

  const handleSendMessageBtn = async (event) => {
    event.preventDefault();

    const newMessage = {
      date: new Date(),
      text: inputMessageText || "",
      read: false,
      id: new Date(),
      sender: currentUser,
      recipient:
        selectedChat.recipient._id === currentUser._id
          ? selectedChat.sender
          : selectedChat.recipient,
    };

    if (replyMessage) {
      newMessage.replyMessage = replyMessage;
      newMessage.replyMessage.sender.name =
        newMessage.replyMessage.sender.primary.name;
      newMessage.replyMessage.sender._id = newMessage.replyMessage.sender._id;
    }

    const messagesBeforeSend = messages.slice();

    setMessages((prev) => [...prev, { ...newMessage, status: "Sending..." }]);

    if (imageForMessage && imageForPreviewMsg) {
      const { data } = await postUploadImage(
        imageForMessage,
        currentUser._id,
        "msg-image"
      );

      const { success } = data;
      if (!success) {
        const { message } = data;
        setMessages([...messagesBeforeSend, { newMessage, status: "Error" }]);
        setOpenModalMsg(false);
        setImageForMessage(null);
        setImageForPreviewMsg(null);
        console.log(message);
        return alert(message);
      }

      const { relativePath } = data;
      newMessage.image = relativePath;
      console.log(newMessage);
    }

    socketConnectState.emit("send-private-message", {
      userId: currentUser._id,
      newMessage,
      recipient:
        selectedChat.recipient._id === currentUser._id
          ? selectedChat.sender._id
          : selectedChat.recipient._id,
    });
    setInputMessageText("");
    setIsValidText(false);
    setOpenModalMsg(false);
    setImageForMessage(null);
    setImageForPreviewMsg(null);
    setReplyMessage(null);
  };

  useEffect(() => {
    socketConnectState.on("open-chat-with-user", (data) => {
      console.log(data);
    });
  }, []);

  socketConnectState.on("send-private-message", (data) => {
    const { success } = data;
    if (!success) {
      const { message } = data;
      return alert(message);
    }
    const { chat, allUserChats } = data;

    if (selectedChat?._id === chat._id) {
      setSelectedChat(chat);
      setMessages(chat.messages);
    }
    setMsgSendStatusText(null);
    setChats(allUserChats);
    setIsOpenPicker(false);
  });

  useEffect(() => {
    if (messages) {
      const unreadMessages = messages.filter(
        (message) =>
          message.read === false && message.sender._id !== currentUser._id
      );
      if (unreadMessages.length) {
        socketConnectState.emit("send-read-status", {
          chatId: selectedChat._id,
          userId: currentUser._id,
        });
      }
    }

    socketConnectState.on("send-read-status", (data) => {
      if (!data) {
        return console.log("Error on client: send-read-status listener");
      }
      const { success } = data;
      if (!success) {
        const { message } = data;
        return console.log(message);
      }
      const { chat, chats } = data;

      if (selectedChat?._id === chat._id) {
        setChats(chats);

        setMessages(chat.messages);
      }
    });

    return () => {
      setReplyMessage(null);
    };
  }, [selectedChat]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: {
          xl: "70%",
          lg: "70%",
          md: "100%",
          sm: "100%",
          xs: "100%",
        },
        maxWidth: "100%",
        minWidth: "400px",
        backgroundColor: (theme) => theme.palette.primary.grey[5],
        borderRadius: {
          xl: "0 12px 12px 0",
          lg: "0 12px 12px 0",
          md: "12px",
          sm: "12px",
          xs: "12px",
        },
        borderTop: (theme) => `1px solid ${theme.palette.primary.grey[3]}`,
        borderRight: (theme) => `1px solid ${theme.palette.primary.grey[3]}`,
        borderBottom: (theme) => `1px solid ${theme.palette.primary.grey[3]}`,
        borderLeft: (theme) => ({
          xl: `1px solid ${theme.palette.primary.grey[3]}`,
          lg: `1px solid ${theme.palette.primary.grey[3]}`,
          md: `1px solid ${theme.palette.primary.grey[3]}`,
          sm: `1px solid ${theme.palette.primary.grey[3]}`,
          xs: `1px solid ${theme.palette.primary.grey[3]}`,
        }),
      }}
    >
      {chatsLoading ? (
        <PageLoader></PageLoader>
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              minHeight: "42px",
              width: "100%",
              padding: "0 12px",
              borderBottom: (theme) =>
                `1px solid ${theme.palette.primary.grey[3]}`,
            }}
          >
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                mr: 2,
                display: {
                  xl: "none",
                  lg: "none",
                  md: "flex",
                  sm: "flex",
                  xs: "flex",
                },
                ...(openDrawer && { display: "none" }),
              }}
            >
              <MenuIcon />
            </IconButton>
            {selectedChat ? (
              selectedChat.sender._id === currentUser._id ? (
                // console.log(selectedChat.recipient._id)
                <Typography
                  onClick={() =>
                    navigate(`../profile/${selectedChat.recipient._id}`)
                  }
                  sx={{
                    cursor: "pointer",
                    color: "#71aaeb",
                    fontFamily: "Roboto",
                    fontSize: "14px",
                    fontStyle: "normal",
                    fontWeight: 500,
                  }}
                >
                  {selectedChat.recipient.primary.name +
                    " " +
                    selectedChat.recipient.primary.surname}
                </Typography>
              ) : (
                <Typography
                  onClick={() =>
                    navigate(`../profile/${selectedChat.sender._id}`)
                  }
                  sx={{
                    cursor: "pointer",
                    color: "#71aaeb",
                    fontFamily: "Roboto",
                    fontSize: "14px",
                    fontStyle: "normal",
                    fontWeight: 500,
                  }}
                >
                  {selectedChat.sender.primary.name +
                    " " +
                    selectedChat.sender.primary.surname}
                </Typography>
              )
            ) : null}
          </Box>
          {selectedChat ? (
            <>
              {messages?.length ? (
                <Box // Box for messages
                  sx={{
                    display: "flex",
                    flexDirection: "column-reverse",
                    flexGrow: 1,
                    gap: "12px",
                    width: "100%",
                    padding: "12px",
                    overflowY: "scroll",
                    overflowX: "hidden",
                  }}
                >
                  <EmojiPicker
                    open={isOpenPicker}
                    theme="dark"
                    lazyLoadEmojis={true}
                    style={{
                      position: "absolute",
                    }}
                    onEmojiClick={(props) => {
                      setInputMessageText((prev) => prev + props.emoji);
                    }}
                  ></EmojiPicker>
                  {messages
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((message) => (
                      <Box // Line Container for 1 message
                        key={`MsgContainer-${message._id}`}
                        sx={{
                          display: "flex",
                          justifyContent:
                            message.sender._id === currentUser._id
                              ? "flex-end"
                              : "flex-start",
                        }}
                      >
                        {message ? (
                          <Message // Single component for 1 message
                            message={message}
                            setReplyMessage={setReplyMessage}
                            msgSendStatusText={msgSendStatusText}
                          ></Message>
                        ) : null}
                      </Box>
                    ))}
                </Box>
              ) : (
                <Box // Box for empty chat
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <Typography
                    sx={{
                      color: (theme) => theme.palette.primary.grey[3],
                      fontFamily: "Roboto",
                      fontSize: "12px",
                      fontStyle: "normal",
                      fontWeight: 500,
                    }}
                  >
                    Enter Your first message
                  </Typography>
                </Box>
              )}
              <Box // Main Container for message input area
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  width: "100%",
                  // height: "84px",
                  borderTop: (theme) =>
                    `1px solid ${theme.palette.primary.grey[3]}`,
                  backgroundColor: (theme) => theme.palette.primary.grey[4],
                  borderRadius: "0 0 12px 0",
                  padding: "12px",
                }}
              >
                {replyMessage && (
                  <Box // Root Container for reply message and buttons for it
                    sx={{
                      display: "flex",
                      gap: "8px",
                      width: "100%",
                    }}
                  >
                    <Avatar
                      src={replyIcon}
                      alt="reply-icon"
                      sx={{
                        borderRadius: 0,
                        height: "100%",
                        padding: "8px",
                        width: "auto",
                      }}
                    ></Avatar>
                    <Box // Container for reply message texts and image
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "8px",
                        backgroundColor: (theme) =>
                          theme.palette.primary.grey[3],
                        borderRadius: "4px",
                        width: {
                          xl: "80%",
                          lg: "80%",
                          md: "70%",
                          sm: "60%",
                          xs: "60%",
                        },
                        padding: "4px",
                        maxHeight: "46px",
                      }}
                    >
                      {replyMessage.image && (
                        <Avatar
                          src={
                            URL_SERVICES +
                            ":" +
                            PORT_SERVICE_ROOT +
                            "/" +
                            replyMessage.image
                          }
                          alt="reply-message-image"
                          sx={{
                            borderRadius: 0,
                          }}
                        ></Avatar>
                      )}
                      <Box // Container for texts
                        sx={{
                          display: "flex",
                          flexDirection: "column",
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
                          Reply to {replyMessage.sender.primary.name}
                        </Typography>
                        {replyMessage.text ? (
                          <Typography
                            sx={{
                              color: (theme) => theme.palette.primary.grey[2],
                              fontFamily: "Roboto",
                              fontSize: "13px",
                              fontStyle: "normal",
                              fontWeight: 500,
                              maxWidth: "100%",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              wordWrap: "break-word",
                            }}
                          >
                            {replyMessage.text}
                          </Typography>
                        ) : (
                          <Typography
                            sx={{
                              color: "#71aaeb",
                              fontFamily: "Roboto",
                              fontSize: "13px",
                              fontStyle: "normal",
                              fontWeight: 500,
                            }}
                          >
                            Image
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Avatar
                      src={crossMarkIcon}
                      onClick={() => setReplyMessage(null)}
                      sx={{
                        cursor: "pointer",
                        minWidth: 0,
                        padding: "8px",
                      }}
                    ></Avatar>
                  </Box>
                )}
                {imageForPreviewMsg ? (
                  <Modal // Modal for message with image
                    open={openModalMsg}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "column",
                        gap: "16px",
                        backgroundColor: (theme) =>
                          theme.palette.primary.grey[5],
                        border: (theme) =>
                          `1px solid ${theme.palette.primary.grey[3]}`,
                        width: "50%",
                        paddingTop: "16px",
                        borderRadius: "12px",
                      }}
                    >
                      <Box // container for image
                        sx={{
                          // width: "70%",
                          margin: "0 12px 0px 12px",
                          border: (theme) =>
                            `1px solid ${theme.palette.primary.grey[3]}`,
                        }}
                      >
                        <Avatar
                          src={imageForPreviewMsg}
                          alt="message-img"
                          sx={{
                            width: "100%",
                            height: "auto",
                            maxHeight: "70vh",
                            borderRadius: 0,
                          }}
                        ></Avatar>
                      </Box>
                      <Box // Contailer for input and button in modal
                        sx={{
                          display: "flex",
                          gap: "12px",
                          width: "100%",
                          height: "84px",
                          borderTop: (theme) =>
                            `1px solid ${theme.palette.primary.grey[3]}`,
                          backgroundColor: (theme) =>
                            theme.palette.primary.grey[4],
                          borderRadius: "0 0 16px 16px",
                          padding: "12px",
                        }}
                      >
                        <FormForMsg onSubmit={handleSendMessageBtn}>
                          <Input
                            placeholder="Enter your message"
                            value={inputMessageText}
                            onChange={(e) => {
                              validateMessage(e.target.value);
                              setInputMessageText(e.target.value);
                            }}
                            sx={{
                              display: "flex",
                              width: "100%",
                              color: (theme) => theme.palette.primary.grey[1],
                              border: (theme) =>
                                `1px solid ${theme.palette.primary.grey[3]}`,
                              padding: "8px",
                              borderRadius: "8px",
                              fontFamily: "Roboto",
                              fontSize: "13px",
                              fontStyle: "normal",
                              fontWeight: 500,
                            }}
                          ></Input>
                          <Button
                            type="submit"
                            variant="contained"
                            disabled={!isValidText}
                            // onClick={handleSendMessageBtn}
                            sx={{
                              backgroundColor: (theme) =>
                                theme.palette.primary.grey[3],
                              color: (theme) => theme.palette.primary.grey[1],
                            }}
                          >
                            Send
                          </Button>
                        </FormForMsg>
                      </Box>
                    </Box>
                  </Modal>
                ) : null}
                <Box // Container for Emoji piker, image uploader, input and button
                  sx={{
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                    }}
                  >
                    <Button
                      component="label"
                      role={undefined}
                      variant="contained"
                      tabIndex={-1}
                      startIcon={<CloudUploadIcon />}
                      onChange={handleChangeImgForMsg}
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "transparent",
                        boxShadow: "0",
                        padding: "0",
                        minWidth: 0,
                        borderRadius: 0,
                        width: "30px",
                        height: "30px",
                        "& span": {
                          margin: 0,
                        },
                        "& :hover": {
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      <VisuallyHiddenInput type="file" accept="image/*" />
                    </Button>
                  </Box>
                  <Avatar
                    alt="emoji-picker"
                    src={emojiPickerImg}
                    onClick={() => setIsOpenPicker(!isOpenPicker)}
                    sx={{
                      cursor: "pointer",
                      width: "24px",
                      height: "24px",
                    }}
                  ></Avatar>
                  <FormForMsg
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      width: "100%",
                    }}
                  >
                    <Input
                      placeholder="Enter your message"
                      value={inputMessageText}
                      onPaste={handlePaste}
                      onChange={(e) => {
                        validateMessage(e.target.value);
                        setInputMessageText(e.target.value);
                      }}
                      sx={{
                        display: "flex",
                        width: "100%",
                        color: (theme) => theme.palette.primary.grey[1],
                        border: (theme) =>
                          `1px solid ${theme.palette.primary.grey[3]}`,
                        padding: "8px",
                        borderRadius: "8px",
                        fontFamily: "Roboto",
                        fontSize: "13px",
                        fontStyle: "normal",
                        fontWeight: 500,
                      }}
                    ></Input>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={!isValidText}
                      onClick={handleSendMessageBtn}
                      sx={{
                        backgroundColor: (theme) =>
                          theme.palette.primary.grey[3],
                        color: (theme) => theme.palette.primary.grey[1],
                      }}
                    >
                      Send
                    </Button>
                  </FormForMsg>
                </Box>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexGrow: 1,
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                // height: "100%",
              }}
            >
              <svg
                width="57"
                height="69"
                viewBox="0 0 57 69"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.8491 10.9307C14.3691 10.9307 7.87909 16.8507 7.87909 23.7307C7.87909 26.2007 8.69909 28.5207 10.1291 30.4707C10.3238 30.7303 10.4291 31.0461 10.4291 31.3707C10.4291 33.0007 9.99909 34.5907 9.46909 36.0407C9.11303 36.9878 8.72277 37.9218 8.29909 38.8407C11.6091 38.5107 13.7991 37.4407 15.0991 35.8807C15.3008 35.6418 15.5722 35.4719 15.8752 35.3948C16.1782 35.3177 16.4977 35.3373 16.7891 35.4507C18.7256 36.1819 20.7791 36.5547 22.8491 36.5507C31.3191 36.5407 37.8191 30.6107 37.8191 23.7307C37.8191 16.8607 31.3191 10.9307 22.8491 10.9307ZM4.87909 23.7307C4.87909 14.8307 13.1191 7.93066 22.8491 7.93066C32.5691 7.93066 40.8191 14.8107 40.8191 23.7307C40.8191 32.6607 32.5691 39.5407 22.8491 39.5407C20.6791 39.5407 18.5991 39.2107 16.6791 38.5907C14.4191 40.7307 11.1291 41.7707 7.07909 41.9307C6.70928 41.9397 6.34315 41.8554 6.01456 41.6855C5.68598 41.5156 5.40554 41.2655 5.1992 40.9585C4.99285 40.6515 4.86726 40.2974 4.83403 39.9289C4.8008 39.5605 4.86101 39.1897 5.00909 38.8507L5.42909 37.9007C5.85909 36.9407 6.28909 36.0007 6.64909 35.0007C7.05909 33.8907 7.33909 32.8207 7.40909 31.8207C5.76833 29.445 4.88621 26.6278 4.87909 23.7407V23.7307Z"
                  fill="#828282"
                />
                <path
                  d="M43.8291 19.7006C43.7165 19.8627 43.6371 20.0454 43.5953 20.2383C43.5534 20.4311 43.5501 20.6303 43.5854 20.8245C43.6207 21.0186 43.694 21.2039 43.801 21.3697C43.908 21.5355 44.0467 21.6785 44.2091 21.7906C47.6491 24.1706 49.7591 27.7706 49.7591 31.7406C49.7591 34.2106 48.9491 36.5206 47.5091 38.4706C47.3144 38.7303 47.2091 39.0461 47.2091 39.3706C47.2091 41.0006 47.6391 42.5906 48.1691 44.0406C48.5191 45.0006 48.9391 45.9606 49.3391 46.8406C46.0291 46.5106 43.8391 45.4406 42.5391 43.8806C42.3374 43.6418 42.066 43.4719 41.763 43.3948C41.46 43.3177 41.1405 43.3372 40.8491 43.4506C38.9126 44.1819 36.8591 44.5547 34.7891 44.5506C31.8091 44.5506 29.0391 43.7906 26.7091 42.5206C26.3617 42.3448 25.9595 42.311 25.5876 42.4263C25.2156 42.5417 24.9031 42.7971 24.7161 43.1387C24.5291 43.4802 24.4823 43.8811 24.5855 44.2565C24.6887 44.632 24.9338 44.9526 25.2691 45.1506C27.6556 46.4315 30.2755 47.219 32.9727 47.4664C35.6699 47.7138 38.3894 47.416 40.9691 46.5906C43.2191 48.7306 46.5091 49.7706 50.5591 49.9306C50.9289 49.9397 51.295 49.8554 51.6236 49.6855C51.9522 49.5155 52.2326 49.2655 52.439 48.9585C52.6453 48.6514 52.7709 48.2973 52.8042 47.9289C52.8374 47.5605 52.7772 47.1896 52.6291 46.8506L52.2091 45.9006C51.7691 44.9406 51.3491 44.0006 50.9891 43.0006C50.5875 41.9816 50.3317 40.9111 50.2291 39.8206C51.8699 37.445 52.752 34.6278 52.7591 31.7406C52.7591 26.6406 50.0391 22.1806 45.9191 19.3206C45.757 19.2081 45.5743 19.1286 45.3814 19.0868C45.1886 19.045 44.9894 19.0416 44.7952 19.0769C44.6011 19.1122 44.4158 19.1855 44.25 19.2925C44.0842 19.3995 43.9412 19.5382 43.8291 19.7006Z"
                  fill="#828282"
                />
              </svg>

              <Typography
                sx={{
                  color: (theme) => theme.palette.primary.grey[3],
                  fontFamily: "Roboto",
                  fontSize: "12px",
                  fontStyle: "normal",
                  fontWeight: 500,
                }}
              >
                {chats.length ? "Select a chat" : "You don't have any chats"}
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ChatMessages;
