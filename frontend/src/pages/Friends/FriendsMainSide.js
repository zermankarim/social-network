import styled from "@emotion/styled";
import searchIcon from "../../images/icons/search.svg";
import UserCardSearch from "../../shared/UserCardSearch";

const Container = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 60%;
  min-height: 400px;
  background-color: ${(props) => props.theme.palette.primary.grey[5]};
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.palette.primary.grey[3]};
  padding: 16px;
`;

const Header = styled("div")`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const Title = styled("div")`
  text-align: center;
  font-family: Roboto;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
`;

const PeopleCounter = styled("div")`
  color: rgb(130, 130, 130);
  font-family: Roboto;
  font-size: 12.492px;
  font-style: normal;
  font-weight: 400;
`;

const SearchBarContainer = styled("div")`
  display: flex;
  width: 100%;
  height: 32px;
  border: 1px solid ${(props) => props.theme.palette.primary.grey[3]};
  border-radius: 8px;
  overflow: hidden;
`;

const SearchBar = styled("input")`
  border: none;
  width: 90%;
  height: 100%;
  background-color: ${(props) => props.theme.palette.primary.grey[5]};
  padding: 4px;
  font-family: Roboto;
  font-size: 12.492px;
  font-style: normal;
  font-weight: 400;
  &:focus {
    outline: none;
  }
`;

const SearchBtn = styled("input")`
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  height: 100%;
  width: 10%;
  background-color: ${({ theme }) => theme.grayBlockBg};
  padding: 4px;
`;

const SearchImage = styled("img")`
  height: 100%;
`;

const UsersForSearch = styled("div")`
width: 100%;
height: 100%;
`

const FriendsMainSide = () => {
  return (
    <Container>
      <Header>
        <Title>People</Title>
        <PeopleCounter>155 555</PeopleCounter>
      </Header>
      <SearchBarContainer>
        <SearchBar placeholder="Enter your request"></SearchBar>
        <SearchBtn>
          <SearchImage src={searchIcon} alt="search"></SearchImage>
        </SearchBtn>
      </SearchBarContainer>
      <UsersForSearch>
        <UserCardSearch></UserCardSearch>
        <UserCardSearch></UserCardSearch>
        <UserCardSearch></UserCardSearch>
        <UserCardSearch></UserCardSearch>
        <UserCardSearch></UserCardSearch>
        <UserCardSearch></UserCardSearch>
        <UserCardSearch></UserCardSearch>
        <UserCardSearch></UserCardSearch>
        <UserCardSearch></UserCardSearch>
        <UserCardSearch></UserCardSearch>
        <UserCardSearch></UserCardSearch>
        <UserCardSearch></UserCardSearch>
        <UserCardSearch></UserCardSearch>
        <UserCardSearch></UserCardSearch>
      </UsersForSearch>
    </Container>
  );
};

export default FriendsMainSide;
