import styled from "@emotion/styled";
import { Avatar, Box, Button, TextField } from "@mui/material";
import { Context } from "./Context";
import { useContext, useState } from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import { postUploadImage, postNewPost } from "../http/Fetches";
import ImageCropper from "./ImageCropper";
import uploadImageIcon from "../images/icons/add-image.png";

const Container = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  border-radius: 12px;
  background: ${(props) => props.theme.palette.primary.grey[5]};
  border: 1px solid ${(props) => props.theme.palette.primary.grey[3]};
  padding: 16px;
`;

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

const AddNewPost = () => {
  const currentUserContext = useContext(Context);
  const { currentUser, setPosts } = currentUserContext;

  const [newPostSending, setNewPostSending] = useState(false);
  const [postData, setPostData] = useState({
    authorID: "",
    date: "",
    text: "",
    image: "",
  });

  const [postImage, setPostImage] = useState("");

  const handleSendNewPost = async () => {
    setNewPostSending(true);

    const textRegex = /\S/;

    const isTextValid = textRegex.test(postData.text);

    if (!isTextValid) {
      setNewPostSending(false);
      return alert("Invalit text field");
    }

    if (!postData.text && !postImage) {
      setNewPostSending(false);
      return alert("Invalid fields");
    }

    let imgPathOnServer;

    if (postImage) {
      const { data } = await postUploadImage(
        postImage,
        currentUser._id,
        "post"
      );
      const { success } = data;
      if (!success) {
        const { message } = data;
        console.log(message);
        return alert(message);
      }
      const { relativePath } = data;
      imgPathOnServer = relativePath;
    }

    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    // console.log(new Date(formattedDate));
    const newPost = {
      ...postData,
      author: currentUser._id,
      date: formattedDate,
      image: "",
    };
    if (imgPathOnServer) {
      newPost.image = imgPathOnServer;
    }
    const { data } = await postNewPost(currentUser._id, "profile", newPost);
    if (!data) {
      setNewPostSending(false);
      return alert("Something wrond (add new post)");
    }
    const { success } = data;
    if (!success) {
      const { message } = data;
      console.log("Error add new post:", message);
      setNewPostSending(false);
      return alert(message);
    }
    const { allPosts } = data;
    console.log(allPosts);
    setPosts(allPosts);
    setPostData((prev) => ({
      ...prev,
      authorID: "",
      date: "",
      text: "",
      image: "",
    }));
    setPostImage("");
    setNewPostSending(false);
  };

  return (
    <Container>
      <TextField
        id="outlined-multiline-flexible"
        label="What's new?"
        multiline
        maxRows={4}
        value={postData.text}
        onChange={(event) => {
          setPostData((prev) => ({
            ...prev,
            text: event.target.value,
          }));
        }}
        sx={{
          border: (theme) => `1px solid ${theme.palette.primary.grey[3]}`,
          width: "100%",
          borderRadius: "12px",
          padding: "0",
          // textfield
          ".css-kptawt-MuiInputBase-root-MuiOutlinedInput-root": {
            color: (theme) => theme.palette.primary.grey[1],
            fontSize: "14px",
          },

          // placeholder color
          ".css-tmp4qz-MuiFormLabel-root-MuiInputLabel-root": {
            color: (theme) => theme.palette.primary.grey[3],
            fontSize: "14px",
          },

          // Focused
          ".css-kptawt-MuiInputBase-root-MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
            {
              border: (theme) => "1px solid " + theme.palette.primary.grey[3],
            },
        }}
      />
      {postImage && (
        <Avatar
          title="post_img"
          src={postImage}
          sx={{
            width: "100%",
            height: "auto",
            borderRadius: 0,
          }}
        ></Avatar>
      )}
      <Box
        sx={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexGrow: 1,
          }}
        >
          <ImageCropper
            imageType={"post"}
            circularCrop={false}
            MIN_DEMENSION={150}
            setNewAvatar={setPostImage}
          ></ImageCropper>
          <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            // startIcon={<CloudUploadIcon />}
            // onChange={onSelectFile}
            sx={{
              // backgroundColor: (theme) => theme.palette.primary.grey[3],
              width: "20px",
              minWidth: 0,
              maxWidth: "20px",
              height: "20px",
              backgroundColor: "transparent",
              "&:hover": {
                backgroundColor: "transparent",
              },
            }}
          >
            <Avatar
              title="post_img"
              src={uploadImageIcon}
              sx={{
                width: "20px",
                height: "auto",
                borderRadius: 0,
              }}
            ></Avatar>
            <VisuallyHiddenInput type="file" accept="video/*" />
          </Button>
        </Box>
        <LoadingButton
          loading={newPostSending}
          variant="contained"
          onClick={handleSendNewPost}
          sx={{
            border: (theme) => "1px solid " + theme.palette.primary.grey[3],
            backgroundColor: (theme) => theme.palette.primary.grey[5],
            color: (theme) => theme.palette.primary.grey[1],
            fontSize: "13px",
            textTransform: "none",
            "&:hover": {
              backgroundColor: (theme) => theme.palette.primary.grey[4],
            },
          }}
        >
          Send
        </LoadingButton>
      </Box>
    </Container>
  );
};

export default AddNewPost;
