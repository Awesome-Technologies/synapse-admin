import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

const LoginFormBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  minHeight: "calc(100vh - 1rem)",
  alignItems: "center",
  justifyContent: "flex-start",
  background: "url(./images/floating-cogs.svg)",
  backgroundColor: "#f9f9f9",
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",

  [`& .card`]: {
    width: "30rem",
    marginTop: "6rem",
    marginBottom: "6rem",
  },
  [`& .avatar`]: {
    margin: "1rem",
    display: "flex",
    justifyContent: "center",
  },
  [`& .icon`]: {
    backgroundColor: theme.palette.grey[500],
  },
  [`& .hint`]: {
    marginTop: "1em",
    marginBottom: "1em",
    display: "flex",
    justifyContent: "center",
    color: theme.palette.grey[600],
  },
  [`& .form`]: {
    padding: "0 1rem 1rem 1rem",
  },
  [`& .select`]: {
    marginBottom: "2rem",
  },
  [`& .actions`]: {
    padding: "0 1rem 1rem 1rem",
  },
  [`& .serverVersion`]: {
    color: theme.palette.grey[500],
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
    marginLeft: "0.5rem",
  },
  [`& .matrixVersions`]: {
    color: theme.palette.grey[500],
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
    fontSize: "0.8rem",
    marginBottom: "1rem",
    marginLeft: "0.5rem",
  },
}));

export default LoginFormBox;
