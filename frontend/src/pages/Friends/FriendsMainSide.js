import styled from "@emotion/styled";
import searchIcon from "../../images/icons/search.svg";
import UserCardSearch from "../../shared/UserCardSearch";
import { useContext, useEffect, useState } from "react";
import { Context } from "../../shared/Context";
import { getUserInfo, getUsersInfo } from "../../http/Fetches";
import { Typography } from "@mui/material";
import { PageLoader } from "../../shared/Loaders";
import { Box } from "@mui/material";

const Container = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 60%;
  min-height: 300px;
  background-color: ${(props) => props.theme.palette.primary.grey[5]};
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.palette.primary.grey[3]};
  padding: 16px;
  -webkit-box-shadow: ${({ theme }) => theme.palette.primary.blackShadow.small};
  -moz-box-shadow: ${({ theme }) => theme.palette.primary.blackShadow.small};
  box-shadow: ${({ theme }) => theme.palette.primary.blackShadow.small};
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

const SearchBtn = styled("span")`
  cursor: pointer;
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
`;

const FriendsMainSide = ({ peopleSearchParams, setPeopleSearchParams }) => {
  // Separation user
  const [userFriends, setUserFriends] = useState([]);
  const [otherUsers, setOtherUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUserContext = useContext(Context);
  const { currentUser, setCurrentUser, usersFromSearch, setUsersFromSearch } =
    currentUserContext;
  const fetchAllUsers = async () => {
    const { data } = await getUsersInfo({
      peopleSearchParams: peopleSearchParams,
    });
    const { success } = data;
    if (success) {
      const { users } = data;
      setUsersFromSearch(users);
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    const { data } = await getUserInfo(currentUser._id);
    const { success } = data;
    if (success) {
      const { user } = data;
      setCurrentUser(user);
    } else {
      const { message } = data;
      console.log(message);
      alert(message);
    }
  };

  const handleSearchWithFilter = async () => {
    const { data } = await getUsersInfo({
      peopleSearchParams: peopleSearchParams,
    });
    const { success } = data;
    if (!success) {
      const { message } = data;
      console.log(message);
      return alert(message);
    }
    const { users } = data;
    setUsersFromSearch(users);
  };

  // Effects

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    let filteredFriends = [];
    let filteredOtherUsers = [];
    if (currentUser.socialContacts.friends.length) {
      filteredFriends = usersFromSearch.filter((userFromSearch) =>
        currentUser.socialContacts.friends.includes(
          userFromSearch._id.toString()
        )
      );

      filteredOtherUsers = usersFromSearch.filter(
        (userFromSearch) =>
          !currentUser.socialContacts.friends.includes(
            userFromSearch._id.toString()
          ) && userFromSearch._id !== currentUser._id
      );

      setUserFriends(filteredFriends);
      setOtherUsers(filteredOtherUsers);
      setLoading(false);
    } else {
      usersFromSearch.forEach((userFromSearch) => {
        if (userFromSearch._id !== currentUser._id) {
          return filteredOtherUsers.push(userFromSearch);
        }
      });
      setOtherUsers(filteredOtherUsers);
      setLoading(false);
    }
  }, [usersFromSearch]);

  return (
    <Container>
      <Header>
        {userFriends.length ? (
          <>
            <Title>Friends</Title>
            <PeopleCounter>{userFriends.length}</PeopleCounter>
          </>
        ) : (
          <>
            <Title>Peoples</Title>
            <PeopleCounter>{otherUsers.length}</PeopleCounter>
          </>
        )}
      </Header>
      <SearchBarContainer>
        <SearchBar
          placeholder="Enter your request"
          value={peopleSearchParams.searchInputValue}
          onChange={(e) =>
            setPeopleSearchParams((prev) => ({
              ...prev,
              searchInputValue: e.target.value,
            }))
          }
        ></SearchBar>
        <SearchBtn onClick={handleSearchWithFilter}>
          <SearchImage src={searchIcon} alt="search"></SearchImage>
        </SearchBtn>
      </SearchBarContainer>
      <UsersForSearch>
        {loading ? (
          <PageLoader></PageLoader>
        ) : userFriends.length ? (
          <>
            {userFriends.map((friend) => {
              return (
                <UserCardSearch key={friend._id} user={friend}></UserCardSearch>
              );
            })}
            {otherUsers.length ? (
              <Typography
                variant="body1"
                sx={{
                  width: "100%",
                  marginTop: "48px",
                }}
              >
                Subscribe to other users:
              </Typography>
            ) : null}
            {otherUsers.length
              ? otherUsers.map((otherUser) => {
                  return (
                    otherUser._id !== currentUser._id && (
                      <UserCardSearch
                        key={otherUser._id}
                        user={otherUser}
                      ></UserCardSearch>
                    )
                  );
                })
              : null}
          </>
        ) : (
          <>
            {otherUsers.length
              ? otherUsers.map((otherUser) => {
                  return (
                    otherUser._id !== currentUser._id && (
                      <UserCardSearch
                        key={otherUser._id}
                        user={otherUser}
                      ></UserCardSearch>
                    )
                  );
                })
              : null}
          </>
        )}
        {!userFriends.length && !otherUsers.length ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <Typography
              sx={{
                color: (theme) => theme.palette.primary.grey[3],
              }}
            >
              Nothing found
            </Typography>
          </Box>
        ) : null}
      </UsersForSearch>
    </Container>
  );
};

export default FriendsMainSide;
