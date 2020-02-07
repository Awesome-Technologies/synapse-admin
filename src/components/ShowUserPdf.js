import React from "react";
import { Title, Button } from "react-admin";
import { makeStyles } from "@material-ui/core/styles";
import { PDFExport } from "@progress/kendo-react-pdf";
import QRCode from "qrcode.react";

function xor(a, b) {
  var res = "",
    i = a.length,
    j = b.length;
  while (i-- > 0 && j-- > 0)
    res = (parseInt(a.charAt(i)) ^ parseInt(b.charAt(j))).toString() + res;
  return res;
}

function calculateQrString(serverUrl, username, password) {
  var magicString = "wo9k5tep252qxsa5yde7366kugy6c01w7oeeya9hrmpf0t7ii7";

  var urlString = "user=" + username + "&password=" + password;

  while (urlString.length > magicString.length) {
    magicString += magicString;
  }

  urlString = xor(urlString, magicString); // xor with magic string
  urlString = btoa(urlString); // to base64

  return serverUrl + "/#" + urlString;
}

const ShowUserPdf = props => {
  const useStyles = makeStyles(theme => ({
    page: {
      height: 800,
      width: 566,
      padding: "none",
      backgroundColor: "white",
      boxShadow: "5px 5px 5px black",
      margin: "auto",
      overflowX: "hidden",
      overflowY: "hidden",
    },
    header: {
      height: 144,
      width: 534,
      marginLeft: 32,
      marginTop: 15,
    },
    name: {
      width: 233,
      fontSize: 40,
      float: "left",
      marginTop: 15,
    },
    logo: {
      height: 90,
      width: 90,
      marginTop: 20,
      marginRight: 32,
      float: "left",
    },
    code: {
      marginLeft: 330,
      marginTop: 86,
    },
    qr: {
      marginRight: 40,
      float: "right",
    },
    note: {
      fontSize: 18,
      marginTop: 100,
      marginLeft: 32,
      marginRight: 32,
    },
  }));

  const classes = useStyles();

  var resume;

  const exportPDF = () => {
    resume.save();
  };

  var qrCode = "";
  var displayname = "";

  if (props.location.state) {
    const { id, password } = props.location.state;

    const username = id.substring(1, id.indexOf(":"));
    const serverUrl = "https://" + id.substring(id.indexOf(":") + 1);

    const qrString = calculateQrString(serverUrl, username, password);

    qrCode = <QRCode value={qrString} size={128} />;
    displayname = props.location.state.displayname;
  }

  return (
    <div>
      <Title title="PDF" />
      <Button label="synapseadmin.action.download_pdf" onClick={exportPDF} />

      <PDFExport
        paperSize={"A4"}
        fileName="User.pdf"
        title=""
        subject=""
        keywords=""
        ref={r => (resume = r)}
      >
        <div className={classes.page}>
          <div className={classes.code}>Ihr persönlicher Anmeldecode:</div>
          <div className={classes.header}>
            <div className={classes.name}>{displayname}</div>
            <img className={classes.logo} alt="Logo" src="images/logo.png" />
            <div className={classes.qr}>{qrCode}</div>
          </div>
          <div className={classes.note}>
            Hier können Sie Ihre selbst gewählte Schlüsselsicherungs-Passphrase
            notieren:
            <br />
            <br />
            <br />
            <hr />
          </div>
        </div>
      </PDFExport>
    </div>
  );
};

export default ShowUserPdf;
