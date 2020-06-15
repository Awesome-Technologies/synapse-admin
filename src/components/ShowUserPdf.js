import React, { useRef } from "react";
import { Title, Button } from "react-admin";
import { makeStyles } from "@material-ui/core/styles";
import { PDFExport } from "@progress/kendo-react-pdf";
import QRCode from "qrcode.react";
import { string, any } from "prop-types";

function xor(a, b) {
  var res = "";
  for (var i = 0; i < a.length; i++) {
    res += String.fromCharCode(a.charCodeAt(i) ^ b.charCodeAt(i % b.length));
  }
  return res;
}

function calculateQrString(serverUrl, username, password) {
  const magicString = "wo9k5tep252qxsa5yde7366kugy6c01w7oeeya9hrmpf0t7ii7";
  const origUrlString = "user=" + username + "&password=" + password;

  var urlString = xor(origUrlString, magicString); // xor with magic string
  if (origUrlString !== xor(urlString, magicString)) {
    console.error(
      "xoring this url string with magicString twice gave different results:",
      origUrlString,
      urlString,
      xor(urlString, magicString)
    );
  }
  urlString = btoa(urlString); // to base64

  return serverUrl + "/#" + urlString;
}

UserPdfPage.propTypes = {
  classes: any,
  displayname: string,
  qrCode: any,
  serverUrl: string,
  username: string,
  password: string,
};

function UserPdfPage({
  classes,
  displayname,
  qrCode,
  serverUrl,
  username,
  password,
}) {
  return (
    <div className={classes.page}>
      <div className={classes.header}>
        <div className={classes.name}>{displayname}</div>
        <img className={classes.logo} alt="Logo" src="images/logo.png" />
      </div>
      <div className={classes.body}>
        <table>
          <tbody>
            <tr>
              <td width="200px">
                <div className={classes.code_note}>
                  Ihr persönlicher Anmeldecode:
                </div>
              </td>
              <td className={classes.table_cell}>
                <div className={classes.credentials_note}>
                  Ihre persönlichen Zugangsdaten:
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className={classes.qr}>{qrCode}</div>
              </td>
              <td className={classes.table_cell}>
                <div className={classes.credentials_text}>
                  <br />
                  <table>
                    <tbody>
                      <tr>
                        <td>Heimserver:</td>
                        <td>
                          <span className={classes.credentials}>
                            {serverUrl}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>Benutzername:</td>
                        <td>
                          <span className={classes.credentials}>
                            {username}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>Passwort:</td>
                        <td>
                          <span className={classes.credentials}>
                            {password}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div className={classes.note}>
          Hier können Sie Ihre selbst gewählte Schlüsselsicherungs-Passphrase
          notieren:
          <br />
          <br />
          <br />
          <hr />
        </div>
      </div>
    </div>
  );
}

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
    fontFamily: "DejaVu Sans, Sans-Serif",
    fontSize: 15,
  },
  header: {
    height: 144,
    width: 534,
    marginLeft: 32,
    marginTop: 15,
  },
  name: {
    width: 240,
    fontSize: 35,
    float: "left",
    marginTop: 100,
  },
  logo: {
    width: 90,
    marginTop: 50,
    marginRight: 70,
    float: "right",
  },
  body: {
    clear: "both",
  },
  table_cell: {
    verticalAlign: "top",
  },
  code_note: {
    marginLeft: 32,
    marginTop: 86,
  },
  qr: {
    marginTop: 15,
    marginLeft: 32,
  },
  credentials_note: {
    marginTop: 86,
    marginLeft: 10,
  },
  credentials_text: {
    marginLeft: 10,
    fontSize: 12,
  },
  credentials: {
    fontFamily: "DejaVu Sans Mono, monospace",
  },
  note: {
    fontSize: 18,
    marginTop: 100,
    marginLeft: 32,
    marginRight: 32,
  },
}));

const ShowUserPdf = props => {
  const classes = useStyles();
  const userPdf = useRef(null);

  const exportPDF = () => {
    userPdf.current.save();
  };

  let userRecords;

  if (props.records) {
    userRecords = props.records;
  }

  if (
    props.location &&
    props.location.state &&
    props.location.state.id &&
    props.location.state.password
  ) {
    userRecords = [
      {
        id: props.location.state.id,
        password: props.location.state.password,
        displayname: props.location.state.displayname,
      },
    ];
  }

  return (
    <div>
      <Title title="PDF" />
      <Button label="synapseadmin.action.download_pdf" onClick={exportPDF} />

      <PDFExport
        paperSize={"A4"}
        fileName="Users.pdf"
        title=""
        subject=""
        keywords=""
        ref={userPdf}
        //ref={r => (resume = r)}
      >
        {userRecords.map(record => {
          if (record.id && record.password) {
            const username = record.id.substring(1, record.id.indexOf(":"));
            const serverUrl =
              "https://" + record.id.substring(record.id.indexOf(":") + 1);
            const qrString = calculateQrString(
              serverUrl,
              username,
              record.password
            );
            const qrCode = <QRCode value={qrString} size={128} />;
            return (
              <UserPdfPage
                classes={classes}
                displayname={record.displayname}
                qrCode={qrCode}
                serverUrl={serverUrl}
                username={username}
                password={record.password}
              />
            );
          } else {
            /* Skip empty PDF pages */
            return null;
          }
        })}
      </PDFExport>
    </div>
  );
};

export default ShowUserPdf;
