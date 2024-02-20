import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { postLogin } from "../../http/Fetches";
import { Context } from "../../shared/Context";

const Container = styled("div")`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const LoginContainer = styled("div")`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  border: 1px solid ${({theme}) => theme.palette.primary.grey[3]};
  border-radius: 8px;
  padding: 8px 16px 8px 16px;
  width: 50%;
  height: 400px;
  gap: 12px;
`;

const LoginTitle = styled("div")`
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${({theme}) => theme.palette.primary.grey[1]};
  width: 100%;
  height: 20%;
  font-family: Roboto;
  font-style: normal;
  font-weight: 500;
`;

const InputsContainer = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  height: 30%;
`;

const Input = styled("input")`
  background-color:  ${({theme}) => theme.palette.primary.grey[5]};
  border: ${({theme}) => theme.palette.primary.grey[3]};
  border-radius: 8px;
  padding: 8px;
  width: 100%;
  font-family: Roboto;
  font-style: normal;
  font-weight: 500;
`;

const Btn = styled("div")`
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${(props) =>
    (props.isSignUpBtn && props.theme.palette.primary.green[1]) || props.theme.palette.primary.grey[3]};
  padding: 8px;
  border-radius: 8px;
  width: 100%;
  font-family: Roboto;
  font-style: normal;
  font-weight: 500;
  &:hover {
    background-color: ${(props) => props.theme.palette.primary.grey[3]};
  }
  background-color: ${(props) =>
    (props.isSignUpBtn && props.theme.palette.primary.green[1]) || props.theme.palette.primary.grey[4]};
  ${({ disabled }) =>
    disabled
      ? `
      background-color: #464646c2;
      cursor:default;
      color: grey;
    `
      : `
    &:hover {
    background-color: ${({theme}) => theme.palette.primary.grey[3]};
  }`}
`;

const HaveNotAccountTitle = styled("span")`
  width: 100%;
  font-size: 12px;
  font-family: Roboto;
  font-style: normal;
  font-weight: 500;
`;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const currentUserContext = useContext(Context)
  const {setCurrentUser} = currentUserContext;

  const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const disabled = !email || !emailRegExp.test(email) || !password;

  const login = async (userData) => {
    const {data} = await postLogin(userData);
    const {success} = data;
    if(!success) {
      const {message} = data;
      alert(message)
      console.log(data)
      return
    }
    const {token, user} = data;
    localStorage.setItem("token", JSON.stringify({value:token}))
    setCurrentUser(user)
    navigate(`/profile/${user._id}`)
  }

  const handleClickLogin = () => {
    const userData = {email,password};
    login(userData)
  }

  return (
    <Container>
      <LoginContainer>
        <LoginTitle>Log In</LoginTitle>
        <InputsContainer>
          <Input
            type="phone"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></Input>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></Input>
        </InputsContainer>
        <Btn
          disabled={disabled}
          onClick={() => !disabled && handleClickLogin()}
        >
          Log In
        </Btn>
        <HaveNotAccountTitle>Haven't account?</HaveNotAccountTitle>
        <Btn isSignUpBtn={true} onClick={() => navigate("/registration")}>
          Sign Up
        </Btn>
      </LoginContainer>
    </Container>
  );
};

export default Login;
