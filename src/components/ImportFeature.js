import React, { useState } from "react";
import {
  Button as ReactAdminButton,
  useDataProvider,
  useNotify,
  Title,
} from "react-admin";
import { parse as parseCsv, unparse as unparseCsv } from "papaparse";
import GetAppIcon from "@mui/icons-material/GetApp";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  Container,
  FormControlLabel,
  NativeSelect,
} from "@mui/material";
import { useTranslate } from "ra-core";
import { generateRandomUser } from "./users";

const LOGGING = true;

export const ImportButton = ({ label, variant = "text" }) => {
  return (
    <ReactAdminButton
      color="primary"
      component="span"
      variant={variant}
      label={label}
    >
      <GetAppIcon style={{ transform: "rotate(180deg)", fontSize: "20" }} />
    </ReactAdminButton>
  );
};

const expectedFields = ["id", "displayname"].sort();
const optionalFields = [
  "user_type",
  "guest",
  "admin",
  "deactivated",
  "avatar_url",
  "password",
].sort();

function TranslatableOption({ value, text }) {
  const translate = useTranslate();
  return <option value={value}>{translate(text)}</option>;
}

const FilePicker = props => {
  const [values, setValues] = useState(null);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [dryRun, setDryRun] = useState(true);

  const [progress, setProgress] = useState(null);

  const [importResults, setImportResults] = useState(null);
  const [skippedRecords, setSkippedRecords] = useState(null);

  const [conflictMode, setConflictMode] = useState("stop");
  const [passwordMode, setPasswordMode] = useState(true);
  const [useridMode, setUseridMode] = useState("ignore");

  const translate = useTranslate();
  const notify = useNotify();

  const dataProvider = useDataProvider();

  const onFileChange = async e => {
    if (progress !== null) return;

    setValues(null);
    setError(null);
    setStats(null);
    setImportResults(null);
    const file = e.target.files ? e.target.files[0] : null;
    /* Let's refuse some unreasonably big files instead of freezing
     * up the browser */
    if (file.size > 100000000) {
      const message = translate("import_users.errors.unreasonably_big", {
        size: (file.size / (1024 * 1024)).toFixed(2),
      });
      notify(message);
      setError(message);
      return;
    }
    try {
      parseCsv(file, {
        header: true,
        skipEmptyLines: true /* especially for a final EOL in the csv file */,
        complete: result => {
          if (result.error) {
            setError(result.error);
          }
          /* Papaparse is very lenient, we may be able to salvage
           * the data in the file. */
          verifyCsv(result, { setValues, setStats, setError });
        },
      });
    } catch {
      setError(true);
      return null;
    }
  };

  const verifyCsv = (
    { data, meta, errors },
    { setValues, setStats, setError }
  ) => {
    /* First, verify the presence of required fields */
    let eF = Array.from(expectedFields);
    let oF = Array.from(optionalFields);

    meta.fields.forEach(name => {
      if (eF.includes(name)) {
        eF = eF.filter(v => v !== name);
      }
      if (oF.includes(name)) {
        oF = oF.filter(v => v !== name);
      }
    });

    if (eF.length !== 0) {
      setError(
        translate("import_users.error.required_field", { field: eF[0] })
      );
      return false;
    }

    // XXX after deciding on how "name" and friends should be handled below,
    //     this place will want changes, too.

    /* Collect some stats to prevent sneaky csv files from adding admin
       users or something.
     */
    let stats = {
      user_types: { default: 0 },
      is_guest: 0,
      admin: 0,
      deactivated: 0,
      password: 0,
      avatar_url: 0,
      id: 0,

      total: data.length,
    };

    data.forEach((line, idx) => {
      if (line.user_type === undefined || line.user_type === "") {
        stats.user_types.default++;
      } else {
        stats.user_types[line.user_type] += 1;
      }
      /* XXX correct the csv export that react-admin offers for the users
       * resource so it gives sensible field names and doesn't duplicate
       * id as "name"?
       */
      if (meta.fields.includes("name")) {
        delete line.name;
      }
      if (meta.fields.includes("user_type")) {
        delete line.user_type;
      }
      if (meta.fields.includes("is_admin")) {
        line.admin = line.is_admin;
        delete line.is_admin;
      }

      ["is_guest", "admin", "deactivated"].forEach(f => {
        if (line[f] === "true") {
          stats[f]++;
          line[f] = true; // we need true booleans instead of strings
        } else {
          if (line[f] !== "false" && line[f] !== "") {
            errors.push(
              translate("import_users.error.invalid_value", {
                field: f,
                row: idx,
              })
            );
          }
          line[f] = false; // default values to false
        }
      });

      if (line.password !== undefined && line.password !== "") {
        stats.password++;
      }

      if (line.avatar_url !== undefined && line.avatar_url !== "") {
        stats.avatar_url++;
      }

      if (line.id !== undefined && line.id !== "") {
        stats.id++;
      }
    });

    if (errors.length > 0) {
      setError(errors);
    }
    setStats(stats);
    setValues(data);

    return true;
  };

  const runImport = async e => {
    if (progress !== null) {
      notify("import_users.errors.already_in_progress");
      return;
    }

    const results = await doImport(
      dataProvider,
      values,
      conflictMode,
      passwordMode,
      useridMode,
      dryRun,
      setProgress,
      setError
    );
    setImportResults(results);
    // offer CSV download of skipped or errored records
    // (so that the user doesn't have to filter out successful
    // records manually when fixing stuff in the CSV)
    setSkippedRecords(unparseCsv(results.skippedRecords));
    if (LOGGING) console.log("Skipped records:");
    if (LOGGING) console.log(skippedRecords);
  };

  // XXX every single one of the requests will restart the activity indicator
  //     which doesn't look very good.

  const doImport = async (
    dataProvider,
    data,
    conflictMode,
    passwordMode,
    useridMode,
    dryRun,
    setProgress,
    setError
  ) => {
    let skippedRecords = [];
    let erroredRecords = [];
    let succeededRecords = [];
    let changeStats = {
      toAdmin: 0,
      toGuest: 0,
      toRegular: 0,
      replacedPassword: 0,
    };
    let entriesDone = 0;
    let entriesCount = data.length;
    try {
      setProgress({ done: entriesDone, limit: entriesCount });
      for (const entry of data) {
        let userRecord = {};
        let overwriteData = {};
        // No need to do a bunch of cryptographic random number getting if
        // we are using neither a generated password nor a generated user id.
        if (
          useridMode === "ignore" ||
          entry.id === undefined ||
          entry.password === undefined ||
          passwordMode === false
        ) {
          overwriteData = generateRandomUser();
          // Ignoring IDs or the entry lacking an ID means we keep the
          // ID field in the overwrite data.
          if (!(useridMode === "ignore" || entry.id === undefined)) {
            delete overwriteData.id;
          }

          // Not using passwords from the csv or this entry lacking a password
          // means we keep the password field in the overwrite data.
          if (
            !(
              passwordMode === false ||
              entry.password === undefined ||
              entry.password === ""
            )
          ) {
            delete overwriteData.password;
          }
        }
        /* TODO record update stats (especially admin no -> yes, deactivated x -> !x, ... */
        Object.assign(userRecord, entry);
        Object.assign(userRecord, overwriteData);

        /* For these modes we will consider the ID that's in the record.
         * If the mode is "stop", we will not continue adding more records, and
         * we will offer information on what was already added and what was
         * skipped.
         *
         * If the mode is "skip", we record the record for later, but don't
         * send it to the server.
         *
         * If the mode is "update", we change fields that are reasonable to
         * update.
         *  - If the "password mode" is "true" (i.e. "use passwords from csv"):
         *    - if the record has a password
         *      - send the password along with the record
         *    - if the record has no password
         *      - generate a new password
         *  - If the "password mode" is "false"
         *    - never generate a new password to update existing users with
         */

        /* We just act as if there are no IDs in the CSV, so every user will be
         * created anew.
         * We do a simple retry loop so that an accidental hit on an existing ID
         * doesn't trip us up.
         */
        if (LOGGING)
          console.log(
            "will check for existence of record " + JSON.stringify(userRecord)
          );
        let retries = 0;
        const submitRecord = recordData => {
          return dataProvider.getOne("users", { id: recordData.id }).then(
            async alreadyExists => {
              if (LOGGING) console.log("already existed");

              if (useridMode === "update" || conflictMode === "skip") {
                skippedRecords.push(recordData);
              } else if (conflictMode === "stop") {
                throw new Error(
                  translate("import_users.error.id_exits", {
                    id: recordData.id,
                  })
                );
              } else {
                const overwriteData = generateRandomUser();
                const newRecordData = Object.assign({}, recordData, {
                  id: overwriteData.id,
                });
                retries++;
                if (retries > 512) {
                  console.warn("retry loop got stuck? pathological situation?");
                  skippedRecords.push(recordData);
                } else {
                  await submitRecord(newRecordData);
                }
              }
            },
            async okToSubmit => {
              if (LOGGING)
                console.log(
                  "OK to create record " +
                    recordData.id +
                    " (" +
                    recordData.displayname +
                    ")."
                );

              if (!dryRun) {
                await dataProvider.create("users", { data: recordData });
              }
              succeededRecords.push(recordData);
            }
          );
        };

        await submitRecord(userRecord);
        entriesDone++;
        setProgress({ done: entriesDone, limit: data.length });
      }

      setProgress(null);
    } catch (e) {
      setError(
        translate("import_users.error.at_entry", {
          entry: entriesDone + 1,
          message: e.message,
        })
      );
      setProgress(null);
    }
    return {
      skippedRecords,
      erroredRecords,
      succeededRecords,
      totalRecordCount: entriesCount,
      changeStats,
      wasDryRun: dryRun,
    };
  };

  const downloadSkippedRecords = () => {
    const element = document.createElement("a");
    console.log(skippedRecords);
    const file = new Blob([skippedRecords], {
      type: "text/comma-separated-values",
    });
    element.href = URL.createObjectURL(file);
    element.download = "skippedRecords.csv";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  const onConflictModeChanged = async e => {
    if (progress !== null) {
      return;
    }

    const value = e.target.value;
    setConflictMode(value);
  };

  const onPasswordModeChange = e => {
    if (progress !== null) {
      return;
    }

    setPasswordMode(e.target.checked);
  };

  const onUseridModeChanged = async e => {
    if (progress !== null) {
      return;
    }

    const value = e.target.value;
    setUseridMode(value);
  };

  const onDryRunModeChanged = ev => {
    if (progress !== null) {
      return;
    }
    setDryRun(ev.target.checked);
  };

  // render individual small components

  const statsCards = stats &&
    !importResults && [
      <Container>
        <CardHeader
          title={translate("import_users.cards.importstats.header")}
        />
        <CardContent>
          <div>
            {translate(
              "import_users.cards.importstats.users_total",
              stats.total
            )}
          </div>
          <div>
            {translate(
              "import_users.cards.importstats.guest_count",
              stats.is_guest
            )}
          </div>
          <div>
            {translate(
              "import_users.cards.importstats.admin_count",
              stats.admin
            )}
          </div>
        </CardContent>
      </Container>,
      <Container>
        <CardHeader title={translate("import_users.cards.ids.header")} />
        <CardContent>
          <div>
            {stats.id === stats.total
              ? translate("import_users.cards.ids.all_ids_present")
              : translate("import_users.cards.ids.count_ids_present", stats.id)}
          </div>
          {stats.id > 0 ? (
            <div>
              <NativeSelect
                onChange={onUseridModeChanged}
                value={useridMode}
                enabled={(progress !== null).toString()}
              >
                <TranslatableOption
                  value="ignore"
                  text="import_users.cards.ids.mode.ignore"
                />
                <TranslatableOption
                  value="update"
                  text="import_users.cards.ids.mode.update"
                />
              </NativeSelect>
            </div>
          ) : (
            ""
          )}
        </CardContent>
      </Container>,
      <Container>
        <CardHeader title={translate("import_users.cards.passwords.header")} />
        <CardContent>
          <div>
            {stats.password === stats.total
              ? translate("import_users.cards.passwords.all_passwords_present")
              : translate(
                  "import_users.cards.passwords.count_passwords_present",
                  stats.password
                )}
          </div>
          {stats.password > 0 ? (
            <div>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={passwordMode}
                    enabled={(progress !== null).toString()}
                    onChange={onPasswordModeChange}
                  />
                }
                label={translate("import_users.cards.passwords.use_passwords")}
              />
            </div>
          ) : (
            ""
          )}
        </CardContent>
      </Container>,
    ];

  let conflictCards = stats && !importResults && (
    <Container>
      <CardHeader title={translate("import_users.cards.conflicts.header")} />
      <CardContent>
        <div>
          <NativeSelect
            onChange={onConflictModeChanged}
            value={conflictMode}
            enabled={(progress !== null).toString()}
          >
            <TranslatableOption
              value="stop"
              text="import_users.cards.conflicts.mode.stop"
            />
            <TranslatableOption
              value="skip"
              text="import_users.cards.conflicts.mode.skip"
            />
          </NativeSelect>
        </div>
      </CardContent>
    </Container>
  );

  let errorCards = error && (
    <Container>
      <CardHeader title={translate("import_users.error.error")} />
      <CardContent>
        {(Array.isArray(error) ? error : [error]).map(e => (
          <div>{e}</div>
        ))}
      </CardContent>
    </Container>
  );

  let uploadCard = !importResults && (
    <Container>
      <CardHeader title={translate("import_users.cards.upload.header")} />
      <CardContent>
        {translate("import_users.cards.upload.explanation")}
        <a href="./data/example.csv">example.csv</a>
        <br />
        <br />
        <input
          type="file"
          onChange={onFileChange}
          enabled={(progress !== null).toString()}
        />
      </CardContent>
    </Container>
  );

  let resultsCard = importResults && (
    <CardContent>
      <CardHeader title={translate("import_users.cards.results.header")} />
      <div>
        {translate(
          "import_users.cards.results.total",
          importResults.totalRecordCount
        )}
        <br />
        {translate(
          "import_users.cards.results.successful",
          importResults.succeededRecords.length
        )}
        <br />
        {importResults.skippedRecords.length
          ? [
              translate(
                "import_users.cards.results.skipped",
                importResults.skippedRecords.length
              ),
              <div>
                <button onClick={downloadSkippedRecords}>
                  {translate("import_users.cards.results.download_skipped")}
                </button>
              </div>,
              <br />,
            ]
          : ""}
        {importResults.erroredRecords.length
          ? [
              translate(
                "import_users.cards.results.skipped",
                importResults.erroredRecords.length
              ),
              <br />,
            ]
          : ""}
        <br />
        {importResults.wasDryRun && [
          translate("import_users.cards.results.simulated_only"),
          <br />,
        ]}
      </div>
    </CardContent>
  );

  let startImportCard =
    !values || values.length === 0 || importResults ? undefined : (
      <CardActions>
        <FormControlLabel
          control={
            <Checkbox
              checked={dryRun}
              onChange={onDryRunModeChanged}
              enabled={(progress !== null).toString()}
            />
          }
          label={translate("import_users.cards.startImport.simulate_only")}
        />
        <Button
          size="large"
          onClick={runImport}
          enabled={(progress !== null).toString()}
        >
          {translate("import_users.cards.startImport.run_import")}
        </Button>
        {progress !== null ? (
          <div>
            {progress.done} of {progress.limit} done
          </div>
        ) : null}
      </CardActions>
    );

  let allCards = [];
  if (uploadCard) allCards.push(uploadCard);
  if (errorCards) allCards.push(errorCards);
  if (conflictCards) allCards.push(conflictCards);
  if (statsCards) allCards.push(...statsCards);
  if (startImportCard) allCards.push(startImportCard);
  if (resultsCard) allCards.push(resultsCard);

  let cardContainer = <Card>{allCards}</Card>;

  return [
    <Title defaultTitle={translate("import_users.title")} />,
    cardContainer,
  ];
};

export const ImportFeature = FilePicker;
