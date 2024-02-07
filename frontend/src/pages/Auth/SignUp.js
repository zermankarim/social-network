import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getSignUp } from "../../shared/utils";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  border: ${(props) => props.theme.mainBlockBorder};
  border-radius: 8px;
  padding: 8px 16px 8px 16px;
  width: 50%;
  height: 500px;
  gap: 12px;
`;

const LoginTitle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${(props) => props.theme.mainTextColor};
  width: 100%;
  height: 10%;
  font-family: Roboto;
  font-style: normal;
  font-weight: 500;
`;

const InputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  min-height: 30%;
`;

const Input = styled.input`
  background-color: ${(props) => props.theme.mainBg};
  border: ${(props) => props.theme.mainBlockBorder};
  border-radius: 8px;
  padding: 8px;
  width: 100%;
  font-family: Roboto;
  font-style: normal;
  font-weight: 500;
`;

const Btn = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${(props) =>
    (props.isSignUpBtn && props.theme.greenBtnBg) || props.theme.btnBg};
  ${({ disabled }) =>
    disabled
      ? `
      background-color: #464646c2;
      cursor:default;
    `
      : `
    &:hover {
    background-color: ${(props) => props.theme.hoverBtnBg};
  }`}
  padding: 8px;
  border-radius: 8px;
  width: 100%;
  font-family: Roboto;
  font-style: normal;
  font-weight: 500;
`;

const HaveNotAccountTitle = styled.span`
  width: 100%;
  font-size: 12px;
  font-family: Roboto;
  font-style: normal;
  font-weight: 500;
`;

const SignUp = () => {
  const [name, setName] = useState(null);
  const [surname, setSurname] = useState(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [repeatPassword, setRepeatPassword] = useState(null);
  const navigate = useNavigate();
  const disabled =
    !name ||
    !surname ||
    !email ||
    !password ||
    !repeatPassword ||
    !(password === repeatPassword);
  const handleClickSignUp = () => {
    const userData = {
      name,
      surname,
      email,
      password,
    }
    const signUp = async () => {
      const res = await getSignUp(name, surname, email, password)
      console.log(res)
    }
    signUp()
  };
  return (
    <Container>
      <LoginContainer>
        <LoginTitle>Sign Up</LoginTitle>
        <InputsContainer>
          <Input
            type="text"
            placeholder="Name"
            onChange={(e) => setName(e.target.value)}
          ></Input>
          <Input
            type="text"
            placeholder="Surname"
            onChange={(e) => setSurname(e.target.value)}
          ></Input>
          <Input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          ></Input>
          <Input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          ></Input>
          <Input
            type="password"
            placeholder="Repeat password"
            onChange={(e) => setRepeatPassword(e.target.value)}
          ></Input>
        </InputsContainer>
        <Btn
          isSignUpBtn={true}
          disabled={disabled}
          onClick={() => !disabled && handleClickSignUp()}
        >
          Sign Up
        </Btn>
        <HaveNotAccountTitle>Have an account?</HaveNotAccountTitle>
        <Btn onClick={() => navigate("/login")}>Log In</Btn>
      </LoginContainer>
    </Container>
  );
};

export default SignUp;